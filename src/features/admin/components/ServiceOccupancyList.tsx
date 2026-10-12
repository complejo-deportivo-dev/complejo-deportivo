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
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Ocupación por servicio
        </h2>
        <p className="text-xs text-text-secondary">Esta semana</p>
      </div>

      {serviceList.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">
          No hay servicios para mostrar.
        </p>
      ) : (
        <ul className="space-y-4">
          {serviceList.map((service) => (
            <li key={service.id}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-text-primary">{service.name}</span>
                <span className="text-text-secondary">{service.occupancy}%</span>
              </div>
              {/* Barra de progreso: el ancho de la barra interna es el porcentaje */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-primary-soft">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(service.occupancy, 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
