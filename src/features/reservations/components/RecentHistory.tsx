"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarX2, CreditCard } from "lucide-react";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { formatDateShort } from "@/utils/dates";
import type { ReservationStatus } from "@/types";

export interface HistoryItemData {
  reservationId: number;
  serviceName: string;
  date: string;
  timeRange: string;
  status: ReservationStatus;
  peopleCount: number;
  expiresAt?: string | null;
}

interface RecentHistoryProps {
  items: HistoryItemData[];
  loading?: boolean;
}

const STATUS_BADGE: Record<
  ReservationStatus,
  { variant: BadgeVariant; label: string }
> = {
  pending: { variant: "warning", label: "Pendiente" },
  confirmed: { variant: "success", label: "Confirmada" },
  failed: { variant: "error", label: "Fallida" },
  expired: { variant: "error", label: "Expirada" },
  completed: { variant: "primary", label: "Completada" },
};

export default function RecentHistory({ items, loading = false }: RecentHistoryProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const hasPending = items.some(
      (item) => item.status === "pending" && Boolean(item.expiresAt),
    );
    if (!hasPending) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [items]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-h3 font-semibold text-text-primary">
          Historial reciente
        </h2>
        <Link
          href="/client/reservations"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Ver todas
          <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </div>

      {loading ? (
        <Card className="flex flex-col gap-3" padding="lg">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} height={20} />
          ))}
        </Card>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <CalendarX2 aria-hidden="true" className="size-6" />
          </span>
          <p className="font-medium text-text-primary">Aún no tienes historial</p>
          <p className="text-sm text-text-secondary">
            Cuando hagas tu primera reserva, aparecerá aquí.
          </p>
        </Card>
      ) : (
        <Card as="ul" padding="none" className="divide-y divide-border">
          {items.map((item) => {
            const expiresAtMs = item.expiresAt ? new Date(item.expiresAt).getTime() : null;
            const isExpired =
              item.status === "expired" ||
              (item.status === "pending" && expiresAtMs !== null && expiresAtMs <= now);

            const effectiveStatus = isExpired ? "expired" : item.status;
            const badge = STATUS_BADGE[effectiveStatus];
            const canPay = item.status === "pending" && !isExpired;

            return (
              <li
                key={item.reservationId}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-text-primary">
                    {item.serviceName}
                  </p>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {formatDateShort(item.date)} · {item.timeRange} ·{" "}
                    {item.peopleCount}{" "}
                    {item.peopleCount === 1 ? "persona" : "personas"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                  <Badge size="sm" variant={badge.variant}>
                    {badge.label}
                  </Badge>
                  {canPay && (
                    <Link href={`/client/payment/${item.reservationId}`}>
                      <Button size="sm" className="gap-1.5 shadow-md shadow-sky-500/25">
                        <CreditCard size={14} />
                        <span>Pagar ahora</span>
                      </Button>
                    </Link>
                  )}
                  <Link
                    href="/client/reservations"
                    className="shrink-0 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
                  >
                    Ver detalle
                  </Link>
                </div>
              </li>
            );
          })}
        </Card>
      )}
    </section>
  );
}