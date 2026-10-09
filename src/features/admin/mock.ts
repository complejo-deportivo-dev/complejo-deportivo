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

export type CategoryMockItem = { // TEMP-MOCK
  id: number; // TEMP-MOCK
  name: string; // TEMP-MOCK
  servicios_count: number; // TEMP-MOCK
  activo: boolean; // TEMP-MOCK
}; // TEMP-MOCK

export const MOCK_CATEGORIES: CategoryMockItem[] = [ // TEMP-MOCK
  { id: 1, name: "Canchas", servicios_count: 4, activo: true }, // TEMP-MOCK
  { id: 2, name: "Piscinas", servicios_count: 4, activo: true }, // TEMP-MOCK
  { id: 3, name: "Zonas húmedas", servicios_count: 2, activo: true }, // TEMP-MOCK
  { id: 4, name: "Gimnasio", servicios_count: 1, activo: true }, // TEMP-MOCK
]; // TEMP-MOCK

let mockCategoryState: CategoryMockItem[] = [...MOCK_CATEGORIES]; // TEMP-MOCK

export function getMockCategories(): CategoryMockItem[] { // TEMP-MOCK
  const mode = process.env.NEXT_PUBLIC_USE_MOCK?.trim().toLowerCase(); // TEMP-MOCK

  if (mode === "empty") { // TEMP-MOCK
    return []; // TEMP-MOCK
  } // TEMP-MOCK

  if (mode === "error") { // TEMP-MOCK
    throw new Error("No se pudo cargar la lista de categorías."); // TEMP-MOCK
  } // TEMP-MOCK

  return mockCategoryState.map((category) => ({ ...category })); // TEMP-MOCK
} // TEMP-MOCK

export function createMockCategory(payload: { name: string; is_active?: boolean }): CategoryMockItem { // TEMP-MOCK
  const trimmedName = payload.name.trim(); // TEMP-MOCK
  const nextId = mockCategoryState.length > 0 ? Math.max(...mockCategoryState.map((category) => category.id)) + 1 : 1; // TEMP-MOCK
  const nextCategory: CategoryMockItem = { // TEMP-MOCK
    id: nextId, // TEMP-MOCK
    name: trimmedName, // TEMP-MOCK
    servicios_count: 0, // TEMP-MOCK
    activo: payload.is_active ?? true, // TEMP-MOCK
  }; // TEMP-MOCK

  mockCategoryState = [nextCategory, ...mockCategoryState]; // TEMP-MOCK
  return { ...nextCategory }; // TEMP-MOCK
} // TEMP-MOCK

export function updateMockCategory( // TEMP-MOCK
  id: number, // TEMP-MOCK
  payload: { name?: string; is_active?: boolean }, // TEMP-MOCK
): CategoryMockItem | null { // TEMP-MOCK
  let updatedCategory: CategoryMockItem | null = null; // TEMP-MOCK

  mockCategoryState = mockCategoryState.map((category) => { // TEMP-MOCK
    if (category.id !== id) { // TEMP-MOCK
      return category; // TEMP-MOCK
    } // TEMP-MOCK

    updatedCategory = { // TEMP-MOCK
      ...category, // TEMP-MOCK
      name: payload.name?.trim() || category.name, // TEMP-MOCK
      activo: payload.is_active ?? category.activo, // TEMP-MOCK
    }; // TEMP-MOCK

    return updatedCategory; // TEMP-MOCK
  }); // TEMP-MOCK

  return updatedCategory; // TEMP-MOCK
} // TEMP-MOCK

export function toggleMockCategory(id: number): CategoryMockItem | null { // TEMP-MOCK
  return updateMockCategory(id, { // TEMP-MOCK
    is_active: !mockCategoryState.find((category) => category.id === id)?.activo, // TEMP-MOCK
  }); // TEMP-MOCK
} // TEMP-MOCK

export function deleteMockCategory(id: number): boolean { // TEMP-MOCK
  const previousLength = mockCategoryState.length; // TEMP-MOCK
  mockCategoryState = mockCategoryState.filter((category) => category.id !== id); // TEMP-MOCK
  return mockCategoryState.length !== previousLength; // TEMP-MOCK
} // TEMP-MOCK

