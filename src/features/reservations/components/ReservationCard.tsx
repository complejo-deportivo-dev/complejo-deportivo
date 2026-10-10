"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Clock3, Users } from "lucide-react";

import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { ReservationWithDetails } from "@/types/api";
import { formatDateShort, timeRangeToLabel } from "@/utils/dates";

const STATUS_PRESENTATION: Record<
  ReservationWithDetails["status"],
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Pendiente", variant: "warning" },
  confirmed: { label: "Confirmada", variant: "success" },
  completed: { label: "Completada", variant: "primary" },
  failed: { label: "Fallida", variant: "error" },
  expired: { label: "Expirada", variant: "neutral" },
};

interface ReservationCardProps {
  reservation: ReservationWithDetails;
  onViewQr: (reservation: ReservationWithDetails, qrIndex: number) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ReservationCard({
  reservation,
  onViewQr,
}: ReservationCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const status = STATUS_PRESENTATION[reservation.status];
  const qrCodes = reservation.status === "confirmed"
    ? reservation.qr_codes ?? []
    : [];

  return (
    <Card as="article" className="space-y-5" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase text-text-secondary">
            Reserva #{reservation.reservation_id}
          </p>
          <h2 className="mt-1 break-words font-heading text-h4 font-semibold text-text-primary">
            {reservation.service.name}
          </h2>
        </div>
        <Badge size="sm" variant={status.variant}>
          {status.label}
        </Badge>
      </div>

      <div className="grid gap-4 text-sm sm:grid-cols-3">
        <div className="flex items-start gap-2.5 text-text-secondary">
          <CalendarDays aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={17} />
          <span>{formatDateShort(reservation.reservation_date)}</span>
        </div>
        <div className="flex items-start gap-2.5 text-text-secondary">
          <Clock3 aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={17} />
          <span>{timeRangeToLabel(reservation.slots)}</span>
        </div>
        <div className="flex items-start gap-2.5 text-text-secondary">
          <Users aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={17} />
          <span>
            {reservation.quantity} {reservation.quantity === 1 ? "persona" : "personas"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-text-secondary">Valor total</p>
          <p className="mt-0.5 font-heading text-lg font-semibold text-text-primary">
            {formatCurrency(reservation.amount)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {qrCodes.map((qr, index) => (
            <Button
              key={qr.qr_id}
              aria-label={
                qrCodes.length > 1
                  ? `Ver QR ${index + 1} de la reserva ${reservation.reservation_id}`
                  : `Ver QR de la reserva ${reservation.reservation_id}`
              }
              onClick={() => onViewQr(reservation, index)}
              size="sm"
              variant="secondary"
            >
              {index === 0 ? "Ver QR" : `Ver QR ${index + 1}`}
            </Button>
          ))}
          <Button
            aria-expanded={detailsOpen}
            onClick={() => setDetailsOpen((open) => !open)}
            size="sm"
            variant="ghost"
          >
            {detailsOpen ? "Ocultar detalle" : "Ver detalle"}
            <ChevronDown
              aria-hidden="true"
              className={`transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              size={16}
            />
          </Button>
        </div>
      </div>

      {detailsOpen && (
        <dl className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-text-secondary">Número de reserva</dt>
            <dd className="mt-1 font-medium">#{reservation.reservation_id}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-secondary">Estado</dt>
            <dd className="mt-1 font-medium">{status.label}</dd>
          </div>
          {reservation.expires_at && reservation.status === "pending" && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-text-secondary">Vence el pago</dt>
              <dd className="mt-1 font-medium">
                {new Intl.DateTimeFormat("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(reservation.expires_at))}
              </dd>
            </div>
          )}
          {reservation.status === "confirmed" && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-text-secondary">Códigos de acceso</dt>
              <dd className="mt-1 font-medium">
                {qrCodes.length > 0
                  ? `${qrCodes.length} ${qrCodes.length === 1 ? "QR disponible" : "QR disponibles"}`
                  : "Los códigos QR aún no están disponibles"}
              </dd>
            </div>
          )}
        </dl>
      )}
    </Card>
  );
}