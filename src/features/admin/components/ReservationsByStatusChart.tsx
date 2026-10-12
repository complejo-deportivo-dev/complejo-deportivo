"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { CARD_CLASS, RESERVATION_STATUS } from "@/features/admin/constants";
import type { AdminMetrics, ReservationStatus } from "@/features/admin/types";

interface ReservationsByStatusChartProps {
  data?: AdminMetrics["by_status"];
}

// Orden de visualización en 2 columnas como en Figma
const LEFT_STATUSES: ReservationStatus[] = ["confirmed", "completed", "failed"];
const RIGHT_STATUSES: ReservationStatus[] = ["pending", "expired"];
const ALL_STATUSES: ReservationStatus[] = [
  "confirmed",
  "pending",
  "completed",
  "expired",
  "failed",
];

export default function ReservationsByStatusChart({
  data,
}: ReservationsByStatusChartProps) {
  // Aseguramos que data exista
  const statusData = data ?? ({} as Record<ReservationStatus, number>);

  const chartData = ALL_STATUSES.map((status) => {
    const config = RESERVATION_STATUS[status];
    return {
      name: config.pluralLabel,
      value: statusData[status] ?? 0,
      color: config.color,
    };
  }).filter((item) => item.value > 0);

  const total = ALL_STATUSES.reduce(
    (sum, status) => sum + (statusData[status] ?? 0),
    0
  );

  return (
    <section className={CARD_CLASS}>
      <div className="mb-4">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Reservas por estado
        </h2>
        <p className="text-xs text-text-secondary">Período actual</p>
      </div>

      {total === 0 ? (
        <p className="py-10 text-center text-sm text-text-secondary">
          Aún no hay reservas para mostrar.
        </p>
      ) : (
        <>
          <div className="relative h-60 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={60}
                  nameKey="name"
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {chartData.map((item) => (
                    <Cell fill={item.color} key={item.name} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Total centrado dentro del donut como en Figma */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-bold text-text-primary">
                {total}
              </span>
              <span className="text-xs text-text-secondary">Total</span>
            </div>
          </div>

          {/* Leyenda personalizada en 2 columnas según Figma */}
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-border pt-4 text-xs">
            <div className="space-y-2">
              {LEFT_STATUSES.map((status) => {
                const config = RESERVATION_STATUS[status];
                const count = statusData[status] ?? 0;
                return (
                  <div className="flex items-center justify-between" key={status}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-text-secondary">
                        {config.pluralLabel}
                      </span>
                    </div>
                    <span className="font-medium text-text-primary">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              {RIGHT_STATUSES.map((status) => {
                const config = RESERVATION_STATUS[status];
                const count = statusData[status] ?? 0;
                return (
                  <div className="flex items-center justify-between" key={status}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <span className="text-text-secondary">
                        {config.pluralLabel}
                      </span>
                    </div>
                    <span className="font-medium text-text-primary">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
