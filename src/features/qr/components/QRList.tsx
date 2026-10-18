"use client";

import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  Dumbbell,
  QrCode,
  Trophy,
  Waves,
} from "lucide-react";
import QRCard from "@/components/shared/QRCard";
import Skeleton from "@/components/ui/Skeleton";

function getServiceTheme(serviceName: string) {
  const name = serviceName.toLowerCase();

  if (name.includes("cancha")) {
    return {
      icon: Trophy,
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:!border-emerald-500/30",
      glow: "hover:!shadow-emerald-500/10",
    };
  }

  if (name.includes("piscina")) {
    return {
      icon: Waves,
      text: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "hover:!border-sky-500/30",
      glow: "hover:!shadow-sky-500/10",
    };
  }

  if (name.includes("gym") || name.includes("gimnasio")) {
    return {
      icon: Dumbbell,
      text: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "hover:!border-orange-500/30",
      glow: "hover:!shadow-orange-500/10",
    };
  }

  if (
    name.includes("humed") ||
    name.includes("húmed") ||
    name.includes("sauna") ||
    name.includes("turco")
  ) {
    return {
      icon: Droplets,
      text: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "hover:!border-cyan-500/30",
      glow: "hover:!shadow-cyan-500/10",
    };
  }

  return {
    icon: QrCode,
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "hover:!border-white/20",
    glow: "hover:!shadow-white/5",
  };
}

export interface QRItemData {
  qrId: number;
  reservationId: number;
  token: string;
  used: boolean;
  title: string;
  serviceName: string;
  qrType: "group" | "individual";
  date: string;
  timeRange: string;
  peopleCount: number;
}

interface QRListProps {
  items: QRItemData[];
  loading?: boolean;
  onOpenQR?: (item: QRItemData) => void;
}

const listClasses = "flex flex-wrap gap-4 pb-2";

export default function QRList({ items, loading = false, onOpenQR }: QRListProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h3 font-semibold text-text-primary">
          Mis QRs activos
        </h2>
        <Link
          href="/client/reservations"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Ver todos
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>

      {loading ? (
        <div className={listClasses}>
          {[0, 1, 2].map((index) => (
            <Skeleton
              key={index}
              width={200}
              height={260}
              className="rounded-xl"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <QrCode aria-hidden="true" className="size-6" />
          </span>
          <p className="font-medium text-text-primary">
            Aún no tienes QRs activos
          </p>
          <p className="text-sm text-text-secondary">
            Cuando confirmes una reserva, tu código aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className={listClasses}>
          {items.map((item) => {
            const theme = getServiceTheme(item.title || item.serviceName || "");

            return (
              <QRCard
                key={item.qrId}
                title={item.title}
                reservationCode={`#RSV-${item.reservationId}`}
                qrToken={item.token}
                qrType={item.qrType}
                used={item.used}
                onClick={() => onOpenQR?.(item)}
                serviceTheme={theme}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}