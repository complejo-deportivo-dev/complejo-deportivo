import { Pencil, Power, Trash2 } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export interface AdminServiceRow {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  capacity: number;
  max_companions?: number; // TODO-BACKEND: campo real del backend.
  qr_type: "group" | "individual";
  price_per_hour: number;
  is_active: boolean;
  active_reservations_count?: number; // TODO-BACKEND: conteo real del backend.
  past_reservations_count?: number; // TODO-BACKEND: historial de reservas pasadas.
}

interface ServicesTableProps {
  services: AdminServiceRow[];
  onEdit: (service: AdminServiceRow) => void;
  onToggle: (service: AdminServiceRow) => void;
  onDelete: (service: AdminServiceRow) => void;
}

export default function ServicesTable({
  services,
  onEdit,
  onToggle,
  onDelete,
}: ServicesTableProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border border-white/10 bg-[#101827]" padding="none">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#0F172A] text-left text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <th className="w-16 px-4 py-3 font-medium">#</th>
              <th className="w-[22%] px-4 py-3 font-medium">Nombre</th>
              <th className="w-[16%] px-4 py-3 font-medium">Categoría</th>
              <th className="w-[12%] px-4 py-3 font-medium">Capacidad</th>
              <th className="w-[15%] px-4 py-3 font-medium">Precio/hora</th>
              <th className="w-[12%] px-4 py-3 font-medium">Tipo QR</th>
              <th className="w-[12%] px-4 py-3 font-medium">Estado</th>
              <th className="w-[11%] px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service, index) => {
              const price = new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
                maximumFractionDigits: 0,
              }).format(service.price_per_hour);

              return (
                <tr key={service.id} className="border-t border-white/10 bg-transparent">
                  <td className="w-16 px-4 py-4 text-sm text-slate-400">{index + 1}</td>
                  <td className="w-[22%] px-4 py-4 text-sm font-semibold text-white">
                    {service.name}
                  </td>
                  <td className="w-[16%] px-4 py-4 text-sm text-slate-300">
                    {service.category_name}
                  </td>
                  <td className="w-[12%] px-4 py-4 text-sm text-slate-300">
                    {service.capacity}
                  </td>
                  <td className="w-[15%] px-4 py-4 text-sm text-slate-300">
                    {`${price} / hr`}
                  </td>
                  <td className="w-[12%] px-4 py-4 text-sm">
                    <Badge
                      size="sm"
                      variant={service.qr_type === "group" ? "primary" : "secondary"}
                    >
                      {service.qr_type === "group" ? "Grupal" : "Individual"}
                    </Badge>
                  </td>
                  <td className="w-[12%] px-4 py-4">
                    <Badge size="sm" variant={service.is_active ? "success" : "neutral"}>
                      {service.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="w-[11%] px-4 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        aria-label="Editar servicio"
                        className="flex items-center justify-center text-slate-400 transition-colors hover:text-white"
                        onClick={() => onEdit(service)}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        aria-label={service.is_active ? "Desactivar servicio" : "Activar servicio"}
                        className={`flex items-center justify-center transition-colors ${
                          service.is_active
                            ? "text-emerald-500 hover:text-emerald-400"
                            : "text-slate-400 hover:text-emerald-400"
                        }`}
                        onClick={() => onToggle(service)}
                        type="button"
                      >
                        <Power className="h-4 w-4" />
                      </button>

                      <button
                        aria-label="Eliminar servicio"
                        className="flex items-center justify-center text-slate-400 transition-colors hover:text-red-400"
                        onClick={() => onDelete(service)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
