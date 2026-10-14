import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  number_document: z
    .string()
    .trim()
    .max(20)
    .regex(/^\d*$/, "La cédula solo puede contener números.")
    .nullable()
    .optional(),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, number_document, role")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "No se pudo cargar el perfil" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: data.id,
    name: data.name,
    email: data.email,
    number_document: data.number_document,
    role: data.role,
  });
}

export async function PATCH(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const rawPayload = {
    name: typeof body.name === "string" ? body.name : undefined,
    number_document:
      body.number_document === null || typeof body.number_document === "string"
        ? body.number_document
        : undefined,
  };

  const validation = updateProfileSchema.safeParse(rawPayload);
  if (!validation.success) {
    return NextResponse.json(
      { error: "Los datos enviados no son válidos" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 },
    );
  }

  const payload = {
    ...(validation.data.name !== undefined ? { name: validation.data.name.trim() } : {}),
    ...(validation.data.number_document !== undefined
      ? { number_document: validation.data.number_document?.trim() || null }
      : {}),
  };

  if (Object.keys(payload).length === 0) {
    return NextResponse.json({ error: "No hay cambios para guardar" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", user.id)
    .select("id, name, email, number_document, role")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "No se pudieron guardar los cambios" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: data.id,
    name: data.name,
    email: data.email,
    number_document: data.number_document,
    role: data.role,
  });
}
