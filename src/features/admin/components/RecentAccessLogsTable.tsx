import Link from "next/link";

import Badge from "@/components/ui/Badge";
import { CARD_CLASS } from "@/features/admin/constants";
import type { AdminAccessLog } from "@/features/admin/types";

interface RecentAccessLogsTableProps {
  accessLogs: AdminAccessLog[];
}

// Extrae solo la hora en formato HH:mm sin fecha
function formatTimeOnly(timeStr: string): string {
  if (!timeStr) return "—";
  if (timeStr.includes("T")) {
    const timePart = timeStr.split("T")[1];
    return timePart ? timePart.slice(0, 5) : timeStr;
  }
  if (timeStr.includes(" ")) {
    const parts = timeStr.split(" ");
    return parts[1] ? parts[1].slice(0, 5) : timeStr;
  }
  return timeStr.slice(0, 5);
}

export default function RecentAccessLogsTable({
  accessLogs,
}: RecentAccessLogsTableProps) {
  // Mostramos máximo 5 registros como pide la rúbrica
  const displayedLogs = accessLogs.slice(0, 5);

  return (
    <section className={CARD_CLASS}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Últimos accesos validados
        </h2>
        <Link
          className="text-sm font-medium text-primary hover:underline"
          href="/admin/access-logs"
        >
          Ver todos &rarr;
        </Link>
      </div>

      {displayedLogs.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-secondary">
          Todavía no hay accesos registrados.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-text-secondary">
              <tr className="border-b border-border">
                <th className="py-2.5 pr-4 font-semibold">Cliente</th>
                <th className="py-2.5 pr-4 font-semibold">Servicio</th>
                <th className="py-2.5 pr-4 font-semibold">Hora</th>
                <th className="py-2.5 pr-4 font-semibold">Resultado</th>
                <th className="py-2.5 font-semibold">Empleado</th>
              </tr>
            </thead>
            <tbody>
              {displayedLogs.map((log) => (
                <tr
                  className="border-b border-border last:border-0"
                  key={log.id}
                >
                  <td className="py-3 pr-4 font-medium text-text-primary">
                    {log.personName}
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {log.serviceName}
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {formatTimeOnly(log.accessedAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge
                      size="sm"
                      variant={log.result === "granted" ? "success" : "error"}
                    >
                      {log.result === "granted"
                        ? "Acceso concedido"
                        : "Acceso denegado"}
                    </Badge>
                  </td>
                  <td className="py-3 text-text-secondary">
                    {log.employeeName || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
