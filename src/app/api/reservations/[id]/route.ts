import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { calculateReservationAmount } from "@/lib/reservation-amount";
import { reconcileReservationPayment } from "@/lib/reservation-reconciliation";
import type { ApiError, ApiResponse } from "@/types/api";
import { formatInTimeZone } from "date-fns-tz";
import { NextResponse } from "next/server";

const TIME_ZONE = "America/Bogota";

function parseReservationId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const reservationId = Number(value);
  return Number.isSafeInteger(reservationId) && reservationId > 0
    ? reservationId
    : null;
}

function formatDateOnly(value: Date): string {
  return formatInTimeZone(value, TIME_ZONE, "yyyy-MM-dd");
}

function formatTimeOnly(value: Date): string {
  return formatInTimeZone(value, TIME_ZONE, "HH:mm");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reservationId = parseReservationId(id);

  if (reservationId === null) {
    return NextResponse.json<ApiError>(
      { error: "Reserva no encontrada" },
      { status: 404 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json<ApiError>({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await prisma.public_users.findUnique({
    where: { id: user.id },
    select: { id: true, role: true },
  });

  if (!profile || profile.role !== "client") {
    return NextResponse.json<ApiError>({ error: "No autorizado" }, { status: 403 });
  }

  try {
    let reservation = await prisma.reservations.findUnique({
      where: { id: reservationId },
      include: {
        reservation_slots: {
          where: { is_active: true },
          include: {
            time_slots: {
              include: {
                services: true,
              },
            },
          },
        },
        payments: true,
        qr_codes: true,
      },
    });

    if (!reservation || reservation.id_user !== user.id) {
      return NextResponse.json<ApiError>(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (reservation.status === "pending" || reservation.qr_codes.length === 0) {
      const reconciled = await reconcileReservationPayment(reservation.id);
      if (reconciled) {
        reservation = reconciled;
      }
    }

    const orderedSlots = [...reservation.reservation_slots].sort(
      (left, right) => left.slot_date.getTime() - right.slot_date.getTime()
    );

    const serviceEntry =
      orderedSlots.find((slot) => slot.time_slots?.services)?.time_slots?.services ??
      null;

    const slots = orderedSlots
      .map((slot) => {
        if (!slot.time_slots || slot.id_time_slot === null) {
          return null;
        }

        return {
          time_slot_id: slot.id_time_slot,
          time_start: formatTimeOnly(slot.time_slots.time_start),
          time_end: formatTimeOnly(slot.time_slots.time_end),
        };
      })
      .filter(
        (
          slot
        ): slot is { time_slot_id: number; time_start: string; time_end: string } =>
          slot !== null
      );

    const amount =
      reservation.payments !== null && reservation.payments !== undefined
        ? Number(reservation.payments.amount)
        : serviceEntry
          ? calculateReservationAmount({
              serviceHourPrice: serviceEntry.hour_price,
              reservationSlots: reservation.reservation_slots,
              quantity: reservation.quantity,
            })
          : 0;

    const response = {
      reservation_id: reservation.id,
      service: {
        id: serviceEntry?.id ?? 0,
        name: serviceEntry?.name ?? "",
      },
      reservation_date: orderedSlots[0]?.slot_date
        ? formatDateOnly(orderedSlots[0].slot_date)
        : "",
      slots,
      status: reservation.status ?? "pending",
      quantity: reservation.quantity,
      amount,
      expires_at: reservation.expires_at?.toISOString() ?? null,
    } as const;

    const qrCodes =
      reservation.status === "confirmed"
        ? reservation.qr_codes.map((qr) => ({
            qr_id: qr.id,
            token: qr.token,
            used: Boolean(qr.used_at),
          }))
        : [];

    return NextResponse.json<ApiResponse<typeof response & { qr_codes: typeof qrCodes }>>({
      data: {
        ...response,
        qr_codes: qrCodes,
      },
    });
  } catch (error) {
    console.error("Error al consultar la reserva:", error);
    return NextResponse.json<ApiError>(
      { error: "Error al consultar la reserva" },
      { status: 500 }
    );
  }
}
