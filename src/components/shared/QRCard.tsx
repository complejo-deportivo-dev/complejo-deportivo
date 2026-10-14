"use client";

import { ArrowRight, User, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import QRCodeImage from "@/components/shared/QRCodeImage";

interface QRCardProps {
  title: string;
  reservationCode: string;
  qrToken: string;
  qrType: "group" | "individual";
  used?: boolean;
  onClick?: () => void;
}

export default function QRCard({
  title,
  reservationCode,
  qrToken,
  qrType,
  used = false,
  onClick,
}: QRCardProps) {
  const isGroup = qrType === "group";

  return (
    <Card
      padding="none"
      onClick={onClick}
      className="group flex h-[260px] w-[200px] flex-col overflow-hidden text-left"
    >
      <span
        aria-hidden="true"
        className={`h-1 w-full shrink-0 bg-gradient-to-r ${
          isGroup
            ? "from-primary to-primary-hover"
            : "from-secondary to-secondary-hover"
        }`}
      />
      <span className="flex min-h-0 flex-1 flex-col items-center px-4 pb-3 pt-2">
        <span
          className={`relative mb-2 flex size-[140px] shrink-0 items-center justify-center rounded-xl bg-surface-elevated p-4 ${
            used ? "opacity-40" : ""
          }`}
        >
          <QRCodeImage
            alt={`QR de acceso ${reservationCode}`}
            className="size-full rounded-md object-contain"
            value={qrToken}
          />
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-2 flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary"
          >
            {isGroup ? (
              <Users aria-hidden="true" className="size-5" />
            ) : (
              <User aria-hidden="true" className="size-5" />
            )}
          </span>
        </span>

        <Badge variant={used ? "neutral" : "success"} size="sm">
          {used ? "Ya escaneado" : "Vigente"}
        </Badge>

        <span className="mt-1 max-w-full truncate text-base font-medium text-text-primary">
          {title}
        </span>
        <span className="max-w-full truncate text-xs text-text-secondary">
          {reservationCode}
        </span>
        <span
          className={`mt-auto flex w-full items-center justify-between text-sm font-medium ${
            isGroup ? "text-primary" : "text-secondary"
          }`}
        >
          Ver QR
          <ArrowRight aria-hidden="true" size={16} />
        </span>
      </span>
    </Card>
  );
}
