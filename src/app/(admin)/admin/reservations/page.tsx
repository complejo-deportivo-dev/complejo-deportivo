"use client";

import { useEffect, useMemo, useState } from "react";

import Header from "@/components/shared/Header";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import { CARD_CLASS } from "@/features/admin/constants";
import ReservationsTable, {
  type AdminReservationRow,
} from "@/features/admin/components/ReservationsTable";
import type { ReservationStatus } from "@/features/admin/types";

const STATUS_FILTERS: { value: ReservationStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
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
      `No se pudieron cargar las reservas (error ${response.status}).`
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
    "all"
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
          : "No se pudo cargar la lista de reservas."
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
            (reservation) => reservation.status === statusFilter
          ),
    [reservations, statusFilter]
  );

  return (
    <>
      <Header role="admin" userName="Admin" userInitials="AD" />

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <div>
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            PANEL DE ADMINISTRACIÓN
          </p>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Reservas
          </h1>
          <p className="text-text-secondary">
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

        <section className={CARD_CLASS}>
          <label
            className="flex flex-col gap-2 text-sm font-medium text-text-primary sm:max-w-xs"
            htmlFor="reservation-status"
          >
            Estado
            <select
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
              id="reservation-status"
              onChange={(event) =>
                setStatusFilter(event.target.value as ReservationStatus | "all")
              }
              value={statusFilter}
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {loading ? (
          <section
            aria-busy="true"
            className={`${CARD_CLASS} py-10 text-center text-sm text-text-secondary`}
          >
            Cargando reservas...
          </section>
        ) : (
          !error && <ReservationsTable reservations={filteredReservations} />
        )}
      </main>
    </>
  );
}
