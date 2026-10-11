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
    return Response.json(
      { error: "No tienes permiso para validar accesos" },
      { status: 403 },
    );
  }

  const body: unknown = await request.json();
  const token =
    typeof body === "object" && body !== null && "token" in body
      ? body.token
      : undefined;

  if (typeof token !== "string" || token.length === 0) {
    return Response.json(
      { error: "El código QR es obligatorio" },
      { status: 400 },
    );
  }

  const qr = await prisma.qr_codes.findUnique({
    where: { token },
    include: {
      reservations: {
        include: {
          users: true,
          reservation_slots: {
            include: {
              time_slots: {
                include: { services: true },
              },
            },
            orderBy: [
              { slot_date: "asc" },
              { time_slots: { time_start: "asc" } },
            ],
          },
        },
      },
    },
  });

  if (!qr) {
    return Response.json({ error: "Código QR no reconocido" }, { status: 404 });
  }

  const logDeniedAccess = async () => {
    await prisma.access_logs.create({
      data: {
        id_reservation: qr.id_reservation,
        id_employee: dbUser.id,
        id_qr_code: qr.id,
        entry_type: "qr",
        result: "denied",
      },
    });
  };

  const reservation = qr.reservations;

  if (reservation?.status !== "confirmed") {
    await logDeniedAccess();
    return Response.json(
      { error: "La reserva no está confirmada" },
      { status: 400 },
    );
  }

  const firstSlot = reservation.reservation_slots[0];
  const todayInBogota = formatInTimeZone(
    new Date(),
    BOGOTA_TIME_ZONE,
    "yyyy-MM-dd",
  );
  const reservationDate = firstSlot
    ? formatInTimeZone(firstSlot.slot_date, "UTC", "yyyy-MM-dd")
    : null;

  if (reservationDate !== todayInBogota) {
    await logDeniedAccess();
    return Response.json(
      { error: "El código no corresponde a la fecha de hoy" },
      { status: 400 },
    );
  }

  if (qr.used_at !== null) {
    await logDeniedAccess();
    return Response.json(
      { error: "Este código QR ya fue usado" },
      { status: 409 },
    );
  }

  const lastSlot =
    reservation.reservation_slots[reservation.reservation_slots.length - 1];
  if (
    !firstSlot?.time_slots?.services ||
    !lastSlot?.time_slots ||
    !reservation.users
  ) {
    throw new Error(
      "La reserva no tiene los datos necesarios para validar el acceso",
    );
  }

  const serviceName = firstSlot.time_slots.services.name;
  const holderName = reservation.users.name;

  const transactionResult = await prisma.$transaction(async (tx) => {
    const updated = await tx.$executeRaw`
      UPDATE qr_codes
      SET used_at = NOW(), used_by = ${dbUser.id}::uuid
      WHERE token = ${token} AND used_at IS NULL
    `;

    if (updated === 0) {
      await tx.access_logs.create({
        data: {
          id_reservation: qr.id_reservation,
          id_employee: dbUser.id,
          id_qr_code: qr.id,
          entry_type: "qr",
          result: "denied",
        },
      });
      return false;
    }

    await tx.reservations.update({
      where: { id: reservation.id },
      data: { status: "completed" },
    });
    await tx.access_logs.create({
      data: {
        id_reservation: qr.id_reservation,
        id_employee: dbUser.id,
        id_qr_code: qr.id,
        entry_type: "qr",
        result: "granted",
      },
    });

    return true;
  });

  if (!transactionResult) {
    return Response.json(
      { error: "Este código QR ya fue usado" },
      { status: 409 },
    );
  }

  const dateParts = new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).formatToParts(firstSlot.slot_date);
  const weekday =
    dateParts.find((part) => part.type === "weekday")?.value ?? "";
  const day = dateParts.find((part) => part.type === "day")?.value ?? "";
  const month = dateParts.find((part) => part.type === "month")?.value ?? "";

  return Response.json(
    {
      data: {
        valid: true,
        reservation_id: reservation.id,
        service_name: serviceName,
        holder_name: holderName,
        reservation_date: `${weekday.charAt(0).toLocaleUpperCase("es-CO")}${weekday.slice(1)} ${day} ${month.charAt(0).toLocaleUpperCase("es-CO")}${month.slice(1)}`,
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
        quantity: reservation.quantity,
      },
    },
    { status: 200 },
  );
}
