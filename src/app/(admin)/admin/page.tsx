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
import type {
  AdminAccessLog,
  AdminMetrics,
  AdminReservation,
  ApiResponse,
  DashboardData,
} from "@/features/admin/types";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error ${response.status} en ${url}`);
  }
  const json: ApiResponse<T> = await response.json();
  return json.data;
}

async function fetchDashboardData(): Promise<DashboardData> {
  const [metrics, reservations, accessLogs] = await Promise.all([
    fetchJson<AdminMetrics>("/api/admin/metrics"),
    fetchJson<AdminReservation[]>("/api/admin/reservations?limit=5"),
    fetchJson<AdminAccessLog[]>("/api/admin/access-logs?limit=5"),
  ]);

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

      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-20 pt-28 md:px-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            PANEL DE ADMINISTRACIÓN
          </p>
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Hola, Admin.
          </h1>
          <p className="text-slate-300">
            Aquí está el resumen del complejo hoy.
          </p>
        </div>

        {loading && <DashboardSkeleton />}

        {!loading && error && (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center backdrop-blur-xl">
            <p className="mb-4 text-white">
              No pudimos cargar el dashboard. Revisa tu conexión e intenta de
              nuevo.
            </p>
            <Button
              onClick={handleRetry}
              className="bg-sky-500 hover:bg-sky-400"
            >
              Reintentar
            </Button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <MetricsGrid metrics={data.metrics} />

            <div className="grid gap-6 lg:grid-cols-2">
              <ReservationsByDayChart data={data.metrics.daily_reservations} />
              <ReservationsByStatusChart data={data.metrics.by_status} />
            </div>

            <ServiceOccupancyList services={data.metrics.service_occupancy} />
            <QuickActionsGrid counts={data.metrics.counts} />
            <RecentReservationsTable reservations={data.reservations} />
            <RecentAccessLogsTable accessLogs={data.accessLogs} />
          </>
        )}
      </main>
    </div>
  );
}
