import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Camera, CheckCircle, Search } from "lucide-react";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const BOGOTA_TIME_ZONE = "America/Bogota";

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const employee = await prisma.public_users.findUnique({
    where: { id: user.id },
  });

  if (!employee || employee.role !== "employee") {
    redirect("/");
  }

  const todayInBogota = formatInTimeZone(
    new Date(),
    BOGOTA_TIME_ZONE,
    "yyyy-MM-dd",
  );
  const startOfTodayInBogota = fromZonedTime(
    `${todayInBogota}T00:00:00`,
    BOGOTA_TIME_ZONE,
  );

  const [recentValidations, validatedCount] = await Promise.all([
    prisma.access_logs.findMany({
      where: {
        id_employee: user.id,
        scanned_at: { gte: startOfTodayInBogota },
      },
      include: {
        reservations: {
          include: {
            users: true,
            reservation_slots: {
              include: { time_slots: { include: { services: true } } },
              orderBy: [
                { slot_date: "asc" },
                { time_slots: { time_start: "asc" } },
              ],
            },
          },
        },
      },
      orderBy: { scanned_at: "desc" },
      take: 5,
    }),
    prisma.access_logs.count({
      where: {
        id_employee: user.id,
        result: "granted",
        scanned_at: { gte: startOfTodayInBogota },
      },
    }),
  ]);

  return (
    <main className="flex min-h-screen justify-center bg-background">
      <div className="w-full max-w-md px-4 py-6">
        <header className="flex items-center justify-between">
          <Image
            src="/brand/imagotipo-light.svg"
            alt="Otium"
            width={32}
            height={32}
            priority
          />
          <div className="flex items-center gap-3">
            <span className="max-w-48 truncate text-sm text-text-primary">
              {employee.name}
            </span>
            <Avatar name={employee.name} size="sm" />
          </div>
        </header>

        <section className="mt-8">
          <h1 className="font-heading text-2xl font-bold text-text-primary">
            Hola, {employee.name}
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
            {validatedCount} accesos validados hoy
          </p>
        </Card>

        <div className="mt-5 space-y-4">
          <Link
            href="/employee/scan"
            className="block rounded-xl transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Card
              variant="highlighted"
              padding="md"
              className="flex h-[180px] flex-col items-center justify-center text-center"
            >
              <Camera aria-hidden="true" className="size-12 text-white" />
              <h2 className="mt-3 font-heading text-2xl font-bold text-white">
                Escanear QR
              </h2>
              <p className="mt-1 text-sm text-white/80">
                Apunta al código del cliente.
              </p>
            </Card>
          </Link>

          <Link
            href="/employee/manual"
            className="block rounded-xl transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Card
              padding="sm"
              className="flex min-h-20 items-center gap-3 transition-colors hover:border-primary"
            >
              <Search
                aria-hidden="true"
                className="size-5 shrink-0 text-primary"
              />
              <span className="flex-1 text-sm font-medium text-text-primary">
                Buscar por nombre, cédula o reserva
              </span>
              <ArrowRight
                aria-hidden="true"
                className="size-5 shrink-0 text-text-secondary"
              />
            </Card>
          </Link>
        </div>

        <section className="mt-8">
          <h2 className="font-heading text-lg font-bold text-text-primary">
            Últimas validaciones
          </h2>
          {recentValidations.length === 0 ? (
            <p className="mt-4 text-sm text-text-secondary">
              Sin validaciones hoy
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {recentValidations.map((validation) => {
                const holderName =
                  validation.reservations?.users?.name ??
                  "Titular no disponible";
                const serviceName =
                  validation.reservations?.reservation_slots[0]?.time_slots
                    ?.services?.name ?? "Servicio no disponible";

                return (
                  <li key={validation.id}>
                    <Card
                      as="article"
                      padding="sm"
                      className="flex items-center gap-3"
                    >
                      <Avatar name={holderName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {holderName}
                        </p>
                        <p className="truncate text-xs text-text-secondary">
                          {serviceName}
                          <span aria-hidden="true"> · </span>
                          {validation.scanned_at
                            ? formatInTimeZone(
                                validation.scanned_at,
                                BOGOTA_TIME_ZONE,
                                "HH:mm",
                              )
                            : "--:--"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          validation.result === "granted" ? "success" : "error"
                        }
                        size="sm"
                      >
                        {validation.result === "granted"
                          ? "Concedido"
                          : "Denegado"}
                      </Badge>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
