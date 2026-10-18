import { createClient } from "@/lib/supabase/server";
import { MAX_SMALLINT_ID } from "@/lib/catalog";
import {
  calculateSlotAvailability,
  validateAvailabilityDate,
} from "@/lib/service-availability";
import { prisma } from "@/lib/prisma";
import type { ApiError, ApiResponse, ServiceSlot } from "@/types/api";
import type { QrType } from "@/types/database";
import { NextResponse } from "next/server";

function parseServiceId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }

  const serviceId = Number(value);
  return Number.isSafeInteger(serviceId) && serviceId > 0
    ? serviceId
    : null;
}

function isQrType(value: string): value is QrType {
  return value === "group" || value === "individual";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const requestUrl = new URL(request.url);
  const serviceId = parseServiceId(id);

  if (serviceId === null) {
    return NextResponse.json<ApiError>(
      { error: "ID de servicio inválido" },
      { status: 400 }
    );
  }

  if (serviceId > MAX_SMALLINT_ID) {
    return NextResponse.json<ApiError>(
      { error: "Servicio no encontrado" },
      { status: 404 }
    );
  }

  const now = new Date();
  const date = validateAvailabilityDate(
    requestUrl.searchParams.get("date"),
    now
  );

  if (!date.success) {
    const message = "error" in date ? date.error : "Error desconocido";
    return NextResponse.json<ApiError>(
      { error: message },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const service = await prisma.services.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        qr_type: true,
        capacity: true,
        is_active: true,
      },
    });

    if (!service || !service.is_active) {
      return NextResponse.json<ApiError>(
        { error: "Servicio no encontrado" },
        { status: 404 }
      );
    }

    if (!isQrType(service.qr_type)) {
      throw new Error("El tipo de QR del servicio no es válido");
    }

    const timeSlots = await prisma.time_slots.findMany({
      where: { id_service: service.id },
      orderBy: { time_start: "asc" },
      select: {
        id: true,
        time_start: true,
        time_end: true,
      },
    });

    if (timeSlots.length === 0) {
      return NextResponse.json<ApiResponse<ServiceSlot[]>>({
        data: [],
      });
    }

    const reservationSlots = await prisma.reservation_slots.findMany({
      where: {
        id_time_slot: { in: timeSlots.map(({ id }) => id) },
        slot_date: date.date,
        is_active: true,
        reservations: {
          is: {
            OR: [
              { status: "confirmed" },
              { status: "completed" },
              { status: "pending", expires_at: { gt: now } },
            ],
          },
        },
      },
      select: {
        id_time_slot: true,
        reservations: {
          select: {
            quantity: true,
            status: true,
          },
        },
      },
    });

    const activeReservationSlots = reservationSlots.filter(
      (rs) =>
        rs.reservations?.status === "confirmed" ||
        rs.reservations?.status === "completed" ||
        rs.reservations?.status === "pending"
    );
    const reservationsBySlot = new Map<number, number>();
    for (const reservationSlot of activeReservationSlots) {
      const slotId = reservationSlot.id_time_slot;
      const quantity = reservationSlot.reservations?.quantity;
      if (slotId === null || quantity === undefined) {
        continue;
      }

      const reserved = service.qr_type === "group" ? 1 : quantity;
      reservationsBySlot.set(
        slotId,
        (reservationsBySlot.get(slotId) ?? 0) + reserved
      );
    }

    let userReservationIds: number[] = [];
    if (user) {
      const userReservations = await prisma.reservations.findMany({
        where: {
          id_user: user.id,
          // Status check will be done in the mapping
        },
        select: {
          id: true,
          status: true,
        },
      });
      const reservationIds = userReservations.map((r) => r.id);
      if (reservationIds.length > 0) {
        const slots = await prisma.reservation_slots.findMany({
          where: {
            id_reservation: { in: reservationIds },
            id_time_slot: { in: timeSlots.map(({ id }) => id) },
            slot_date: date.date,
            is_active: true,
            // Check status here or filter later
            reservations: {
                status: "confirmed"
            }
          },
          select: {
            id_time_slot: true,
          },
        });
        userReservationIds = slots
          .map((rs) => rs.id_time_slot)
          .filter((id): id is number => id !== null);
      }
    }

    const data = calculateSlotAvailability(
      timeSlots,
      activeReservationSlots,
      { qr_type: service.qr_type, capacity: service.capacity },
      date,
      userReservationIds
    );

    return NextResponse.json<ApiResponse<ServiceSlot[]>>({ 
      data: data.map(slot => ({
        ...slot,
        userHasReservation: userReservationIds.includes(slot.time_slot_id),
        remaining_capacity:
          service.qr_type === "group"
            ? Math.max(0, 1 - (reservationsBySlot.get(slot.time_slot_id) ?? 0))
            : slot.remaining_capacity
      })) 
    });
  } catch (error) {
    console.error("Error al obtener la disponibilidad de las franjas:", error);
    return NextResponse.json<ApiError>(
      { error: "Error al obtener la disponibilidad de las franjas" },
      { status: 500 }
    );
  }
}
