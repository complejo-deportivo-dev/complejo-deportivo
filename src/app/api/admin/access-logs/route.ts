import { prisma } from '@/lib/prisma';
import { isAuthError, requireAdmin } from '@/lib/auth-admin';
import { NextResponse, type NextRequest } from 'next/server';

// ─── GET /api/admin/access-logs ──────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (isAuthError(auth)) return auth;

  const searchParams = request.nextUrl.searchParams;
  const dateStr = searchParams.get('date');
  const employee_id = searchParams.get('employee_id');
  const result = searchParams.get('result');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (dateStr) {
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: 'Filtros inválidos' }, { status: 400 });
    }
    
    // Configurar límites de tiempo para cubrir todo el día
    const startOfDay = new Date(dateObj);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dateObj);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    where.scanned_at = { gte: startOfDay, lte: endOfDay };
  }
  
  if (employee_id) {
    where.id_employee = employee_id;
  }
  
  if (result) {
    if (result !== 'granted' && result !== 'denied') {
      return NextResponse.json({ error: 'Filtros inválidos' }, { status: 400 });
    }
    where.result = result;
  }

  const logs = await prisma.access_logs.findMany({
    where,
    include: {
      users: { select: { id: true, name: true, email: true } },
      qr_codes: { select: { id: true, token: true } },
    },
    orderBy: { scanned_at: 'desc' },
  });

  const data = logs.map(log => ({
    id: log.id,
    reservation_id: log.id_reservation,
    qr_code_id: log.id_qr_code,
    entry_type: log.entry_type,
    result: log.result,
    scanned_at: log.scanned_at,
    employee: log.users ? {
      id: log.users.id,
      name: log.users.name,
      email: log.users.email,
    } : null,
  }));

  return NextResponse.json({ data }, { status: 200 });
}
