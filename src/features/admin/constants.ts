import type { BadgeVariant } from "@/components/ui/Badge";
import type { ReservationStatus } from "@/types/database";

export interface StatusConfig {
  label: string;
  pluralLabel: string;
  variant: BadgeVariant;
  color: string;
}

// Configuración de los 5 estados reales según Figma y la base de datos
export const RESERVATION_STATUS: Record<ReservationStatus, StatusConfig> = {
  confirmed: {
    label: "Confirmada",
    pluralLabel: "Confirmadas",
    variant: "success",
    color: "#22c55e",
  },
  pending: {
    label: "Pendiente",
    pluralLabel: "Pendientes",
    variant: "warning",
    color: "#facc15",
  },
  completed: {
    label: "Completada",
    pluralLabel: "Completadas",
    variant: "primary",
    color: "#3a83bf",
  },
  expired: {
    label: "Expirada",
    pluralLabel: "Expiradas",
    variant: "neutral",
    color: "#94a3b8",
  },
  failed: {
    label: "Fallida",
    pluralLabel: "Fallidas",
    variant: "error",
    color: "#ef4444",
  },
};

// Clases base para tarjetas del dashboard
export const CARD_CLASS = "rounded-xl border border-border bg-surface p-5";
