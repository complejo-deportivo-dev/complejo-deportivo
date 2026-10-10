import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
  }

  try {
    const supabase = await createClient();
    
    // 1. Intercambiar el código por una sesión
    const { data: { user }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !user) {
      return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
    }

    // 2. Leer el rol desde la base de datos (public.users)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });

    if (!dbUser) {
      // Si el usuario está en auth pero no en public.users, podrías manejarlo como error
      return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
    }

    // 3. Redirigir según el rol
    const roleRedirects: Record<string, string> = {
      admin: "/admin",
      employee: "/employee",
      client: "/client",
    };

    const redirectPath = roleRedirects[dbUser.role] || "/";
    
    // Si hay un 'next' válido y no es el redireccionamiento por defecto del rol,
    // podrías priorizar 'next', pero el contexto pide redirección por rol.
    // Para cumplir estrictamente con contexto.md:
    return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));

  } catch (error) {
    console.error("[AUTH_CALLBACK_ERROR]", error);
    return NextResponse.redirect(new URL("/login?error=oauth", requestUrl.origin));
  }
}
