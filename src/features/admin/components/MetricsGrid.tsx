import { CalendarCheck, DollarSign, DoorOpen, Gauge } from "lucide-react";

import { CARD_CLASS } from "@/features/admin/constants";
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
        <div className={CARD_CLASS} key={item.label}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <item.icon size={20} />
            </div>
            <p className="font-heading text-2xl font-bold text-text-primary">
              {item.value}
            </p>
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
