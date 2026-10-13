"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

const DAYS_AHEAD = 15;
const SCROLL_AMOUNT = 200;

interface DateSelectorProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}

export default function DateSelector({
  selectedDate,
  onSelect,
}: DateSelectorProps) {
  const today = new Date();
  const dates = Array.from({ length: DAYS_AHEAD }).map((_, i) =>
    addDays(today, i),
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
  }, []);

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheelHandler = (e: WheelEvent) => {
      // Si hay movimiento horizontal nativo (e.g. trackpad), permitirlo o convertir scroll vertical en horizontal
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY, behavior: "auto" });
      }
    };

    el.addEventListener("wheel", onWheelHandler, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheelHandler);
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollLeft();
        if (selectedDate) {
          const prev = dates.find(
            (d) =>
              isSameDay(d, addDays(selectedDate, -1)) &&
              d >= today,
          );
          if (prev) onSelect(prev);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollRight();
        if (selectedDate) {
          const next = dates.find((d) =>
            isSameDay(d, addDays(selectedDate, 1)),
          );
          if (next) onSelect(next);
        }
      }
    },
    [selectedDate, dates, today, scrollLeft, scrollRight, onSelect],
  );

  useEffect(() => {
    checkScroll();
  }, [checkScroll]);

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg font-medium text-text-primary">
        Elige una fecha
      </h3>
      <p className="flex items-center gap-1.5 text-sm text-text-secondary">
        <Info aria-hidden="true" size={14} className="shrink-0 text-primary" />
        Puedes reservar con hasta {DAYS_AHEAD} días de anticipación
      </p>

      <div className="relative flex items-center gap-2">
        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Días anteriores"
          className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-all ${
            canScrollLeft
              ? "hover:border-primary/50 hover:bg-surface-elevated hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              : "opacity-30 cursor-not-allowed"
          }`}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        {/* Carrusel de fechas */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="listbox"
          aria-label="Selecciona una fecha"
          className="flex min-w-0 flex-1 gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide focus:outline-none"
        >
          {dates.map((date, i) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            return (
              <button
                key={i}
                type="button"
                role="option"
                aria-selected={!!isSelected}
                onClick={() => onSelect(date)}
                className={`flex min-w-20 flex-col items-center justify-center rounded-xl border p-3 transition-colors ${
                  isSelected
                    ? "border-primary bg-primary-soft text-primary shadow-sm"
                    : "border-border bg-surface text-text-secondary hover:border-primary/50 hover:bg-surface-elevated"
                }`}
              >
                <span className="text-xs font-medium uppercase">
                  {isToday ? "Hoy" : format(date, "EEE", { locale: es })}
                </span>
                <span
                  className={`text-xl font-bold ${isSelected ? "text-primary" : "text-text-primary"}`}
                >
                  {format(date, "d")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Flecha derecha */}
        <button
          type="button"
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="Días siguientes"
          className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-all ${
            canScrollRight
              ? "hover:border-primary/50 hover:bg-surface-elevated hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              : "opacity-30 cursor-not-allowed"
          }`}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
