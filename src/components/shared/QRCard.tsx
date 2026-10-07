"use client";

import Badge from "@/components/ui/Badge";

interface QRCardProps {
  title: string;
  reservationCode: string;
  qrType: "group" | "individual";
  used?: boolean;
  onClick?: () => void;
}

export default function QRCard({
  title,
  reservationCode,
  qrType,
  used = false,
  onClick,
}: QRCardProps) {
  const accent =
    qrType === "group"
      ? "from-primary to-primary-hover"
      : "from-secondary to-secondary-hover";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-[260px] w-[200px] flex-col overflow-hidden rounded-[20px] border border-border bg-surface/95 text-left shadow-lg backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-200 hover:scale-[1.03] hover:border-primary/40 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-white/10 dark:bg-slate-900/80 dark:focus-visible:ring-offset-slate-950"
    >
      <span aria-hidden="true" className={`h-1 w-full shrink-0 bg-gradient-to-r ${accent}`} />
      <span className="flex min-h-0 flex-1 flex-col items-center px-4 pb-3 pt-2">
        <span
          aria-hidden="true"
          className={`mb-2 flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-xl bg-surface p-5 text-text-secondary dark:bg-slate-800 dark:text-slate-400 ${used ? "opacity-40" : ""}`}
        >
          <span className="flex size-full items-center justify-center rounded-md border border-border text-sm font-medium dark:border-white/10">
            QR
          </span>
        </span>
        <Badge variant={used ? "neutral" : "success"} size="sm">
          {used ? "Ya escaneado" : "Vigente"}
        </Badge>
        <span className="mt-1 max-w-full truncate text-base font-medium leading-6 text-text-primary dark:text-slate-100">
          {title}
        </span>
        <span className="max-w-full truncate text-xs leading-4 text-text-secondary dark:text-slate-400">
          {reservationCode}
        </span>
        <span className="mt-auto w-full text-sm font-medium leading-5 text-primary">
          Ver QR →
        </span>
      </span>
    </button>
  );
}