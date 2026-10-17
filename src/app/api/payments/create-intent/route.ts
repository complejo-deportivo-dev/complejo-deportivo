import { Prisma } from "@/generated/prisma/client";
import { calculateReservationAmount } from "@/lib/reservation-amount";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type {
  ApiError,
  ApiResponse,
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
} from "@/types/api";
import { NextResponse } from "next/server";
import { z } from "zod";

const createPaymentIntentSchema = z
  .object({
    reservation_id: z.number().int().positive(),
  })
  .strict();

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function POST(request: Request) {
  let userId: string;
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ApiError>(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    userId = user.id;
  } catch (error) {
    console.error("Error al validar la sesión del cliente:", error);
    return NextResponse.json<ApiError>(
      { error: "Error al validar la sesión" },
      { status: 500 }
    );
  }

  let requestBody: unknown;
  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  const parsedBody = createPaymentIntentSchema.safeParse(requestBody);
  if (!parsedBody.success) {
    return NextResponse.json<ApiError>(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  const body: CreatePaymentIntentRequest = parsedBody.data;

  let reservation;
  try {
    reservation = await prisma.reservations.findUnique({
      where: { id: body.reservation_id },
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
      },
    });
  } catch (error) {
    console.error("Error al obtener la reserva para el pago:", error);
    return NextResponse.json<ApiError>(
      { error: "No se pudo obtener la reserva" },
      { status: 500 }
    );
  }

  if (!reservation) {
    return NextResponse.json<ApiError>(
      { error: "Reserva no encontrada" },
      { status: 404 }
    );
  }

  if (reservation.id_user !== userId) {
    return NextResponse.json<ApiError>(
      { error: "No tienes permiso" },
      { status: 403 }
    );
  }

  if (reservation.status !== "pending") {
    return NextResponse.json<ApiError>(
      { error: "La reserva no está pendiente de pago" },
      { status: 400 }
    );
  }

  if (reservation.expires_at && reservation.expires_at < new Date()) {
    await prisma.$transaction(async (tx) => {
      await tx.reservations.update({
        where: { id: reservation.id },
        data: { status: "expired" },
      });
      await tx.reservation_slots.updateMany({
        where: { id_reservation: reservation.id, is_active: true },
        data: { is_active: false },
      });
    });

    return NextResponse.json<ApiError>(
      { error: "La reserva ha expirado" },
      { status: 400 }
    );
  }

  const serviceHourPrice =
    reservation.reservation_slots[0]?.time_slots?.services?.hour_price;
  if (serviceHourPrice === undefined) {
    return NextResponse.json<ApiError>(
      { error: "La reserva no tiene un servicio válido para calcular el pago" },
      { status: 400 }
    );
  }

  const amount = calculateReservationAmount({
    serviceHourPrice,
    reservationSlots: reservation.reservation_slots,
    quantity: reservation.quantity,
  });

  let intent;
  try {
    intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "cop",
      metadata: {
        reservation_id: String(reservation.id),
        user_id: userId,
      },
    });
  } catch (error) {
    console.error("Error al crear el intento de pago en Stripe:", error);
    return NextResponse.json<ApiError>(
      { error: "No se pudo iniciar el pago" },
      { status: 500 }
    );
  }

  if (!intent.client_secret) {
    console.error("Stripe creó un intento de pago sin client_secret:", intent.id);
    return NextResponse.json<ApiError>(
      { error: "No se pudo iniciar el pago" },
      { status: 500 }
    );
  }

  try {
    await prisma.payments.create({
      data: {
        id_reservation: reservation.id,
        stripe_payment_intent_id: intent.id,
        status: "pending",
        amount: new Prisma.Decimal(amount),
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json<ApiError>(
        { error: "La reserva ya tiene un pago confirmado" },
        { status: 400 }
      );
    }

    console.error("Error al registrar el pago:", error);
    return NextResponse.json<ApiError>(
      { error: "No se pudo registrar el pago" },
      { status: 500 }
    );
  }

  const response: CreatePaymentIntentResponse = {
    client_secret: intent.client_secret,
    amount,
    expires_at: reservation.expires_at?.toISOString() ?? "",
  };

  return NextResponse.json<ApiResponse<CreatePaymentIntentResponse>>({
    data: response,
  });
}
