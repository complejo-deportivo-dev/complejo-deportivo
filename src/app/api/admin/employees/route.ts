import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse, type NextRequest } from 'next/server';

// ─── GET /api/admin/employees ────────────────────────────────────────────────
export async function GET() {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  // Filtrar exclusivamente public_users que sean 'employee'
  const employees = await prisma.public_users.findMany({
    where: { role: 'employee' },
    select: {
      id: true,
      name: true,
      email: true,
      number_document: true,
      is_active: true,
    },
    orderBy: { email: 'asc' },
  });

  return NextResponse.json({ data: employees }, { status: 200 });
}

// ─── POST /api/admin/employees ───────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const { name, email, number_document } = body;

  // 1. Validaciones
  if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 50) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || email.trim().length === 0 || email.trim().length > 100) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  
  const trimmedEmail = email.trim();
  if (trimmedEmail.indexOf('@') === -1 || trimmedEmail.indexOf('.') === -1) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
  if (number_document !== undefined && number_document !== null) {
    if (typeof number_document !== 'string' || number_document.trim().length === 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
  }

  const emailTrimmed = email.trim().toLowerCase();

  // 2. Verificar duplicidad de correo en BD
  const exists = await prisma.public_users.findUnique({
    where: { email: emailTrimmed },
  });

  if (exists) {
    return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
  }

  // 3. Crear usuario y enviar invitación mediante Supabase Auth
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(emailTrimmed);
  
  if (inviteError || !inviteData.user) {
    return NextResponse.json({ error: 'Error al enviar la invitación al empleado' }, { status: 500 });
  }

  const userId = inviteData.user.id;

  // 4. Actualizar el app_metadata (para el payload del JWT)
  await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'employee' },
  });

  // 5. Garantizar el registro en public_users con rol employee y data extra.
  // Usamos upsert porque el trigger de Supabase podría o no haber terminado su inserción.
  const updatedUser = await prisma.public_users.upsert({
    where: { id: userId },
    update: {
      role: 'employee',
      name: name.trim(),
      number_document: number_document ? (number_document as string).trim() : null,
    },
    create: {
      id: userId,
      email: emailTrimmed,
      role: 'employee',
      name: name.trim(),
      number_document: number_document ? (number_document as string).trim() : null,
      is_active: true,
    },
  });

  return NextResponse.json(
    {
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    },
    { status: 201 }
  );
}
