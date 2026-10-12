import Link from "next/link";

import Badge from "@/components/ui/Badge";
import { CARD_CLASS, RESERVATION_STATUS } from "@/features/admin/constants";
import type { AdminReservation } from "@/features/admin/types";

interface RecentReservationsTableProps {
  reservations: AdminReservation[];
}

// Nombres cortos en español para mostrar la fecha sin depender de la zona horaria
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

// Formatea "YYYY-MM-DD" como "Vie 15 Oct".
// No usamos new Date("YYYY-MM-DD") porque eso interpreta la fecha en UTC y puede correr un día.
function formatReservationDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return `${DAY_NAMES[date.getDay()]} ${day} ${MONTH_NAMES[date.getMonth()]}`;
}

// Recorta "18:00:00" a "18:00"
function formatTime(time: string): string {
  return (time ?? "").slice(0, 5);
}

// Rango desde el inicio de la primera franja hasta el fin de la última
function formatTimeRange(slots: AdminReservation["slots"]): string {
  if (!slots || slots.length === 0) return "—";
  const first = slots[0];
  const last = slots[slots.length - 1];
  return `${formatTime(first.time_start)} - ${formatTime(last.time_end)}`;
}

export default function RecentReservationsTable({
  reservations,
}: RecentReservationsTableProps) {
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

      {reservations.length === 0 ? (
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
              {reservations.map((reservation) => {
                const status = RESERVATION_STATUS[reservation.status];
                return (
                  <tr
                    className="border-b border-border last:border-0"
                    key={reservation.reservation_id}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-text-primary">
                        {reservation.user.name}
                      </p>
                      {reservation.user.document_last4 && (
                        <span className="block text-xs text-text-secondary">
                          CC •••• {reservation.user.document_last4}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {reservation.service.name}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {formatReservationDate(reservation.reservation_date)} ·{" "}
                      {formatTimeRange(reservation.slots)}
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
