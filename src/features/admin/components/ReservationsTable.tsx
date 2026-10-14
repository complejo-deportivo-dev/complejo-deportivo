import Badge from "@/components/ui/Badge";
import { CARD_CLASS, RESERVATION_STATUS } from "@/features/admin/constants";
import type { AdminReservation } from "@/features/admin/types";

export type AdminReservationRow = Omit<
  AdminReservation,
  "reservation_date" | "service" | "slots" | "user"
> & {
  amount?: number | null;
  reservation_date?: string | null;
  service?: AdminReservation["service"] | null;
  slots?: {
    time_start?: string | null;
    time_end?: string | null;
  }[];
  user?: AdminReservation["user"] | null;
};

interface ReservationsTableProps {
  reservations: AdminReservationRow[];
}

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

function formatReservationDate(dateStr?: string | null): string {
  if (!dateStr) return "—";

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;

  const date = new Date(year, month - 1, day);
  return `${DAY_NAMES[date.getDay()]} ${day} ${MONTH_NAMES[date.getMonth()]}`;
}

function formatTime(time?: string | null): string {
  return time ? time.slice(0, 5) : "—";
}

function formatTimeRange(slots: AdminReservationRow["slots"]): string {
  if (!slots?.length) return "—";

  return `${formatTime(slots[0].time_start)} - ${formatTime(
    slots[slots.length - 1].time_end
  )}`;
}

export default function ReservationsTable({
  reservations,
}: ReservationsTableProps) {
  const showAmount = reservations.some(
    (reservation) => reservation.amount !== undefined && reservation.amount !== null
  );
  const money = new Intl.NumberFormat("es-CO");

  return (
    <section className={CARD_CLASS}>
      {reservations.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">
          No hay reservas
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-text-secondary">
              <tr className="border-b border-border">
                <th className="py-2.5 pr-4 font-semibold">ID</th>
                <th className="py-2.5 pr-4 font-semibold">Fecha</th>
                <th className="py-2.5 pr-4 font-semibold">Cliente</th>
                <th className="py-2.5 pr-4 font-semibold">Servicio</th>
                <th className="py-2.5 pr-4 font-semibold">Horario</th>
                <th className="py-2.5 pr-4 font-semibold">Estado</th>
                {showAmount && (
                  <th className="py-2.5 font-semibold">Monto</th>
                )}
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
                    <td className="py-3 pr-4 font-medium text-text-primary">
                      {reservation.reservation_id}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {formatReservationDate(reservation.reservation_date)}
                    </td>
                    <td className="py-3 pr-4 text-text-primary">
                      {reservation.user?.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {reservation.service?.name ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-text-secondary">
                      {formatTimeRange(reservation.slots)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge size="sm" variant={status?.variant ?? "neutral"}>
                        {status?.label ?? reservation.status}
                      </Badge>
                    </td>
                    {showAmount && (
                      <td className="py-3 text-text-secondary">
                        {reservation.amount === undefined ||
                        reservation.amount === null
                          ? "—"
                          : `$${money.format(reservation.amount)}`}
                      </td>
                    )}
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
