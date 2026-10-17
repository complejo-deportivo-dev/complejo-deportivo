"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

import Header from "@/components/shared/Header";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import { CARD_CLASS } from "@/features/admin/constants";
import ReservationsTable, {
  type AdminReservationRow,
} from "@/features/admin/components/ReservationsTable";
import type { ReservationStatus } from "@/features/admin/types";

const STATUS_FILTERS: { value: ReservationStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "failed", label: "Fallida" },
  { value: "expired", label: "Expirada" },
];

async function fetchReservations(): Promise<AdminReservationRow[]> {
  const response = await fetch("/api/admin/reservations");
  if (!response.ok) {
    throw new Error(
      `No se pudieron cargar las reservas (error ${response.status}).`,
    );
  }

  const payload: { data?: AdminReservationRow[] } = await response.json();
  if (!Array.isArray(payload.data)) {
    throw new Error("La respuesta de reservas no tiene un formato válido.");
  }

  return payload.data;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<AdminReservationRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">(
    "all",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    setLoading(true);
    setError(null);

    try {
      setReservations(await fetchReservations());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo cargar la lista de reservas.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReservations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredReservations = useMemo(
    () =>
      statusFilter === "all"
        ? reservations
        : reservations.filter(
            (reservation) => reservation.status === statusFilter,
          ),
    [reservations, statusFilter],
  );

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Fondo de cuadritos */}
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

      <Header role="admin" userName="Admin" userInitials="AD" />

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-20 pt-16 md:px-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            PANEL DE ADMINISTRACIÓN
          </p>
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Reservas
          </h1>
          <p className="text-slate-300">
            Consulta y filtra las reservas del complejo.
          </p>
        </div>

        {error && (
          <Banner variant="error">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void loadReservations()}
              >
                Reintentar
              </Button>
            </div>
          </Banner>
        )}

        {/* Contenedor del Filtro */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-lg backdrop-blur-xl">
          <label
            className="flex flex-col gap-2.5 text-sm font-medium text-slate-300 sm:max-w-xs"
            htmlFor="reservation-status"
          >
            Filtrar por estado
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                id="reservation-status"
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as ReservationStatus | "all",
                  )
                }
                value={statusFilter}
              >
                {STATUS_FILTERS.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                    className="bg-[#0c1322] text-white"
                  >
                    {status.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </label>
        </section>

        {loading ? (
          <section className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] py-24 shadow-lg backdrop-blur-xl">
            <Loader2 className="mb-4 size-8 animate-spin text-sky-500" />
            <p className="text-sm font-medium text-slate-400">
              Cargando reservas del sistema...
            </p>
          </section>
        ) : (
          !error && <ReservationsTable reservations={filteredReservations} />
        )}
      </main>
    </div>
  );
}
