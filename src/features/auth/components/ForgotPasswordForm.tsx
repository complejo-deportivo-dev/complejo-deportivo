"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .email("El correo debe tener un formato válido.")
    .max(100, "El correo no puede superar 100 caracteres."),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export default function ForgotPasswordForm() {
  const requestInProgress = useRef(false);
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInProgress.current) return;

    const validation = forgotPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setFieldError(validation.error.issues[0]?.message ?? "Correo inválido.");
      setError("");
      setSuccess("");
      return;
    }

    requestInProgress.current = true;
    setIsSubmitting(true);
    setFieldError("");
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: validation.data.email }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          response.status === 400 &&
          isRecord(body) &&
          body.error === "Correo inválido"
            ? "El correo debe tener un formato válido."
            : "No se pudo procesar la solicitud. Intenta nuevamente.";
        setError(message);
        return;
      }

      setSuccess("Si el correo existe, recibirás un enlace");
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      requestInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <Card
      as="section"
      padding="none"
      variant="flat"
      className="w-full !rounded-none !bg-transparent !shadow-none !backdrop-blur-none"
    >
      <h2 className="mb-2 font-heading text-h2 font-bold leading-tight text-text-primary">
        Recupera tu contraseña
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Te enviaremos un enlace para restablecerla
      </p>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <Input
          className="space-y-1.5"
          disabled={isSubmitting}
          error={fieldError}
          icon={<Mail />}
          label="Correo electrónico"
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldError("");
            setError("");
            setSuccess("");
          }}
          placeholder="tu@correo.com"
          required
          type="email"
          value={email}
        />

        {error && (
          <p
            className="rounded-md border border-error/30 bg-error-soft px-3 py-2 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className="rounded-md border border-success/30 bg-success-soft px-3 py-2 text-sm text-success"
            role="status"
          >
            {success}
          </p>
        )}

        <Button
          className="w-full !rounded-full"
          disabled={isSubmitting}
          loading={isSubmitting}
          size="lg"
          type="submit"
        >
          Enviar enlace
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link
          className="font-semibold text-primary transition-colors hover:text-primary-hover"
          href="/login"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </Card>
  );
}
