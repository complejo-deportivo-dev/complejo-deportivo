import { Prisma } from "@/generated/prisma/client";

export function timeInMilliseconds(value: Date): number {
  return (
    value.getUTCHours() * 3_600_000 +
    value.getUTCMinutes() * 60_000 +
    value.getUTCSeconds() * 1_000 +
    value.getUTCMilliseconds()
  );
}

export function calculateReservationAmount({
  serviceHourPrice,
  reservationSlots,
  quantity,
}: {
  serviceHourPrice: Prisma.Decimal | number;
  reservationSlots: Array<{
    time_slots: { time_start: Date; time_end: Date } | null;
  }>;
  quantity: number;
}): number {
  const totalMilliseconds = reservationSlots.reduce((total, slot) => {
    const timeSlot = slot.time_slots;
    if (!timeSlot) {
      return total;
    }

    return (
      total +
      (timeInMilliseconds(timeSlot.time_end) -
        timeInMilliseconds(timeSlot.time_start))
    );
  }, 0);

  const hours = totalMilliseconds / 3_600_000;
  const price =
    typeof serviceHourPrice === "number"
      ? serviceHourPrice
      : Number(serviceHourPrice);

  return Number(new Prisma.Decimal(hours).mul(price).mul(quantity).toFixed(2));
}
