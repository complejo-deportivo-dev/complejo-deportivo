import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  quantity: number;
  onChange: (quantity: number) => void;
  max: number;
}

export default function QuantitySelector({ quantity, onChange, max }: QuantitySelectorProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-text-primary">Personas</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={quantity <= 1}
          onClick={() => onChange(quantity - 1)}
          className="flex size-8 items-center justify-center rounded-full border border-border text-text-secondary disabled:opacity-50"
        >
          <Minus size={16} />
        </button>
        <span className="w-4 text-center font-medium">{quantity}</span>
        <button
          type="button"
          disabled={quantity >= max}
          onClick={() => onChange(quantity + 1)}
          className="flex size-8 items-center justify-center rounded-full border border-border text-text-secondary disabled:opacity-50"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
