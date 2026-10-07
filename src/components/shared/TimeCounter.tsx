"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface TimeCounterProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  className?: string;
}

type CounterStatus = "normal" | "warning" | "expired";

const TOTAL_SECONDS = 600; // 10 minutos
const WARNING_THRESHOLD = 120; // 2 minutos

function getRemainingSeconds(expiresAtMs: number): number {
  return Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const stateClasses: Record<
  CounterStatus,
  { container: string; text: string; bar: string }
> = {
  normal: { container: "bg-surface", text: "text-primary", bar: "bg-primary" },
  warning: {
    container: "bg-warning-soft",
    text: "text-warning-text",
    bar: "bg-warning",
  },
  expired: { container: "bg-error-soft", text: "text-error", bar: "bg-error" },
};

export default function TimeCounter({
  expiresAt,
  onExpire,
  className = "",
}: TimeCounterProps) {
  const expiresAtMs = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() =>
    getRemainingSeconds(expiresAtMs)
  );

  // Guardamos el callback en un ref para no reiniciar el intervalo
  // cuando el padre pasa una función nueva en cada render.
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    hasExpiredRef.current = false;

    const tick = () => {
      const next = getRemainingSeconds(expiresAtMs);
      setRemaining(next);

      if (next === 0) {
        clearInterval(intervalId);
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true;
          onExpireRef.current?.();
        }
      }
    };

    const intervalId = setInterval(tick, 1000);
    tick();

    return () => clearInterval(intervalId);
  }, [expiresAtMs]);

  const status: CounterStatus =
    remaining === 0
      ? "expired"
      : remaining < WARNING_THRESHOLD
        ? "warning"
        : "normal";
  const styles = stateClasses[status];
  const progress = Math.min(
    100,
    Math.max(0, (remaining / TOTAL_SECONDS) * 100)
  );

  return (
    <div
      aria-live="polite"
      className={`flex flex-col gap-3 rounded-xl border border-border px-5 py-4 backdrop-blur-[20px] transition-colors duration-300 ${styles.container} ${className}`}
      role="timer"
    >
      <div className="flex items-center justify-between gap-4">
        <div className={`flex min-w-0 items-center gap-2 ${styles.text}`}>
          <Clock aria-hidden="true" className="shrink-0" size={20} />
          <span className="text-sm">
            {status === "expired"
              ? "El tiempo de pago venció."
              : "Tiempo restante para completar el pago"}
          </span>
        </div>
        <span
          className={`shrink-0 font-heading text-lg font-bold tabular-nums ${styles.text}`}
        >
          {formatTime(remaining)}
        </span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-elevated">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${styles.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
