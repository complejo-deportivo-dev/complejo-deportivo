import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { NextResponse, type NextRequest } from 'next/server';

// ─── GET /api/admin/reservations ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const searchParams = request.nextUrl.searchParams;
  const dateStr = searchParams.get('date');
  const status = searchParams.get('status');
  const service_id = searchParams.get('service_id');
  const user_id = searchParams.get('user_id');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (status) {
    where.status = status;
  }
  
  if (user_id) {
    where.id_user = user_id;
  }
  
  if (dateStr || service_id) {
    where.reservation_slots = { some: {} };
    
    if (dateStr) {
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json({ error: 'Filtros inválidos' }, { status: 400 });
      }
      where.reservation_slots.some.slot_date = dateObj;
    }
    
    if (service_id) {
      const s_id = Number(service_id);
      if (isNaN(s_id)) return NextResponse.json({ error: 'Filtros inválidos' }, { status: 400 });
      where.reservation_slots.some.time_slots = { id_service: s_id };
    }
  }

  const reservations = await prisma.reservations.findMany({
    where,
    include: {
      users: { select: { id: true, name: true, email: true } },
      reservation_slots: {
        include: {
          time_slots: {
            include: { services: { select: { id: true, name: true } } }
          }
        }
      }
    },
    orderBy: { created_at: 'desc' },
  });

  const data = reservations.map((res) => {
    const firstSlot = res.reservation_slots[0];
    const service = firstSlot?.time_slots?.services || null;
    
    return {
      id: res.id,
      date: firstSlot?.slot_date ? firstSlot.slot_date.toISOString().split('T')[0] : null,
      status: res.status,
      quantity: res.quantity,
      user: res.users,
      service,
      slots: res.reservation_slots.map(rs => ({
        id: rs.id_time_slot,
        time_start: rs.time_slots?.time_start ? rs.time_slots.time_start.toISOString().substring(11, 16) : null,
        time_end: rs.time_slots?.time_end ? rs.time_slots.time_end.toISOString().substring(11, 16) : null,
      })),
      created_at: res.created_at,
    };
  });

  return NextResponse.json({ data }, { status: 200 });
}
