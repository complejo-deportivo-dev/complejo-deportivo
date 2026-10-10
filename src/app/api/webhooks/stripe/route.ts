import { randomBytes } from "node:crypto";

import QRCode from "qrcode";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

function isStripeSignatureMissing(signature: string | null): boolean {
  return !signature || signature.trim().length === 0;
}

function getQrQuantity(
  reservation: { quantity: number; status?: string | null },
  service: { qr_type: string } | null
): number {
  if (!service) {
    return 0;
  }

  return service.qr_type === "group" ? 1 : reservation.quantity;
}

function getTimeRangeLabel(reservationSlots: Array<{ time_slots: { time_start: Date; time_end: Date } | null }>) {
  const validSlots = reservationSlots
    .map((slot) => slot.time_slots)
    .filter((slot): slot is { time_start: Date; time_end: Date } => slot !== null);

  if (validSlots.length === 0) {
    return { time_start: "", time_end: "" };
  }

  const timeStart = validSlots.reduce((earliest, current) =>
    earliest.time_start <= current.time_start ? earliest : current
  );
  const timeEnd = validSlots.reduce((latest, current) =>
    latest.time_end >= current.time_end ? latest : current
  );

  return {
    time_start: timeStart.time_start,
    time_end: timeEnd.time_end,
  };
}

