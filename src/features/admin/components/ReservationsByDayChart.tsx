"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { CARD_CLASS } from "@/features/admin/constants";
import type { AdminMetrics } from "@/features/admin/types";

interface ReservationsByDayChartProps {
  data?: AdminMetrics["daily_reservations"];
}

// Obtiene la inicial del día de la semana de forma segura contra zonas horarias
function getDayInitial(dateStr: string): string {
  const initials = ["D", "L", "M", "M", "J", "V", "S"];
  if (!dateStr) return "";

  // Formato YYYY-MM-DD
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3 && !parts.some(Number.isNaN)) {
    const [year, month, day] = parts;
    const date = new Date(year, month - 1, day);
    return initials[date.getDay()];
  }

  // Si ya es una inicial o texto corto
  return dateStr.slice(0, 1).toUpperCase();
}

export default function ReservationsByDayChart({
  data,
}: ReservationsByDayChartProps) {
  const chartData = (data ?? []).map((item) => ({
    dia: getDayInitial(item.date),
    reservas: item.total,
  }));

  return (
    <section className={CARD_CLASS}>
      <div className="mb-4">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Reservas por día
        </h2>
        <p className="text-xs text-text-secondary">Últimos 7 días</p>
      </div>

      {chartData.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-secondary">
          No hay reservas en los últimos 7 días.
        </p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#3a83bf" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3a83bf" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                axisLine={false}
                dataKey="dia"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip />
              <Area
                dataKey="reservas"
                dot={{
                  r: 3.5,
                  fill: "#3a83bf",
                  stroke: "#ffffff",
                  strokeWidth: 1.5,
                }}
                fill="url(#areaGradient)"
                fillOpacity={1}
                stroke="#3a83bf"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
