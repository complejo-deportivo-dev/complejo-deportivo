import Link from "next/link";

import Badge from "@/components/ui/Badge";
import { CARD_CLASS, RESERVATION_STATUS } from "@/features/admin/constants";
import type { AdminReservation } from "@/features/admin/types";

interface RecentReservationsTableProps {
  reservations: AdminReservation[];
}

export default function RecentReservationsTable({
  reservations,
}: RecentReservationsTableProps) {
  // Mostramos máximo 5 registros como pide la rúbrica
  const displayedReservations = reservations.slice(0, 5);

  return (
    <section className={CARD_CLASS}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Últimas reservas
        </h2>
        <Link
          className="text-sm font-medium text-primary hover:underline"
          href="/admin/reservations"
        >
          Ver todas &rarr;
        </Link>
      </div>

      {displayedReservations.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">
          Todavía no hay reservas.
        </p>
      ) : (
        // overflow-x-auto: en móvil la tabla se desliza de lado en vez de romper el diseño
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-text-secondary">
              <tr className="border-b border-border">
                <th className="py-2.5 pr-4 font-semibold">Cliente</th>
                <th className="py-2.5 pr-4 font-semibold">Servicio</th>
                <th className="py-2.5 pr-4 font-semibold">Fecha y Hora</th>
                <th className="py-2.5 pr-4 font-semibold">Estado</th>
                <th className="py-2.5 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {displayedReservations.map((reservation) => {
                const status = RESERVATION_STATUS[reservation.status];
                return (
                  <tr
                    className="border-b border-border last:border-0"
                    key={reservation.id}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-text-primary">
                        {reservation.clientName}
                      </p>
                      {reservation.clientDocumentLast4 && (
                        <span className="block text-xs text-text-secondary">
                          CC •••• {reservation.clientDocumentLast4}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {reservation.serviceName}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {reservation.date} · {reservation.timeRange}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge size="sm" variant={status?.variant ?? "neutral"}>
                        {status?.label ?? reservation.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Link
                        className="text-xs font-medium text-primary hover:underline"
                        href="/admin/reservations"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
