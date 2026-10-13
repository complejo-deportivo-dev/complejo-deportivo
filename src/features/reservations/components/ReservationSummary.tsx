"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Ticket, Calendar, Clock, UserCheck, ShieldCheck, Sparkles } from "lucide-react";
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
  const total = hourPrice * durationHours * quantity;

  const formattedHourPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(hourPrice);

  const formattedTotal = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(total);

  const canSubmit =
    selectedDate &&
    durationHours > 0 &&
    (!needsDocument || documentValue.trim().length > 0);

  const timeRangeLabel =
    selectedSlots.length > 0
      ? `${selectedSlots[0].time_start.slice(0, 5)} - ${selectedSlots[selectedSlots.length - 1].time_end.slice(0, 5)}`
      : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-xl backdrop-blur-sm">
      {/* Cinta superior decorativa con degradado deportivo */}
      <div className="h-2 w-full bg-gradient-to-r from-primary via-emerald-400 to-primary-hover" />

      {/* Cabecera del ticket */}
      <div className="p-6 pb-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Ticket size={13} aria-hidden="true" />
            Ticket de Reserva
          </span>
          <span className="text-[11px] font-mono tracking-widest text-text-muted uppercase">
            Otium Sport
          </span>
        </div>

        <h3 className="mt-4 font-heading text-xl font-bold tracking-tight text-text-primary">
          {serviceName || "Resumen de reserva"}
        </h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          {formattedHourPrice} / hora {quantity > 1 ? `· ${quantity} personas` : ""}
        </p>
      </div>

      {/* Línea divisoria de corte */}
      <div className="px-6">
        <div className="w-full border-t-2 border-dashed border-border" />
      </div>

      {/* Cuerpo del ticket con desglose */}
      <div className="space-y-4 p-6 pt-5">
        <div className="space-y-2.5 text-sm">
          {/* Fecha */}
          <div className="flex items-center justify-between text-text-secondary">
            <span className="flex items-center gap-2">
              <Calendar size={15} className="text-primary" />
              Fecha
            </span>
            <span className="font-medium text-text-primary">
              {selectedDate
                ? format(selectedDate, "EEE, dd MMM yyyy", { locale: es })
                : "Sin seleccionar"}
            </span>
          </div>

          {/* Horario y Duración */}
          <div className="flex items-center justify-between text-text-secondary">
            <span className="flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              Horario
            </span>
            <span className="font-medium text-text-primary">
              {timeRangeLabel ? `${timeRangeLabel} (${durationHours}h)` : "—"}
            </span>
          </div>

          {/* Cantidad de personas si aplica */}
          {quantity > 1 && (
            <div className="flex items-center justify-between text-text-secondary">
              <span className="flex items-center gap-2">
                <UserCheck size={15} className="text-primary" />
                Personas
              </span>
              <span className="font-medium text-text-primary">
                {quantity} personas
              </span>
            </div>
          )}

          {/* Desglose de cálculo */}
          {durationHours > 0 && (
            <div className="mt-2 rounded-lg bg-surface-elevated/70 p-2.5 text-xs font-mono text-text-secondary">
              <div className="flex justify-between">
                <span>{formattedHourPrice} × {durationHours} hr{durationHours > 1 ? "s" : ""} {quantity > 1 ? `× ${quantity}p` : ""}</span>
                <span className="font-semibold text-text-primary">{formattedTotal}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input de documento si se requiere */}
        {needsDocument && (
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-primary">
              <ShieldCheck size={14} className="text-primary" />
              Documento del titular
            </label>
            <Input
              value={documentValue}
              onChange={(e) => onDocumentChange(e.target.value)}
              placeholder="Número de cédula o ID"
              className="font-mono text-sm"
            />
          </div>
        )}
      </div>

      {/* Línea divisoria antes del total */}
      <div className="px-6">
        <div className="w-full border-t-2 border-dashed border-border" />
      </div>

      {/* Pie del ticket: Total y Acción */}
      <div className="p-6 pt-5 bg-surface-elevated/40 space-y-5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-text-secondary font-medium">
              Total a pagar
            </span>
            {durationHours === 0 && (
              <p className="text-[11px] text-text-muted mt-0.5">
                Selecciona al menos 1 hora
              </p>
            )}
          </div>
          <span className="font-heading text-3xl font-extrabold tracking-tight text-primary">
            {formattedTotal}
          </span>
        </div>

        <Button
          className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
          disabled={!canSubmit || isSubmitting}
          onClick={onSubmit}
          loading={isSubmitting}
        >
          {canSubmit ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={18} />
              Continuar al pago
            </span>
          ) : (
            "Completar selección"
          )}
        </Button>

        {/* Código de barras decorativo de ticket */}
        <div className="flex flex-col items-center justify-center gap-1 pt-1 opacity-60">
          <div
            className="h-6 w-48 tracking-widest text-center select-none font-mono text-[10px] leading-tight text-text-muted overflow-hidden flex items-center justify-center gap-[3px]"
            aria-hidden="true"
          >
            {[4, 2, 6, 1, 5, 2, 4, 3, 1, 5, 3, 2, 6, 4, 2, 5, 1, 3, 6, 2, 4, 1, 5, 3].map(
              (h, i) => (
                <span
                  key={i}
                  className="bg-text-secondary rounded-sm"
                  style={{
                    width: h % 2 === 0 ? "2px" : "1.5px",
                    height: `${12 + (h * 2)}px`,
                  }}
                />
              )
            )}
          </div>
          <span className="font-mono text-[10px] text-text-muted tracking-widest">
            OTM-{selectedSlots[0]?.time_slot_id ?? "00"}-{Math.floor(total || 25000)}
          </span>
        </div>
      </div>
    </div>
  );
}
