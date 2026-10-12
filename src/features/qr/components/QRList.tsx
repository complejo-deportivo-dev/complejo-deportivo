"use client";

import Link from "next/link";
import { ArrowRight, QrCode } from "lucide-react";
import QRCard from "@/components/shared/QRCard";
import Skeleton from "@/components/ui/Skeleton";

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

const listClasses =
  "grid grid-flow-col auto-cols-max gap-4 overflow-x-auto pb-2 lg:grid-flow-row lg:grid-cols-3 lg:overflow-visible";

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
          {items.map((item) => (
            <QRCard
              key={item.qrId}
              title={item.title}
              reservationCode={`#RSV-${item.reservationId}`}
              qrToken={item.token}
              qrType={item.qrType}
              used={item.used}
              onClick={() => onOpenQR?.(item)}
            />
          ))}
        </div>
      )}
    </section>
  );
}