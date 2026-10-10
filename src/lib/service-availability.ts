import { formatInTimeZone } from "date-fns-tz";
import type { ServiceSlot } from "@/types/api";
import type { QrType } from "@/types/database";

const TIME_ZONE = "America/Bogota";
const MAX_ADVANCE_DAYS = 15;

type DateValidation =
  | {
      success: true;
      date: Date;
      isToday: boolean;
      currentTime: string;
    }
  | {
      success: false;
      error: string;
    };

type TimeSlot = {
  id: number;
  time_start: Date;
  time_end: Date;
};

type ReservationSlot = {
  id_time_slot: number | null;
  reservations: { quantity: number } | null;
};

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function validateAvailabilityDate(
  value: string | null,
  now: Date
): DateValidation {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { success: false, error: "Fecha inválida" };
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return { success: false, error: "Fecha inválida" };
  }

  const today = formatInTimeZone(now, TIME_ZONE, "yyyy-MM-dd");
  if (value < today) {
    return {
      success: false,
      error: "No se puede consultar una fecha pasada",
    };
  }

  if (value > addDays(today, MAX_ADVANCE_DAYS)) {
    return {
      success: false,
      error: "Solo se puede reservar con máximo 15 días de anticipación",
    };
  }

  return {
    success: true,
    date,
    isToday: value === today,
    currentTime: formatInTimeZone(now, TIME_ZONE, "HH:mm"),
  };
}

function formatTime(value: Date): string {
  return `${String(value.getUTCHours()).padStart(2, "0")}:${String(
    value.getUTCMinutes()
  ).padStart(2, "0")}`;
}

export function calculateSlotAvailability(
  slots: TimeSlot[],
  reservationSlots: ReservationSlot[],
  service: { qr_type: QrType; capacity: number },
  date: { isToday: boolean; currentTime: string }
): ServiceSlot[] {
  const reservationsBySlot = new Map<number, number[]>();

  for (const reservationSlot of reservationSlots) {
    const slotId = reservationSlot.id_time_slot;
    const quantity = reservationSlot.reservations?.quantity;
    if (slotId === null || quantity === undefined) {
      continue;
    }

    const quantities = reservationsBySlot.get(slotId) ?? [];
    quantities.push(quantity);
    reservationsBySlot.set(slotId, quantities);
  }

  return slots.map((slot) => {
    const timeStart = formatTime(slot.time_start);
    const timeEnd = formatTime(slot.time_end);
    const hasStarted = date.isToday && timeStart <= date.currentTime;
    const quantities = reservationsBySlot.get(slot.id) ?? [];

    if (service.qr_type === "group") {
      return {
        time_slot_id: slot.id,
        time_start: timeStart,
        time_end: timeEnd,
        available: !hasStarted && quantities.length === 0,
      };
    }

    const remainingCapacity = Math.max(
      0,
      service.capacity - quantities.reduce((total, quantity) => total + quantity, 0)
    );

    return {
      time_slot_id: slot.id,
      time_start: timeStart,
      time_end: timeEnd,
      available: !hasStarted && remainingCapacity > 0,
      remaining_capacity: remainingCapacity,
    };
  });
}
