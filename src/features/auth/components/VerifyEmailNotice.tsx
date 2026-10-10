"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

interface VerifyEmailNoticeProps {
  email: string;
}

export default function VerifyEmailNotice({ email }: VerifyEmailNoticeProps) {
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleResend() {
    if (!email) {
      return;
    }

    setIsResending(true);
    setStatus("idle");
    setFeedback("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        throw error;
      }

      setStatus("success");
      setFeedback("Correo reenviado. Revisa tu bandeja.");
    } catch {
      setStatus("error");
      setFeedback("No fue posible reenviar el correo. Intenta nuevamente.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Card
      as="section"
      padding="none"
      variant="flat"
      className="mx-auto w-full max-w-md !rounded-none !bg-transparent !shadow-none !backdrop-blur-none text-center"
    >
      <div className="mb-6 flex justify-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Mail aria-hidden="true" className="text-primary" size={64} />
        </div>
      </div>

      <h2 className="font-heading text-h2 font-bold leading-tight text-text-primary">
        Verifica tu correo
      </h2>

      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
        Te enviamos un enlace a {email}. Haz clic en él para activar tu cuenta.
      </p>

      {feedback && (
        <div
          aria-live="polite"
          className={`mt-4 rounded-md border px-3 py-2 text-sm ${
            status === "success"
              ? "border-success/30 bg-success-soft text-success"
              : "border-error/30 bg-error-soft text-error"
          }`}
          role={status === "error" ? "alert" : "status"}
        >
          {feedback}
        </div>
      )}

      <Button
        className="mt-6 w-full !rounded-full"
        disabled={isResending}
        loading={isResending}
        onClick={handleResend}
        size="lg"
        variant="secondary"
      >
        Reenviar correo de verificación
      </Button>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link
          className="font-semibold text-primary transition-colors hover:text-primary-hover"
          href="/login"
        >
          Volver al inicio de sesión
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-text-secondary">
        Si no recibes el correo, revisa tu carpeta de spam.
      </p>
    </Card>
  );
}
