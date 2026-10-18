import { CalendarCheck, DollarSign, DoorOpen, Gauge } from "lucide-react";
import type { AdminMetrics } from "@/features/admin/types";

interface MetricsGridProps {
  metrics: AdminMetrics;
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const money = new Intl.NumberFormat("es-CO");

  const totalAccesses =
    metrics.entries !== undefined
      ? metrics.entries.granted + metrics.entries.denied
      : "—";

  const items = [
    {
      label: "Reservas hoy",
      value: metrics.total_reservations ?? 0,
      icon: CalendarCheck,
    },
    {
      label: "Ingresos hoy",
      value: `$${money.format(metrics.total_revenue ?? 0)}`,
      icon: DollarSign,
    },
    {
      label: "Ocupación hoy",
      value: metrics.occupancy !== undefined ? `${metrics.occupancy}%` : "—",
      icon: Gauge,
    },
    {
      label: "Accesos hoy",
      value: totalAccesses,
      icon: DoorOpen,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-400">
              <item.icon size={20} />
            </div>
            <p className="font-heading text-2xl font-bold text-white">
              {item.value}
            </p>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