async function sendReservationEmail({
  userEmail,
  serviceName,
  reservationDate,
  timeStart,
  timeEnd,
  quantity,
  reservationId,
  qrEntries,
}: {
  userEmail: string;
  serviceName: string;
  reservationDate: string;
  timeStart: string;
  timeEnd: string;
  quantity: number;
  reservationId: number;
  qrEntries: Array<{ label: string; filename: string; content: Buffer; contentId: string }>;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!resendApiKey) {
    console.warn("Resend no está configurado; se omite el envío del correo.");
    return;
  }

  const resend = new Resend(resendApiKey);

  const qrHtml = qrEntries
    .map(
      ({ label, contentId }) => `
        <div style="margin: 16px 0; text-align: center;">
          <p style="margin: 0 0 8px; font-weight: 600;">${label}</p>
          <img src="cid:${contentId}" alt="${label}" style="max-width: 220px; width: 100%; border-radius: 12px;" />
        </div>
      `
    )
    .join("");

  await resend.emails.send({
    from: resendFromEmail,
    to: userEmail,
    subject: "Tu reserva está confirmada - Otium",
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; padding: 24px;">
        <h2 style="margin: 0 0 16px;">Tu reserva está confirmada</h2>
        <p style="margin: 0 0 8px;"><strong>Servicio:</strong> ${serviceName}</p>
        <p style="margin: 0 0 8px;"><strong>Fecha:</strong> ${reservationDate}</p>
        <p style="margin: 0 0 8px;"><strong>Horario:</strong> ${timeStart} - ${timeEnd}</p>
        <p style="margin: 0 0 8px;"><strong>Personas:</strong> ${quantity}</p>
        <p style="margin: 0 0 20px;"><strong>Reserva:</strong> #${reservationId}</p>
        ${qrHtml}
      </div>
    `,
    attachments: qrEntries.map(({ filename, content, contentId }) => ({
      filename,
      content,
      contentId,
      contentType: "image/png",
    })),
  });
}

async function generateQrRecords({
  reservationId,
  serviceQrType,
  quantity,
}: {
  reservationId: number;
  serviceQrType: string;
  quantity: number;
}) {
  const count = getQrQuantity({ quantity }, { qr_type: serviceQrType });

  const qrEntries: Array<{
    label: string;
    filename: string;
    content: Buffer;
    contentId: string;
    token: string;
  }> = [];

  for (let index = 0; index < count; index += 1) {
    const token = randomBytes(32).toString("hex");
    const buffer = await QRCode.toBuffer(token);
    const contentId = `qr-${reservationId}-${index + 1}`;
    const label = serviceQrType === "group" ? "Pase grupal" : `Persona ${index + 1}`;

    qrEntries.push({
      label,
      filename: `qr-${index + 1}.png`,
      content: Buffer.from(buffer),
      contentId,
      token,
    });
  }

  return qrEntries;
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (isStripeSignatureMissing(signature)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const payment = await prisma.payments.findUnique({
        where: { stripe_payment_intent_id: intent.id },
        include: {
          reservations: {
            include: {
              users: true,
              reservation_slots: {
                include: {
                  time_slots: {
                    include: {
                      services: true,
                    },
                  },
                },
              },
              qr_codes: true,
            },
          },
        },
      });

      if (!payment) {
        return NextResponse.json({ data: { received: true } });
      }

      if (payment.status === "succeeded") {
        return NextResponse.json({ data: { received: true } });
      }

      const reservation = payment.reservations;
      if (!reservation) {
        return NextResponse.json({ data: { received: true } });
      }

      if (reservation.status === "confirmed") {
        return NextResponse.json({ data: { received: true } });
      }

      const now = new Date();
      const reservationExpired =
        reservation.expires_at !== null && reservation.expires_at <= now;

      const service =
        reservation.reservation_slots[0]?.time_slots?.services ?? null;

      if (reservationExpired) {
        await prisma.$transaction(async (tx) => {
          await tx.payments.update({
            where: { stripe_payment_intent_id: intent.id },
            data: { status: "succeeded" },
          });

          await tx.reservations.update({
            where: { id: reservation.id },
            data: {
              status: "expired",
              expires_at: null,
            },
          });

          await tx.reservation_slots.updateMany({
            where: {
              id_reservation: reservation.id,
              is_active: true,
            },
            data: { is_active: false },
          });
        });

        console.warn(
          `Pago exitoso recibido para reserva ${reservation.id} después de expirar.`
        );
        return NextResponse.json({ data: { received: true } });
      }

      const qrEntries = await generateQrRecords({
        reservationId: reservation.id,
        serviceQrType: service?.qr_type ?? "group",
        quantity: reservation.quantity,
      });

      await prisma.$transaction(async (tx) => {
        const existingQrs = await tx.qr_codes.count({
          where: { id_reservation: reservation.id },
        });

        if (existingQrs > 0) {
          return;
        }

        await tx.payments.update({
          where: { stripe_payment_intent_id: intent.id },
          data: { status: "succeeded" },
        });

        await tx.reservations.update({
          where: { id: reservation.id },
          data: {
            status: "confirmed",
            expires_at: null,
          },
        });

        await tx.qr_codes.createMany({
          data: qrEntries.map(({ token }) => ({
            id_reservation: reservation.id,
            token,
            used_at: null,
            used_by: null,
          })),
        });
      });

      if (reservation.users?.email && service) {
        const timeRange = getTimeRangeLabel(reservation.reservation_slots);
        const start = timeRange.time_start
          ? new Date(timeRange.time_start).toISOString().slice(11, 16)
          : "";
        const end = timeRange.time_end
          ? new Date(timeRange.time_end).toISOString().slice(11, 16)
          : "";

        try {
          await sendReservationEmail({
            userEmail: reservation.users.email,
            serviceName: service.name,
            reservationDate: reservation.reservation_slots[0]?.slot_date
              ? new Date(reservation.reservation_slots[0].slot_date).toISOString().slice(0, 10)
              : "",
            timeStart: start,
            timeEnd: end,
            quantity: reservation.quantity,
            reservationId: reservation.id,
            qrEntries: qrEntries.map(({ label, filename, content, contentId }) => ({
              label,
              filename,
              content,
              contentId,
            })),
          });
        } catch (error) {
          console.error("Error enviando correo de reserva confirmada:", error);
        }
      }

      return NextResponse.json({ data: { received: true } });
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const payment = await prisma.payments.findUnique({
        where: { stripe_payment_intent_id: intent.id },
        include: { reservations: true },
      });

      if (!payment) {
        return NextResponse.json({ data: { received: true } });
      }

      if (payment.status === "failed") {
        return NextResponse.json({ data: { received: true } });
      }

      if (payment.reservations) {
        const reservation = payment.reservations;

        await prisma.$transaction(async (tx) => {
          await tx.payments.update({
            where: { stripe_payment_intent_id: intent.id },
            data: { status: "failed" },
          });

          await tx.reservations.update({
            where: { id: reservation.id },
            data: { status: "failed" },
          });

          await tx.reservation_slots.updateMany({
            where: {
              id_reservation: reservation.id,
              is_active: true,
            },
            data: { is_active: false },
          });
        });
      }

      return NextResponse.json({ data: { received: true } });
    }

    return NextResponse.json({ data: { received: true } });
  } catch (error) {
    console.error("Error al procesar el evento de Stripe:", error);
    return NextResponse.json(
      { error: "Error al procesar el evento" },
      { status: 500 }
    );
  }
}
