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
    return NextResponse.json<ApiError>(
      { error: date.error },
      { status: 400 }
    );
  }

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
          },
        },
      },
    });

    const data = calculateSlotAvailability(
      timeSlots,
      reservationSlots,
      { qr_type: service.qr_type, capacity: service.capacity },
      date
    );

    return NextResponse.json<ApiResponse<ServiceSlot[]>>({ data });
  } catch (error) {
    console.error("Error al obtener la disponibilidad de las franjas:", error);
    return NextResponse.json<ApiError>(
      { error: "Error al obtener la disponibilidad de las franjas" },
      { status: 500 }
    );
  }
}
