import { prisma } from "@/lib/prisma";
import { isAuthError, requireAdmin } from "@/lib/auth-admin";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const searchParams = request.nextUrl.searchParams;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  let toDate = new Date();
  let fromDate = new Date();
  fromDate.setUTCHours(0, 0, 0, 0);
  fromDate.setUTCDate(fromDate.getUTCDate() - 6);

  if (fromParam) {
    const parsedFrom = new Date(fromParam);
    if (isNaN(parsedFrom.getTime())) {
      return NextResponse.json({ error: "Rango inválido" }, { status: 400 });
    }
    fromDate = parsedFrom;
  }

  if (toParam) {
    const parsedTo = new Date(toParam);
    if (isNaN(parsedTo.getTime())) {
      return NextResponse.json({ error: "Rango inválido" }, { status: 400 });
    }
    parsedTo.setUTCHours(23, 59, 59, 999);
    toDate = parsedTo;
  }

  if (fromDate > toDate) {
    return NextResponse.json({ error: "Rango inválido" }, { status: 400 });
  }

  const reservations = await prisma.reservations.findMany({
    where: {
      created_at: { gte: fromDate, lte: toDate },
    },
    include: {
      payments: true,
      reservation_slots: {
        include: {
          time_slots: {
            include: { services: true },
          },
        },
      },
    },
  });

  const dailyTotals = new Map<string, number>();
  const dailyDates: string[] = [];
  const dayCursor = new Date(fromDate);
  dayCursor.setUTCHours(0, 0, 0, 0);
  const lastDay = new Date(toDate);
  lastDay.setUTCHours(0, 0, 0, 0);

  while (dayCursor <= lastDay) {
    const date = dayCursor.toISOString().slice(0, 10);
    dailyDates.push(date);
    dailyTotals.set(date, 0);
    dayCursor.setUTCDate(dayCursor.getUTCDate() + 1);
  }

  const rangeDays = dailyDates.length;

  // Cálculo de ocupación de HOY
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  const todayServices = await prisma.services.findMany({
    where: { is_active: true },
    include: {
      time_slots: {
        include: {
          reservation_slots: {
            where: {
              is_active: true,
              slot_date: { gte: todayStart, lte: todayEnd },
              reservations: {
                is: { status: { in: ["confirmed", "completed"] } },
              },
            },
            select: { id: true },
          },
        },
      },
    },
  });

  let totalSlotsToday = 0;
  let bookedSlotsToday = 0;

  todayServices.forEach((svc) => {
    totalSlotsToday += svc.time_slots.length;
    svc.time_slots.forEach((slot) => {
      bookedSlotsToday += slot.reservation_slots.length;
    });
  });

  const occupancyToday =
    totalSlotsToday > 0
      ? Math.round((bookedSlotsToday / totalSlotsToday) * 100)
      : 0;

  const activeServices = await prisma.services.findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      time_slots: {
        select: {
          reservation_slots: {
            where: {
              is_active: true,
              slot_date: { gte: fromDate, lte: toDate },
              reservations: {
                is: { status: { in: ["confirmed", "completed"] } },
              },
            },
            select: { id: true },
          },
        },
      },
    },
  });

  let total_revenue = 0;
  const by_status: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    failed: 0,
    expired: 0,
  };

  const serviceMap = new Map<
    number,
    { service_id: number; name: string; count: number; revenue: number }
  >();

  reservations.forEach((res) => {
    if (res.created_at) {
      const date = res.created_at.toISOString().slice(0, 10);
      if (dailyTotals.has(date)) {
        dailyTotals.set(date, dailyTotals.get(date)! + 1);
      }
    }

    const status = res.status || "unknown";
    if (by_status[status] !== undefined) {
      by_status[status]++;
    } else {
      by_status[status] = 1;
    }

    const payment = res.payments;
    let resRevenue = 0;
    if (payment && payment.status === "succeeded" && payment.amount) {
      resRevenue = Number(payment.amount);
      total_revenue += resRevenue;
    }

    if (res.reservation_slots.length > 0) {
      const service = res.reservation_slots[0].time_slots?.services;
      if (service) {
        if (!serviceMap.has(service.id)) {
          serviceMap.set(service.id, {
            service_id: service.id,
            name: service.name,
            count: 0,
            revenue: 0,
          });
        }
        const svcData = serviceMap.get(service.id)!;
        svcData.count++;
        svcData.revenue += resRevenue;
      }
    }
  });

  const accessLogs = await prisma.access_logs.groupBy({
    by: ["result"],
    _count: { result: true },
    where: {
      scanned_at: { gte: fromDate, lte: toDate },
    },
  });

  const entries = { granted: 0, denied: 0 };
  accessLogs.forEach((log) => {
    if (log.result === "granted") entries.granted = log._count.result;
    else if (log.result === "denied") entries.denied = log._count.result;
  });

  const service_occupancy = activeServices.map((service) => {
    const availableSlots = service.time_slots.length * rangeDays;
    const bookedSlots = service.time_slots.reduce(
      (total, timeSlot) => total + timeSlot.reservation_slots.length,
      0,
    );

    return {
      id: service.id,
      name: service.name,
      occupancy: availableSlots > 0 ? (bookedSlots / availableSlots) * 100 : 0,
    };
  });

  const [categoriesCount, servicesCount, employeesCount] = await Promise.all([
    prisma.categories.count({ where: { is_active: true } }),
    prisma.services.count({ where: { is_active: true } }),
    prisma.public_users.count({ where: { role: "employee", is_active: true } }),
  ]);

  return NextResponse.json(
    {
      data: {
        total_reservations: reservations.length,
        by_status,
        total_revenue,
        occupancy: occupancyToday,
        by_service: Array.from(serviceMap.values()),
        entries,
        daily_reservations: dailyDates.map((date) => ({
          date,
          total: dailyTotals.get(date) ?? 0,
        })),
        service_occupancy,
        counts: {
          categories: categoriesCount,
          services: servicesCount,
          employees: employeesCount,
        },
      },
    },
    { status: 200 },
  );
}
