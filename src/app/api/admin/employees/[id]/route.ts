import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';

type RouteParams = { params: Promise<{ id: string }> };

// ─── PATCH /api/admin/employees/:id ──────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // 1. Validar que exista y sea employee
  const employee = await prisma.public_users.findUnique({ where: { id } });
  if (!employee || employee.role !== 'employee') {
    return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const updateData: {
    name?: string;
    number_document?: string | null;
    is_active?: boolean;
  } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0 || body.name.trim().length > 50) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    updateData.name = body.name.trim();
  }

  if (body.number_document !== undefined) {
    if (body.number_document !== null && typeof body.number_document !== 'string') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    if (typeof body.number_document === 'string' && body.number_document.trim().length === 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    updateData.number_document = body.number_document ? body.number_document.trim() : null;
  }

  if (body.is_active !== undefined) {
    if (typeof body.is_active !== 'boolean') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    updateData.is_active = body.is_active;
  }

  // 2. Actualizar public_users
  const updated = await prisma.public_users.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      number_document: true,
      is_active: true,
    },
  });

  return NextResponse.json({ data: updated }, { status: 200 });
}

// ─── DELETE /api/admin/employees/:id ─────────────────────────────────────────
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // 1. Validar que exista y sea employee
  const employee = await prisma.public_users.findUnique({ where: { id } });
  if (!employee || employee.role !== 'employee') {
    return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
  }

  // 2. Verificar actividad (accesos o uso de QR)
  const accessLogsCount = await prisma.access_logs.count({ where: { id_employee: id } });
  const qrCodesCount = await prisma.qr_codes.count({ where: { used_by: id } });

  // 3. Borrado Lógico vs Físico
  if (accessLogsCount > 0 || qrCodesCount > 0) {
    // Soft Delete
    await prisma.public_users.update({
      where: { id },
      data: { is_active: false },
    });
    return NextResponse.json({ data: { deactivated: true } }, { status: 200 });
  }

  // Hard Delete: Se elimina primero de Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  
  if (error) {
    return NextResponse.json({ error: 'Error al intentar eliminar de Auth' }, { status: 500 });
  }

  // Generalmente el trigger de Supabase podría eliminarlo de public_users (on delete cascade),
  // pero lo intentamos manualmente por si no está configurada la cascada. Ignoramos si falla.
  try {
    await prisma.public_users.delete({ where: { id } });
  } catch {
    // Si ya fue borrado en cascada, ignorar el error.
  }

  return NextResponse.json({ data: { deleted: true } }, { status: 200 });
}
