import { formatInTimeZone } from "date-fns-tz";
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
  const numberDocument =
    typeof body === "object" && body !== null && "number_document" in body
      ? body.number_document
      : undefined;

  if (
    typeof reservationId !== "number" ||
    !Number.isSafeInteger(reservationId) ||
    reservationId <= 0 ||
    typeof numberDocument !== "string" ||
    numberDocument.trim().length === 0
  ) {
    return Response.json(
      { error: "Reserva y cédula son obligatorias" },
      { status: 400 },
    );
  }

  const reservation = await prisma.reservations.findUnique({
    where: { id: reservationId },
    include: {
      users: true,
      reservation_slots: {
        include: { time_slots: { include: { services: true } } },
        orderBy: [{ slot_date: "asc" }, { time_slots: { time_start: "asc" } }],
      },
    },
  });

  if (!reservation) {
    return Response.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  if (reservation.users?.number_document !== numberDocument.trim()) {
    return Response.json(
      { error: "La cédula no coincide con el titular de la reserva" },
      { status: 400 },
    );
  }

  if (reservation.status !== "confirmed") {
    return Response.json(
      { error: "La reserva no está confirmada" },
      { status: 400 },
    );
  }

  const firstSlot = reservation.reservation_slots[0];
  const lastSlot =
    reservation.reservation_slots[reservation.reservation_slots.length - 1];
  const todayInBogota = formatInTimeZone(
    new Date(),
    BOGOTA_TIME_ZONE,
    "yyyy-MM-dd",
  );
  const reservationDate = firstSlot
    ? formatInTimeZone(firstSlot.slot_date, "UTC", "yyyy-MM-dd")
    : null;

  if (reservationDate !== todayInBogota) {
    return Response.json(
      { error: "El código no corresponde a la fecha de hoy" },
      { status: 400 },
    );
  }

  if (
    !reservation.users ||
    !firstSlot?.time_slots?.services ||
    !lastSlot?.time_slots
  ) {
    throw new Error(
      `La reserva ${reservation.id} no tiene los datos necesarios para validar el acceso`,
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
        service_name: firstSlot.time_slots.services.name,
        time_start: formatInTimeZone(
          firstSlot.time_slots.time_start,
          "UTC",
          "HH:mm",
        ),
        time_end: formatInTimeZone(
          lastSlot.time_slots.time_end,
          "UTC",
          "HH:mm",
        ),
      },
    },
    { status: 200 },
  );
}
