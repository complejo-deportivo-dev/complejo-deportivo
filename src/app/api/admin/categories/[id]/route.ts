import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { NextResponse, type NextRequest } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

// ─── PATCH /api/admin/categories/:id ─────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // Verificar existencia
  const existing = await prisma.categories.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const { name, is_active } = (body ?? {}) as Record<string, unknown>;

  // Validar name si viene
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    if (name.trim().length > 200) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
  }

  // Validar is_active si viene
  if (is_active !== undefined && typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // Verificar unicidad del nuevo nombre (excluyendo la categoría actual)
  if (name !== undefined) {
    const trimmedName = (name as string).trim();
    const duplicate = await prisma.categories.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
        id: { not: id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 400 },
      );
    }
  }

  // Construir payload de actualización solo con los campos provistos
  const updateData: { name?: string; is_active?: boolean } = {};
  if (name !== undefined) updateData.name = (name as string).trim();
  if (is_active !== undefined) updateData.is_active = is_active as boolean;

  const updated = await prisma.categories.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, is_active: true },
  });

  return NextResponse.json({ data: updated }, { status: 200 });
}

// ─── DELETE /api/admin/categories/:id ────────────────────────────────────────
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
  }

  // Verificar existencia e incluir conteo de servicios
  const category = await prisma.categories.findUnique({
    where: { id },
    include: {
      _count: { select: { services: true } },
    },
  });

  if (!category) {
    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
  }

  // Con servicios asociados → desactivar
  if (category._count.services > 0) {
    await prisma.categories.update({
      where: { id },
      data: { is_active: false },
    });

    return NextResponse.json({ data: { deactivated: true } }, { status: 200 });
  }

  // Sin servicios → eliminar físicamente
  await prisma.categories.delete({ where: { id } });

  return NextResponse.json({ data: { deleted: true } }, { status: 200 });
}
