import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(100),
  password: z.string().min(6),
});

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

  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validation.data.email,
    password: validation.data.password,
    options: {
      data: { name: validation.data.name },
      emailRedirectTo: new URL(
        "/auth/callback",
        process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin,
      ).toString(),
    },
  });

  if (error) {
    const isDuplicateEmail =
      error.code === "user_already_exists" ||
      /already (registered|exists)/i.test(error.message);

    return NextResponse.json(
      {
        error: isDuplicateEmail
          ? "El correo ya está registrado"
          : "No se pudo crear la cuenta. Intenta nuevamente.",
      },
      { status: isDuplicateEmail ? 400 : 500 },
    );
  }

  const user = isRecord(data.user) ? data.user : null;
  if (!user || typeof user.id !== "string" || typeof user.email !== "string") {
    return NextResponse.json(
      { error: "No se pudo crear la cuenta. Intenta nuevamente." },
      { status: 500 },
    );
  }

  if (user.identities?.length === 0) {
    return NextResponse.json(
      { error: "El correo ya está registrado" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { data: { user_id: user.id, email: user.email } },
    { status: 201 },
  );
}
