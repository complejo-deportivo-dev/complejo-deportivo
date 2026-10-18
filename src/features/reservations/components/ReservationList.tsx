"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, History, Plus } from "lucide-react";

import ModalQR from "@/components/shared/ModalQR";
import ImmersiveBackground from "@/components/shared/ImmersiveBackground";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";

import Skeleton from "@/components/ui/Skeleton";
import ReservationCard from "@/features/reservations/components/ReservationCard";
import type { ReservationStatus } from "@/types/database";
import type { ReservationWithDetails } from "@/types/api";
import { formatDateLong, timeRangeToLabel } from "@/utils/dates";

type ReservationFilter = "upcoming" | "history";

const FILTERS: {
  id: ReservationFilter;
  label: string;
  icon: typeof CalendarDays;
}[] = [
  { id: "upcoming", label: "Próximas", icon: CalendarDays },
  { id: "history", label: "Historial", icon: History },
];

const FILTER_STATUSES: Record<ReservationFilter, ReservationStatus[]> = {
  upcoming: ["pending", "confirmed"],
  history: ["completed", "failed", "expired"],
};

interface SelectedQr {
  reservation: ReservationWithDetails;
  qrIndex: number;
}

async function fetchReservations(
  url: string,
): Promise<ReservationWithDetails[]> {
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
    throw new Error(
      body?.error ?? "No se pudo cargar el detalle de la reserva.",
    );
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
  const lists = await Promise.all(
    statuses.map((status) =>
      fetchReservations(`/api/reservations?status=${status}`),
    ),
  );

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

  return withQrCodes;
}

function getEmptyMessage(filter: ReservationFilter): string {
  if (filter === "upcoming") return "No tienes reservas próximas";
  return "Aún no tienes historial";
}

export default function ReservationList() {
  const [filter, setFilter] = useState<ReservationFilter>("upcoming");
  const [reservations, setReservations] = useState<ReservationWithDetails[]>(
    [],
  );
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
  const sortedReservations = sortReservations(reservations, filter);

  return (
    <>
      <ImmersiveBackground ambient alt="Escenarios deportivos" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-20 pt-28 lg:px-16">
        <Link
          href="/client"
          className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#0c1322]/50 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#0c1322]/80 hover:text-white"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Volver al inicio</span>
        </Link>

        {/* HERO BANNER DE RESERVAS */}
        <section className="group relative mb-8 flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 md:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                Gestión de Visitas y Accesos
              </span>

              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Mis reservas
              </h1>

              <p className="text-sm text-slate-300 sm:text-base leading-relaxed">
                Consulta tus franjas horarias programadas, accede a tus códigos
                QR para ingreso en portería y revisa tu historial deportivo.
              </p>
            </div>

            <Link
              href="/client/categories"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 text-sm font-semibold text-white transition-colors duration-300 hover:bg-sky-400"
            >
              <Plus aria-hidden="true" size={16} />
              <span>Nueva reserva</span>
            </Link>
          </div>
        </section>

        {/* SELECTOR DE FILTROS */}
        <div
          aria-label="Filtrar reservas"
          className="scrollbar-hide mb-6 flex w-full gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#0c1322]/75 p-1.5 shadow-lg backdrop-blur-xl sm:w-fit"
          role="group"
        >
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              aria-pressed={filter === id}
              className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold transition-all focus:outline-none ${
                filter === id
                  ? "border border-sky-400/30 bg-[#0284c7] text-white shadow-md shadow-sky-500/25"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => changeFilter(id)}
              type="button"
            >
              <Icon aria-hidden="true" size={15} />
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
          <div
            aria-label="Cargando reservas"
            className="space-y-4"
            role="status"
          >
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="space-y-5 rounded-2xl border border-white/10 bg-[#0c1322]/75 p-6 shadow-xl backdrop-blur-xl"
              >
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
              </div>
            ))}
          </div>
        ) : !error && reservations.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-white/15 bg-[#0c1322]/60 px-6 py-16 text-center shadow-xl backdrop-blur-xl">
            <span className="flex size-14 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/15 text-[#38bdf8]">
              <Clock3 aria-hidden="true" className="size-7" />
            </span>
            <div className="max-w-md">
              <h2 className="font-heading text-xl font-bold text-white">
                {getEmptyMessage(filter)}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300">
                {filter === "upcoming"
                  ? "No tienes reservas agendadas en este momento. Elige una disciplina y asegura tu cupo en tiempo real."
                  : "Cuando reserves un servicio, aparecerá listado aquí con su código QR y comprobante."}
              </p>
            </div>
            <Link href="/client/categories">
              <Button className="mt-2" size="md">
                <Plus aria-hidden="true" size={17} />
                Explorar escenarios
              </Button>
            </Link>
          </div>
        ) : !error ? (
          <div
            aria-label={`${reservations.length} reservas`}
            className="space-y-4"
          >
            {sortedReservations.map((reservation) => (
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
