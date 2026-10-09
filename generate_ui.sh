#!/bin/bash

mkdir -p src/features/reservations/components
mkdir -p src/app/\(client\)/services/\[id\]

# ServiceDetail
cat << 'INNER_EOF' > src/features/reservations/components/ServiceDetail.tsx
import { Users, UserPlus } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface ServiceDetailProps {
  name: string;
  qrType: "group" | "individual";
  capacity: number;
  maxCompanions: number;
  hourPrice: number;
}

export default function ServiceDetail({
  name,
  qrType,
  capacity,
  maxCompanions,
  hourPrice,
}: ServiceDetailProps) {
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(hourPrice);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-h2 font-bold text-text-primary">{name}</h1>
        {qrType === "group" ? (
          <Badge variant="primary">Grupal</Badge>
        ) : (
          <Badge variant="warning">Individual</Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <Users size={18} />
          <span>Hasta {capacity} personas</span>
        </div>
        <div className="flex items-center gap-2">
          <UserPlus size={18} />
          <span>Máximo {maxCompanions} acompañantes</span>
        </div>
      </div>

      <div className="pt-2">
        <p className="text-sm text-text-secondary">Precio por hora</p>
        <p className="font-heading text-2xl font-bold text-primary">{formattedPrice}</p>
      </div>
    </div>
  );
}
INNER_EOF

# DateSelector
cat << 'INNER_EOF' > src/features/reservations/components/DateSelector.tsx
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
INNER_EOF

# TimeSlotPicker
cat << 'INNER_EOF' > src/features/reservations/components/TimeSlotPicker.tsx
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
INNER_EOF

# QuantitySelector
cat << 'INNER_EOF' > src/features/reservations/components/QuantitySelector.tsx
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
INNER_EOF

# ReservationSummary
cat << 'INNER_EOF' > src/features/reservations/components/ReservationSummary.tsx
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { ServiceSlot } from "@/types/api";

interface ReservationSummaryProps {
  serviceName: string;
  hourPrice: number;
  selectedDate: Date | null;
  selectedSlots: ServiceSlot[];
  quantity: number;
  needsDocument: boolean;
  documentValue: string;
  onDocumentChange: (val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReservationSummary({
  serviceName,
  hourPrice,
  selectedDate,
  selectedSlots,
  quantity,
  needsDocument,
  documentValue,
  onDocumentChange,
  onSubmit,
  isSubmitting,
}: ReservationSummaryProps) {
  const durationHours = selectedSlots.length;
  // Cost is hourPrice * durationHours * quantity (or quantity depends on whether it's individual/group but normally it's hourPrice * durationHours. If individual, maybe multiplied by quantity. Let's assume hourPrice is per hour for the service)
  const total = hourPrice * durationHours * quantity; 

  const formattedTotal = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(total);

  const canSubmit = selectedDate && durationHours > 0 && (!needsDocument || documentValue.trim().length > 0);

  return (
    <Card variant="default" padding="lg" className="sticky top-28 space-y-6">
      <h3 className="font-heading text-xl font-bold text-text-primary">Resumen de reserva</h3>
      
      <div className="space-y-3 border-b border-border pb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Servicio</span>
          <span className="font-medium text-text-primary">{serviceName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Fecha</span>
          <span className="font-medium text-text-primary">
            {selectedDate ? format(selectedDate, "dd MMM yyyy", { locale: es }) : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">Duración</span>
          <span className="font-medium text-text-primary">
            {durationHours > 0 ? `${durationHours} hora${durationHours > 1 ? "s" : ""}` : "—"}
          </span>
        </div>
        {selectedSlots.length > 0 && (
          <div className="flex justify-between">
            <span className="text-text-secondary">Horario</span>
            <span className="font-medium text-text-primary">
              {selectedSlots[0].time_start.slice(0,5)} - {selectedSlots[selectedSlots.length - 1].time_end.slice(0,5)}
            </span>
          </div>
        )}
      </div>

      {needsDocument && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Cédula del titular</label>
          <Input
            value={documentValue}
            onChange={(e) => onDocumentChange(e.target.value)}
            placeholder="Ej. 123456789"
          />
        </div>
      )}

      <div className="flex items-end justify-between pt-2">
        <span className="font-medium text-text-secondary">Total</span>
        <span className="font-heading text-2xl font-bold text-primary">{formattedTotal}</span>
      </div>

      <Button
        className="w-full"
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
        isLoading={isSubmitting}
      >
        Continuar al pago
      </Button>
    </Card>
  );
}
INNER_EOF

