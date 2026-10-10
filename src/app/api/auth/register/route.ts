import { z } from "zod";
import { NextResponse } from "next/server";
import { authService } from "@/services/auth";

const registerSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(50, "El nombre no puede exceder los 50 caracteres"),
  email: z.string().email("Formato de correo inválido").max(100, "El correo no puede exceder los 100 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  number_document: z.string().max(20, "El documento no puede exceder los 20 caracteres").optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const user = await authService.register(result.data);

    return NextResponse.json(
      {
        data: {
          user_id: user.user_id,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "EMAIL_ALREADY_REGISTERED") {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 400 }
      );
    }

    console.error("[AUTH_REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
