import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  })
  .strict();

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Contraseña inválida" },
      { status: 400 },
    );
  }

  const validation = resetPasswordSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Contraseña inválida" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    return NextResponse.json(
      { error: "El enlace venció o no es válido" },
      { status: 401 },
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: validation.data.password,
  });

  if (error) {
    return NextResponse.json(
      { error: "No se pudo actualizar la contraseña. Intenta nuevamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: null });
}
