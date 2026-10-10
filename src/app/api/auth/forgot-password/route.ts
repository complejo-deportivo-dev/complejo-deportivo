import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authService } from "@/services/auth";

const forgotPasswordSchema = z.object({
  email: z.string().email("Formato de correo inválido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "El formato del correo electrónico es incorrecto" },
        { status: 400 }
      );
    }

    await authService.forgotPassword(result.data.email);

    return NextResponse.json(
      {
        data: {
          message: "Si el correo existe, recibirás un enlace",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
