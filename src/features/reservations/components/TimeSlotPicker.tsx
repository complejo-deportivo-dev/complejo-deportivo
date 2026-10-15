import { Info } from "lucide-react";
import type { ServiceSlot } from "@/types/api";

interface TimeSlotPickerProps {
  slots: ServiceSlot[];
  selectedSlots: ServiceSlot[];
  onToggleSlot: (slot: ServiceSlot) => void;
  canSelectSlot: (slot: ServiceSlot) => boolean;
}

export default function TimeSlotPicker({
  slots,
  selectedSlots,
  onToggleSlot,
  canSelectSlot,
}: TimeSlotPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-heading text-lg font-bold text-white">
          Elige tu horario
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Info size={14} className="text-[#38bdf8]" />
          <span>Selecciona franjas consecutivas de 1 hora</span>
        </div>
      </div>

      {/* Indicador de bloque continuo seleccionado */}
      {selectedSlots.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-sky-400/25 bg-sky-500/10 px-3.5 py-2 text-xs backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex size-2 rounded-full bg-[#38bdf8] animate-pulse" />
            <span>
              Bloque:{" "}
              <strong className="text-white font-semibold">
                {selectedSlots[0].time_start.slice(0, 5)} - {selectedSlots[selectedSlots.length - 1].time_end.slice(0, 5)}
              </strong>
            </span>
          </div>
          <span className="rounded-md border border-sky-400/30 bg-sky-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-[#38bdf8]">
            {selectedSlots.length} hr{selectedSlots.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
        {slots.map((slot) => {
          const isSelected = selectedSlots.some(
            (s) => s.time_slot_id === slot.time_slot_id,
          );
          const isDisabled =
            !slot.available || (!isSelected && !canSelectSlot(slot));
          const startLabel = slot.time_start.slice(0, 5);
          const endLabel = slot.time_end.slice(0, 5);
          const timeLabel = `${startLabel} - ${endLabel}`;
          const isUserReservation = slot.is_user_reservation;

          return (
            <button
              key={slot.time_slot_id}
              type="button"
              disabled={isDisabled}
              onClick={() => onToggleSlot(slot)}
              aria-label={`Franja ${timeLabel}${isDisabled && slot.available ? ", no consecutiva con el rango seleccionado" : ""}`}
              className={`flex flex-col items-center justify-center rounded-xl border py-2 px-2 text-center transition-all ${
                isDisabled
                  ? !slot.available
                    ? "cursor-not-allowed border-rose-500/30 bg-rose-900/20 text-rose-300"
                    : "cursor-not-allowed border-transparent bg-slate-900/30 text-slate-600 opacity-25"
                  : isSelected
                    ? "border-sky-400 bg-[#0284c7] text-white shadow-md shadow-[#0284c7]/40 font-semibold"
                    : "border-white/10 bg-[#0c1322]/60 text-slate-300 backdrop-blur-md hover:border-sky-400/40 hover:text-white"
              }`}
            >
              <span className="text-xs font-semibold">{timeLabel}</span>
              {slot.remaining_capacity !== undefined && slot.available && (
                <span
                  className={`mt-0.5 text-[10px] leading-tight font-medium ${
                    isSelected
                      ? "text-sky-100"
                      : slot.remaining_capacity <= 5
                        ? "text-amber-300 font-semibold"
                        : "text-slate-400"
                  }`}
                >
                  {slot.remaining_capacity <= 5
                    ? `${slot.remaining_capacity} cupos`
                    : `${slot.remaining_capacity} disp.`}
                </span>
              )}
              {!slot.available && (
                <span className="mt-0.5 text-[10px] leading-tight font-medium text-rose-400/80">
                  {isUserReservation ? "Apartada" : "Ocupada"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
