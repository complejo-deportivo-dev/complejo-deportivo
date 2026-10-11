"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "La contraseña debe incluir una mayúscula.")
      .regex(/[0-9]/, "La contraseña debe incluir un número."),
    confirmation: z.string().min(1, "Confirma tu contraseña."),
  })
  .refine((values) => values.password === values.confirmation, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmation"],
  });

interface UpdatePasswordFormProps {
  initialLinkError: boolean;
}

export default function UpdatePasswordForm({
  initialLinkError,
}: UpdatePasswordFormProps) {
  const router = useRouter();
  const requestInProgress = useRef(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    password: "",
    confirmation: "",
  });
  const [error, setError] = useState(
    initialLinkError ? "El enlace de recuperación venció o no es válido." : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInProgress.current) return;

    const validation = updatePasswordSchema.safeParse({
      password,
      confirmation,
    });

    if (!validation.success) {
      const errors = { password: "", confirmation: "" };
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (
          (field === "password" || field === "confirmation") &&
          !errors[field]
        ) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      setError("");
      return;
    }

    requestInProgress.current = true;
    setIsSubmitting(true);
    setFieldErrors({ password: "", confirmation: "" });
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: validation.data.password }),
      });

      if (response.status === 401) {
        setError("El enlace de recuperación venció o no es válido.");
        return;
      }

      if (!response.ok) {
        setError(
          response.status === 400
            ? "La contraseña no cumple los requisitos."
            : "No se pudo actualizar la contraseña. Intenta nuevamente.",
        );
        return;
      }

      router.replace("/login?passwordUpdated=1");
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
      padding="lg"
      variant="default"
      className="w-full max-w-[720px] rounded-[28px] border border-white/10 bg-[#1d2a38]/90 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.95)] backdrop-blur-xl"
    >
      <div className="mb-6">
        <h2 className="font-heading text-3xl font-bold leading-tight text-text-primary">
          Nueva contraseña
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Elige una contraseña segura para continuar.
        </p>
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <Input
          className="space-y-1.5"
          disabled={isSubmitting}
          error={fieldErrors.password}
          icon={<LockKeyhole />}
          label="Nueva contraseña"
          name="password"
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((current) => ({ ...current, password: "" }));
            setError("");
          }}
          required
          type="password"
          value={password}
        />

        <Input
          className="space-y-1.5"
          disabled={isSubmitting}
          error={fieldErrors.confirmation}
          icon={<LockKeyhole />}
          label="Confirmar contraseña"
          name="confirmation"
          onChange={(event) => {
            setConfirmation(event.target.value);
            setFieldErrors((current) => ({ ...current, confirmation: "" }));
            setError("");
          }}
          required
          type="password"
          value={confirmation}
        />

        {error && (
          <p
            className="rounded-md border border-error/30 bg-error-soft px-3 py-2 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <Button
          className="w-full !rounded-full"
          disabled={isSubmitting}
          loading={isSubmitting}
          size="lg"
          type="submit"
        >
          Guardar contraseña
        </Button>
      </form>
    </Card>
  );
}
