import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const BOGOTA_TIME_ZONE = "America/Bogota";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "No autenticado" }, { status: 401 });
    }

    const dbUser = await prisma.public_users.findUnique({
      where: { id: user.id },
    });

    if (dbUser?.role !== "employee") {
      return Response.json({ error: "No tienes permiso" }, { status: 403 });
    }

    const todayInBogota = formatInTimeZone(
      new Date(),
      BOGOTA_TIME_ZONE,
      "yyyy-MM-dd",
    );
    const tomorrowUtc = new Date(`${todayInBogota}T00:00:00.000Z`);
    tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1);

    const startOfToday = fromZonedTime(
      `${todayInBogota}T00:00:00`,
      BOGOTA_TIME_ZONE,
    );
    const startOfTomorrow = fromZonedTime(
      formatInTimeZone(tomorrowUtc, "UTC", "yyyy-MM-dd") + "T00:00:00",
      BOGOTA_TIME_ZONE,
    );

    const [validationsToday, recentLogs] = await prisma.$transaction([
      prisma.access_logs.count({
        where: {
          id_employee: dbUser.id,
          scanned_at: { gte: startOfToday, lt: startOfTomorrow },
        },
      }),
      prisma.access_logs.findMany({
        where: { id_employee: dbUser.id },
        orderBy: { scanned_at: { sort: "desc", nulls: "last" } },
        take: 5,
        include: {
          reservations: {
            include: {
              users: true,
              reservation_slots: {
                where: { is_active: true },
                include: {
                  time_slots: { include: { services: true } },
                },
                orderBy: [
                  { slot_date: "asc" },
                  { time_slots: { time_start: "asc" } },
                ],
              },
            },
          },
        },
      }),
    ]);

    const recentValidations = recentLogs.map((log) => {
      if (log.result !== "granted" && log.result !== "denied") {
        throw new Error(`Resultado de acceso no reconocido: ${log.result}`);
      }

      const reservation = log.reservations;
      const firstSlot = reservation?.reservation_slots[0];

      return {
        id: log.id,
        holder_name: reservation?.users?.name ?? "Sin reserva",
        service_name: firstSlot?.time_slots?.services?.name ?? "Sin reserva",
        time: log.scanned_at
          ? formatInTimeZone(log.scanned_at, BOGOTA_TIME_ZONE, "HH:mm")
          : "—",
        result: log.result,
      };
    });

    return Response.json({
      data: {
        validations_today: validationsToday,
        recent_validations: recentValidations,
      },
    });
  } catch (error) {
    console.error("Error al cargar estadísticas de acceso", error);
    return Response.json(
      { error: "No se pudieron cargar las estadísticas de acceso" },
      { status: 500 },
    );
  }
}
