"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarX2,
  Clock,
  Users,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { formatDateShort } from "@/utils/dates";

export interface UpcomingReservation {
  reservationId: number;
  serviceName: string;
  date: string;
  timeRange: string;
  peopleCount: number;
}

interface UpcomingReservationCardProps {
  reservation: UpcomingReservation | null;
  loading?: boolean;
}

export default function UpcomingReservationCard({
  reservation,
  loading = false,
}: UpcomingReservationCardProps) {
  if (loading) {
    return (
      <Card className="flex h-full flex-col gap-3" padding="lg">
        <Skeleton width="55%" height={24} />
        <Skeleton width="40%" height={16} />
        <Skeleton width="60%" height={16} />
        <Skeleton width="35%" height={16} />
      </Card>
    );
  }

  if (!reservation) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 border-dashed text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <CalendarX2 aria-hidden="true" className="size-6" />
        </span>
        <div>
          <p className="font-medium text-text-primary">
            No tienes reservas próximas
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Reserva tu próxima visita y la encontrarás aquí.
          </p>
        </div>
        <Link
          href="/client/categories"
          className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-base font-medium text-white transition-colors duration-200 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          Reservar ahora
        </Link>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col gap-4" padding="lg">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-h4 font-semibold text-text-primary">
          {reservation.serviceName}
        </h3>
        <Badge size="sm" variant="success">
          Confirmada
        </Badge>
      </div>

      <div className="flex flex-col gap-2 text-sm text-text-secondary">
        <span className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" size={16} className="shrink-0" />
          {formatDateShort(reservation.date)}
        </span>
        <span className="flex items-center gap-2">
          <Clock aria-hidden="true" size={16} className="shrink-0" />
          {reservation.timeRange}
        </span>
        <span className="flex items-center gap-2">
          <Users aria-hidden="true" size={16} className="shrink-0" />
          {reservation.peopleCount}{" "}
          {reservation.peopleCount === 1 ? "persona" : "personas"}
        </span>
      </div>

      <Link
        href="/client/reservations"
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
      >
        Ver QR
        <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </Card>
  );
}