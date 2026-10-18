import { CARD_CLASS } from "@/features/admin/constants";
import type { AdminMetrics } from "@/features/admin/types";

interface ServiceOccupancyListProps {
  services?: AdminMetrics["service_occupancy"];
}

export default function ServiceOccupancyList({
  services,
}: ServiceOccupancyListProps) {
  const serviceList = services ?? [];

  return (
    <section className={CARD_CLASS}>
      <div className="mb-4">
        <h2 className="font-heading text-lg font-bold text-white">
          Ocupación por servicio
        </h2>
        <p className="text-xs text-slate-400">Promedio de esta semana</p>
      </div>

      {serviceList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 py-6 text-center">
          <p className="text-sm text-slate-400">
            No hay servicios para mostrar.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {serviceList.map((service) => {
            const occupancyValue = Math.min(
              Math.max(service.occupancy, 0),
              100,
            );

            let barColor = "bg-sky-500";
            let glowColor = "shadow-[0_0_10px_rgba(14,165,233,0.5)]";
            let textColor = "text-sky-400";

            if (occupancyValue >= 80) {
              barColor = "bg-rose-500";
              glowColor = "shadow-[0_0_10px_rgba(244,63,94,0.5)]";
              textColor = "text-rose-400";
            } else if (occupancyValue >= 50) {
              barColor = "bg-amber-400";
              glowColor = "shadow-[0_0_10px_rgba(251,191,36,0.5)]";
              textColor = "text-amber-400";
            }

            return (
              <li
                key={service.id}
                className="group flex items-center gap-4 rounded-lg p-1 transition-colors hover:bg-white/[0.02]"
              >
                <span
                  className="w-32 shrink-0 truncate text-xs font-medium text-slate-300 group-hover:text-white transition-colors"
                  title={service.name}
                >
                  {service.name}
                </span>

                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-black/50 border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor} ${glowColor}`}
                    style={{ width: `${occupancyValue}%` }}
                  />
                </div>

                <span
                  className={`w-10 shrink-0 text-right text-xs font-bold ${textColor}`}
                >
                  {Math.floor(occupancyValue)}%
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
