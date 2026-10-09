# Guía de Implementación para Backend — Dashboard Admin

Este documento describe los contratos, endpoints y consideraciones técnicas requeridas por el frontend del Dashboard Admin (`/admin`), adaptado a los tipos existentes en `src/types/api.ts` y `src/types/database.ts`.

---

## 1. Endpoints requeridos y formato de respuesta

Todas las respuestas deben seguir el estándar `ApiResponse<T>` definido en `src/types/api.ts`:
```json
{
  "data": { ... }
}
```

Cada endpoint bajo `/api/admin/*` **debe validar obligatoriamente en el servidor que la sesión corresponda a un usuario con rol `admin`** (mediante cookies / token de Supabase) y retornar HTTP 401/403 en caso contrario.

---

### 1.1. `GET /api/admin/metrics`
Proporciona los KPIs principales, distribución de reservas y ocupación.

#### Forma esperada según contrato actual (`src/types/api.ts`):
```json
{
  "data": {
    "total_reservations": 342,
    "total_revenue": 4250000,
    "entries": {
      "granted": 140,
      "denied": 16
    },
    "by_status": {
      "confirmed": 128,
      "pending": 42,
      "completed": 136,
      "expired": 24,
      "failed": 12
    },
    "by_service": [
      {
        "service_id": 1,
        "name": "Cancha sintética 5v5 #1",
        "count": 45,
        "revenue": 1200000
      }
    ],
    // --- Campos opcionales (propuesta de extensión) ---
    "occupancy": 78,
    "daily_reservations": [
      { "date": "2026-10-12", "total": 12 },
      { "date": "2026-10-13", "total": 25 },
      { "date": "2026-10-14", "total": 18 },
      { "date": "2026-10-15", "total": 35 },
      { "date": "2026-10-16", "total": 30 },
      { "date": "2026-10-17", "total": 48 },
      { "date": "2026-10-18", "total": 42 }
    ],
    "service_occupancy": [
      { "id": 1, "name": "Cancha sintética 5v5 #1", "occupancy": 92 },
      { "id": 2, "name": "Cancha sintética 5v5 #2", "occupancy": 87 }
    ]
  }
}
```

---

### 1.2. `GET /api/admin/reservations?limit=5`
Retorna las últimas reservas realizadas en el sistema (máximo 5).

#### Forma esperada:
```json
{
  "data": [
    {
      "id": 1,
      "clientName": "Laura Martínez",
      "serviceName": "Cancha 5v5 #1",
      "date": "Vie 15 Oct",
      "timeRange": "18:00 - 19:00",
      "status": "confirmed",
      // --- Campo opcional (propuesta) ---
      "clientDocumentLast4": "2481"
    }
  ]
}
```

---

### 1.3. `GET /api/admin/access-logs?limit=5`
Retorna los últimos registros de acceso escaneados en torniquetes o recepción (máximo 5).

#### Forma esperada:
```json
{
  "data": [
    {
      "id": 1,
      "personName": "Laura Martínez",
      "serviceName": "Cancha 5v5 #1",
      "accessedAt": "17:54",
      "result": "granted",
      // --- Campo opcional (propuesta) ---
      "employeeName": "Empleado 01"
    }
  ]
}
```

---

## 2. Tabla de cambios pendientes de backend

| Endpoint o Archivo afectado | Cambio necesario | Motivo | Estado en Frontend |
| :--- | :--- | :--- | :--- |
| `GET /api/admin/metrics` (`AdminMetrics`) | Agregar campo `occupancy: number` (0–100) *(Propuesta)* | La tarjeta KPI "Ocupación hoy" requiere el porcentaje general del día. No existe en `src/types/api.ts`. | Opcional. Si no llega, muestra `"—"`. |
| `GET /api/admin/metrics` (`AdminMetrics`) | Agregar serie `daily_reservations: { date: string, total: number }[]` *(Propuesta)* | El gráfico de área "Reservas por día" requiere los últimos 7 días. No existe en `src/types/api.ts`. | Opcional. Si no llega, muestra estado vacío ("No hay reservas en los últimos 7 días"). |
| `GET /api/admin/metrics` (`AdminMetrics`) | Agregar `service_occupancy: { id: number, name: string, occupancy: number }[]` *(Propuesta)* | La lista "Ocupación por servicio" requiere el porcentaje por servicio. `by_service` solo provee `count` y `revenue`. | Opcional. Si no llega, muestra estado vacío ("No hay servicios para mostrar"). |
| `GET /api/admin/reservations` | Incluir `clientDocumentLast4?: string` *(Propuesta)* | En el diseño de Figma se muestra `CC •••• XXXX` bajo el nombre del cliente. | Opcional. Si no llega, no muestra la línea de documento. |
| `GET /api/admin/access-logs` | Incluir `employeeName?: string` *(Propuesta)* | En el diseño de Figma la tabla de accesos tiene la columna "EMPLEADO". | Opcional. Si no llega, la celda muestra `" — "`. |
| `GET /api/admin/metrics` o `/api/admin/counts` | Endpoint o campos de conteo total de categorías, servicios y empleados activos *(Propuesta)* | La sección "Gestión rápida" en Figma muestra conteos (ej: "4 categorías", "11 servicios"). | Actualmente muestra textos genéricos fijos sin números. |
| `./middleware.ts` | Mover a `src/middleware.ts` *(Propuesta de infraestructura)* | Next.js no ejecuta `middleware.ts` en la raíz cuando el proyecto tiene directorio `src/`. | Dejado como está por regla estricta. |

---

## 3. Comportamiento del frontend ante campos opcionales

### A. `occupancy` (KPI)
- **JSON con campo:** `"occupancy": 78` &rarr; Muestra `78%`.
- **JSON sin campo:** `undefined` &rarr; Muestra `—`.

### B. `daily_reservations` (Gráfico de área)
- **JSON con campo:** `[{ "date": "2026-10-12", "total": 12 }, ...]` &rarr; Grafica la curva con las iniciales `L M M J V S D`.
- **JSON sin campo:** `undefined` o `[]` &rarr; Renderiza mensaje: *"No hay reservas en los últimos 7 días."*

### C. `service_occupancy` (Lista de barras)
- **JSON con campo:** `[{ "id": 1, "name": "Cancha 5v5", "occupancy": 85 }]` &rarr; Renderiza barras de progreso.
- **JSON sin campo:** `undefined` o `[]` &rarr; Renderiza mensaje: *"No hay servicios para mostrar."*

### D. `clientDocumentLast4` (Tabla de reservas)
- **JSON con campo:** `"clientDocumentLast4": "2481"` &rarr; Muestra debajo del nombre: `CC •••• 2481`.
- **JSON sin campo:** `undefined` &rarr; Solo muestra el nombre del cliente sin salto adicional.

### E. `employeeName` (Tabla de accesos)
- **JSON con campo:** `"employeeName": "Empleado 01"` &rarr; Muestra el nombre en la columna Empleado.
- **JSON sin campo:** `undefined` &rarr; Muestra `—`.
