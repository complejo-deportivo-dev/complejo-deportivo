// TEMP-MOCK: Archivo de datos simulados para probar el dashboard mientras se implementan los endpoints reales.
// TEMP-MOCK
import type { // TEMP-MOCK
  AdminAccessLog, // TEMP-MOCK
  AdminMetrics, // TEMP-MOCK
  AdminReservation, // TEMP-MOCK
  DashboardData, // TEMP-MOCK
} from "./types"; // TEMP-MOCK
// TEMP-MOCK
export const MOCK_ADMIN_METRICS: AdminMetrics = { // TEMP-MOCK
  total_reservations: 342, // TEMP-MOCK (contrato api.ts)
  total_revenue: 4250000, // TEMP-MOCK (contrato api.ts)
  entries: { // TEMP-MOCK (contrato api.ts: 140 + 16 = 156 accesos)
    granted: 140, // TEMP-MOCK
    denied: 16, // TEMP-MOCK
  }, // TEMP-MOCK
  by_status: { // TEMP-MOCK (contrato api.ts: 5 estados reales; suman 342)
    confirmed: 128, // TEMP-MOCK
    pending: 42, // TEMP-MOCK
    completed: 136, // TEMP-MOCK
    expired: 24, // TEMP-MOCK
    failed: 12, // TEMP-MOCK
  }, // TEMP-MOCK
  by_service: [ // TEMP-MOCK (contrato api.ts)
    { service_id: 1, name: "Cancha sintética 5v5 #1", count: 45, revenue: 1200000 }, // TEMP-MOCK
    { service_id: 2, name: "Cancha sintética 5v5 #2", count: 40, revenue: 1100000 }, // TEMP-MOCK
    { service_id: 3, name: "Piscina olímpica", count: 32, revenue: 750000 }, // TEMP-MOCK
  ], // TEMP-MOCK
  // Campos opcionales fuera del contrato actual de api.ts:
  occupancy: 78, // TEMP-MOCK (% de ocupación hoy)
  daily_reservations: [ // TEMP-MOCK (serie últimos 7 días con fechas ISO YYYY-MM-DD)
    { date: "2026-10-12", total: 12 }, // Lunes // TEMP-MOCK
    { date: "2026-10-13", total: 25 }, // Martes // TEMP-MOCK
    { date: "2026-10-14", total: 18 }, // Miércoles // TEMP-MOCK
    { date: "2026-10-15", total: 35 }, // Jueves // TEMP-MOCK
    { date: "2026-10-16", total: 30 }, // Viernes // TEMP-MOCK
    { date: "2026-10-17", total: 48 }, // Sábado // TEMP-MOCK
    { date: "2026-10-18", total: 42 }, // Domingo // TEMP-MOCK
  ], // TEMP-MOCK
  service_occupancy: [ // TEMP-MOCK (8 servicios con porcentaje de ocupación)
    { id: 1, name: "Cancha sintética 5v5 #1", occupancy: 92 }, // TEMP-MOCK
    { id: 2, name: "Cancha sintética 5v5 #2", occupancy: 87 }, // TEMP-MOCK
    { id: 3, name: "Piscina olímpica", occupancy: 74 }, // TEMP-MOCK
    { id: 4, name: "Piscina con olas", occupancy: 68 }, // TEMP-MOCK
    { id: 5, name: "Cancha grande 11v11", occupancy: 62 }, // TEMP-MOCK
    { id: 6, name: "Gimnasio principal", occupancy: 55 }, // TEMP-MOCK
    { id: 7, name: "Sauna", occupancy: 30 }, // TEMP-MOCK
    { id: 8, name: "Turco", occupancy: 12 }, // TEMP-MOCK
  ], // TEMP-MOCK
  counts: { categories: 4, services: 11, employees: 3 }, // TEMP-MOCK (totales de Gestión rápida)
}; // TEMP-MOCK
// TEMP-MOCK
export const MOCK_ADMIN_RESERVATIONS: AdminReservation[] = [ // TEMP-MOCK
  { // TEMP-MOCK (confirmed, con documento, dos franjas para probar el rango de horas)
    reservation_id: 2481, // TEMP-MOCK
    user: { // TEMP-MOCK
      id: "uuid-user-01", // TEMP-MOCK
      name: "Laura Martínez", // TEMP-MOCK
      email: "laura@correo.com", // TEMP-MOCK
      document_last4: "2481", // TEMP-MOCK
    }, // TEMP-MOCK
    service: { id: 1, name: "Cancha 5v5 #1" }, // TEMP-MOCK
    reservation_date: "2026-10-15", // TEMP-MOCK
    slots: [ // TEMP-MOCK
      { time_slot_id: 12, time_start: "18:00", time_end: "19:00" }, // TEMP-MOCK
      { time_slot_id: 13, time_start: "19:00", time_end: "20:00" }, // TEMP-MOCK
    ], // TEMP-MOCK
    status: "confirmed", // TEMP-MOCK
    quantity: 1, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK (pending, con documento)
    reservation_id: 2480, // TEMP-MOCK
    user: { // TEMP-MOCK
      id: "uuid-user-02", // TEMP-MOCK
      name: "Carlos Pérez", // TEMP-MOCK
      email: "carlos@correo.com", // TEMP-MOCK
      document_last4: "7130", // TEMP-MOCK
    }, // TEMP-MOCK
    service: { id: 3, name: "Piscina olímpica" }, // TEMP-MOCK
    reservation_date: "2026-10-14", // TEMP-MOCK
    slots: [ // TEMP-MOCK
      { time_slot_id: 20, time_start: "17:00", time_end: "18:00" }, // TEMP-MOCK
    ], // TEMP-MOCK
    status: "pending", // TEMP-MOCK
    quantity: 2, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK (completed, con documento, hora con segundos para probar el recorte)
    reservation_id: 2479, // TEMP-MOCK
    user: { // TEMP-MOCK
      id: "uuid-user-03", // TEMP-MOCK
      name: "Ana Gómez", // TEMP-MOCK
      email: "ana@correo.com", // TEMP-MOCK
      document_last4: "9054", // TEMP-MOCK
    }, // TEMP-MOCK
    service: { id: 6, name: "Gimnasio" }, // TEMP-MOCK
    reservation_date: "2026-10-13", // TEMP-MOCK
    slots: [ // TEMP-MOCK
      { time_slot_id: 7, time_start: "16:00:00", time_end: "17:00:00" }, // TEMP-MOCK
    ], // TEMP-MOCK
    status: "completed", // TEMP-MOCK
    quantity: 1, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK (failed, SIN document_last4 para probar que no se muestra la línea)
    reservation_id: 2478, // TEMP-MOCK
    user: { // TEMP-MOCK
      id: "uuid-user-04", // TEMP-MOCK
      name: "Juan Rodríguez", // TEMP-MOCK
      email: "juan@correo.com", // TEMP-MOCK
    }, // TEMP-MOCK
    service: { id: 5, name: "Cancha grande 11v11" }, // TEMP-MOCK
    reservation_date: "2026-10-12", // TEMP-MOCK
    slots: [ // TEMP-MOCK
      { time_slot_id: 30, time_start: "19:00", time_end: "20:00" }, // TEMP-MOCK
    ], // TEMP-MOCK
    status: "failed", // TEMP-MOCK
    quantity: 1, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK (expired, SIN document_last4)
    reservation_id: 2477, // TEMP-MOCK
    user: { // TEMP-MOCK
      id: "uuid-user-05", // TEMP-MOCK
      name: "Valentina Ríos", // TEMP-MOCK
      email: "valentina@correo.com", // TEMP-MOCK
    }, // TEMP-MOCK
    service: { id: 8, name: "Turco" }, // TEMP-MOCK
    reservation_date: "2026-10-16", // TEMP-MOCK
    slots: [ // TEMP-MOCK
      { time_slot_id: 40, time_start: "15:00", time_end: "16:00" }, // TEMP-MOCK
    ], // TEMP-MOCK
    status: "expired", // TEMP-MOCK
    quantity: 3, // TEMP-MOCK
  }, // TEMP-MOCK
]; // TEMP-MOCK
// TEMP-MOCK
export const MOCK_ADMIN_ACCESS_LOGS: AdminAccessLog[] = [ // TEMP-MOCK
  { // TEMP-MOCK (granted, con reservation: cliente y servicio)
    id: 310, // TEMP-MOCK
    reservation_id: 2481, // TEMP-MOCK
    employee: { id: "uuid-employee-01", name: "Empleado 01" }, // TEMP-MOCK
    qr_code_id: 905, // TEMP-MOCK
    result: "granted", // TEMP-MOCK
    scanned_at: "2026-10-15T17:54:00Z", // TEMP-MOCK
    reservation: { // TEMP-MOCK
      user: { name: "Laura Martínez" }, // TEMP-MOCK
      service: { name: "Cancha 5v5 #1" }, // TEMP-MOCK
    }, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK (denied, con reservation)
    id: 309, // TEMP-MOCK
    reservation_id: 2479, // TEMP-MOCK
    employee: { id: "uuid-employee-02", name: "Empleado 02" }, // TEMP-MOCK
    qr_code_id: 904, // TEMP-MOCK
    result: "denied", // TEMP-MOCK
    scanned_at: "2026-10-15T16:58:00Z", // TEMP-MOCK
    reservation: { // TEMP-MOCK
      user: { name: "Ana Gómez" }, // TEMP-MOCK
      service: { name: "Gimnasio" }, // TEMP-MOCK
    }, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK (granted, con reservation)
    id: 308, // TEMP-MOCK
    reservation_id: 2480, // TEMP-MOCK
    employee: { id: "uuid-employee-01", name: "Empleado 01" }, // TEMP-MOCK
    qr_code_id: 903, // TEMP-MOCK
    result: "granted", // TEMP-MOCK
    scanned_at: "2026-10-15T16:10:00Z", // TEMP-MOCK
    reservation: { // TEMP-MOCK
      user: { name: "Carlos Pérez" }, // TEMP-MOCK
      service: { name: "Piscina olímpica" }, // TEMP-MOCK
    }, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK (SIN reservation ni QR: prueba los "—" en cliente y servicio)
    id: 307, // TEMP-MOCK
    reservation_id: 2478, // TEMP-MOCK
    employee: { id: "uuid-employee-03", name: "Empleado 03" }, // TEMP-MOCK
    qr_code_id: null, // TEMP-MOCK
    result: "granted", // TEMP-MOCK
    scanned_at: "2026-10-15T15:45:00Z", // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK (denied, con reservation)
    id: 306, // TEMP-MOCK
    reservation_id: 2477, // TEMP-MOCK
    employee: { id: "uuid-employee-02", name: "Empleado 02" }, // TEMP-MOCK
    qr_code_id: 902, // TEMP-MOCK
    result: "denied", // TEMP-MOCK
    scanned_at: "2026-10-15T14:10:00Z", // TEMP-MOCK
    reservation: { // TEMP-MOCK
      user: { name: "Valentina Ríos" }, // TEMP-MOCK
      service: { name: "Turco" }, // TEMP-MOCK
    }, // TEMP-MOCK
  }, // TEMP-MOCK
]; // TEMP-MOCK
// TEMP-MOCK
export const MOCK_DASHBOARD_DATA: DashboardData = { // TEMP-MOCK
  metrics: MOCK_ADMIN_METRICS, // TEMP-MOCK
  reservations: MOCK_ADMIN_RESERVATIONS, // TEMP-MOCK
  accessLogs: MOCK_ADMIN_ACCESS_LOGS, // TEMP-MOCK
}; // TEMP-MOCK
// TEMP-MOCK
// Estado vacío simulado para probar la pantalla sin datos (NEXT_PUBLIC_USE_MOCK=empty) // TEMP-MOCK
export const MOCK_EMPTY_DASHBOARD_DATA: DashboardData = { // TEMP-MOCK
  metrics: { // TEMP-MOCK
    total_reservations: 0, // TEMP-MOCK
    total_revenue: 0, // TEMP-MOCK
    entries: { granted: 0, denied: 0 }, // TEMP-MOCK
    by_status: { confirmed: 0, pending: 0, completed: 0, expired: 0, failed: 0 }, // TEMP-MOCK
    by_service: [], // TEMP-MOCK
    occupancy: 0, // TEMP-MOCK
    daily_reservations: [], // TEMP-MOCK
    service_occupancy: [], // TEMP-MOCK
    counts: { categories: 0, services: 0, employees: 0 }, // TEMP-MOCK
  }, // TEMP-MOCK
  reservations: [], // TEMP-MOCK
  accessLogs: [], // TEMP-MOCK
}; // TEMP-MOCK
