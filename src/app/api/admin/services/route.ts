import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { NextResponse, type NextRequest } from 'next/server';

// ─── GET /api/admin/services ─────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const category_id = request.nextUrl.searchParams.get('category_id');
  const where = category_id && !isNaN(Number(category_id)) 
    ? { id_category: Number(category_id) } 
    : {};

  const services = await prisma.services.findMany({
    where,
    orderBy: { id: 'asc' },
  });

  const data = services.map((svc: typeof services[number]) => ({
    id: svc.id,
    name: svc.name,
    category_id: svc.id_category,
    capacity: svc.capacity,
    max_companions: svc.max_companions,
    qr_type: svc.qr_type,
    is_active: svc.is_active,
    hour_price: Number(svc.hour_price),
  }));

  return NextResponse.json({ data }, { status: 200 });
}

// ─── POST /api/admin/services ────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const {
    name,
    category_id,
    capacity,
    max_companions = 5,
    qr_type,
    hour_price,
    is_active = true,
  } = body;

  // Validaciones
  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 50) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (typeof category_id !== 'number' || !Number.isInteger(category_id) || category_id <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (typeof capacity !== 'number' || !Number.isInteger(capacity) || capacity <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (typeof max_companions !== 'number' || !Number.isInteger(max_companions) || max_companions < 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (qr_type !== 'group' && qr_type !== 'individual') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (typeof hour_price !== 'number' || hour_price < 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  // Verificar máximo 2 decimales
  const decimals = hour_price.toString().split('.')[1];
  if (decimals && decimals.length > 2) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  // Verificar que la categoría exista
  const catExists = await prisma.categories.findUnique({ where: { id: category_id } });
  if (!catExists) {
    return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
  }

  const newService = await prisma.services.create({
    data: {
      name: name.trim(),
      id_category: category_id,
      capacity,
      max_companions,
      qr_type,
      hour_price,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    },
  });

  return NextResponse.json(
    { data: { id: newService.id, name: newService.name, qr_type: newService.qr_type } },
    { status: 201 },
  );
}