export const MOCK_EMPLOYEES: Array<{ // TEMP-MOCK
  id: number; // TEMP-MOCK
  name: string; // TEMP-MOCK
  email: string; // TEMP-MOCK
  number_document: string; // TEMP-MOCK
  is_active: boolean; // TEMP-MOCK
  initials?: string; // TEMP-MOCK
  access_logs_count?: number; // TEMP-MOCK
}> = [ // TEMP-MOCK
  { id: 1, name: "Luis Herrera", email: "luis@otium.com", number_document: "1023456789", is_active: true, initials: "LH", access_logs_count: 5 }, // TEMP-MOCK
  { id: 2, name: "María Rodríguez", email: "maria@otium.com", number_document: "987654321", is_active: true, initials: "MR", access_logs_count: 0 }, // TEMP-MOCK
  { id: 3, name: "Pedro Sánchez", email: "pedro@otium.com", number_document: "123456789", is_active: true, initials: "PS", access_logs_count: 2 }, // TEMP-MOCK
]; // TEMP-MOCK

let mockEmployeeState = [...MOCK_EMPLOYEES]; // TEMP-MOCK

export function getMockEmployees() { // TEMP-MOCK
  const mode = process.env.NEXT_PUBLIC_USE_MOCK?.trim().toLowerCase(); // TEMP-MOCK

  if (mode === "empty") { // TEMP-MOCK
    return []; // TEMP-MOCK
  } // TEMP-MOCK

  if (mode === "error") { // TEMP-MOCK
    throw new Error("No se pudo cargar la lista de empleados."); // TEMP-MOCK
  } // TEMP-MOCK

  return mockEmployeeState.map((employee) => ({ ...employee })); // TEMP-MOCK
} // TEMP-MOCK

export function createMockEmployee(payload: { // TEMP-MOCK
  name: string; // TEMP-MOCK
  email: string; // TEMP-MOCK
  number_document: string; // TEMP-MOCK
  is_active?: boolean; // TEMP-MOCK
}): (typeof MOCK_EMPLOYEES)[number] { // TEMP-MOCK
  const trimmedName = payload.name.trim(); // TEMP-MOCK
  const nextId = mockEmployeeState.length > 0 ? Math.max(...mockEmployeeState.map((employee) => employee.id)) + 1 : 1; // TEMP-MOCK
  const initials = trimmedName // TEMP-MOCK
    .split(/\s+/) // TEMP-MOCK
    .filter(Boolean) // TEMP-MOCK
    .slice(0, 2) // TEMP-MOCK
    .map((word) => word[0]?.toUpperCase() ?? "") // TEMP-MOCK
    .join("") || "E"; // TEMP-MOCK

  const nextEmployee = { // TEMP-MOCK
    id: nextId, // TEMP-MOCK
    name: trimmedName, // TEMP-MOCK
    email: payload.email.trim(), // TEMP-MOCK
    number_document: payload.number_document.trim(), // TEMP-MOCK
    is_active: payload.is_active ?? true, // TEMP-MOCK
    initials, // TEMP-MOCK
    access_logs_count: 0, // TEMP-MOCK
  }; // TEMP-MOCK

  mockEmployeeState = [nextEmployee, ...mockEmployeeState]; // TEMP-MOCK
  return { ...nextEmployee }; // TEMP-MOCK
} // TEMP-MOCK

export function updateMockEmployee( // TEMP-MOCK
  id: number, // TEMP-MOCK
  payload: Partial<(typeof MOCK_EMPLOYEES)[number]>, // TEMP-MOCK
): (typeof MOCK_EMPLOYEES)[number] | null { // TEMP-MOCK
  let updatedEmployee: (typeof MOCK_EMPLOYEES)[number] | null = null; // TEMP-MOCK

  mockEmployeeState = mockEmployeeState.map((employee) => { // TEMP-MOCK
    if (employee.id !== id) { // TEMP-MOCK
      return employee; // TEMP-MOCK
    } // TEMP-MOCK

    updatedEmployee = { // TEMP-MOCK
      ...employee, // TEMP-MOCK
      ...payload, // TEMP-MOCK
      name: payload.name?.trim() || employee.name, // TEMP-MOCK
      email: payload.email?.trim() || employee.email, // TEMP-MOCK
      number_document: payload.number_document?.trim() || employee.number_document, // TEMP-MOCK
      initials:
        payload.initials ??
        employee.initials ??
        ((employee.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "E")), // TEMP-MOCK
    }; // TEMP-MOCK

    return updatedEmployee; // TEMP-MOCK
  }); // TEMP-MOCK

  return updatedEmployee; // TEMP-MOCK
} // TEMP-MOCK

export function toggleMockEmployee(id: number): (typeof MOCK_EMPLOYEES)[number] | null { // TEMP-MOCK
  const current = mockEmployeeState.find((employee) => employee.id === id); // TEMP-MOCK

  if (!current) { // TEMP-MOCK
    return null; // TEMP-MOCK
  } // TEMP-MOCK

  return updateMockEmployee(id, { is_active: !current.is_active }); // TEMP-MOCK
} // TEMP-MOCK

