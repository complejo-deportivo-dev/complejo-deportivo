import { Info } from "lucide-react";
import type { ServiceSlot } from "@/types/api";

interface TimeSlotPickerProps {
  slots: ServiceSlot[];
  selectedSlots: ServiceSlot[];
  onToggleSlot: (slot: ServiceSlot) => void;
}

export default function TimeSlotPicker({ slots, selectedSlots, onToggleSlot }: TimeSlotPickerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-medium text-text-primary">Elige tu horario</h3>
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Info size={14} />
          <span>Puedes seleccionar varias franjas seguidas</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {slots.map((slot) => {
          const isSelected = selectedSlots.some((s) => s.time_slot_id === slot.time_slot_id);
          const timeLabel = slot.time_start.slice(0, 5); // "06:00:00" -> "06:00"

          return (
            <button
              key={slot.time_slot_id}
              type="button"
              disabled={!slot.available}
              onClick={() => onToggleSlot(slot)}
              className={`rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors ${
                !slot.available
                  ? "cursor-not-allowed border-transparent bg-background text-text-disabled"
                  : isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-text-secondary hover:border-primary/50"
              }`}
            >
              {timeLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
