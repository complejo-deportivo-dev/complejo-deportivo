import { Pencil, Power, Trash2 } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";

export interface AdminCategoryRow {
  id: number;
  name: string;
  is_active: boolean;
  services_count?: number;
  services?: { id: number; name: string }[];
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
    <Card
      className="overflow-hidden !rounded-3xl !border-white/10 !bg-white/[0.03] backdrop-blur-xl !shadow-lg"
      padding="none"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="bg-black/20 text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-white/10">
              <th className="w-16 px-6 py-4 font-semibold">#</th>
              <th className="w-[35%] px-6 py-4 font-semibold">Nombre</th>
              <th className="w-[25%] px-6 py-4 font-semibold">Servicios</th>
              <th className="w-[15%] px-6 py-4 font-semibold">Estado</th>
              <th className="w-[20%] px-6 py-4 font-semibold text-left">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {categories.map((category, index) => {
              const services_count =
                category.services_count ?? category.services?.length ?? 0;

              return (
                <tr
                  key={category.id}
                  className="group transition-colors hover:bg-white/[0.02]"
                >
                  <td className="w-16 px-6 py-4 text-sm text-slate-500">
                    {index + 1}
                  </td>
                  <td className="w-[35%] px-6 py-4 text-sm font-semibold text-white">
                    {category.name}
                  </td>
                  <td className="w-[25%] px-6 py-4 text-sm text-slate-300">
                    {services_count === 1
                      ? "1 servicio"
                      : `${services_count} servicios`}
                  </td>
                  <td className="w-[15%] px-6 py-4">
                    <Badge
                      variant={category.is_active ? "success" : "neutral"}
                      size="sm"
                    >
                      {category.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="w-[20%] px-6 py-4">
                    <div className="flex items-center gap-4">
                      <button
                        aria-label="Editar categoría"
                        className="flex items-center justify-center text-slate-400 transition-colors hover:text-sky-400"
                        onClick={() => onEdit(category)}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        aria-label={
                          category.is_active
                            ? "Desactivar categoría"
                            : "Activar categoría"
                        }
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
                        className="flex items-center justify-center text-slate-400 transition-colors hover:text-rose-500"
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
