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
}; // TEMP-MOCK
// TEMP-MOCK
export const MOCK_ADMIN_RESERVATIONS: AdminReservation[] = [ // TEMP-MOCK
  { // TEMP-MOCK
    id: 1, // TEMP-MOCK
    clientName: "Laura Martínez", // TEMP-MOCK
    clientDocumentLast4: "2481", // TEMP-MOCK (con documento)
    serviceName: "Cancha 5v5 #1", // TEMP-MOCK
    date: "Vie 15 Oct", // TEMP-MOCK
    timeRange: "18:00 - 19:00", // TEMP-MOCK
    status: "confirmed", // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 2, // TEMP-MOCK
    clientName: "Carlos Pérez", // TEMP-MOCK
    clientDocumentLast4: "7130", // TEMP-MOCK (con documento)
    serviceName: "Piscina olímpica", // TEMP-MOCK
    date: "Vie 15 Oct", // TEMP-MOCK
    timeRange: "17:00 - 18:00", // TEMP-MOCK
    status: "confirmed", // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 3, // TEMP-MOCK
    clientName: "Ana Gómez", // TEMP-MOCK
    clientDocumentLast4: "9054", // TEMP-MOCK (con documento)
    serviceName: "Gimnasio", // TEMP-MOCK
    date: "Vie 15 Oct", // TEMP-MOCK
    timeRange: "16:00 - 17:00", // TEMP-MOCK
    status: "completed", // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 4, // TEMP-MOCK
    clientName: "Juan Rodríguez", // TEMP-MOCK
    // clientDocumentLast4 omitido deliberadamente para probar que no muestra nada extra // TEMP-MOCK
    serviceName: "Cancha grande 11v11", // TEMP-MOCK
    date: "Vie 15 Oct", // TEMP-MOCK
    timeRange: "19:00 - 20:00", // TEMP-MOCK
    status: "pending", // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 5, // TEMP-MOCK
    clientName: "Valentina Ríos", // TEMP-MOCK
    clientDocumentLast4: "3312", // TEMP-MOCK (con documento)
    serviceName: "Sauna", // TEMP-MOCK
    date: "Vie 15 Oct", // TEMP-MOCK
    timeRange: "15:00 - 16:00", // TEMP-MOCK
    status: "failed", // TEMP-MOCK
  }, // TEMP-MOCK
]; // TEMP-MOCK
// TEMP-MOCK
export const MOCK_ADMIN_ACCESS_LOGS: AdminAccessLog[] = [ // TEMP-MOCK
  { // TEMP-MOCK
    id: 1, // TEMP-MOCK
    personName: "Laura Martínez", // TEMP-MOCK
    serviceName: "Cancha 5v5 #1", // TEMP-MOCK
    accessedAt: "17:54", // TEMP-MOCK
    result: "granted", // TEMP-MOCK
    employeeName: "Empleado 01", // TEMP-MOCK (con empleado)
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 2, // TEMP-MOCK
    personName: "Carlos Pérez", // TEMP-MOCK
    serviceName: "Piscina olímpica", // TEMP-MOCK
    accessedAt: "16:58", // TEMP-MOCK
    result: "granted", // TEMP-MOCK
    employeeName: "Empleado 02", // TEMP-MOCK (con empleado)
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 3, // TEMP-MOCK
    personName: "Ana Gómez", // TEMP-MOCK
    serviceName: "Gimnasio", // TEMP-MOCK
    accessedAt: "15:51", // TEMP-MOCK
    result: "denied", // TEMP-MOCK (acceso denegado)
    employeeName: "Empleado 01", // TEMP-MOCK (con empleado)
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 4, // TEMP-MOCK
    personName: "Juan Rodríguez", // TEMP-MOCK
    serviceName: "Cancha grande 11v11", // TEMP-MOCK
    accessedAt: "18:45", // TEMP-MOCK
    result: "granted", // TEMP-MOCK
    // employeeName omitido deliberadamente para probar que la celda muestra "—" // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 5, // TEMP-MOCK
    personName: "Mateo Gómez", // TEMP-MOCK
    serviceName: "Cancha 5v5 #2", // TEMP-MOCK
    accessedAt: "14:10", // TEMP-MOCK
    result: "denied", // TEMP-MOCK (acceso denegado)
    employeeName: "Empleado 03", // TEMP-MOCK (con empleado)
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
  }, // TEMP-MOCK
  reservations: [], // TEMP-MOCK
  accessLogs: [], // TEMP-MOCK
}; // TEMP-MOCK
