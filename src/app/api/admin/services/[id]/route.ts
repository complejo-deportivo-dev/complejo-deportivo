import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { NextResponse, type NextRequest } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

// ─── PATCH /api/admin/services/:id ───────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const existing = await prisma.services.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const updateData: {
    name?: string;
    id_category?: number;
    capacity?: number;
    max_companions?: number;
    qr_type?: string;
    hour_price?: number;
    is_active?: boolean;
  } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.trim().length > 50) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    updateData.name = body.name.trim();
  }

  if (body.category_id !== undefined) {
    if (typeof body.category_id !== 'number' || !Number.isInteger(body.category_id) || body.category_id <= 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const catExists = await prisma.categories.findUnique({ where: { id: body.category_id } });
    if (!catExists) return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    updateData.id_category = body.category_id;
  }

  if (body.capacity !== undefined) {
    if (typeof body.capacity !== 'number' || !Number.isInteger(body.capacity) || body.capacity <= 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    updateData.capacity = body.capacity;
  }

  if (body.max_companions !== undefined) {
    if (typeof body.max_companions !== 'number' || !Number.isInteger(body.max_companions) || body.max_companions < 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    updateData.max_companions = body.max_companions;
  }

  if (body.qr_type !== undefined) {
    if (body.qr_type !== 'group' && body.qr_type !== 'individual') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    
    // Verificar si se intenta cambiar el qr_type teniendo reservas activas
    if (body.qr_type !== existing.qr_type) {
      const activeReservations = await prisma.reservations.count({
        where: {
          status: { in: ['pending', 'confirmed'] },
          reservation_slots: { some: { time_slots: { id_service: id } } }
        }
      });
      
      if (activeReservations > 0) {
        return NextResponse.json(
          { error: 'No se puede cambiar el tipo de QR con reservas activas' },
          { status: 409 }
        );
      }
    }
    updateData.qr_type = body.qr_type;
  }

  if (body.hour_price !== undefined) {
    if (typeof body.hour_price !== 'number' || body.hour_price < 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    const decimals = body.hour_price.toString().split('.')[1];
    if (decimals && decimals.length > 2) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    updateData.hour_price = body.hour_price;
  }

  if (body.is_active !== undefined) {
    if (typeof body.is_active !== 'boolean') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    updateData.is_active = body.is_active;
  }

  const updated = await prisma.services.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(
    {
      data: {
        id: updated.id,
        name: updated.name,
        category_id: updated.id_category,
        capacity: updated.capacity,
        max_companions: updated.max_companions,
        qr_type: updated.qr_type,
        is_active: updated.is_active,
        hour_price: Number(updated.hour_price),
      },
    },
    { status: 200 }
  );
}

// ─── DELETE /api/admin/services/:id ──────────────────────────────────────────
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const service = await prisma.services.findUnique({ where: { id } });
  if (!service) {
    return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 });
  }

  // Verificamos reservas activas primero (409)
  const activeReservations = await prisma.reservations.count({
    where: {
      status: { in: ['pending', 'confirmed'] },
      reservation_slots: { some: { time_slots: { id_service: id } } },
    },
  });

  if (activeReservations > 0) {
    return NextResponse.json(
      { error: 'El servicio tiene reservas activas' },
      { status: 409 }
    );
  }

  // Si no hay activas, verificamos si existen reservas pasadas (completed, expired, failed)
  const pastReservations = await prisma.reservations.count({
    where: {
      reservation_slots: { some: { time_slots: { id_service: id } } },
    },
  });

  if (pastReservations > 0) {
    // Solo historial pasado -> Borrado lógico
    await prisma.services.update({
      where: { id },
      data: { is_active: false },
    });
    return NextResponse.json({ data: { deactivated: true } }, { status: 200 });
  }

  // Sin ninguna reserva (ni pasada ni activa) -> Eliminación física
  // Debemos borrar los time_slots asociados primero (por foreign key RESTRICT)
  await prisma.$transaction([
    prisma.time_slots.deleteMany({ where: { id_service: id } }),
    prisma.services.delete({ where: { id } }),
  ]);

  return NextResponse.json({ data: { deleted: true } }, { status: 200 });
}
