"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "El nombre es obligatorio.").max(50, "El nombre no puede superar 50 caracteres."),
    email: z
      .string()
      .trim()
      .min(1, "El correo electrónico es obligatorio.")
      .email("El correo debe tener un formato válido.")
      .max(100, "El correo no puede superar 100 caracteres."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(/[A-Z]/, "La contraseña debe incluir una mayúscula.")
      .regex(/[0-9]/, "La contraseña debe incluir un número."),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
    acceptedTerms: z.literal(true, {
      error: "Debes aceptar los Términos y la Política de Privacidad.",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

type RegisterFieldErrors = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: string;
};

const emptyFieldErrors: RegisterFieldErrors = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptedTerms: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
      />
      <path
        fill="#FF3D00"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#4CAF50"
        d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
      />
      <path
        fill="#1976D2"
        d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const requestInProgress = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<RegisterFieldErrors>(emptyFieldErrors);
  const isBusy = isSubmitting || isGoogleLoading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInProgress.current) return;

    const validation = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      acceptedTerms,
    });
    if (!validation.success) {
      const nextErrors = { ...emptyFieldErrors };
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (
          field === "name" ||
          field === "email" ||
          field === "password" ||
          field === "confirmPassword" ||
          field === "acceptedTerms"
        ) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    requestInProgress.current = true;
    setIsSubmitting(true);
    setError("");
    setFieldErrors(emptyFieldErrors);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validation.data.name,
          email: validation.data.email,
          password: validation.data.password,
        }),
      });

      if (response.status === 201) {
        router.push(`/verify-email?email=${encodeURIComponent(validation.data.email)}`);
        return;
      }

      if (response.status === 400) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          isRecord(body) && body.error === "El correo ya está registrado"
            ? "El correo ya está registrado."
            : "Revisa los datos ingresados e intenta nuevamente.";
        setError(message);
        return;
      }

      setError("No se pudo crear la cuenta. Intenta nuevamente.");
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      requestInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleGoogleRegister() {
    if (requestInProgress.current) return;
    if (!acceptedTerms) {
      setFieldErrors((current) => ({
        ...current,
        acceptedTerms: "Debes aceptar los Términos y la Política de Privacidad.",
      }));
      return;
    }

    requestInProgress.current = true;
    setError("");
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: new URL(
            "/auth/callback",
            process.env.NEXT_PUBLIC_APP_URL || window.location.origin,
          ).toString(),
        },
      });

      if (oauthError) {
        setError("No se pudo continuar con Google. Intenta nuevamente.");
        requestInProgress.current = false;
        setIsGoogleLoading(false);
      }
    } catch {
      setError("No se pudo continuar con Google. Intenta nuevamente.");
      requestInProgress.current = false;
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card
      as="section"
      padding="none"
      variant="flat"
      className="w-full !rounded-none !bg-transparent !shadow-none !backdrop-blur-none"
    >
      <h2 className="mb-6 font-heading text-h2 font-bold leading-tight text-text-primary">
        Crear cuenta
      </h2>

      <Button
        className="w-full !rounded-full !border-border !bg-surface-elevated !text-text-primary hover:!bg-surface"
        disabled={isBusy}
        loading={isGoogleLoading}
        onClick={handleGoogleRegister}
        variant="secondary"
      >
        <GoogleIcon />
        Continuar con Google
      </Button>

      <div
        aria-label="o"
        className="my-6 flex items-center gap-3 text-xs text-text-secondary"
        role="separator"
      >
        <span className="h-px flex-1 bg-border" />
        <span aria-hidden="true">o</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <Input
          className="space-y-1.5"
          disabled={isBusy}
          error={fieldErrors.name}
          icon={<UserRound />}
          label="Nombre completo"
          name="name"
          onChange={(event) => {
            setName(event.target.value);
            setFieldErrors((current) => ({ ...current, name: "" }));
            setError("");
          }}
          placeholder="Tu nombre completo"
          required
          type="text"
          value={name}
        />
        <Input
          className="space-y-1.5"
          disabled={isBusy}
          error={fieldErrors.email}
          icon={<Mail />}
          label="Correo electrónico"
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
            setFieldErrors((current) => ({ ...current, email: "" }));
            setError("");
          }}
          placeholder="tu@correo.com"
          required
          type="email"
          value={email}
        />
        <Input
          className="space-y-1.5"
          disabled={isBusy}
          error={fieldErrors.password}
          icon={<LockKeyhole />}
          label="Contraseña"
          name="password"
          onChange={(event) => {
            setPassword(event.target.value);
            setFieldErrors((current) => ({ ...current, password: "" }));
            setError("");
          }}
          placeholder="8 caracteres, una mayúscula y un número"
          required
          type="password"
          value={password}
        />
        <Input
          className="space-y-1.5"
          disabled={isBusy}
          error={fieldErrors.confirmPassword}
          icon={<LockKeyhole />}
          label="Confirmar contraseña"
          name="confirmPassword"
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setFieldErrors((current) => ({ ...current, confirmPassword: "" }));
            setError("");
          }}
          placeholder="Repite tu contraseña"
          required
          type="password"
          value={confirmPassword}
        />

        <div className="space-y-1 pt-1">
          <label className="flex cursor-pointer items-start gap-2 text-sm text-text-secondary">
            <input
              checked={acceptedTerms}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-surface accent-primary focus:ring-2 focus:ring-primary/50"
              disabled={isBusy}
              onChange={(event) => {
                setAcceptedTerms(event.target.checked);
                setFieldErrors((current) => ({ ...current, acceptedTerms: "" }));
              }}
              type="checkbox"
            />
            <span>
              Acepto los{" "}
              <Link
                className="text-primary underline underline-offset-2 hover:text-primary-hover"
                href="/terms"
                onClick={(event) => event.stopPropagation()}
              >
                Términos
              </Link>{" "}
              y la{" "}
              <Link
                className="text-primary underline underline-offset-2 hover:text-primary-hover"
                href="/privacy"
                onClick={(event) => event.stopPropagation()}
              >
                Política de Privacidad
              </Link>
            </span>
          </label>
          {fieldErrors.acceptedTerms && (
            <p className="text-xs text-error" role="alert">
              {fieldErrors.acceptedTerms}
            </p>
          )}
        </div>

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
          disabled={isBusy}
          loading={isSubmitting}
          size="lg"
          type="submit"
        >
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        ¿Ya tienes cuenta?{" "}
        <Link
          className="font-semibold text-primary transition-colors hover:text-primary-hover"
          href="/login"
        >
          Inicia sesión
        </Link>
      </p>
    </Card>
  );
}
