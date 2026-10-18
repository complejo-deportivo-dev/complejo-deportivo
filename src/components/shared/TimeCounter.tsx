"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface TimeCounterProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  className?: string;
}

type CounterStatus = "normal" | "warning" | "expired";

const TOTAL_SECONDS = 600;
const WARNING_THRESHOLD = 120;

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
  { container: string; text: string; bar: string; icon: string }
> = {
  normal: {
    container: "border-white/10 bg-white/[0.03]",
    text: "text-sky-400",
    bar: "bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]",
    icon: "text-sky-400 border-sky-400/20 bg-sky-500/10",
  },
  warning: {
    container: "border-amber-500/20 bg-amber-500/5",
    text: "text-amber-400",
    bar: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]",
    icon: "text-amber-400 border-amber-400/20 bg-amber-500/10",
  },
  expired: {
    container: "border-rose-500/20 bg-rose-500/5",
    text: "text-rose-400",
    bar: "bg-rose-500",
    icon: "text-rose-400 border-rose-400/20 bg-rose-500/10",
  },
};

export default function TimeCounter({
  expiresAt,
  onExpire,
  className = "",
}: TimeCounterProps) {
  const expiresAtMs = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() =>
    getRemainingSeconds(expiresAtMs),
  );

  const onExpireRef = useRef(onExpire);
  const expiredForRef = useRef<number | null>(null);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const tick = () => {
      const next = getRemainingSeconds(expiresAtMs);
      setRemaining(next);

      if (next === 0) {
        clearInterval(intervalId);
        if (expiredForRef.current !== expiresAtMs) {
          expiredForRef.current = expiresAtMs;
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
    Math.max(0, (remaining / TOTAL_SECONDS) * 100),
  );

  return (
    <div
      aria-live="polite"
      className={`relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-colors duration-500 ${styles.container} ${className}`}
      role="timer"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
          >
            <Clock aria-hidden="true" size={20} />
          </span>
          <span className="text-sm font-medium text-slate-300">
            {status === "expired"
              ? "El tiempo de pago venció."
              : "Tiempo restante para completar el pago"}
          </span>
        </div>
        <span
          className={`shrink-0 font-mono text-2xl font-bold tabular-nums tracking-tight ${styles.text}`}
        >
          {formatTime(remaining)}
        </span>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-black/40">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${styles.bar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
