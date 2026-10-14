"use client";

import { useCallback, useEffect, useState } from "react";

import Header from "@/components/shared/Header";
import Banner from "@/components/ui/Banner";
import Button from "@/components/ui/Button";
import DashboardSkeleton from "@/features/admin/components/DashboardSkeleton";
import MetricsGrid from "@/features/admin/components/MetricsGrid";
import ReservationsByDayChart from "@/features/admin/components/ReservationsByDayChart";
import ReservationsByStatusChart from "@/features/admin/components/ReservationsByStatusChart";
import ServiceOccupancyList from "@/features/admin/components/ServiceOccupancyList";
import type { AdminMetrics, ApiResponse } from "@/features/admin/types";

async function fetchMetrics(): Promise<AdminMetrics> {
  const response = await fetch("/api/admin/metrics");
  if (!response.ok) {
    throw new Error(`No se pudieron cargar las métricas (error ${response.status}).`);
  }

  const payload: ApiResponse<AdminMetrics> = await response.json();
  return payload.data;
}

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setMetrics(await fetchMetrics());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudieron cargar las métricas."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMetrics();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadMetrics]);

  return (
    <>
      <Header role="admin" userName="Admin" userInitials="AD" />

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-6">
        <div>
          <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            PANEL DE ADMINISTRACIÓN
          </p>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Métricas
          </h1>
          <p className="text-text-secondary">
            Consulta el rendimiento y la ocupación del complejo.
          </p>
        </div>

        {loading && <DashboardSkeleton />}

        {!loading && error && (
          <Banner variant="error">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button size="sm" variant="secondary" onClick={() => void loadMetrics()}>
                Reintentar
              </Button>
            </div>
          </Banner>
        )}

        {!loading && !error && metrics && (
          <>
            <MetricsGrid metrics={metrics} />

            <div className="grid gap-4 lg:grid-cols-2">
              <ReservationsByDayChart data={metrics.daily_reservations} />
              <ReservationsByStatusChart data={metrics.by_status} />
            </div>

            <ServiceOccupancyList services={metrics.service_occupancy} />
          </>
        )}
      </main>
    </>
  );
}
