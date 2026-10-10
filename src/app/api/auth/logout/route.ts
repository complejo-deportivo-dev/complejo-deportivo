import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1. Verificar sesión activa
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Cerrar sesión
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("[AUTH_LOGOUT_ERROR]", signOutError);
      return NextResponse.json(
        { error: "Error al cerrar la sesión" },
        { status: 500 }
      );
    }

    // 3. Respuesta exitosa
    return NextResponse.json(
      { data: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[AUTH_LOGOUT_EXCEPTION]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
