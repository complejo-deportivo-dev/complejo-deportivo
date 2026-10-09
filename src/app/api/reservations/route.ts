import { createClient } from "@/lib/supabase/server";
import { validateAvailabilityDate } from "@/lib/service-availability";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type {
  ApiError,
  ApiResponse,
  CreateReservationRequest,
  CreateReservationResponse,
} from "@/types/api";
import { formatInTimeZone } from "date-fns-tz";
import { NextResponse } from "next/server";
import { z } from "zod";

const MAX_SMALLINT_ID = 32_767;
const TIME_ZONE = "America/Bogota";
const RESERVATION_DURATION_MS = 10 * 60 * 1000;

const createReservationSchema = z
  .object({
    service_id: z.number().int().positive().max(MAX_SMALLINT_ID),
    time_slot_ids: z
      .array(z.number().int().positive().max(MAX_SMALLINT_ID))
      .min(1),
    reservation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    quantity: z.number().int().positive().optional(),
    number_document: z.string().trim().min(1).max(20).optional(),
  })
  .strict();

type ReservationTransactionResult = {
  reservation_id: number;
  expires_at: string;
  amount: number;
};

class ReservationRequestError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 401 | 404
  ) {
    super(message);
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

function timeInMilliseconds(value: Date): number {
  return (
    value.getUTCHours() * 3_600_000 +
    value.getUTCMinutes() * 60_000 +
    value.getUTCSeconds() * 1_000 +
    value.getUTCMilliseconds()
  );
}

function timeStringInMilliseconds(value: string): number {
  const [hours, minutes, seconds] = value.split(":").map(Number);
  return hours * 3_600_000 + minutes * 60_000 + seconds * 1_000;
}

function validateConsecutiveSlots(
  slots: { time_start: Date; time_end: Date }[]
): boolean {
  for (let index = 1; index < slots.length; index += 1) {
    if (
      timeInMilliseconds(slots[index - 1].time_end) !==
      timeInMilliseconds(slots[index].time_start)
    ) {
      return false;
    }
  }
  return true;
}

function reservationDateErrorMessage(validationError: string): string {
  if (validationError === "No se puede consultar una fecha pasada") {
    return "No se permiten reservas en fechas pasadas";
  }
  if (
    validationError ===
    "Solo se puede reservar con máximo 15 días de anticipación"
  ) {
    return "No se puede reservar con más de 15 días de anticipación";
  }
  return "Datos inválidos";
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

  const parsedBody = createReservationSchema.safeParse(requestBody);
  if (!parsedBody.success) {
    return NextResponse.json<ApiError>(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  const body: CreateReservationRequest = parsedBody.data;
  if (new Set(body.time_slot_ids).size !== body.time_slot_ids.length) {
    return NextResponse.json<ApiError>(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  const now = new Date();
  const reservationDate = validateAvailabilityDate(
    body.reservation_date,
    now
  );
  if (!reservationDate.success) {
    return NextResponse.json<ApiError>(
      { error: reservationDateErrorMessage(reservationDate.error) },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(
      async (tx): Promise<ReservationTransactionResult> => {
        const lockKeys = [
          `reservation:user:${userId}:${body.reservation_date}`,
          ...body.time_slot_ids.map(
            (slotId) => `reservation:slot:${body.reservation_date}:${slotId}`
          ),
        ].sort();

        for (const lockKey of lockKeys) {
          await tx.$queryRaw`
            SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))
          `;
        }

        const transactionNow = new Date();
        const transactionDate = validateAvailabilityDate(
          body.reservation_date,
          transactionNow
        );
        if (!transactionDate.success) {
          throw new ReservationRequestError(
            reservationDateErrorMessage(transactionDate.error),
            400
          );
        }

        const profile = await tx.public_users.findUnique({
          where: { id: userId },
          select: {
            id: true,
            role: true,
            is_active: true,
            number_document: true,
          },
        });

        if (
          !profile ||
          !profile.is_active ||
          profile.role !== "client"
        ) {
          throw new ReservationRequestError("No autenticado", 401);
        }

        if (!profile.number_document && !body.number_document) {
          throw new ReservationRequestError(
            "Debes indicar tu cédula para reservar",
            400
          );
        }

        const service = await tx.services.findUnique({
          where: { id: body.service_id },
          select: {
            id: true,
            qr_type: true,
            capacity: true,
            hour_price: true,
            is_active: true,
          },
        });

        if (!service || !service.is_active) {
          throw new ReservationRequestError(
            "Servicio o franja no encontrados",
            404
          );
        }

        if (
          service.qr_type !== "group" &&
          service.qr_type !== "individual"
        ) {
          throw new Error("El tipo de servicio no es válido");
        }

        if (service.qr_type === "individual" && body.quantity === undefined) {
          throw new ReservationRequestError(
            "Cantidad de personas inválida",
            400
          );
        }

        const quantity =
          service.qr_type === "group" ? 1 : body.quantity!;
        if (quantity > service.capacity) {
          throw new ReservationRequestError(
            "La cantidad supera el cupo disponible",
            400
          );
        }

        const timeSlots = await tx.time_slots.findMany({
          where: { id: { in: body.time_slot_ids } },
          select: {
            id: true,
            id_service: true,
            time_start: true,
            time_end: true,
          },
        });

        if (timeSlots.length !== body.time_slot_ids.length) {
          throw new ReservationRequestError(
            "Servicio o franja no encontrados",
            404
          );
        }

        if (timeSlots.some((slot) => slot.id_service !== service.id)) {
          throw new ReservationRequestError(
            "Las franjas deben ser del mismo servicio y seguidas",
            400
          );
        }

        const orderedSlots = [...timeSlots].sort(
          (a, b) =>
            timeInMilliseconds(a.time_start) -
            timeInMilliseconds(b.time_start)
        );
        if (!validateConsecutiveSlots(orderedSlots)) {
          throw new ReservationRequestError(
            "Las franjas deben ser del mismo servicio y seguidas",
            400
          );
        }

        const currentDate = formatInTimeZone(
          transactionNow,
          TIME_ZONE,
          "yyyy-MM-dd"
        );
        const currentTime = timeStringInMilliseconds(
          formatInTimeZone(transactionNow, TIME_ZONE, "HH:mm:ss")
        );
        if (
          body.reservation_date === currentDate &&
          orderedSlots.some(
            (slot) => timeInMilliseconds(slot.time_start) <= currentTime
          )
        ) {
          throw new ReservationRequestError("Franja no disponible", 400);
        }

        const activeReservationFilter = {
          OR: [
            { status: "confirmed" },
            { status: "pending", expires_at: { gt: transactionNow } },
          ],
        };

        const userReservations = await tx.reservation_slots.findMany({
          where: {
            slot_date: reservationDate.date,
            is_active: true,
            reservations: {
              is: {
                id_user: profile.id,
                ...activeReservationFilter,
              },
            },
          },
          select: {
            time_slots: {
              select: {
                time_start: true,
                time_end: true,
              },
            },
          },
        });

        const hasUserConflict = userReservations.some(
          ({ time_slots: existingSlot }) =>
            existingSlot !== null &&
            orderedSlots.some(
              (requestedSlot) =>
                timeInMilliseconds(existingSlot.time_start) <
                  timeInMilliseconds(requestedSlot.time_end) &&
                timeInMilliseconds(requestedSlot.time_start) <
                  timeInMilliseconds(existingSlot.time_end)
            )
        );
        if (hasUserConflict) {
          throw new ReservationRequestError(
            "Conflicto de horario: ya tienes una reserva en esa franja",
            400
          );
        }

        const occupiedSlots = await tx.reservation_slots.findMany({
          where: {
            id_time_slot: { in: body.time_slot_ids },
            slot_date: reservationDate.date,
            is_active: true,
            reservations: { is: activeReservationFilter },
          },
          select: {
            id_time_slot: true,
            reservations: { select: { quantity: true } },
          },
        });

        const quantityBySlot = new Map<number, number>();
        for (const reservationSlot of occupiedSlots) {
          const slotId = reservationSlot.id_time_slot;
          const reservedQuantity = reservationSlot.reservations?.quantity;
          if (slotId === null || reservedQuantity === undefined) {
            continue;
          }

          quantityBySlot.set(
            slotId,
            (quantityBySlot.get(slotId) ?? 0) + reservedQuantity
          );
        }

        const unavailable = orderedSlots.some((slot) => {
          const reservedQuantity = quantityBySlot.get(slot.id) ?? 0;
          return service.qr_type === "group"
            ? reservedQuantity > 0
            : reservedQuantity + quantity > service.capacity;
        });
        if (unavailable) {
          throw new ReservationRequestError("Franja no disponible", 400);
        }

        if (!profile.number_document && body.number_document) {
          await tx.public_users.update({
            where: { id: profile.id },
            data: { number_document: body.number_document },
          });
        }

        const expiresAt = new Date(
          transactionNow.getTime() + RESERVATION_DURATION_MS
        );
        const totalDurationMs = orderedSlots.reduce(
          (total, slot) =>
            total +
            timeInMilliseconds(slot.time_end) -
            timeInMilliseconds(slot.time_start),
          0
        );
        const amount = new Prisma.Decimal(totalDurationMs)
          .div(3_600_000)
          .mul(service.hour_price)
          .mul(quantity)
          .toDecimalPlaces(2)
          .toNumber();

        const reservation = await tx.reservations.create({
          data: {
            id_user: profile.id,
            quantity,
            status: "pending",
            expires_at: expiresAt,
          },
          select: { id: true },
        });

        await tx.reservation_slots.createMany({
          data: orderedSlots.map((slot) => ({
            id_reservation: reservation.id,
            id_time_slot: slot.id,
            slot_date: reservationDate.date,
            is_active: true,
          })),
        });

        return {
          reservation_id: reservation.id,
          expires_at: expiresAt.toISOString(),
          amount,
        };
      },
      { maxWait: 5_000, timeout: 10_000 }
    );

    return NextResponse.json<ApiResponse<CreateReservationResponse>>(
      { data: result },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ReservationRequestError) {
      return NextResponse.json<ApiError>(
        { error: error.message },
        { status: error.status }
      );
    }

    if (isUniqueConstraintError(error)) {
      return NextResponse.json<ApiError>(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    console.error("Error al crear la reserva:", error);
    return NextResponse.json<ApiError>(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}
