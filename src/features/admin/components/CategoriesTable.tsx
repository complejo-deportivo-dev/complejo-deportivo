import { Pencil, Power, Trash2 } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export interface AdminCategoryRow {
  id: number;
  name: string;
  is_active: boolean;
  serviceCount?: number; // TODO-BACKEND: conteo real del backend.
  services?: { id: number; name: string }[]; // TODO-BACKEND
}

interface CategoriesTableProps {
  categories: AdminCategoryRow[];
  onEdit: (category: AdminCategoryRow) => void;
  onToggle: (category: AdminCategoryRow) => void;
  onDelete: (category: AdminCategoryRow) => void;
}

export default function CategoriesTable({
  categories,
  onEdit,
  onToggle,
  onDelete,
}: CategoriesTableProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border border-white/10 bg-[#101827]" padding="none">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#0F172A] text-left text-[10px] uppercase tracking-[0.2em] text-slate-400">
              <th className="w-16 px-4 py-3 font-medium">#</th>
              <th className="w-[35%] px-4 py-3 font-medium">Nombre</th>
              <th className="w-[25%] px-4 py-3 font-medium">Servicios</th>
              <th className="w-[15%] px-4 py-3 font-medium">Estado</th>
              <th className="w-[20%] px-4 py-3 text-left font-medium">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category, index) => {
              const serviceCount = category.serviceCount ?? category.services?.length ?? 0;

              return (
                <tr key={category.id} className="border-t border-white/10 bg-transparent">
                  <td className="w-16 px-4 py-4 text-sm text-slate-400">{index + 1}</td>
                  <td className="w-[35%] px-4 py-4 text-sm font-semibold text-white">
                    {category.name}
                  </td>
                  <td className="w-[25%] px-4 py-4 text-sm text-slate-300">
                    {serviceCount === 1 ? "1 servicio" : `${serviceCount} servicios`}
                  </td>
                  <td className="w-[15%] px-4 py-4">
                    <Badge variant={category.is_active ? "success" : "neutral"} size="sm">
                      {category.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="w-[20%] px-4 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        aria-label="Editar categoría"
                        className="flex items-center justify-center text-slate-400 transition-colors hover:text-white"
                        onClick={() => onEdit(category)}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        aria-label={category.is_active ? "Desactivar categoría" : "Activar categoría"}
                        className={`flex items-center justify-center transition-colors ${
                          category.is_active
                            ? "text-emerald-500 hover:text-emerald-400"
                            : "text-slate-400 hover:text-emerald-400"
                        }`}
                        onClick={() => onToggle(category)}
                        type="button"
                      >
                        <Power className="h-4 w-4" />
                      </button>

                      <button
                        aria-label="Eliminar categoría"
                        className="flex items-center justify-center text-slate-400 transition-colors hover:text-red-400"
                        onClick={() => onDelete(category)}
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
