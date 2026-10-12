"use client";

import { Pencil, Trash2 } from "lucide-react";

import Badge from "@/components/ui/Badge";

export interface TimeSlotTableRow {
  id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
  active_reservations_count?: number; // TODO-BACKEND
}

interface TimeSlotsTableProps {
  timeSlots: TimeSlotTableRow[];
  onEdit: (slot: TimeSlotTableRow) => void;
  onDelete: (slot: TimeSlotTableRow) => void;
}

const toMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return (Number.isNaN(hours) ? 0 : hours) * 60 + (Number.isNaN(minutes) ? 0 : minutes);
};

const formatDisplayTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  const normalizedHour = Number.isNaN(hours) ? 0 : hours;
  const normalizedMinutes = Number.isNaN(minutes) ? 0 : minutes;

  return `${String(normalizedHour).padStart(2, "0")}:${String(normalizedMinutes).padStart(2, "0")}`;
};

const formatDuration = (startTime: string, endTime: string) => {
  const durationMinutes = Math.max(0, toMinutes(endTime) - toMinutes(startTime));
  const totalHours = Math.floor(durationMinutes / 60);
  const remainingMinutes = durationMinutes % 60;

  if (durationMinutes <= 0) {
    return "0 min";
  }

  if (totalHours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${totalHours} hora${totalHours > 1 ? "s" : ""}`;
  }

  return `${totalHours} hora${totalHours > 1 ? "s" : ""} ${remainingMinutes} min`;
};

export default function TimeSlotsTable({ timeSlots, onEdit, onDelete }: TimeSlotsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101827]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-[#0B0F19] text-left text-[10px] uppercase tracking-[0.2em] text-slate-400">
            <tr>
              <th className="w-[5%] px-4 py-3 font-medium">#</th>
              <th className="w-[20%] px-4 py-3 font-medium">Hora inicio</th>
              <th className="w-[20%] px-4 py-3 font-medium">Hora fin</th>
              <th className="w-[20%] px-4 py-3 font-medium">Duración</th>
              <th className="w-[20%] px-4 py-3 font-medium">Estado</th>
              <th className="w-[15%] px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, index) => (
              <tr key={slot.id} className="border-t border-white/10 text-sm text-slate-200">
                <td className="w-[5%] px-4 py-4 text-slate-300">{index + 1}</td>
                <td className="w-[20%] px-4 py-4">{formatDisplayTime(slot.start_time)}</td>
                <td className="w-[20%] px-4 py-4">{formatDisplayTime(slot.end_time)}</td>
                <td className="w-[20%] px-4 py-4 text-slate-300">{formatDuration(slot.start_time, slot.end_time)}</td>
                <td className="w-[20%] px-4 py-4">
                  <Badge
                    variant={slot.is_active === false ? "neutral" : "success"}
                    size="sm"
                    className={
                      slot.is_active === false
                        ? "bg-slate-800 text-slate-300"
                        : "bg-emerald-500/10 text-emerald-300"
                    }
                  >
                    {slot.is_active === false ? "Inactivo" : "Activo"}
                  </Badge>
                </td>
                <td className="w-[15%] px-4 py-4">
                  <div className="flex items-center gap-4">
                    <button
                      aria-label={`Editar franja ${slot.id}`}
                      className="flex items-center justify-center text-slate-400 transition-colors hover:text-white"
                      onClick={() => onEdit(slot)}
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Eliminar franja ${slot.id}`}
                      className="flex items-center justify-center text-slate-400 transition-colors hover:text-red-400"
                      onClick={() => onDelete(slot)}
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
    </div>
  );
}
