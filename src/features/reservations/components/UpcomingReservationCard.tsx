"use client";

import Link from "next/link";
import {
  CalendarDays,
  CalendarX2,
  Clock,
  QrCode,
  Users,
} from "lucide-react";
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
  onOpenQR?: () => void;
}

export default function UpcomingReservationCard({
  reservation,
  loading = false,
  onOpenQR,
}: UpcomingReservationCardProps) {
  if (loading) {
    return (
      <div className="flex h-full flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
        <Skeleton width="55%" height={24} />
        <Skeleton width="40%" height={16} />
        <Skeleton width="60%" height={16} />
        <Skeleton width="35%" height={16} />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-[#0c1322]/50 p-6 text-center backdrop-blur-xl">
        <span className="flex size-12 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/10 text-[#38bdf8]">
          <CalendarX2 aria-hidden="true" className="size-6" />
        </span>
        <div>
          <p className="font-heading text-base font-bold text-white">
            Sin entrenamientos agendados
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Reserva una cancha, piscina o gimnasio y asegura tu cupo.
          </p>
        </div>
        <Link
          href="/client/categories"
          className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10"
        >
          Explorar y reservar
        </Link>
      </div>
    );
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-black/50">
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-xl font-bold tracking-tight text-white">
            {reservation.serviceName}
          </h3>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Confirmada
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-2.5 text-sm text-slate-400">
          <span className="flex items-center gap-2.5 text-slate-300">
            <CalendarDays aria-hidden="true" size={16} className="text-[#38bdf8]" />
            {formatDateShort(reservation.date)}
          </span>
          <span className="flex items-center gap-2.5 text-white font-semibold">
            <Clock aria-hidden="true" size={16} className="text-[#38bdf8]" />
            {reservation.timeRange}
          </span>
          <span className="flex items-center gap-2.5 text-slate-400">
            <Users aria-hidden="true" size={16} className="text-[#38bdf8]" />
            {reservation.peopleCount}{" "}
            {reservation.peopleCount === 1 ? "persona" : "personas"}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        {onOpenQR ? (
          <button
            type="button"
            onClick={onOpenQR}
            className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10"
          >
            <QrCode size={16} />
            Mostrar QR de entrada
          </button>
        ) : (
          <Link
            href="/client/reservations"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/10"
          >
            <QrCode size={16} />
            Ver pase de entrada
          </Link>
        )}
      </div>
    </div>
  );
}