export function deleteMockEmployee(id: number): boolean { // TEMP-MOCK
  const previousLength = mockEmployeeState.length; // TEMP-MOCK
  mockEmployeeState = mockEmployeeState.filter((employee) => employee.id !== id); // TEMP-MOCK
  return mockEmployeeState.length !== previousLength; // TEMP-MOCK
} // TEMP-MOCK

export const MOCK_SERVICE_CATEGORIES: { id: number; name: string }[] = [ // TEMP-MOCK
  { id: 1, name: "Canchas" }, // TEMP-MOCK
  { id: 2, name: "Piscinas" }, // TEMP-MOCK
  { id: 3, name: "Gimnasio" }, // TEMP-MOCK
  { id: 4, name: "Wellness" }, // TEMP-MOCK
]; // TEMP-MOCK

export function getMockServiceCategories() { // TEMP-MOCK
  return MOCK_SERVICE_CATEGORIES.map((category) => ({ ...category })); // TEMP-MOCK
} // TEMP-MOCK

export const MOCK_SERVICES: Array<{
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  capacity: number;
  max_companions?: number;
  qr_type: "group" | "individual";
  price_per_hour: number;
  is_active: boolean;
  active_reservations_count?: number;
  past_reservations_count?: number;
}> = [ // TEMP-MOCK
  { // TEMP-MOCK
    id: 1, // TEMP-MOCK
    name: "Cancha sintética 5v5 #1", // TEMP-MOCK
    category_id: 1, // TEMP-MOCK
    category_name: "Canchas", // TEMP-MOCK
    capacity: 10, // TEMP-MOCK
    max_companions: 4, // TEMP-MOCK
    qr_type: "group", // TEMP-MOCK
    price_per_hour: 45000, // TEMP-MOCK
    is_active: true, // TEMP-MOCK
    active_reservations_count: 3, // TEMP-MOCK
    past_reservations_count: 7, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 2, // TEMP-MOCK
    name: "Piscina olímpica", // TEMP-MOCK
    category_id: 2, // TEMP-MOCK
    category_name: "Piscinas", // TEMP-MOCK
    capacity: 20, // TEMP-MOCK
    max_companions: 2, // TEMP-MOCK
    qr_type: "individual", // TEMP-MOCK
    price_per_hour: 32000, // TEMP-MOCK
    is_active: true, // TEMP-MOCK
    active_reservations_count: 0, // TEMP-MOCK
    past_reservations_count: 5, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 3, // TEMP-MOCK
    name: "Gimnasio principal", // TEMP-MOCK
    category_id: 3, // TEMP-MOCK
    category_name: "Gimnasio", // TEMP-MOCK
    capacity: 12, // TEMP-MOCK
    max_companions: 1, // TEMP-MOCK
    qr_type: "individual", // TEMP-MOCK
    price_per_hour: 28000, // TEMP-MOCK
    is_active: false, // TEMP-MOCK
    active_reservations_count: 0, // TEMP-MOCK
    past_reservations_count: 2, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 4, // TEMP-MOCK
    name: "Sauna & relax", // TEMP-MOCK
    category_id: 4, // TEMP-MOCK
    category_name: "Wellness", // TEMP-MOCK
    capacity: 8, // TEMP-MOCK
    max_companions: 1, // TEMP-MOCK
    qr_type: "group", // TEMP-MOCK
    price_per_hour: 25000, // TEMP-MOCK
    is_active: true, // TEMP-MOCK
    active_reservations_count: 1, // TEMP-MOCK
    past_reservations_count: 1, // TEMP-MOCK
  }, // TEMP-MOCK
  { // TEMP-MOCK
    id: 5, // TEMP-MOCK
    name: "Cancha de pádel", // TEMP-MOCK
    category_id: 1, // TEMP-MOCK
    category_name: "Canchas", // TEMP-MOCK
    capacity: 4, // TEMP-MOCK
    max_companions: 2, // TEMP-MOCK
    qr_type: "group", // TEMP-MOCK
    price_per_hour: 38000, // TEMP-MOCK
    is_active: true, // TEMP-MOCK
    active_reservations_count: 0, // TEMP-MOCK
    past_reservations_count: 0, // TEMP-MOCK
  }, // TEMP-MOCK
]; // TEMP-MOCK

let mockServiceState = [...MOCK_SERVICES]; // TEMP-MOCK

