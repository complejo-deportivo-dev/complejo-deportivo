import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );


  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. Evitar loop en /unauthorized
  if (pathname === "/unauthorized") {
    return response;
  }

  // 2. Redirigir usuarios autenticados fuera de Login o Registro
  if (user && (pathname === "/login" || pathname === "/register")) {
    const role = user.app_metadata?.role;
    const roleRedirects: Record<string, string> = {
      admin: "/admin",
      employee: "/employee",
      client: "/client",
    };
    const redirectPath = roleRedirects[role as string] || "/";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // 3. Proteger rutas por Rol
  const rolePermissions: Record<string, string> = {
    "/admin": "admin",
    "/client": "client",
    "/employee": "employee",
  };

  for (const [path, requiredRole] of Object.entries(rolePermissions)) {
    if (pathname.startsWith(path)) {
      // Si no hay usuario, redirigir a /login
      if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      // Si el usuario no tiene el rol requerido, redirigir a /unauthorized
      if (user.app_metadata?.role !== requiredRole) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|api).*)',
  ],
};
