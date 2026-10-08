import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

const roleHomes = {
  admin: "/admin",
  client: "/client",
  employee: "/employee",
} as const;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();
      const role: unknown = profile?.role;

      if (
        !profileError &&
        profile &&
        (role === "admin" || role === "client" || role === "employee")
      ) {
        return NextResponse.redirect(
          new URL(roleHomes[role], requestUrl.origin),
        );
      }
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=auth_callback", requestUrl.origin),
  );
}
