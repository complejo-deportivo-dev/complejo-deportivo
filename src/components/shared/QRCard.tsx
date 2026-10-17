"use client";

import { ArrowRight, User, Users, type LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import QRCodeImage from "@/components/shared/QRCodeImage";

interface QRCardTheme {
  icon: LucideIcon;
  text: string;
  bg: string;
  border: string;
  glow: string;
}

interface QRCardProps {
  title: string;
  reservationCode: string;
  qrToken: string;
  qrType: "group" | "individual";
  used?: boolean;
  onClick?: () => void;
  serviceTheme?: QRCardTheme;
}

export default function QRCard({
  title,
  reservationCode,
  qrToken,
  qrType,
  used = false,
  onClick,
  serviceTheme,
}: QRCardProps) {
  const isGroup = qrType === "group";
  const CategoryIcon = serviceTheme?.icon ?? (isGroup ? Users : User);

  return (
    <Card
      padding="none"
      onClick={onClick}
      className={`group relative flex min-h-[360px] w-[240px] min-w-[160px] flex-col items-center overflow-hidden !rounded-2xl !border-white/10 !bg-white/[0.03] p-5 !shadow-none !backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:!bg-white/[0.06] hover:!shadow-2xl ${serviceTheme?.border ?? "hover:!border-white/20"} ${serviceTheme?.glow ?? "hover:!shadow-sky-500/10"}`}
    >
      <span className="flex min-h-0 w-full flex-1 flex-col items-center text-left">
        <span
          className={`relative mx-auto flex aspect-square w-full max-w-[160px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-3 shadow-lg transition-transform duration-300 group-hover:scale-105 ${
            used ? "opacity-40" : ""
          }`}
        >
          <QRCodeImage
            alt={`QR de acceso ${reservationCode}`}
            className="size-full rounded-md object-contain"
            value={qrToken}
          />
        </span>

        <span
          className={`mt-3 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
            used
              ? "border-white/10 bg-white/5 text-slate-400"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {!used && (
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          )}
          {used ? "Ya escaneado" : "Vigente"}
        </span>

        <span
          className={`mb-2 mt-2 flex size-10 shrink-0 items-center justify-center rounded-xl ${serviceTheme ? `${serviceTheme.bg} ${serviceTheme.text}` : "bg-sky-500/10 text-sky-400"}`}
          aria-hidden="true"
        >
          <CategoryIcon className="size-5" />
        </span>

        <span className="mt-1 w-full shrink-0 truncate text-center text-sm font-bold text-white">
          {title}
        </span>
        <span className="mt-0.5 w-full shrink-0 truncate text-center text-xs text-slate-400">
          {reservationCode}
        </span>
        <span
          className={`mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold transition-all duration-300 ${serviceTheme ? `${serviceTheme.bg} ${serviceTheme.text}` : "bg-sky-500/10 text-sky-400"} hover:border-white/20 hover:bg-white/10`}
        >
          Ver QR
          <ArrowRight aria-hidden="true" size={16} />
        </span>
      </span>
    </Card>
  );
}
