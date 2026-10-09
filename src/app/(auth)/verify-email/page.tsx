"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function VerifyEmailPage() {
  const router = useRouter();

  return (
    <Card
      as="section"
      padding="none"
      variant="flat"
      className="w-full !rounded-none !bg-transparent !shadow-none !backdrop-blur-none"
    >
      <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Mail aria-hidden="true" className="size-6" />
      </div>
      <h2 className="font-heading text-h2 font-bold leading-tight text-text-primary">
        Revisa tu correo
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        Te enviamos un enlace para confirmar tu cuenta. Ábrelo para completar tu
        registro.
      </p>
      <Button
        className="mt-6 w-full !rounded-full"
        size="lg"
        onClick={() => router.push("/login")}
      >
        Volver al inicio de sesión
      </Button>
      <p className="mt-4 text-center text-sm text-text-secondary">
        ¿No recibiste el correo? Revisa tu carpeta de spam.
      </p>
      <p className="mt-4 text-center text-xs text-text-disabled">
        <Link
          className="text-primary transition-colors hover:text-primary-hover"
          href="/register"
        >
          Volver al registro
        </Link>
      </p>
    </Card>
  );
}
