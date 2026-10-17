"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import Header from "@/components/shared/Header";
import ModalQR from "@/components/shared/ModalQR";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import UpcomingReservationCard, {
  type UpcomingReservation,
} from "@/features/reservations/components/UpcomingReservationCard";
import RecentHistory, {
  type HistoryItemData,
} from "@/features/reservations/components/RecentHistory";
import QRList, { type QRItemData } from "@/features/qr/components/QRList";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { ReservationWithDetails } from "@/types";
import { formatDateLong, isPastDate, timeRangeToLabel } from "@/utils/dates";

interface DashboardPayload {
  name: string;
  upcoming: UpcomingReservation | null;
  history: HistoryItemData[];
}

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error ?? "No se pudieron cargar los datos");
  }
  return body?.data as T;
}

async function getClientName(): Promise<string> {
  let name = "";
  try {
    const user = await fetchData<{ name?: string }>("/api/users/me");
    name = user?.name ?? "";
  } catch {
    name = "";
  }

  if (name) return name;

  try {
    const supabase = createSupabaseClient();
    const { data } = await supabase.auth.getUser();
    const metadata = data?.user?.user_metadata ?? {};
    return (
      metadata?.name ??
      metadata?.full_name ??
      data?.user?.email?.split("@")[0] ??
      "Usuario"
    );
  } catch {
    return "Usuario";
  }
}

function compareByDateAndTime(
  a: ReservationWithDetails,
  b: ReservationWithDetails,
): number {
  if (a.reservation_date !== b.reservation_date) {
    return a.reservation_date < b.reservation_date ? -1 : 1;
  }
  const timeA = a.slots[0]?.time_start ?? "";
  const timeB = b.slots[0]?.time_start ?? "";
  return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
}

function toUpcomingReservation(
  reservation: ReservationWithDetails,
): UpcomingReservation {
  return {
    reservationId: reservation.reservation_id,
    serviceName: reservation.service.name,
    date: reservation.reservation_date,
    timeRange: timeRangeToLabel(reservation.slots),
    peopleCount: reservation.quantity,
  };
}

function toHistoryItem(reservation: ReservationWithDetails): HistoryItemData {
  return {
    reservationId: reservation.reservation_id,
    serviceName: reservation.service.name,
    date: reservation.reservation_date,
    timeRange: timeRangeToLabel(reservation.slots),
    status: reservation.status,
    peopleCount: reservation.quantity,
  };
}

function inferQrType(
  quantity: number,
  qrCount: number,
): "group" | "individual" {
  return qrCount > 1 || quantity > 1 ? "individual" : "group";
}

async function loadDashboardPayload(): Promise<DashboardPayload> {
  const [clientName, confirmedResult, allResult] = await Promise.all([
    getClientName(),
    fetchData<ReservationWithDetails[]>("/api/reservations?status=confirmed"),
    fetchData<ReservationWithDetails[]>("/api/reservations"),
  ]);

  const confirmedList = Array.isArray(confirmedResult) ? confirmedResult : [];
  const allList = Array.isArray(allResult) ? allResult : [];

  const activeConfirmed = confirmedList
    .filter((reservation) => !isPastDate(reservation.reservation_date))
    .sort(compareByDateAndTime);

  const upcoming = activeConfirmed[0]
    ? toUpcomingReservation(activeConfirmed[0])
    : null;

  const history = allList
    .filter(
      (reservation) =>
        isPastDate(reservation.reservation_date) ||
        reservation.status === "completed",
    )
    .sort((a, b) => (a.reservation_date < b.reservation_date ? 1 : -1))
    .slice(0, 5)
    .map(toHistoryItem);

  return { name: clientName, upcoming, history };
}

async function loadQrItems(): Promise<QRItemData[]> {
  const [confirmedResult, servicesResult] = await Promise.all([
    fetchData<ReservationWithDetails[]>("/api/reservations?status=confirmed"),
    fetchData<{ id: number; qr_type: "group" | "individual" }[]>(
      "/api/services",
    ).catch(() => []),
  ]);

  const servicesByQrType = new Map<number, "group" | "individual">(
    servicesResult.map((service) => [service.id, service.qr_type] as const),
  );
  const confirmedList = Array.isArray(confirmedResult) ? confirmedResult : [];
  const activeConfirmed = confirmedList
    .filter((reservation) => !isPastDate(reservation.reservation_date))
    .sort(compareByDateAndTime);

  const confirmedWithQr = await Promise.all(
    activeConfirmed.map(async (reservation) => {
      if ((reservation.qr_codes ?? []).length > 0) return reservation;
      try {
        return await fetchData<ReservationWithDetails>(
          `/api/reservations/${reservation.reservation_id}`,
        );
      } catch {
        return reservation;
      }
    }),
  );

  const qrItems: QRItemData[] = [];
  confirmedWithQr.forEach((reservation) => {
    const codes = reservation.qr_codes ?? [];
    const qrType =
      servicesByQrType.get(reservation.service.id) ??
      inferQrType(reservation.quantity, codes.length);

    codes.forEach((code) => {
      qrItems.push({
        qrId: code.qr_id,
        reservationId: reservation.reservation_id,
        token: code.token,
        used: code.used,
        title: reservation.service.name,
        serviceName: reservation.service.name,
        qrType,
        date: reservation.reservation_date,
        timeRange: timeRangeToLabel(reservation.slots),
        peopleCount: reservation.quantity,
      });
    });
  });

  return qrItems;
}

