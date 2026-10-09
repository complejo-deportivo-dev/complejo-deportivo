import { format, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface DateSelectorProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onSelect }: DateSelectorProps) {
  const today = new Date();
  const dates = Array.from({ length: 7 }).map((_, i) => addDays(today, i));

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg font-medium text-text-primary">Elige una fecha</h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {dates.map((date, i) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(date)}
              className={`flex min-w-[80px] flex-col items-center justify-center rounded-xl border p-3 transition-colors ${
                isSelected
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-text-secondary hover:border-primary/50 hover:bg-surface-elevated"
              }`}
            >
              <span className="text-xs font-medium uppercase">
                {format(date, "EEE", { locale: es })}
              </span>
              <span className={`text-xl font-bold ${isSelected ? "text-primary" : "text-text-primary"}`}>
                {format(date, "d")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
