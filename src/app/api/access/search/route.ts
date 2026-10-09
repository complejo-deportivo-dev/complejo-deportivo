import { formatInTimeZone } from "date-fns-tz";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const BOGOTA_TIME_ZONE = "America/Bogota";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const holderName = searchParams.get("holder_name");
  const numberDocument = searchParams.get("number_document");
  const reservationId = searchParams.get("reservation_id");

  if (
    holderName === null &&
    numberDocument === null &&
    reservationId === null
  ) {
    return Response.json(
      { error: "Debes enviar nombre, cédula o número de reserva" },
      { status: 400 },
    );
  }

  const parsedReservationId =
    reservationId === null ? null : Number(reservationId);
  if (
    parsedReservationId !== null &&
    (!Number.isSafeInteger(parsedReservationId) || parsedReservationId <= 0)
  ) {
    return Response.json({ data: [] }, { status: 200 });
  }

  const todayInBogota = formatInTimeZone(
    new Date(),
    BOGOTA_TIME_ZONE,
    "yyyy-MM-dd",
  );

  const userFilter = {
    ...(holderName !== null
      ? { name: { contains: holderName, mode: "insensitive" as const } }
      : {}),
    ...(numberDocument !== null ? { number_document: numberDocument } : {}),
  };

  const slots = await prisma.reservation_slots.findMany({
    where: {
      is_active: true,
      slot_date: new Date(`${todayInBogota}T00:00:00.000Z`),
      reservations: {
        status: { in: ["confirmed", "completed"] },
        ...(Object.keys(userFilter).length > 0 ? { users: userFilter } : {}),
        ...(parsedReservationId !== null ? { id: parsedReservationId } : {}),
      },
    },
    include: {
      reservations: {
        include: {
          users: true,
          reservation_slots: {
            include: { time_slots: { include: { services: true } } },
            orderBy: [
              { slot_date: "asc" },
              { time_slots: { time_start: "asc" } },
            ],
          },
        },
      },
    },
  });

  const reservations = new Map<
    number,
    NonNullable<(typeof slots)[number]["reservations"]>
  >();
  for (const slot of slots) {
    if (slot.reservations) {
      reservations.set(slot.reservations.id, slot.reservations);
    }
  }

  const data = [...reservations.values()].map((reservation) => {
    const firstSlot = reservation.reservation_slots[0];
    const lastSlot =
      reservation.reservation_slots[reservation.reservation_slots.length - 1];

    if (
      !reservation.users ||
      !firstSlot?.time_slots?.services ||
      !lastSlot?.time_slots ||
      reservation.status === null
    ) {
      throw new Error(
        `La reserva ${reservation.id} no tiene los datos necesarios para mostrar el acceso`,
      );
    }

    const dateParts = new Intl.DateTimeFormat("es-CO", {
      weekday: "short",
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).formatToParts(firstSlot.slot_date);
    const weekday = dateParts
      .find((part) => part.type === "weekday")
      ?.value.replace(/\.$/, "");
    const day = dateParts.find((part) => part.type === "day")?.value;
    const month = dateParts
      .find((part) => part.type === "month")
      ?.value.replace(/\.$/, "");
    if (!weekday || !day || !month) {
      throw new Error(
        `No se pudo formatear la fecha de la reserva ${reservation.id}`,
      );
    }

    return {
      reservation_id: reservation.id,
      holder_name: reservation.users.name,
      number_document: reservation.users.number_document,
      service_name: firstSlot.time_slots.services.name,
      reservation_date: `${weekday.charAt(0).toLocaleUpperCase("es-CO")}${weekday.slice(1)} ${day} ${month.charAt(0).toLocaleUpperCase("es-CO")}${month.slice(1)}`,
      time_start: formatInTimeZone(
        firstSlot.time_slots.time_start,
        "UTC",
        "HH:mm",
      ),
      time_end: formatInTimeZone(lastSlot.time_slots.time_end, "UTC", "HH:mm"),
      status: reservation.status,
    };
  });

  return Response.json({ data }, { status: 200 });
}
