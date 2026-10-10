import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(100),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const validation = forgotPasswordSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validation.data.email,
    {
      redirectTo: new URL(
        "/auth/reset",
        process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin,
      ).toString(),
    },
  );

  if (error) {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud. Intenta nuevamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: { message: "Si el correo existe, recibirás un enlace" },
  });
}
