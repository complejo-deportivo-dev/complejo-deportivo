import { Pencil, Power, Trash2 } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export interface AdminEmployeeRow {
  id: number;
  name: string;
  email: string;
  number_document: string;
  is_active: boolean;
  initials?: string; // TODO-BACKEND: el backend puede devolver esto o se calcula en frontend.
  access_logs_count?: number; // TODO-BACKEND: conteo real del backend.
}

interface EmployeesTableProps {
  employees: AdminEmployeeRow[];
  onEdit: (employee: AdminEmployeeRow) => void;
  onToggle: (employee: AdminEmployeeRow) => void;
  onDelete: (employee: AdminEmployeeRow) => void;
}

export default function EmployeesTable({
  employees,
  onEdit,
  onToggle,
  onDelete,
}: EmployeesTableProps) {
  if (employees.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border border-white/10 bg-[#101827]" padding="none">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#0F172A] text-left text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <th className="w-[5%] px-4 py-3 font-medium">#</th>
              <th className="w-[30%] px-4 py-3 font-medium">Nombre</th>
              <th className="w-[25%] px-4 py-3 font-medium">Email</th>
              <th className="w-[20%] px-4 py-3 font-medium">Cédula</th>
              <th className="w-[10%] px-4 py-3 font-medium">Estado</th>
              <th className="w-[10%] px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.id} className="border-t border-white/10 bg-transparent">
                <td className="w-[5%] px-4 py-4 text-sm text-slate-400">{index + 1}</td>

                <td className="w-[30%] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={employee.name}
                      size="sm"
                      className="bg-slate-800 text-slate-200"
                    />
                    <span className="text-sm font-semibold text-white">
                      {employee.name}
                    </span>
                  </div>
                </td>

                <td className="w-[25%] px-4 py-4 text-sm text-slate-300">
                  {employee.email}
                </td>

                <td className="w-[20%] px-4 py-4 text-sm text-slate-300">
                  {employee.number_document}
                </td>

                <td className="w-[10%] px-4 py-4">
                  <Badge
                    size="sm"
                    variant={employee.is_active ? "success" : "neutral"}
                  >
                    {employee.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </td>

                <td className="w-[10%] px-4 py-4">
                  <div className="flex items-center gap-4">
                    <button
                      aria-label="Editar empleado"
                      className="flex items-center justify-center text-slate-400 transition-colors hover:text-white"
                      onClick={() => onEdit(employee)}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      aria-label={employee.is_active ? "Desactivar empleado" : "Activar empleado"}
                      className={`flex items-center justify-center transition-colors ${
                        employee.is_active
                          ? "text-emerald-500 hover:text-emerald-400"
                          : "text-slate-400 hover:text-emerald-400"
                      }`}
                      onClick={() => onToggle(employee)}
                      type="button"
                    >
                      <Power className="h-4 w-4" />
                    </button>

                    <button
                      aria-label="Eliminar empleado"
                      className="flex items-center justify-center text-slate-400 transition-colors hover:text-red-400"
                      onClick={() => onDelete(employee)}
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
