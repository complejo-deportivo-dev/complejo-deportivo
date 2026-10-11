import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Verifica que el request tenga sesión activa y rol admin.
 *
 * @returns El objeto `user` de Supabase si la validación pasa.
 * @throws Un `NextResponse` con 401 o 403 si falla.
 */
export async function requireAdmin(): Promise<
  | { user: Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>>['data']['user'] & NonNullable<unknown> }
  | NextResponse
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  if (user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso prohibido' }, { status: 403 });
  }

  return { user };
}

/**
 * Devuelve true si el resultado de requireAdmin es un NextResponse (error),
 * permitiendo hacer un early return limpio en los handlers.
 */
export function isAuthError(
  result: { user: unknown } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
