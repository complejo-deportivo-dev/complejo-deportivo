import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const email =
    isRecord(body) && typeof body.email === "string" ? body.email.trim() : "";
  const password =
    isRecord(body) && typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Correo y contraseña son obligatorios" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos" },
      { status: 401 },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "No se pudo completar el inicio de sesión" },
      { status: 500 },
    );
  }

  if (
    profile.role !== "client" &&
    profile.role !== "admin" &&
    profile.role !== "employee"
  ) {
    return NextResponse.json(
      { error: "El perfil de usuario no tiene un rol válido" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
      },
    },
  });
}
