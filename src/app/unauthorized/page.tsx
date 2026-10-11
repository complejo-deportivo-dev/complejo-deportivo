import Link from "next/link";
import { ShieldX } from "lucide-react";
import Button from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-error-soft text-error">
          <ShieldX className="size-16" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-heading text-2xl font-bold text-text-primary">
          Acceso no autorizado
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          No tienes permisos para ver esta sección. Inicia sesión con la cuenta
          correcta o vuelve al inicio.
        </p>
        <div className="mt-8 space-y-3">
          <Link href="/login" className="block">
            <Button size="lg" className="w-full">
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button size="lg" variant="ghost" className="w-full">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
