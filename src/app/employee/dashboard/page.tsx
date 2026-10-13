"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, CheckCircle, LogOut, Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type RecentValidation = {
  id: number;
  holder_name: string;
  service: string;
  time: string;
  result: "granted" | "denied";
};

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [validationsToday, setValidationsToday] = useState<number>(0);
  const [recentValidations, setRecentValidations] = useState<
    RecentValidation[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadDashboard() {
      try {
        const [profileResponse, statsResponse] = await Promise.all([
          fetch("/api/users/me"),
          fetch("/api/access/stats"),
        ]);

        if (!profileResponse.ok || !statsResponse.ok) {
          throw new Error("No se pudieron cargar los datos del dashboard");
        }

        const profile: { name: string } = await profileResponse.json();
        const stats: {
          data: {
            validations_today: number;
            recent_validations: {
              id: number;
              holder_name: string;
              service_name: string;
              time: string;
              result: "granted" | "denied";
            }[];
          };
        } = await statsResponse.json();

        if (!isActive) return;

        setUserName(profile.name);
        setUserInitials(
          profile.name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toLocaleUpperCase(),
        );
        setValidationsToday(stats.data.validations_today);
        setRecentValidations(
          stats.data.recent_validations.map((validation) => ({
            id: validation.id,
            holder_name: validation.holder_name,
            service: validation.service_name,
            time: validation.time,
            result: validation.result,
          })),
        );
      } catch (error) {
        console.error("Error al cargar el dashboard del empleado", error);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

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
          <div className="flex items-center gap-2.5">
            <span className="max-w-36 truncate text-sm text-text-primary">
              {userName}
            </span>
            <Avatar name={userName} size="sm" />
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary transition-colors hover:border-error/40 hover:bg-error-soft/30 hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <section className="mt-8">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Hola, {userName || userInitials}
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
            {loading ? "" : validationsToday} accesos validados hoy
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
              <li key={validation.id}>
                <Card
                  as="article"
                  padding="sm"
                  className="flex items-center gap-3"
                >
                  <Avatar name={validation.holder_name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {validation.holder_name}
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