export function getMockServices() { // TEMP-MOCK
  const mode = process.env.NEXT_PUBLIC_USE_MOCK?.trim().toLowerCase(); // TEMP-MOCK

  if (mode === "empty") { // TEMP-MOCK
    return []; // TEMP-MOCK
  } // TEMP-MOCK

  if (mode === "error") { // TEMP-MOCK
    throw new Error("No se pudo cargar la lista de servicios."); // TEMP-MOCK
  } // TEMP-MOCK

  return mockServiceState.map((service) => ({ ...service })); // TEMP-MOCK
} // TEMP-MOCK

export function createMockService(payload: { // TEMP-MOCK
  name: string; // TEMP-MOCK
  category_id: number; // TEMP-MOCK
  capacity: number; // TEMP-MOCK
  max_companions?: number; // TEMP-MOCK
  qr_type: "group" | "individual"; // TEMP-MOCK
  price_per_hour: number; // TEMP-MOCK
  is_active?: boolean; // TEMP-MOCK
}): (typeof MOCK_SERVICES)[number] { // TEMP-MOCK
  const trimmedName = payload.name.trim(); // TEMP-MOCK
  const nextId = mockServiceState.length > 0 ? Math.max(...mockServiceState.map((service) => service.id)) + 1 : 1; // TEMP-MOCK
  const category = MOCK_SERVICE_CATEGORIES.find((item) => item.id === payload.category_id); // TEMP-MOCK

  const nextService = { // TEMP-MOCK
    id: nextId, // TEMP-MOCK
    name: trimmedName, // TEMP-MOCK
    category_id: payload.category_id, // TEMP-MOCK
    category_name: category?.name ?? "Sin categoría", // TEMP-MOCK
    capacity: payload.capacity, // TEMP-MOCK
    max_companions: payload.max_companions ?? 0, // TEMP-MOCK
    qr_type: payload.qr_type, // TEMP-MOCK
    price_per_hour: payload.price_per_hour, // TEMP-MOCK
    is_active: payload.is_active ?? true, // TEMP-MOCK
    active_reservations_count: 0, // TEMP-MOCK
    past_reservations_count: 0, // TEMP-MOCK
  }; // TEMP-MOCK

  mockServiceState = [nextService, ...mockServiceState]; // TEMP-MOCK
  return { ...nextService }; // TEMP-MOCK
} // TEMP-MOCK

export function updateMockService( // TEMP-MOCK
  id: number, // TEMP-MOCK
  payload: Partial<(typeof MOCK_SERVICES)[number]>, // TEMP-MOCK
): (typeof MOCK_SERVICES)[number] | null { // TEMP-MOCK
  let updatedService: (typeof MOCK_SERVICES)[number] | null = null; // TEMP-MOCK

  mockServiceState = mockServiceState.map((service) => { // TEMP-MOCK
    if (service.id !== id) { // TEMP-MOCK
      return service; // TEMP-MOCK
    } // TEMP-MOCK

    const category = MOCK_SERVICE_CATEGORIES.find((item) => item.id === (payload.category_id ?? service.category_id)); // TEMP-MOCK

    updatedService = { // TEMP-MOCK
      ...service, // TEMP-MOCK
      ...payload, // TEMP-MOCK
      name: payload.name?.trim() || service.name, // TEMP-MOCK
      category_name: category?.name ?? service.category_name, // TEMP-MOCK
    }; // TEMP-MOCK

    return updatedService; // TEMP-MOCK
  }); // TEMP-MOCK

  return updatedService; // TEMP-MOCK
} // TEMP-MOCK

export function toggleMockService(id: number): (typeof MOCK_SERVICES)[number] | null { // TEMP-MOCK
  const current = mockServiceState.find((service) => service.id === id); // TEMP-MOCK

  if (!current) { // TEMP-MOCK
    return null; // TEMP-MOCK
  } // TEMP-MOCK

  return updateMockService(id, { is_active: !current.is_active }); // TEMP-MOCK
} // TEMP-MOCK

export function deleteMockService(id: number): boolean { // TEMP-MOCK
  const previousLength = mockServiceState.length; // TEMP-MOCK
  mockServiceState = mockServiceState.filter((service) => service.id !== id); // TEMP-MOCK
  return mockServiceState.length !== previousLength; // TEMP-MOCK
} // TEMP-MOCK

