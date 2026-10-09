"use client";

import { useEffect, useState } from "react";

import Header from "@/components/shared/Header";
import Button from "@/components/ui/Button";
import DashboardSkeleton from "@/features/admin/components/DashboardSkeleton";
import MetricsGrid from "@/features/admin/components/MetricsGrid";
import QuickActionsGrid from "@/features/admin/components/QuickActionsGrid";
import RecentAccessLogsTable from "@/features/admin/components/RecentAccessLogsTable";
import RecentReservationsTable from "@/features/admin/components/RecentReservationsTable";
import ReservationsByDayChart from "@/features/admin/components/ReservationsByDayChart";
import ReservationsByStatusChart from "@/features/admin/components/ReservationsByStatusChart";
import ServiceOccupancyList from "@/features/admin/components/ServiceOccupancyList";
import {
  MOCK_DASHBOARD_DATA,
  MOCK_EMPTY_DASHBOARD_DATA,
} from "@/features/admin/mock"; // TEMP-MOCK
import type {
  AdminAccessLog,
  AdminMetrics,
  AdminReservation,
  ApiResponse,
  DashboardData,
} from "@/features/admin/types";

// Hace la petición y extrae .data del formato ApiResponse<T>
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error ${response.status} en ${url}`);
  }
  const json: ApiResponse<T> = await response.json();
  return json.data;
}

// Carga las 3 peticiones en paralelo
async function fetchDashboardData(): Promise<DashboardData> {
  // TEMP-MOCK: Inicio de bloque de datos simulados
  const mockMode = process.env.NEXT_PUBLIC_USE_MOCK; // TEMP-MOCK
  if (mockMode === "error") { // TEMP-MOCK
    await new Promise((resolve) => setTimeout(resolve, 300)); // TEMP-MOCK
    throw new Error("Error simulado de carga (mock)"); // TEMP-MOCK
  } // TEMP-MOCK
  if (mockMode === "empty") { // TEMP-MOCK
    await new Promise((resolve) => setTimeout(resolve, 300)); // TEMP-MOCK
    return MOCK_EMPTY_DASHBOARD_DATA; // TEMP-MOCK
  } // TEMP-MOCK
  if (mockMode === "true") { // TEMP-MOCK
    await new Promise((resolve) => setTimeout(resolve, 300)); // TEMP-MOCK
    return MOCK_DASHBOARD_DATA; // TEMP-MOCK
  } // TEMP-MOCK
  // TEMP-MOCK: Fin de bloque de datos simulados

  const [metrics, reservations, accessLogs] = await Promise.all([
    fetchJson<AdminMetrics>("/api/admin/metrics"),
    fetchJson<AdminReservation[]>("/api/admin/reservations?limit=5"),
    fetchJson<AdminAccessLog[]>("/api/admin/access-logs?limit=5"),
  ]);

  // El diseño aún no define `limit` en estos endpoints, así que recortamos a 5 en el
  // frontend como protección por si el backend devuelve más registros.
  return {
    metrics,
    reservations: reservations.slice(0, 5),
    accessLogs: accessLogs.slice(0, 5),
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Función reutilizable para el botón "Reintentar"
  const handleRetry = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await fetchDashboardData();
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial sin llamar a setState síncronamente dentro del efecto (evita react-hooks/set-state-in-effect)
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const result = await fetchDashboardData();
        if (isMounted) {
          setData(result);
        }
      } catch {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Header role="admin" userName="Admin" userInitials="AD" />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            PANEL DE ADMINISTRACIÓN
          </p>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Hola, Admin.
          </h1>
          <p className="text-text-secondary">
            Aquí está el resumen del complejo hoy.
          </p>
        </div>

        {loading && <DashboardSkeleton />}

        {!loading && error && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="mb-4 text-text-primary">
              No pudimos cargar el dashboard. Revisa tu conexión e intenta de
              nuevo.
            </p>
            <Button onClick={handleRetry}>Reintentar</Button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <MetricsGrid metrics={data.metrics} />

            <div className="grid gap-4 lg:grid-cols-2">
              <ReservationsByDayChart
                data={data.metrics.daily_reservations}
              />
              <ReservationsByStatusChart
                data={data.metrics.by_status}
              />
            </div>

            <ServiceOccupancyList
              services={data.metrics.service_occupancy}
            />
            <QuickActionsGrid counts={data.metrics.counts} />
            <RecentReservationsTable reservations={data.reservations} />
            <RecentAccessLogsTable accessLogs={data.accessLogs} />
          </>
        )}
      </main>
    </>
  );
}
