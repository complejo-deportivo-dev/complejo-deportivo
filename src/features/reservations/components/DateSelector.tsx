"use client";

import { useRef, useCallback, useState, useEffect, useMemo } from "react";
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
  const today = useMemo(() => new Date(), []);
  const dates = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }).map((_, i) =>
        addDays(today, i),
      ),
    [today],
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
      <h3 className="font-heading text-lg font-bold text-white">
        Elige una fecha
      </h3>
      <p className="flex items-center gap-1.5 text-xs text-slate-400">
        <Info aria-hidden="true" size={14} className="shrink-0 text-[#38bdf8]" />
        Puedes reservar con hasta {DAYS_AHEAD} días de anticipación
      </p>

      <div className="relative flex items-center gap-2">
        {/* Flecha izquierda */}
        <button
          type="button"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="Días anteriores"
          className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-slate-300 backdrop-blur-md transition-all ${
            canScrollLeft
              ? "hover:border-sky-400/50 hover:bg-slate-800/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
              : "opacity-20 cursor-not-allowed"
          }`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>

        {/* Carrusel de fechas */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="listbox"
          aria-label="Selecciona una fecha"
          className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto px-1 pb-2 scrollbar-hide focus:outline-none"
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
                className={`flex min-w-[72px] flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                  isSelected
                    ? "border-2 border-[#0284c7] bg-[#0c2a47]/90 text-white shadow-lg shadow-[#0284c7]/30"
                    : "border-white/10 bg-[#0c1322]/60 backdrop-blur-md text-slate-400 hover:border-white/20 hover:text-slate-200"
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-[#38bdf8]" : "text-slate-400"}`}>
                  {isToday ? "Hoy" : format(date, "EEE", { locale: es })}
                </span>
                <span
                  className={`mt-0.5 font-heading ${isSelected ? "text-2xl font-black text-white" : "text-lg font-bold text-white"}`}
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
          className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-slate-300 backdrop-blur-md transition-all ${
            canScrollRight
              ? "hover:border-sky-400/50 hover:bg-slate-800/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
              : "opacity-20 cursor-not-allowed"
          }`}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
