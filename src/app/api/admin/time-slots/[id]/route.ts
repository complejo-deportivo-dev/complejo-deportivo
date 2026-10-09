import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { NextResponse, type NextRequest } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

// Helpers
function isValidHhmm(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(val);
}

function hhmmToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':');
  return new Date(Date.UTC(1970, 0, 1, Number(h), Number(m), 0));
}

function dateToHhmm(date: Date): string {
  return date.toISOString().substring(11, 16);
}

// ─── PATCH /api/admin/time-slots/:id ─────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // 1. Verificar existencia
  const existing = await prisma.time_slots.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Franja no encontrada' }, { status: 404 });
  }

  // 2. Verificar que no tenga reservas activas
  const activeReservations = await prisma.reservations.count({
    where: {
      status: { in: ['pending', 'confirmed'] },
      reservation_slots: { some: { id_time_slot: id } },
    },
  });

  if (activeReservations > 0) {
    return NextResponse.json({ error: 'La franja tiene reservas asociadas' }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const { time_start, time_end } = body;

  // Si no mandan nada a actualizar
  if (time_start === undefined && time_end === undefined) {
    return NextResponse.json(
      {
        data: {
          id: existing.id,
          service_id: existing.id_service,
          time_start: dateToHhmm(existing.time_start),
          time_end: dateToHhmm(existing.time_end),
        },
      },
      { status: 200 }
    );
  }

  if (time_start !== undefined && !isValidHhmm(time_start)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (time_end !== undefined && !isValidHhmm(time_end)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // Determinar los nuevos tiempos (fusionando con los existentes)
  const finalStart = time_start !== undefined ? hhmmToDate(time_start) : existing.time_start;
  const finalEnd = time_end !== undefined ? hhmmToDate(time_end) : existing.time_end;

  // 3. Validar fin > inicio
  if (finalEnd <= finalStart) {
    return NextResponse.json({ error: 'La hora de fin debe ser mayor que la de inicio' }, { status: 400 });
  }

  // 4. Validar cruce
  if (time_start !== undefined || time_end !== undefined) {
    const overlap = await prisma.time_slots.findFirst({
      where: {
        id_service: existing.id_service,
        id: { not: id }, // Excluirse a sí mismo
        time_start: { lt: finalEnd },
        time_end: { gt: finalStart },
      },
    });

    if (overlap) {
      return NextResponse.json({ error: 'La franja se cruza con otra existente' }, { status: 400 });
    }
  }

  // 5. Actualizar
  const updated = await prisma.time_slots.update({
    where: { id },
    data: {
      time_start: finalStart,
      time_end: finalEnd,
    },
  });

  return NextResponse.json(
    {
      data: {
        id: updated.id,
        service_id: updated.id_service,
        time_start: dateToHhmm(updated.time_start),
        time_end: dateToHhmm(updated.time_end),
      },
    },
    { status: 200 }
  );
}

// ─── DELETE /api/admin/time-slots/:id ────────────────────────────────────────
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const existing = await prisma.time_slots.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Franja no encontrada' }, { status: 404 });
  }

  // 1. Verificar reservas activas explícitamente
  const activeReservations = await prisma.reservations.count({
    where: {
      status: { in: ['pending', 'confirmed'] },
      reservation_slots: { some: { id_time_slot: id } },
    },
  });

  if (activeReservations > 0) {
    return NextResponse.json({ error: 'La franja tiene reservas asociadas' }, { status: 409 });
  }

  // 2. Intentar borrado físico.
  // Si la franja tiene historial (reservation_slots con status expirados/completados), 
  // saltará un error de Foreign KeyConstraint (P2003). Lo mapeamos a 409 como pide la spec de forma genérica.
  try {
    await prisma.time_slots.delete({ where: { id } });
  } catch (error: any) {
    // P2003 es el código de Prisma para Foreign Key Constraint failed
    if (error?.code === 'P2003') {
      return NextResponse.json({ error: 'La franja tiene reservas asociadas' }, { status: 409 });
    }
    // Relanzar si es otro error
    throw error;
  }

  return NextResponse.json({ data: null }, { status: 200 });
}
