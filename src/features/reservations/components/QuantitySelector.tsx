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
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Users size={16} aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-text-primary">
            Personas
          </span>
        </div>
        <p className="text-xs text-text-secondary pl-9">
          Máximo {max} {max === 1 ? "persona" : "personas"}
        </p>
      </div>

      {/* Control interactivo con botones estilizados */}
      <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-surface-elevated/60 p-1 shadow-sm">
        <button
          type="button"
          disabled={quantity <= 1}
          onClick={() => onChange(quantity - 1)}
          aria-label="Disminuir personas"
          className="flex size-9 items-center justify-center rounded-lg border border-transparent bg-surface text-text-secondary transition-all hover:border-border hover:text-text-primary hover:shadow-xs active:scale-95 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
        >
          <Minus size={15} />
        </button>

        <span className="w-10 text-center font-heading text-base font-bold text-text-primary">
          {quantity}
        </span>

        <button
          type="button"
          disabled={quantity >= max}
          onClick={() => onChange(quantity + 1)}
          aria-label="Aumentar personas"
          className="flex size-9 items-center justify-center rounded-lg border border-transparent bg-primary text-white shadow-xs transition-all hover:bg-primary-hover active:scale-95 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
