"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LockKeyhole, Mail } from "lucide-react";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

const roleHomes: Record<UserRole, string> = {
  admin: "/admin",
  client: "/client",
  employee: "/employee/dashboard",
};

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es obligatorio.")
    .email("El correo debe tener un formato válido."),
  password: z
    .string()
    .refine(
      (value) => value.trim().length > 0,
      "La contraseña es obligatoria.",
    ),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "client" || value === "employee";
}

interface LoginFormProps {
  passwordUpdated?: boolean;
}

export default function LoginForm({ passwordUpdated = false }: LoginFormProps) {
  const router = useRouter();
  const authSubmissionInProgress = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    passwordUpdated
      ? "Contraseña actualizada correctamente. Ya puedes iniciar sesión."
      : "",
  );
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const isBusy = isSubmitting || isGoogleLoading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (authSubmissionInProgress.current) return;

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors = { email: "", password: "" };
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (field === "email" || field === "password") {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    authSubmissionInProgress.current = true;
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      if (!response.ok) {
        setError(
          response.status === 401
            ? "Correo o contraseña incorrectos"
            : "No se pudo iniciar sesión. Intenta nuevamente.",
        );
        return;
      }

      const body: unknown = await response.json();
      const data = isRecord(body) && isRecord(body.data) ? body.data : null;
      const user = data && isRecord(data.user) ? data.user : null;
      if (!user || !isUserRole(user.role)) {
        setError("La respuesta del servidor no es válida. Intenta nuevamente.");
        return;
      }

      router.replace(roleHomes[user.role]);
    } catch {
      setError("No se pudo conectar con el servidor. Intenta nuevamente.");
    } finally {
      authSubmissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    if (authSubmissionInProgress.current) return;

    authSubmissionInProgress.current = true;
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
        setError("No se pudo iniciar sesión con Google. Intenta nuevamente.");
        authSubmissionInProgress.current = false;
        setIsGoogleLoading(false);
      }
    } catch {
      setError("No se pudo iniciar sesión con Google. Intenta nuevamente.");
      authSubmissionInProgress.current = false;
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card
      as="section"
      padding="none"
      variant="default"
      className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 !shadow-none !backdrop-blur-2xl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-white/10 blur-[60px]"
      />
      <div>
        <h2 className="mb-1 font-heading text-2xl font-bold leading-tight text-text-primary">
          Bienvenido de vuelta
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          Ingresa tus datos para continuar con tus reservas.
        </p>
      </div>

      <form className="space-y-4" noValidate onSubmit={handleSubmit}>
        <div className="space-y-4">
          {successMessage && (
            <p
              className="rounded-md border border-success/30 bg-success-soft px-3 py-2 text-sm text-success"
              role="status"
            >
              {successMessage}
            </p>
          )}

          <Input
            className="space-y-1.5 [&_label]:!mb-1.5"
            disabled={isBusy}
            error={fieldErrors.email}
            icon={<Mail />}
            label="Correo electrónico"
            name="email"
            onChange={(event) => {
              const value = event.target.value;
              const validation = loginSchema.shape.email.safeParse(value);
              setEmail(value);
              setFieldErrors((current) => ({
                ...current,
                email: value
                  ? validation.success
                    ? ""
                    : (validation.error.issues[0]?.message ?? "")
                  : current.email,
              }));
              setError("");
            }}
            placeholder="tu@correo.com"
            type="email"
            value={email}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
              <label
                className="mb-1.5 block text-sm font-medium text-text-primary"
                htmlFor="login-password"
              >
                Contraseña
              </label>
              <Link
                className="text-xs font-medium text-primary transition-colors hover:text-primary-hover"
                href="/forgot-password"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              disabled={isBusy}
              error={fieldErrors.password}
              icon={<LockKeyhole />}
              id="login-password"
              name="password"
              onChange={(event) => {
                const value = event.target.value;
                setPassword(value);
                if (value) {
                  setFieldErrors((current) => ({ ...current, password: "" }));
                }
                setError("");
              }}
              placeholder="••••••••"
              type="password"
              value={password}
            />
          </div>

          <div className="flex h-5 items-center">
            <label className="inline-flex h-5 cursor-pointer select-none items-center gap-2 text-sm text-text-secondary">
              <input
                checked={rememberMe}
                className="peer sr-only"
                disabled={isBusy}
                onChange={(event) => setRememberMe(event.target.checked)}
                type="checkbox"
              />
              <span className="flex size-5 items-center justify-center rounded-md border border-border bg-surface transition-colors duration-200 peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50">
                <Check
                  aria-hidden="true"
                  className={`size-[14px] text-white transition-opacity duration-200 ${
                    rememberMe ? "opacity-100" : "opacity-0"
                  }`}
                />
              </span>
              Mantener la sesión iniciada
            </label>
          </div>

          {error && (
            <p
              className="rounded-md border border-error/30 bg-error-soft px-3 py-2 text-sm text-error"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <Button
          className="!h-10 !w-full !gap-2 !rounded-lg !px-4 !text-sm !font-medium transition-colors hover:!bg-primary-hover"
          disabled={isBusy}
          loading={isSubmitting}
          size="md"
          type="submit"
        >
          Iniciar sesión
          <ArrowRight aria-hidden="true" size={16} />
        </Button>
      </form>

      <div
        role="separator"
        aria-label="o continúa con"
        className="my-4 flex items-center gap-3 text-xs uppercase"
      >
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="shrink-0 text-text-secondary tracking-wider">
          O continúa con
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <Button
        className="!h-10 !w-full !gap-2 !cursor-pointer !rounded-lg !border-border !bg-surface !px-4 !text-sm !font-medium !text-text-primary hover:!bg-surface/80"
        disabled={isBusy}
        loading={isGoogleLoading}
        onClick={handleGoogleLogin}
        variant="secondary"
      >
        <GoogleIcon />
        Continuar con Google
      </Button>

      <p className="mt-5 text-center text-sm text-text-secondary">
        ¿No tienes cuenta?{" "}
        <Link
          className="font-semibold text-primary transition-colors hover:text-primary-hover"
          href="/register"
        >
          Regístrate
        </Link>
      </p>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 48 48">
      <path
        fill="#4285F4"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
      />
      <path
        fill="#34A853"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#FBBC05"
        d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
      />
      <path
        fill="#EA4335"
        d="M24 12c3 0 5.7 1 7.8 3l5.8-5.8C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
      />
    </svg>
  );
}
