"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Dumbbell, Trophy, UserPlus, Users } from "lucide-react";

export interface ServiceCardProps {
  name: string;
  description?: string;
  image?: string;
  categoryName: string;
  capacity: number;
  maxCompanions: number;
  qrType: "group" | "individual";
  hourPrice: number;
  onClick?: () => void;
}

const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function ServiceCard({
  name,
  description,
  image,
  categoryName,
  capacity,
  maxCompanions,
  qrType,
  hourPrice,
  onClick,
}: ServiceCardProps) {
  const qrBadge =
    qrType === "group" ? (
      <Badge variant="primary">Grupal</Badge>
    ) : (
      <Badge variant="secondary">Individual</Badge>
    );

  const contentIcon =
    categoryName.toLowerCase().includes("atlet") ||
    categoryName.toLowerCase().includes("fitness") ||
    categoryName.toLowerCase().includes("gimnas") ? (
      <Dumbbell className="size-12 text-primary/70" />
    ) : (
      <Trophy className="size-12 text-primary/70" />
    );

  return (
    <Card
      variant="default"
      padding="none"
      onClick={onClick}
      className="group w-full max-w-[420px] overflow-hidden border border-border bg-surface shadow-md transition-all duration-200 hover:scale-[1.02] hover:border-primary/40 hover:shadow-lg"
      as="article"
    >
      <div className="relative h-[140px] w-full overflow-hidden rounded-t-[20px]">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-soft to-surface">
            <div className="opacity-70">{contentIcon}</div>
          </div>
        )}

        <div className="absolute left-4 top-4 z-10">{qrBadge}</div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="font-heading text-xl font-medium text-text-primary">
            {name}
          </h3>

          {description ? (
            <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Hasta {capacity} personas</span>
          </div>
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Máximo {maxCompanions} acompañantes</span>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[12px] text-text-secondary">Precio por hora</p>
              <p className="font-heading text-xl font-bold text-primary">
                {currencyFormatter.format(hourPrice)}
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClick?.();
              }}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
              aria-label={`Reservar ${name}`}
            >
              Reservar <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