export const MOCK_TIME_SLOTS: Array<{ // TEMP-MOCK
  id: number; // TEMP-MOCK
  service_id: number; // TEMP-MOCK
  start_time: string; // TEMP-MOCK
  end_time: string; // TEMP-MOCK
  is_active?: boolean; // TEMP-MOCK
  active_reservations_count?: number; // TEMP-MOCK
}> = [ // TEMP-MOCK
  { id: 1, service_id: 1, start_time: "08:00", end_time: "09:00", is_active: true, active_reservations_count: 2 }, // TEMP-MOCK
  { id: 2, service_id: 1, start_time: "09:00", end_time: "10:00", is_active: false, active_reservations_count: 1 }, // TEMP-MOCK
  { id: 3, service_id: 1, start_time: "10:00", end_time: "11:00", is_active: true, active_reservations_count: 0 }, // TEMP-MOCK
  { id: 4, service_id: 2, start_time: "07:00", end_time: "09:00", is_active: false, active_reservations_count: 3 }, // TEMP-MOCK
  { id: 5, service_id: 2, start_time: "09:00", end_time: "11:00", is_active: true, active_reservations_count: 0 }, // TEMP-MOCK
]; // TEMP-MOCK

let mockTimeSlotState = [...MOCK_TIME_SLOTS]; // TEMP-MOCK

export function getMockTimeSlots(serviceId?: number) { // TEMP-MOCK
  const mode = process.env.NEXT_PUBLIC_USE_MOCK?.trim().toLowerCase(); // TEMP-MOCK

  if (mode === "empty") { // TEMP-MOCK
    return []; // TEMP-MOCK
  } // TEMP-MOCK

  if (mode === "error") { // TEMP-MOCK
    throw new Error("No se pudo cargar la lista de franjas horarias."); // TEMP-MOCK
  } // TEMP-MOCK

  const timeSlots = serviceId === undefined ? mockTimeSlotState : mockTimeSlotState.filter((slot) => slot.service_id === serviceId); // TEMP-MOCK
  return timeSlots.map((slot) => ({ ...slot })); // TEMP-MOCK
} // TEMP-MOCK

export function createMockTimeSlot(payload: { // TEMP-MOCK
  service_id: number; // TEMP-MOCK
  start_time: string; // TEMP-MOCK
  end_time: string; // TEMP-MOCK
}): (typeof MOCK_TIME_SLOTS)[number] { // TEMP-MOCK
  const nextId = mockTimeSlotState.length > 0 ? Math.max(...mockTimeSlotState.map((slot) => slot.id)) + 1 : 1; // TEMP-MOCK

  const nextSlot = { // TEMP-MOCK
    id: nextId, // TEMP-MOCK
    service_id: payload.service_id, // TEMP-MOCK
    start_time: payload.start_time, // TEMP-MOCK
    end_time: payload.end_time, // TEMP-MOCK
    is_active: true, // TEMP-MOCK
    active_reservations_count: 0, // TEMP-MOCK
  }; // TEMP-MOCK

  mockTimeSlotState = [nextSlot, ...mockTimeSlotState]; // TEMP-MOCK
  return { ...nextSlot }; // TEMP-MOCK
} // TEMP-MOCK

export function updateMockTimeSlot( // TEMP-MOCK
  id: number, // TEMP-MOCK
  payload: Partial<(typeof MOCK_TIME_SLOTS)[number]>, // TEMP-MOCK
): (typeof MOCK_TIME_SLOTS)[number] | null { // TEMP-MOCK
  let updatedSlot: (typeof MOCK_TIME_SLOTS)[number] | null = null; // TEMP-MOCK

  mockTimeSlotState = mockTimeSlotState.map((slot) => { // TEMP-MOCK
    if (slot.id !== id) { // TEMP-MOCK
      return slot; // TEMP-MOCK
    } // TEMP-MOCK

    updatedSlot = { // TEMP-MOCK
      ...slot, // TEMP-MOCK
      ...payload, // TEMP-MOCK
      start_time: payload.start_time ?? slot.start_time, // TEMP-MOCK
      end_time: payload.end_time ?? slot.end_time, // TEMP-MOCK
    }; // TEMP-MOCK

    return updatedSlot; // TEMP-MOCK
  }); // TEMP-MOCK

  return updatedSlot; // TEMP-MOCK
} // TEMP-MOCK

export function deleteMockTimeSlot(id: number): boolean { // TEMP-MOCK
  const previousLength = mockTimeSlotState.length; // TEMP-MOCK
  mockTimeSlotState = mockTimeSlotState.filter((slot) => slot.id !== id); // TEMP-MOCK
  return mockTimeSlotState.length !== previousLength; // TEMP-MOCK
} // TEMP-MOCK
