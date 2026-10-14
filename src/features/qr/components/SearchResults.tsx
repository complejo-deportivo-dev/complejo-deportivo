"use client";

import { ArrowRight, Clock } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface ManualReservation {
  reservation_id: number;
  holder_name: string;
  number_document: string | null;
  service_name: string;
  reservation_date: string;
  time_start: string;
  time_end: string;
  status: string;
}

interface SearchResultsProps {
  reservations: ManualReservation[];
  onSelect: (reservation: ManualReservation) => void;
}

export default function SearchResults({
  reservations,
  onSelect,
}: SearchResultsProps) {
  return (
    <ul aria-label="Reservas encontradas" className="mt-4 space-y-3">
      {reservations.map((reservation) => (
        <li key={reservation.reservation_id}>
          <Card as="article" padding="sm">
            <div className="flex items-center gap-3">
              <Avatar name={reservation.holder_name} size="md" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-sm font-semibold text-text-primary">
                  {reservation.holder_name}
                </h2>
                <p className="truncate text-sm text-text-secondary">
                  {reservation.service_name}
                </p>
              </div>
              <Badge
                size="sm"
                variant={
                  reservation.status === "confirmed" ? "success" : "warning"
                }
              >
                {reservation.status === "confirmed"
                  ? "Confirmada"
                  : "Completada"}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
              <Clock aria-hidden="true" className="size-4 shrink-0" />
              <span>
                {reservation.reservation_date} · {reservation.time_start} -{" "}
                {reservation.time_end}
              </span>
            </div>
            <Button
              aria-label={`Ver reserva de ${reservation.holder_name}`}
              className="mt-3 min-h-11 w-full justify-between"
              onClick={() => onSelect(reservation)}
              variant="ghost"
            >
              Ver detalle
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
          </Card>
        </li>
      ))}
    </ul>
  );
}
