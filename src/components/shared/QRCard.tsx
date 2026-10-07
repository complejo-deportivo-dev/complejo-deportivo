"use client";

import { User, Users, ArrowRight } from "lucide-react";

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
      ? "from-blue-600 to-blue-700"
      : "from-orange-500 to-orange-600"; 

  const statusClasses = used
    ? "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";

  const linkClasses =
    qrType === "group"
      ? "text-blue-600 dark:text-blue-400"
      : "text-orange-600 dark:text-orange-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-[260px] w-[200px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white/95 text-left shadow-lg backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-200 hover:scale-[1.03] hover:border-blue-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/80 dark:focus-visible:ring-offset-slate-950"
    >
      <span aria-hidden="true" className={`h-1 w-full shrink-0 bg-gradient-to-r ${accent}`} />
      <span className="flex min-h-0 flex-1 flex-col items-center px-4 pb-3 pt-2">
        <span
          aria-hidden="true"
          className={`relative mb-2 flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-xl bg-slate-50 p-5 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${used ? "opacity-40" : ""}`}
        >
          <span className="flex size-full items-center justify-center rounded-md border border-slate-200 text-sm font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
            QR
          </span>
          <span className="absolute -right-2 -top-2 flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-blue-400">
            {qrType === "group" ? (
              <Users className="size-5" />
            ) : (
              <User className="size-5" />
            )}
          </span>
        </span>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium leading-4 ${statusClasses}`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 shrink-0 rounded-full ${used ? "bg-slate-500 dark:bg-slate-400" : "bg-emerald-500 dark:bg-emerald-400"}`}
          />
          {used ? "Ya escaneado" : "Vigente"}
        </span>

        <span className="mt-1 max-w-full truncate text-base font-medium leading-6 text-slate-900 dark:text-slate-100">
          {title}
        </span>
        <span className="max-w-full truncate text-xs leading-4 text-slate-500 dark:text-slate-400">
          {reservationCode}
        </span>
        <span className={`mt-auto w-full flex items-center justify-between text-sm font-medium leading-5 ${linkClasses}`}>
          Ver QR
          <ArrowRight className="size-4" />
        </span>
      </span>
    </button>
  );
}