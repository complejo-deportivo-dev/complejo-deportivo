import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { NextResponse, type NextRequest } from 'next/server';

// ─── GET /api/admin/categories ───────────────────────────────────────────────
export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const categories = await prisma.categories.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: {
        select: { services: true },
      },
    },
  });

  const data = categories.map(
    ({ _count, ...cat }: (typeof categories)[number]) => ({
      id: cat.id,
      name: cat.name,
      is_active: cat.is_active,
      created_at: cat.created_at,
      services_count: _count.services,
    }),
  );

  return NextResponse.json({ data }, { status: 200 });
}

// ─── POST /api/admin/categories ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  }

  const { name, is_active = true } = (body ?? {}) as Record<string, unknown>;

  // Validaciones de name
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 200) {
    return NextResponse.json(
      { error: 'El nombre no puede superar los 200 caracteres' },
      { status: 400 },
    );
  }

  // Unicidad (case-insensitive)
  const existing = await prisma.categories.findFirst({
    where: { name: { equals: trimmedName, mode: 'insensitive' } },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe una categoría con ese nombre' },
      { status: 400 },
    );
  }

  const category = await prisma.categories.create({
    data: {
      name: trimmedName,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    },
    select: { id: true, name: true, is_active: true },
  });

  return NextResponse.json({ data: category }, { status: 201 });
}
