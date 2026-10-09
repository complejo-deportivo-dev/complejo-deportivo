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
