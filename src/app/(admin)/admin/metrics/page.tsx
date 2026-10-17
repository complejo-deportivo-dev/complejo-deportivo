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
    throw new Error(
      `No se pudieron cargar las métricas (error ${response.status}).`,
    );
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
          : "No se pudieron cargar las métricas.",
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
    <div className="relative min-h-screen flex flex-col">
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
            Métricas
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Consulta el rendimiento y la ocupación del complejo.
          </p>
        </div>

        {loading && <DashboardSkeleton />}

        {!loading && error && (
          <Banner variant="error">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void loadMetrics()}
              >
                Reintentar
              </Button>
            </div>
          </Banner>
        )}

        {!loading && !error && metrics && (
          <>
            <MetricsGrid metrics={metrics} />

            <div className="grid gap-6 lg:grid-cols-2">
              <ReservationsByDayChart data={metrics.daily_reservations} />
              <ReservationsByStatusChart data={metrics.by_status} />
            </div>

            <ServiceOccupancyList services={metrics.service_occupancy} />
          </>
        )}
      </main>
    </div>
  );
}