function getErrorMessage(caught: unknown): string {
  return caught instanceof Error
    ? caught.message
    : "No se pudieron cargar tus reservas.";
}

export default function ClientDashboardPage() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrItems, setQrItems] = useState<QRItemData[]>([]);
  const [loadingQrs, setLoadingQrs] = useState(true);
  const [selectedQR, setSelectedQR] = useState<QRItemData | null>(null);

  useEffect(() => {
    let active = true;

    loadDashboardPayload()
      .then((result) => {
        if (!active) return;
        setPayload(result);
      })
      .catch((caught) => {
        if (!active) return;
        setError(getErrorMessage(caught));
        setLoadingQrs(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!payload) return;

    let active = true;

    loadQrItems()
      .then((items) => {
        if (active) setQrItems(items);
      })
      .catch((caught) => {
        if (active) setError(getErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoadingQrs(false);
      });

    return () => {
      active = false;
    };
  }, [payload]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setLoadingQrs(true);
    loadDashboardPayload()
      .then((result) => setPayload(result))
      .catch((caught) => {
        setError(getErrorMessage(caught));
        setLoadingQrs(false);
      })
      .finally(() => setLoading(false));
  };

  const displayName = payload?.name ?? "";
  const upcoming = payload?.upcoming ?? null;
  const history = payload?.history ?? [];

  const upcomingQrItem = upcoming
    ? (qrItems.find((q) => q.reservationId === upcoming.reservationId) ?? null)
    : null;

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#060b17]"
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            backgroundPosition: "right top",
          }}
        />
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <Header role="client" userName={displayName || undefined} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pb-20 pt-12 lg:px-16">
        <section className="space-y-2 pt-4">
          {loading && !displayName ? (
            <Skeleton width={240} height={40} />
          ) : (
            <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Hola, {displayName || "usuario"}
            </h1>
          )}
          <p className="text-sm text-slate-300 sm:text-base">
            Todo listo para tu próxima visita al complejo.
          </p>
        </section>

        {error && (
          <Banner variant="error" onClose={() => setError(null)}>
            <p className="font-medium">No pudimos cargar tus reservas.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button size="sm" className="mt-3" onClick={retry}>
              Reintentar
            </Button>
          </Banner>
        )}

        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-bold text-white">
              Nueva Reserva
            </h2>
            <div className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-black/50">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/15 text-[#38bdf8]">
                  <CalendarDays aria-hidden="true" className="size-6" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-heading text-xl font-bold tracking-tight text-white">
                    Hacer una reserva
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed sm:text-sm">
                    Elige entre canchas sintéticas, piscina semiolímpica,
                    gimnasio y zonas húmedas. Selecciona tu horario y asegura tu
                    franja al instante.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <Link
                  href="/client/categories"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-sky-400"
                >
                  <span>Hacer una reserva</span>
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-white">
                Próxima reserva
              </h2>
              {upcoming && (
                <Link
                  href="/client/reservations"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#38bdf8] transition-colors hover:text-white"
                >
                  <span>Ver todas</span>
                  <ArrowRight aria-hidden="true" size={14} />
                </Link>
              )}
            </div>
            <div className="flex-1">
              <UpcomingReservationCard
                reservation={upcoming}
                loading={loading}
                onOpenQR={
                  upcomingQrItem
                    ? () => setSelectedQR(upcomingQrItem)
                    : undefined
                }
              />
            </div>
          </section>
        </div>

        <QRList items={qrItems} loading={loadingQrs} onOpenQR={setSelectedQR} />

        <RecentHistory items={history} loading={loading} />

        {selectedQR && (
          <ModalQR
            isOpen
            onClose={() => setSelectedQR(null)}
            reservationId={selectedQR.reservationId}
            serviceName={selectedQR.serviceName}
            qrToken={selectedQR.token}
            title={selectedQR.title}
            date={formatDateLong(selectedQR.date)}
            timeRange={selectedQR.timeRange}
            peopleCount={selectedQR.peopleCount}
            used={selectedQR.used}
          />
        )}
      </main>
    </div>
  );
}
