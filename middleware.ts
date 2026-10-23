import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rutas públicas que no deben ser accesibles si el usuario está logueado
  const authRoutes = ['/login', '/register'];
  const landingPage = '/';

  if (user && (authRoutes.includes(request.nextUrl.pathname) || request.nextUrl.pathname === landingPage)) {
    // Redirigir según el rol del usuario
    const role = user.user_metadata?.role;
    
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (role === 'client') {
      return NextResponse.redirect(new URL('/client', request.url));
    } else if (role === 'employee') {
      return NextResponse.redirect(new URL('/employee/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/client', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
