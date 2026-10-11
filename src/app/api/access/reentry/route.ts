import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const BOGOTA_TIME_ZONE = "America/Bogota";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "No autenticado" }, { status: 401 });
  }

  const dbUser = await prisma.public_users.findUnique({
    where: { id: user.id },
  });

  if (dbUser?.role !== "employee") {
    return Response.json({ error: "No tienes permiso" }, { status: 403 });
  }

  const body: unknown = await request.json();
  const reservationId =
    typeof body === "object" && body !== null && "reservation_id" in body
      ? body.reservation_id
      : undefined;

  if (
    typeof reservationId !== "number" ||
    !Number.isSafeInteger(reservationId) ||
    reservationId <= 0
  ) {
    return Response.json(
      { error: "El número de reserva es obligatorio" },
      { status: 400 },
    );
  }

  const reservation = await prisma.reservations.findUnique({
    where: { id: reservationId },
    include: {
      users: true,
      reservation_slots: {
        include: { time_slots: true },
        orderBy: [{ slot_date: "asc" }, { time_slots: { time_start: "asc" } }],
      },
    },
  });

  if (!reservation) {
    return Response.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const previousEntry = await prisma.access_logs.findFirst({
    where: {
      id_reservation: reservation.id,
      result: "granted",
    },
  });

  if (!previousEntry) {
    return Response.json(
      { error: "Esta reserva todavía no tiene un primer ingreso" },
      { status: 400 },
    );
  }

  const firstSlot = reservation.reservation_slots[0];
  const lastSlot =
    reservation.reservation_slots[reservation.reservation_slots.length - 1];

  if (!firstSlot?.time_slots || !lastSlot?.time_slots) {
    return Response.json(
      { error: "La franja de esta reserva ya terminó" },
      { status: 400 },
    );
  }

  const startDate = formatInTimeZone(firstSlot.slot_date, "UTC", "yyyy-MM-dd");
  const startTime = formatInTimeZone(
    firstSlot.time_slots.time_start,
    "UTC",
    "HH:mm:ss.SSS",
  );
  const endDate = formatInTimeZone(lastSlot.slot_date, "UTC", "yyyy-MM-dd");
  const endTime = formatInTimeZone(
    lastSlot.time_slots.time_end,
    "UTC",
    "HH:mm:ss.SSS",
  );
  const slotStart = fromZonedTime(
    `${startDate}T${startTime}`,
    BOGOTA_TIME_ZONE,
  );
  const slotEnd = fromZonedTime(`${endDate}T${endTime}`, BOGOTA_TIME_ZONE);
  const now = new Date();

  if (now < slotStart || now > slotEnd) {
    return Response.json(
      { error: "La franja de esta reserva ya terminó" },
      { status: 400 },
    );
  }

  if (!reservation.users) {
    throw new Error(
      `La reserva ${reservation.id} no tiene un titular asociado para registrar el reingreso`,
    );
  }

  await prisma.access_logs.create({
    data: {
      id_reservation: reservation.id,
      id_employee: dbUser.id,
      id_qr_code: null,
      entry_type: "manual",
      result: "granted",
    },
  });

  return Response.json(
    {
      data: {
        valid: true,
        reservation_id: reservation.id,
        holder_name: reservation.users.name,
      },
    },
    { status: 200 },
  );
}
