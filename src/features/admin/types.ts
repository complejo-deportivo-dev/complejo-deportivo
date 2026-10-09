import type { AdminMetrics as BaseAdminMetrics, ApiResponse } from "@/types/api";
import type { AccessResult, ReservationStatus } from "@/types/database";

// Re-exportamos los tipos base del proyecto
export type { ApiResponse, AccessResult, ReservationStatus };

// Extensiones locales para métricas que NO están en el contrato de src/types/api.ts.
// Son opcionales para que el frontend maneje estado vacío si no llegan.
export interface AdminMetricsExtensions {
  occupancy?: number; // % general de ocupación hoy (0-100)
  daily_reservations?: { date: string; total: number }[]; // Serie de los últimos 7 días
  service_occupancy?: { id: number; name: string; occupancy: number }[]; // % de ocupación por servicio
}

export type AdminMetrics = BaseAdminMetrics & AdminMetricsExtensions;

export interface AdminReservation {
  id: number;
  clientName: string;
  clientDocumentLast4?: string; // Campo opcional: últimos 4 dígitos del documento
  serviceName: string;
  date: string;
  timeRange: string;
  status: ReservationStatus;
}

export interface AdminAccessLog {
  id: number;
  personName: string;
  serviceName: string;
  accessedAt: string; // Hora del acceso (ej: "17:54")
  result: AccessResult; // "granted" | "denied"
  employeeName?: string; // Campo opcional: empleado que validó el acceso
}

export interface DashboardData {
  metrics: AdminMetrics;
  reservations: AdminReservation[];
  accessLogs: AdminAccessLog[];
}
