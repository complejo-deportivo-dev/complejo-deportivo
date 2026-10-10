import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/services/auth";
import { createClient } from "@/lib/supabase/server";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "La contraseña no cumple con los criterios de seguridad" },
        { status: 400 }
      );
    }

    // Verify recovery session
    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "El enlace venció o no es válido" },
        { status: 401 }
      );
    }

    await authService.resetPassword(result.data.password);

    return NextResponse.json(
      { data: null },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[ResetPasswordRoute] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
