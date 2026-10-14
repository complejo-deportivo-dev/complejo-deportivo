"use client";

import { Minus, Plus, Users } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  max: number;
}

export default function QuantitySelector({
  quantity,
  onChange,
  max,
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Etiqueta con icono */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-sky-500/25 bg-sky-500/15 text-[#38bdf8]">
            <Users size={16} aria-hidden="true" />
          </span>
          <span className="text-sm font-bold text-white">
            Personas
          </span>
        </div>
        <p className="pl-10 text-xs text-slate-400">
          Máximo {max} {max === 1 ? "persona" : "personas"}
        </p>
      </div>

      {/* Control interactivo con botones estilizados */}
      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1 shadow-inner">
        <button
          type="button"
          disabled={quantity <= 1}
          onClick={() => onChange(quantity - 1)}
          aria-label="Disminuir personas"
          className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-white/5 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
        >
          <Minus size={14} />
        </button>

        <span className="w-8 text-center font-heading text-base font-bold text-white">
          {quantity}
        </span>

        <button
          type="button"
          disabled={quantity >= max}
          onClick={() => onChange(quantity + 1)}
          aria-label="Aumentar personas"
          className="flex size-8 items-center justify-center rounded-lg border border-sky-400/30 bg-[#0284c7] text-white shadow-md shadow-[#0284c7]/40 transition-all hover:bg-[#0369a1] active:scale-95 disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
