"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock3, History, ListFilter, Plus } from "lucide-react";

import ModalQR from "@/components/shared/ModalQR";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import ReservationCard from "@/features/reservations/components/ReservationCard";
import type { ReservationStatus } from "@/types/database";
import type { ReservationWithDetails } from "@/types/api";
import { formatDateLong, timeRangeToLabel } from "@/utils/dates";

type ReservationFilter = "upcoming" | "history" | "all";

const FILTERS: {
  id: ReservationFilter;
  label: string;
  icon: typeof CalendarDays;
}[] = [
  { id: "upcoming", label: "Próximas", icon: CalendarDays },
  { id: "history", label: "Historial", icon: History },
  { id: "all", label: "Todas", icon: ListFilter },
];

const FILTER_STATUSES: Record<ReservationFilter, ReservationStatus[] | null> = {
  upcoming: ["pending", "confirmed"],
  history: ["completed", "failed", "expired"],
  all: null,
};

interface SelectedQr {
  reservation: ReservationWithDetails;
  qrIndex: number;
}

async function fetchReservations(url: string): Promise<ReservationWithDetails[]> {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.error) {
    throw new Error(body?.error ?? "No se pudieron cargar tus reservas.");
  }
  if (!Array.isArray(body?.data)) {
    throw new Error("La respuesta de reservas no tiene el formato esperado.");
  }
  return body.data as ReservationWithDetails[];
}

async function fetchReservationDetails(
  reservationId: number,
): Promise<ReservationWithDetails> {
  const response = await fetch(`/api/reservations/${reservationId}`, {
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.error) {
    throw new Error(body?.error ?? "No se pudo cargar el detalle de la reserva.");
  }
  return body.data as ReservationWithDetails;
}

function sortReservations(
  reservations: ReservationWithDetails[],
  filter: ReservationFilter,
): ReservationWithDetails[] {
  return [...reservations].sort((left, right) => {
    const dateComparison = left.reservation_date.localeCompare(
      right.reservation_date,
    );
    const timeComparison = (left.slots[0]?.time_start ?? "").localeCompare(
      right.slots[0]?.time_start ?? "",
    );
    const comparison = dateComparison || timeComparison;
    return filter === "upcoming" ? comparison : -comparison;
  });
}

async function loadReservations(
  filter: ReservationFilter,
): Promise<ReservationWithDetails[]> {
  const statuses = FILTER_STATUSES[filter];
  const lists = statuses
    ? await Promise.all(
        statuses.map((status) =>
          fetchReservations(`/api/reservations?status=${status}`),
        ),
      )
    : [await fetchReservations("/api/reservations")];

  const uniqueReservations = new Map<number, ReservationWithDetails>();
  lists.flat().forEach((reservation) => {
    uniqueReservations.set(reservation.reservation_id, reservation);
  });

  const reservations = [...uniqueReservations.values()];
  const withQrCodes = await Promise.all(
    reservations.map(async (reservation) => {
      if (reservation.status !== "confirmed") return reservation;
      if ((reservation.qr_codes ?? []).length > 0) return reservation;

      try {
        return await fetchReservationDetails(reservation.reservation_id);
      } catch {
        return reservation;
      }
    }),
  );

  return sortReservations(withQrCodes, filter);
}

function getEmptyMessage(filter: ReservationFilter): string {
  if (filter === "upcoming") return "No tienes reservas próximas";
  if (filter === "history") return "Aún no tienes historial";
  return "Aún no tienes reservas";
}

export default function ReservationList() {
  const [filter, setFilter] = useState<ReservationFilter>("upcoming");
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedQr, setSelectedQr] = useState<SelectedQr | null>(null);

  useEffect(() => {
    let active = true;

    loadReservations(filter)
      .then((items) => {
        if (active) setReservations(items);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(
            caught instanceof Error
              ? caught.message
              : "No se pudieron cargar tus reservas.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter, retryKey]);

  function changeFilter(nextFilter: ReservationFilter) {
    if (nextFilter === filter) return;
    setLoading(true);
    setError(null);
    setFilter(nextFilter);
  }

  function retry() {
    setLoading(true);
    setError(null);
    setRetryKey((key) => key + 1);
  }

  const selectedCode = selectedQr?.reservation.qr_codes?.[selectedQr.qrIndex];

  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-16 pt-10 lg:px-16">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase text-secondary">
            Tu actividad
          </p>
          <h1 className="font-heading text-h1 font-semibold text-text-primary">
            Mis reservas
          </h1>
          <p className="max-w-2xl text-text-secondary">
            Consulta tus próximos horarios, revisa el historial y accede a tus códigos de entrada.
          </p>
        </div>

        <div
          aria-label="Filtrar reservas"
          className="mb-6 flex w-full gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1 sm:w-fit"
          role="group"
        >
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-pressed={filter === id}
              className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                filter === id
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              }`}
              onClick={() => changeFilter(id)}
              type="button"
            >
              <Icon aria-hidden="true" size={16} />
              {label}
            </button>
          ))}
        </div>

        {error && (
          <Banner className="mb-6" variant="error">
            <p className="font-medium">No pudimos cargar tus reservas.</p>
            <p className="mt-1 text-sm">{error}</p>
            <Button className="mt-3" onClick={retry} size="sm">
              Reintentar
            </Button>
          </Banner>
        )}

        {loading ? (
          <div aria-label="Cargando reservas" className="space-y-4" role="status">
            {[0, 1, 2].map((item) => (
              <Card key={item} className="space-y-5" padding="lg">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton height={24} width="42%" />
                  <Skeleton height={22} width={96} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Skeleton height={18} width="80%" />
                  <Skeleton height={18} width="65%" />
                  <Skeleton height={18} width="60%" />
                </div>
                <Skeleton height={42} width="100%" />
              </Card>
            ))}
          </div>
        ) : !error && reservations.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Clock3 aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h2 className="font-heading text-h4 font-semibold text-text-primary">
                {getEmptyMessage(filter)}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Cuando reserves un servicio, aparecerá aquí.
              </p>
            </div>
            <Link href="/client/categories">
              <Button className="mt-2" size="md">
                <Plus aria-hidden="true" size={17} />
                Reservar ahora
              </Button>
            </Link>
          </Card>
        ) : !error ? (
          <div aria-label={`${reservations.length} reservas`} className="space-y-4">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.reservation_id}
                onViewQr={(item, qrIndex) =>
                  setSelectedQr({ reservation: item, qrIndex })
                }
                reservation={reservation}
              />
            ))}
          </div>
        ) : null}
      </main>

      {selectedQr && selectedCode && (
        <ModalQR
          date={formatDateLong(selectedQr.reservation.reservation_date)}
          isOpen
          onClose={() => setSelectedQr(null)}
          peopleCount={selectedQr.reservation.quantity}
          qrToken={selectedCode.token}
          reservationId={selectedQr.reservation.reservation_id}
          serviceName={selectedQr.reservation.service.name}
          timeRange={timeRangeToLabel(selectedQr.reservation.slots)}
          title={
            selectedQr.reservation.qr_codes?.length === 1
              ? selectedQr.reservation.service.name
              : `${selectedQr.reservation.service.name} · QR ${selectedQr.qrIndex + 1}`
          }
          used={selectedCode.used}
        />
      )}
    </>
  );
}