import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { NextResponse, type NextRequest } from 'next/server';

// ─── GET /api/admin/metrics ──────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const searchParams = request.nextUrl.searchParams;
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  let toDate = new Date();
  let fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 7); // Últimos 7 días por defecto

  if (fromParam) {
    const parsedFrom = new Date(fromParam);
    if (isNaN(parsedFrom.getTime())) {
      return NextResponse.json({ error: 'Rango inválido' }, { status: 400 });
    }
    fromDate = parsedFrom;
  }
  
  if (toParam) {
    const parsedTo = new Date(toParam);
    if (isNaN(parsedTo.getTime())) {
      return NextResponse.json({ error: 'Rango inválido' }, { status: 400 });
    }
    // Aseguramos cubrir el día hasta la última hora si mandaron solo YYYY-MM-DD
    parsedTo.setUTCHours(23, 59, 59, 999);
    toDate = parsedTo;
  }

  if (fromDate > toDate) {
    return NextResponse.json({ error: 'Rango inválido' }, { status: 400 });
  }

  // 1. Consultar reservas creadas en este rango y sus pagos relacionados
  const reservations = await prisma.reservations.findMany({
    where: {
      created_at: { gte: fromDate, lte: toDate },
    },
    include: {
      payments: true,
      reservation_slots: {
        include: {
          time_slots: {
            include: { services: true }
          }
        }
      }
    }
  });

  let total_revenue = 0;
  const by_status: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    failed: 0,
    expired: 0
  };

  const serviceMap = new Map<number, { service_id: number; name: string; count: number; revenue: number }>();

  reservations.forEach(res => {
    // Conteos por estado
    const status = res.status || 'unknown';
    if (by_status[status] !== undefined) {
      by_status[status]++;
    } else {
      by_status[status] = 1;
    }

    // Calcular ingresos (solo pagos con status succeeded)
    const payment = res.payments;
    let resRevenue = 0;
    if (payment && payment.status === 'succeeded' && payment.amount) {
      resRevenue = Number(payment.amount);
      total_revenue += resRevenue;
    }

    // Agrupar por servicio
    if (res.reservation_slots.length > 0) {
      const service = res.reservation_slots[0].time_slots?.services;
      if (service) {
        if (!serviceMap.has(service.id)) {
          serviceMap.set(service.id, { service_id: service.id, name: service.name, count: 0, revenue: 0 });
        }
        const svcData = serviceMap.get(service.id)!;
        svcData.count++;
        svcData.revenue += resRevenue;
      }
    }
  });

  // 2. Consultar registros de acceso en el mismo rango de tiempo
  const accessLogs = await prisma.access_logs.groupBy({
    by: ['result'],
    _count: { result: true },
    where: {
      scanned_at: { gte: fromDate, lte: toDate }
    }
  });

  const entries = { granted: 0, denied: 0 };
  accessLogs.forEach(log => {
    if (log.result === 'granted') entries.granted = log._count.result;
    else if (log.result === 'denied') entries.denied = log._count.result;
  });

  return NextResponse.json(
    {
      total_reservations: reservations.length,
      by_status,
      total_revenue,
      by_service: Array.from(serviceMap.values()),
      entries
    },
    { status: 200 }
  );
}
