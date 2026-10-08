"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/database";

const roleHomes: Record<UserRole, string> = {
  admin: "/admin",
  client: "/client",
  employee: "/employee",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "client" || value === "employee";
}

export default function LoginForm() {
  const router = useRouter();
  const submissionInProgress = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const isBusy = isSubmitting || isGoogleLoading;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInProgress.current) return;

    submissionInProgress.current = true;
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body: unknown = await response.json();

      if (!response.ok) {
        const message =
          isRecord(body) && typeof body.error === "string"
            ? body.error
            : "No se pudo iniciar sesión. Intenta nuevamente.";
        setError(message);
        return;
      }

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
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setIsGoogleLoading(true);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) {
        setError("No se pudo iniciar sesión con Google. Intenta nuevamente.");
        setIsGoogleLoading(false);
      }
    } catch {
      setError("No se pudo iniciar sesión con Google. Intenta nuevamente.");
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card
      as="section"
      className="mx-auto w-full max-w-[460px] border-white/10 bg-surface-elevated p-6 shadow-2xl sm:p-8"
      padding="none"
    >
      <div className="mb-5">
        <h2 className="font-heading text-2xl font-bold leading-tight text-text-primary">
          Iniciar sesión
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Ingresa con tu correo y contraseña.
        </p>
      </div>

      <Button
        className="h-10 w-full border-white/10 bg-white/5 text-sm text-text-primary hover:bg-white/10"
        disabled={isBusy}
        loading={isGoogleLoading}
        onClick={handleGoogleLogin}
        variant="secondary"
      >
        <GoogleIcon />
        Continuar con Google
      </Button>

      <div
        aria-label="o"
        className="my-5 flex items-center gap-3 text-xs text-text-disabled"
        role="separator"
      >
        <span className="h-px flex-1 bg-border" />
        <span aria-hidden="true">o</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          className="space-y-1.5"
          disabled={isBusy}
          icon={<Mail />}
          label="Correo electrónico"
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
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
          icon={<LockKeyhole />}
          label="Contraseña"
          name="password"
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
          placeholder="••••••••"
          required
          type="password"
          value={password}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-text-secondary">
            <input
              checked={rememberMe}
              className="h-4 w-4 rounded border-border bg-surface accent-primary focus:ring-2 focus:ring-primary/50"
              disabled={isBusy}
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
            />
            Recordarme
          </label>
          <Link
            className="text-text-primary underline decoration-text-disabled underline-offset-2 transition-colors hover:text-primary"
            href="/forgot-password"
          >
            ¿Olvidaste tu contraseña?
          </Link>
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
          className="w-full"
          disabled={isBusy}
          loading={isSubmitting}
          size="lg"
          type="submit"
        >
          Iniciar sesión
        </Button>
      </form>

      <p className="mt-4 rounded-md border border-secondary/40 bg-secondary/10 py-2.5 text-center text-sm text-text-secondary">
        ¿No tienes cuenta?{" "}
        <Link
          className="font-medium text-text-primary underline decoration-secondary underline-offset-2 transition-colors hover:text-secondary"
          href="/register"
        >
          Regístrate
        </Link>
      </p>

      <p className="mt-4 text-center text-[10px] leading-relaxed text-text-disabled">
        Al continuar aceptas los{" "}
        <Link
          className="underline underline-offset-2 hover:text-text-secondary"
          href="/terms"
        >
          Términos
        </Link>{" "}
        y la{" "}
        <Link
          className="underline underline-offset-2 hover:text-text-secondary"
          href="/privacy"
        >
          Política de Privacidad
        </Link>
      </p>
    </Card>
  );
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      viewBox="0 0 48 48"
    >
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