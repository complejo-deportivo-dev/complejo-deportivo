// TEMPORAL: versión con datos hardcodeados para previsualizar. Reemplazar por versión real cuando el login esté listo.
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, CheckCircle, Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const userName = "Empleado Test";
const userInitials = "ET";
const validationsToday = 12;

const recentValidations: {
  name: string;
  service: string;
  time: string;
  result: "granted" | "denied";
}[] = [
  {
    name: "Laura Martínez",
    service: "Piscina climatizada",
    time: "09:42",
    result: "granted",
  },
  {
    name: "Andrés Gómez",
    service: "Gimnasio",
    time: "09:35",
    result: "granted",
  },
  {
    name: "Camila Rodríguez",
    service: "Cancha de fútbol",
    time: "09:21",
    result: "denied",
  },
  {
    name: "Mateo Sánchez",
    service: "Zonas húmedas",
    time: "09:10",
    result: "granted",
  },
  {
    name: "Valentina López",
    service: "Piscina climatizada",
    time: "08:54",
    result: "granted",
  },
];

export default function EmployeeDashboardPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen justify-center bg-background">
      <div className="w-full max-w-md px-4 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/imagotipo-dark.svg"
              alt="Otium"
              width={96}
              height={96}
              priority
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="max-w-48 truncate text-sm text-text-primary">
              {userName}
            </span>
            <Avatar
              name={`${userInitials[0]} ${userInitials.slice(1)}`}
              size="sm"
            />
          </div>
        </header>

        <section className="mt-8">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Hola, {userName}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Valida los accesos desde tu celular.
          </p>
        </section>

        <Card
          variant="flat"
          padding="sm"
          className="mt-6 flex items-center gap-3 border !border-primary !bg-primary-soft"
        >
          <CheckCircle
            aria-hidden="true"
            className="size-5 shrink-0 text-primary"
          />
          <p className="text-base font-medium text-text-primary">
            {validationsToday} accesos validados hoy
          </p>
        </Card>

        <div className="mt-5 space-y-4">
          <Button
            size="lg"
            className="min-h-[180px] w-full flex-col rounded-xl text-center shadow-lg"
            onClick={() => router.push("/employee/scan")}
          >
            <Camera aria-hidden="true" className="size-12" />
            <span className="font-heading text-2xl font-bold">Escanear QR</span>
          </Button>

          <Link
            href="/employee/manual"
            className="flex min-h-20 items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Search
              aria-hidden="true"
              className="size-5 shrink-0 text-primary"
            />
            <span className="flex-1 text-sm font-medium text-text-primary">
              Buscar manualmente
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-5 shrink-0 text-text-secondary"
            />
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="font-heading text-lg font-bold text-text-primary">
            Últimas validaciones
          </h2>
          <ul className="mt-3 space-y-3">
            {recentValidations.map((validation) => (
              <li key={`${validation.name}-${validation.time}`}>
                <Card
                  as="article"
                  padding="sm"
                  className="flex items-center gap-3"
                >
                  <Avatar name={validation.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {validation.name}
                    </p>
                    <p className="truncate text-xs text-text-secondary">
                      {validation.service}
                      <span aria-hidden="true"> · </span>
                      {validation.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      validation.result === "granted" ? "success" : "error"
                    }
                    size="sm"
                  >
                    {validation.result === "granted" ? "Concedido" : "Denegado"}
                  </Badge>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
