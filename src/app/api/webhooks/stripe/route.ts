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

async function sendReservationEmail({
  userEmail,
  serviceName,
  reservationDate,
  reservationId,
  qrBuffers,
}: {
  userEmail: string;
  serviceName: string;
  reservationDate: string;
  reservationId: number;
  qrBuffers: Array<{ filename: string; content: Buffer }>;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !resendFromEmail) {
    console.warn("Resend no está configurado; se omite el envío del correo.");
    return;
  }

  const resend = new Resend(resendApiKey);

  const attachments = qrBuffers.map(({ filename, content }) => ({
    filename,
    content,
    contentType: "image/png",
  }));

  const qrHtml = qrBuffers
    .map(
      ({ filename }, index) => `
        <div style="margin: 16px 0; text-align: center;">
          <p style="margin: 0 0 8px; font-weight: 600;">QR ${index + 1}</p>
          <img src="cid:${filename}" alt="QR de la reserva" style="max-width: 220px; width: 100%; border-radius: 12px;" />
        </div>
      `
    )
    .join("");

  await resend.emails.send({
    from: resendFromEmail,
    to: userEmail,
    subject: "Reserva confirmada",
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; padding: 24px;">
        <h2 style="margin: 0 0 16px;">Tu reserva está confirmada</h2>
        <p style="margin: 0 0 8px;">Servicio: <strong>${serviceName}</strong></p>
        <p style="margin: 0 0 8px;">Fecha: <strong>${reservationDate}</strong></p>
        <p style="margin: 0 0 20px;">Reserva #${reservationId}</p>
        ${qrHtml}
      </div>
    `,
    attachments,
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
  const count = serviceQrType === "group" ? 1 : quantity;

  const qrBufferList: Array<{ filename: string; content: Buffer }> = [];
  const tokens: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const token = randomBytes(32).toString("hex");
    const buffer = await QRCode.toBuffer(token);
    qrBufferList.push({
      filename: `qr-${reservationId}-${index + 1}.png`,
      content: Buffer.from(buffer),
    });
    tokens.push(token);
  }

  return {
    qrBufferList,
    tokens,
  };
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
        });

        console.warn(
          `Pago exitoso recibido para reserva ${reservation.id} después de expirar.`
        );
        return NextResponse.json({ data: { received: true } });
      }

      const qrQuantity = getQrQuantity(reservation, service);
      const qrGeneration = await generateQrRecords({
        reservationId: reservation.id,
        serviceQrType: service?.qr_type ?? "group",
        quantity: qrQuantity,
      });

      await prisma.$transaction(async (tx) => {
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

        if (qrGeneration.tokens.length > 0) {
          await tx.qr_codes.createMany({
            data: qrGeneration.tokens.map((token) => ({
              id_reservation: reservation.id,
              token,
              used_at: null,
              used_by: null,
            })),
          });
        }
      });

      if (reservation.users?.email && service) {
        try {
          await sendReservationEmail({
            userEmail: reservation.users.email,
            serviceName: service.name,
            reservationDate: reservation.reservation_slots[0]?.slot_date
              ? new Date(reservation.reservation_slots[0].slot_date).toISOString().slice(0, 10)
              : "",
            reservationId: reservation.id,
            qrBuffers: qrGeneration.qrBufferList,
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
        await prisma.$transaction(async (tx) => {
          await tx.payments.update({
            where: { stripe_payment_intent_id: intent.id },
            data: { status: "failed" },
          });

          const reservation = payment.reservations;
          if (!reservation) {
            return;
          }

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
