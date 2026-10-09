import type {
  AdminMetrics as BaseAdminMetrics,
  ApiResponse,
  ReservationWithDetails,
} from "@/types/api";
import type { AccessResult, ReservationStatus } from "@/types/database";

// Re-exportamos los tipos base del proyecto
export type { ApiResponse, AccessResult, ReservationStatus };

// Totales de las tarjetas de "Gestión rápida".
export interface AdminCounts {
  categories: number;
  services: number;
  employees: number;
}

// Extensiones locales para métricas que NO están en el contrato de src/types/api.ts.
// Son opcionales para que el frontend maneje estado vacío si no llegan.
export interface AdminMetricsExtensions {
  occupancy?: number; // % general de ocupación (0-100)
  daily_reservations?: { date: string; total: number }[]; // Serie de los últimos 7 días
  service_occupancy?: { id: number; name: string; occupancy: number }[]; // % de ocupación por servicio
  counts?: AdminCounts; // TODO-BACKEND: totales de las tarjetas de Gestión rápida
}

export type AdminMetrics = BaseAdminMetrics & AdminMetricsExtensions;

// Reutilizamos la forma de api.ts y le agregamos el usuario que trae el endpoint admin.
// La tabla "Últimas reservas" lee user, service, reservation_date, slots y status.
export interface AdminReservation
  extends Pick<
    ReservationWithDetails,
    | "reservation_id"
    | "service"
    | "reservation_date"
    | "slots"
    | "status"
    | "quantity"
  > {
  user: {
    id: string; // UUID
    name: string;
    email: string;
    document_last4?: string; // TODO-BACKEND: últimos 4 dígitos de la cédula, ya enmascarados
  };
}

// Forma de un acceso validado según docs/diseño/api.md (sección 3.6).
export interface AdminAccessLog {
  id: number;
  reservation_id: number;
  employee: {
    id: string; // UUID
    name: string;
  };
  qr_code_id: number | null;
  result: AccessResult; // "granted" | "denied"
  scanned_at: string; // Fecha y hora del acceso (ISO)
  // TODO-BACKEND: el diseño solo trae reservation_id; se propone incluir estos datos.
  reservation?: {
    user?: { name: string };
    service?: { name: string };
  };
}

export interface DashboardData {
  metrics: AdminMetrics;
  reservations: AdminReservation[];
  accessLogs: AdminAccessLog[];
}

export interface AdminCategory {
  id: number;
  name: string;
  is_active: boolean;
  serviceCount?: number; // TODO-BACKEND: conteo real del backend.
  services?: { id: number; name: string }[]; // TODO-BACKEND
}

export interface AdminCategoryMockRecord {
  id: number;
  name: string;
  servicios_count?: number; // TODO-BACKEND: campo real del backend para servicios asociados.
  activo?: boolean; // TODO-BACKEND: bandera real del backend.
  is_active?: boolean; // TODO-BACKEND: alias del frontend para compatibilidad.
}

export interface AdminServiceCategoryOption {
  id: number;
  name: string;
}

export interface AdminService {
  id: number;
  name: string;
  category_id: number;
  category_name: string; // TODO-BACKEND: nombre de categoría resuelto en frontend si no viene del backend.
  capacity: number;
  max_companions?: number; // TODO-BACKEND: valor real del backend; opcional para compatibilidad.
  qr_type: "group" | "individual";
  price_per_hour: number;
  is_active: boolean;
  active_reservations_count?: number; // TODO-BACKEND: conteo real del backend.
  past_reservations_count?: number; // TODO-BACKEND: historial de reservas pasadas.
}

export interface AdminServiceMockRecord {
  id: number;
  name: string;
  category_id: number;
  category_name: string; // TODO-BACKEND: nombre resuelto del backend.
  capacity: number;
  max_companions?: number; // TODO-BACKEND
  qr_type: "group" | "individual";
  price_per_hour: number;
  is_active: boolean;
  active_reservations_count?: number; // TODO-BACKEND
  past_reservations_count?: number; // TODO-BACKEND
}

export interface AdminEmployee {
  id: number;
  name: string;
  email: string;
  number_document: string;
  is_active: boolean;
  initials?: string; // TODO-BACKEND: se puede calcular en frontend si el backend no lo entrega.
  access_logs_count?: number; // TODO-BACKEND: conteo real del backend.
}

export interface AdminEmployeeMockRecord {
  id: number;
  name: string;
  email: string;
  number_document: string;
  is_active: boolean;
  initials?: string; // TODO-BACKEND
  access_logs_count?: number; // TODO-BACKEND
}

export interface AdminTimeSlot {
  id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  is_active?: boolean; // TODO-BACKEND: estado real del backend si aplica.
  duration_minutes?: number; // TODO-BACKEND: se puede calcular en frontend si no viene del backend.
  active_reservations_count?: number; // TODO-BACKEND
}

export interface AdminTimeSlotMockRecord {
  id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  is_active?: boolean; // TODO-BACKEND
  active_reservations_count?: number; // TODO-BACKEND
}
