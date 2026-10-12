"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import Header from "@/components/shared/Header";
import ModalQR from "@/components/shared/ModalQR";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
  qrItems: QRItemData[];
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

function inferQrType(quantity: number, qrCount: number): "group" | "individual" {
  return qrCount > 1 || quantity > 1 ? "individual" : "group";
}

async function loadDashboardPayload(): Promise<DashboardPayload> {
  const [clientName, confirmedResult, allResult] = await Promise.all([
    getClientName(),
    fetchData<ReservationWithDetails[]>("/api/reservations?status=confirmed"),
    fetchData<ReservationWithDetails[]>("/api/reservations"),
  ]);

  let servicesByQrType = new Map<number, "group" | "individual">();
  try {
    const services = await fetchData<
      { id: number; qr_type: "group" | "individual" }[]
    >("/api/services");
    servicesByQrType = new Map(
      services.map((service) => [service.id, service.qr_type]),
    );
  } catch {
    servicesByQrType = new Map();
  }

  const confirmedList = Array.isArray(confirmedResult) ? confirmedResult : [];
  const allList = Array.isArray(allResult) ? allResult : [];

  const activeConfirmed = confirmedList
    .filter((reservation) => !isPastDate(reservation.reservation_date))
    .sort(compareByDateAndTime);

  const upcoming = activeConfirmed[0]
    ? toUpcomingReservation(activeConfirmed[0])
    : null;

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

  const history = allList
    .filter(
      (reservation) =>
        isPastDate(reservation.reservation_date) ||
        reservation.status === "completed",
    )
    .sort((a, b) => (a.reservation_date < b.reservation_date ? 1 : -1))
    .slice(0, 5)
    .map(toHistoryItem);

  return { name: clientName, upcoming, qrItems, history };
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
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const retry = () => {
    setLoading(true);
    setError(null);
    loadDashboardPayload()
      .then((result) => setPayload(result))
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false));
  };

  const displayName = payload?.name ?? "";
  const upcoming = payload?.upcoming ?? null;
  const qrItems = payload?.qrItems ?? [];
  const history = payload?.history ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header role="client" userName={displayName || undefined} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-16 pt-10 lg:px-16">
        <section className="space-y-2">
          {loading && !displayName ? (
            <Skeleton width={240} height={40} />
          ) : (
            <h1 className="font-heading text-h1 font-semibold text-text-primary">
              Hola, {displayName || "usuario"}
            </h1>
          )}
          <p className="text-lg text-text-secondary">
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            variant="highlighted"
            padding="lg"
            className="flex h-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white">
                <CalendarDays aria-hidden="true" className="size-6" />
              </span>
              <div>
                <h2 className="font-heading text-h3 font-semibold text-white">
                  Hacer una reserva
                </h2>
                <p className="mt-1 text-sm text-white/80">
                  Elige entre canchas, piscinas, gimnasio y zonas húmedas y
                  asegura tu franja al instante.
                </p>
              </div>
            </div>
            <Link
              href="/client/categories"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-6 text-base font-medium text-primary transition-colors duration-200 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/60"
            >
              Hacer una reserva
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </Card>

          <section className="space-y-4">
            <h2 className="font-heading text-h3 font-semibold text-text-primary">
              Próxima reserva
            </h2>
            <UpcomingReservationCard reservation={upcoming} loading={loading} />
          </section>
        </div>

        <QRList items={qrItems} loading={loading} onOpenQR={setSelectedQR} />

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