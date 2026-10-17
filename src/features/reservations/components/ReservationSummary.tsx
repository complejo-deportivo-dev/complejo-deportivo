"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Ticket, Calendar, Clock, UserCheck, ShieldCheck, CreditCard } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1322]/75 shadow-2xl backdrop-blur-2xl">
      {/* Cinta superior decorativa con neón brillante cian/esmeralda */}
      <div className="h-[3px] w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-transparent shadow-xs shadow-cyan-400/40" />

      {/* Cabecera del ticket */}
      <div className="p-6 pb-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
            <Ticket size={13} aria-hidden="true" />
            Ticket de Reserva
          </span>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            Otium Sport
          </span>
        </div>

        <h3 className="mt-4 font-heading text-xl font-bold tracking-tight text-white">
          {serviceName || "Resumen de reserva"}
        </h3>
        <p className="mt-0.5 text-xs text-slate-400">
          {formattedHourPrice} / hora {quantity > 1 ? `· ${quantity} personas` : ""}
        </p>
      </div>

      {/* Línea divisoria de corte sutil */}
      <div className="px-6">
        <div className="w-full border-t border-dashed border-white/10" />
      </div>

      {/* Cuerpo del ticket con desglose */}
      <div className="space-y-4 p-6 pt-5">
        <div className="space-y-2.5 text-sm">
          {/* Fecha */}
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2">
              <Calendar size={15} className="text-[#38bdf8]" />
              Fecha
            </span>
            <span className="font-medium text-white">
              {selectedDate
                ? format(selectedDate, "EEE, dd MMM yyyy", { locale: es })
                : "Sin seleccionar"}
            </span>
          </div>

          {/* Horario y Duración */}
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2">
              <Clock size={15} className="text-[#38bdf8]" />
              Horario
            </span>
            <span className="font-medium text-white">
              {timeRangeLabel ? `${timeRangeLabel} (${durationHours}h)` : "—"}
            </span>
          </div>

          {/* Cantidad de personas si aplica */}
          {quantity > 1 && (
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-2">
                <UserCheck size={15} className="text-[#38bdf8]" />
                Personas
              </span>
              <span className="font-medium text-white">
                {quantity} personas
              </span>
            </div>
          )}

          {/* Desglose de cálculo */}
          {durationHours > 0 && (
            <div className="mt-2 rounded-lg border border-white/5 bg-black/30 p-2.5 text-xs font-mono text-slate-400">
              <div className="flex justify-between">
                <span>{formattedHourPrice} × {durationHours} hr{durationHours > 1 ? "s" : ""} {quantity > 1 ? `× ${quantity}p` : ""}</span>
                <span className="font-semibold text-white">{formattedTotal}</span>
              </div>
            </div>
          )}
        </div>

        {/* Input de documento si se requiere */}
        {needsDocument && (
          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-white">
              <ShieldCheck size={14} className="text-[#38bdf8]" />
              Documento del titular
            </label>
            <Input
              value={documentValue}
              onChange={(e) => onDocumentChange(e.target.value)}
              placeholder="Número de cédula o ID"
              className="font-mono text-sm border-white/10 bg-black/40 text-white placeholder:text-slate-500"
            />
          </div>
        )}
      </div>

      {/* Línea divisoria antes del total */}
      <div className="px-6">
        <div className="w-full border-t border-white/10" />
      </div>

      {/* Pie del ticket: Total y Acción */}
      <div className="space-y-5 p-6 pt-5 bg-black/20">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Total a pagar
            </span>
            {durationHours === 0 && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                Selecciona al menos 1 hora
              </p>
            )}
          </div>
          <span className="font-heading text-3xl font-black tracking-tight text-[#38bdf8]">
            {formattedTotal}
          </span>
        </div>

        {canSubmit ? (
          <Button
            className="w-full h-12 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] text-white shadow-lg shadow-sky-500/30 hover:opacity-95 transition-all cursor-pointer"
            onClick={onSubmit}
            loading={isSubmitting}
          >
            <span className="flex items-center justify-center gap-2">
              <CreditCard size={18} />
              Continuar al pago
            </span>
          </Button>
        ) : (
          <div className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-slate-800/60 text-sm font-medium text-slate-400 select-none">
            Completar selección
          </div>
        )}

        {/* Código de barras decorativo de ticket */}
        <div className="flex flex-col items-center justify-center gap-1 pt-1 opacity-50">
          <div
            className="h-6 w-48 tracking-widest text-center select-none font-mono text-[10px] leading-tight text-slate-400 overflow-hidden flex items-center justify-center gap-[3px]"
            aria-hidden="true"
          >
            {[4, 2, 6, 1, 5, 2, 4, 3, 1, 5, 3, 2, 6, 4, 2, 5, 1, 3, 6, 2, 4, 1, 5, 3].map(
              (h, i) => (
                <span
                  key={i}
                  className="bg-slate-400 rounded-xs"
                  style={{
                    width: h % 2 === 0 ? "2px" : "1.5px",
                    height: `${12 + (h * 2)}px`,
                  }}
                />
              )
            )}
          </div>
          <span className="font-mono text-[10px] text-slate-400 tracking-widest">
            OTM-{selectedSlots[0]?.time_slot_id ?? "00"}-{Math.floor(total || 25000)}
          </span>
        </div>
      </div>
    </div>
  );
}
