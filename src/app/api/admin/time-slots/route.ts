import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { NextResponse, type NextRequest } from 'next/server';

// Helpers para manejo de HH:MM a Date y viceversa
function isValidHhmm(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);
}

function hhmmToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':');
  return new Date(Date.UTC(1970, 0, 1, Number(h), Number(m), 0));
}

function dateToHhmm(date: Date): string {
  // Prisma DateTimes guardados desde Date.UTC siempre estarán en 'Z' (UTC).
  return date.toISOString().substring(11, 16);
}

// ─── GET /api/admin/time-slots ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const service_id = request.nextUrl.searchParams.get('service_id');

  if (!service_id || isNaN(Number(service_id))) {
    return NextResponse.json({ error: 'service_id es obligatorio' }, { status: 400 });
  }

  const timeSlots = await prisma.time_slots.findMany({
    where: { id_service: Number(service_id) },
    orderBy: { time_start: 'asc' },
  });

  const data = timeSlots.map((ts) => ({
    id: ts.id,
    service_id: ts.id_service,
    time_start: dateToHhmm(ts.time_start),
    time_end: dateToHhmm(ts.time_end),
  }));

  return NextResponse.json({ data }, { status: 200 });
}

// ─── POST /api/admin/time-slots ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const { service_id, time_start, time_end } = body;

  // 1. Validar tipos de datos
  if (typeof service_id !== 'number' || !Number.isInteger(service_id) || service_id <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (!isValidHhmm(time_start) || !isValidHhmm(time_end)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const startDate = hhmmToDate(time_start);
  const endDate = hhmmToDate(time_end);

  // 2. Validar que fin > inicio
  if (endDate <= startDate) {
    return NextResponse.json({ error: 'La hora de fin debe ser mayor que la de inicio' }, { status: 400 });
  }

  // 3. Verificar que el servicio exista
  const service = await prisma.services.findUnique({ where: { id: service_id } });
  if (!service) {
    return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
  }

  // 4. Verificar cruce de horarios
  // Existe solapamiento si: start1 < end2 AND end1 > start2
  const overlap = await prisma.time_slots.findFirst({
    where: {
      id_service: service_id,
      time_start: { lt: endDate },
      time_end: { gt: startDate },
    },
  });

  if (overlap) {
    return NextResponse.json({ error: 'La franja se cruza con otra existente' }, { status: 400 });
  }

  // 5. Crear
  const newSlot = await prisma.time_slots.create({
    data: {
      id_service: service_id,
      time_start: startDate,
      time_end: endDate,
    },
  });

  return NextResponse.json(
    {
      data: {
        id: newSlot.id,
        service_id: newSlot.id_service,
        time_start: dateToHhmm(newSlot.time_start),
        time_end: dateToHhmm(newSlot.time_end),
      },
    },
    { status: 201 }
  );
}
