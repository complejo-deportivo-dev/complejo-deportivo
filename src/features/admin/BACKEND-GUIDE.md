# Guía de Implementación para Backend — Dashboard Admin

Este documento explica qué consume el Dashboard Admin (`/admin`) de los endpoints del backend, qué ya está cubierto por el diseño de la API y qué se **propone** agregar para que el dashboard funcione completo.

**Fuentes de verdad:** `docs/diseño/api.md` (sección 3.6, Admin) y los tipos de `src/types/api.ts` y `src/types/database.ts`. Si este documento y el diseño difieren, manda el diseño, salvo que el equipo decida ampliarlo.

**Cómo leer las etiquetas**

| Etiqueta | Significado |
| :--- | :--- |
| **Definido** | Ya está en el diseño de la API. El frontend lo usa tal cual. |
| **Propuesta** | No está en el diseño. Se sugiere agregarlo. Se puede ajustar. |
| **Por decidir** | Depende de una decisión del equipo (Tech Lead o cliente). |

---

## 1. Reglas generales

- Todas las respuestas exitosas van envueltas en `{ "data": ... }` (`ApiResponse<T>`). Los errores usan `{ "error": "mensaje" }`.
- Cada endpoint bajo `/api/admin/*` **debe verificar en el servidor que la sesión sea de un usuario con rol `admin`**. Sin sesión responde `401` y con otro rol responde `403`. El dashboard no puede garantizar esto por sí mismo: solo muestra lo que el servidor le entrega.
- Los IDs de servicios, categorías, franjas, reservas, accesos y QR son números. Los IDs de usuarios y empleados son UUID (texto).

---

## 2. Endpoints que consume el dashboard

El dashboard hace las 3 peticiones en paralelo con `Promise.all`.

### 2.1. `GET /api/admin/metrics`

Alimenta los KPIs, la dona de estados, el gráfico por día y la ocupación por servicio.

**Query (Definido):** `from` y `to` opcionales (`YYYY-MM-DD`), aplicados sobre `reservation_date`. Error `400` si el rango es inválido.

**Respuesta (Definido en el diseño y en `api.ts`):**

```json
{
  "data": {
    "total_reservations": 342,
    "total_revenue": 4250000,
    "entries": { "granted": 150, "denied": 6 },
    "by_status": {
      "confirmed": 128,
      "pending": 42,
      "completed": 136,
      "expired": 24,
      "failed": 12
    },
    "by_service": [
      { "service_id": 1, "name": "Cancha sintética 5v5 #1", "count": 45, "revenue": 1200000 }
    ]
  }
}
```

- `total_revenue` suma solo los pagos con estado `succeeded`.
- `entries` cuenta los accesos `granted` y `denied` de `access_logs`.
- La forma exacta de `by_status` (objeto como arriba o lista) es la que defina `src/types/api.ts`. El ejemplo sigue ese archivo.

**Campos propuestos (Propuesta):**

```json
{
  "data": {
    "occupancy": 78,
    "daily_reservations": [
      { "date": "2026-10-12", "total": 12 },
      { "date": "2026-10-13", "total": 25 }
    ],
    "service_occupancy": [
      { "id": 1, "name": "Cancha sintética 5v5 #1", "occupancy": 92 }
    ],
    "counts": { "categories": 4, "services": 11, "employees": 3 }
  }
}
```

| Campo | Qué es | Cómo calcularlo (propuesta) |
| :--- | :--- | :--- |
| `occupancy` | Porcentaje general de ocupación, 0 a 100 | Suma de unidades ocupadas de todos los servicios entre suma de unidades disponibles, en el rango consultado |
| `service_occupancy` | Porcentaje de ocupación por servicio, 0 a 100 | Ver fórmula en la sección 3 |
| `daily_reservations` | Reservas por día de los últimos 7 días | Contar reservas agrupadas por `reservation_date`, con el mismo criterio que `total_reservations` |
| `counts` | Totales para las tarjetas de Gestión rápida | Categorías, servicios y empleados activos |

**Rango por defecto (Por decidir).** El diseño dice que el rango por defecto de `/metrics` está por confirmar, y la tarea de backend propone los últimos 7 días. Los KPIs del dashboard dicen "hoy". Opciones:
1. El dashboard pide `from` y `to` iguales al día actual para los KPIs.
2. Se mantienen los 7 días y las etiquetas cambian a "últimos 7 días".

### 2.2. `GET /api/admin/reservations`

Alimenta la tabla "Últimas reservas".

**Query (Definido):** `date`, `status`, `service_id`, `user_id`. Todos opcionales.

**Respuesta (Definido en el diseño):**

```json
{
  "data": [
    {
      "reservation_id": 2481,
      "user": { "id": "uuid-del-usuario", "name": "Laura Martínez", "email": "laura@correo.com" },
      "service": { "id": 1, "name": "Cancha sintética 5v5 #1" },
      "reservation_date": "2026-10-15",
      "slots": [
        { "time_slot_id": 12, "time_start": "18:00", "time_end": "19:00" }
      ],
      "status": "confirmed",
      "quantity": 1
    }
  ]
}
```

- El rango de horas que muestra el dashboard va desde `time_start` de la primera franja hasta `time_end` de la última.

**Propuestas:**
- `limit` (entero, por ejemplo `?limit=5`) y orden del más reciente al más antiguo. El diseño no define ninguno de los dos, y sin `limit` el endpoint devolvería todas las reservas del sistema. Se propone ordenar por `created_at` descendente.
- `user.document_last4`: últimos 4 dígitos de la cédula (`users.number_document`), **ya enmascarados por el servidor**. No se debe enviar la cédula completa al navegador.

### 2.3. `GET /api/admin/access-logs`

Alimenta la tabla "Últimos accesos validados".

**Query (Definido):** `date`, `employee_id`, `result` (`granted` o `denied`). Todos opcionales.

**Respuesta (Definido en el diseño):**

```json
{
  "data": [
    {
      "id": 310,
      "reservation_id": 2481,
      "employee": { "id": "uuid-del-empleado", "name": "Empleado 01" },
      "qr_code_id": 905,
      "result": "granted",
      "scanned_at": "2026-10-15T17:54:00Z"
    }
  ]
}
```

- El empleado ya viene incluido (`employee.name`). La hora que muestra el dashboard sale de `scanned_at`.
- La tarea de backend menciona un campo `entry_type` que el diseño no lista. Si se agrega, avisar para mostrarlo.

**Propuestas:**
- `limit` y orden del más reciente al más antiguo (`scanned_at` descendente), por el mismo motivo que en reservas.
- Cliente y servicio de cada acceso. Figma muestra las columnas CLIENTE y SERVICIO, pero el registro solo trae `reservation_id`. Se propone incluir la reserva con sus datos básicos:

```json
{
  "reservation": {
    "user": { "name": "Laura Martínez" },
    "service": { "name": "Cancha sintética 5v5 #1" }
  }
}
```

---

## 3. Propuesta de cálculo de ocupación

El diseño ya define cuándo una franja está ocupada (sección 3.2, disponibilidad): reservas de esa fecha en estado `confirmed` o `completed`, o `pending` con `expires_at` en el futuro. Con esa misma regla se propone:

Para cada servicio, dentro del rango consultado:

- **Servicio `group`** (un QR para el grupo, una reserva ocupa la franja completa):
  - Unidades disponibles = cantidad de franjas del servicio × número de días del rango
  - Unidades ocupadas = cantidad de reservas que ocupan una franja
- **Servicio `individual`** (un QR por persona, usa `capacity` y `quantity`):
  - Unidades disponibles = cantidad de franjas × número de días × `capacity`
  - Unidades ocupadas = suma de `quantity` de las reservas

`occupancy` del servicio = `ocupadas / disponibles × 100`, redondeado a entero. La ocupación general es la suma de ocupadas entre la suma de disponibles de todos los servicios activos.

Esta regla es una propuesta que se puede simplificar. Si el equipo prefiere otra forma de medirlo, el dashboard solo necesita un número de 0 a 100 por servicio y uno general.

---

## 4. Resumen de pendientes

| Qué necesita el dashboard | Qué dice el diseño actual | Qué se propone | Estado |
| :--- | :--- | :--- | :--- |
| Solo las últimas 5 reservas y accesos | Sin `limit` ni orden | `limit` y orden descendente en reservas y accesos | Propuesta |
| Cliente y servicio en cada acceso | El acceso trae `reservation_id`, sin datos del cliente ni del servicio | Incluir `reservation.user.name` y `reservation.service.name` | Propuesta |
| KPIs que digan "hoy" | Rango por defecto de `/metrics` por confirmar | `from` y `to` del día actual, o relabel a "últimos 7 días" | Por decidir |
| KPI de ocupación | No existe | `occupancy` en `/metrics` | Propuesta |
| Gráfico de reservas por día | No existe | `daily_reservations` en `/metrics` | Propuesta |
| Ocupación por servicio | `by_service` solo trae `count` y `revenue` | `service_occupancy` en `/metrics` | Propuesta |
| Últimos 4 dígitos del documento del cliente | La reserva trae `user.id`, `name` y `email` | `user.document_last4`, enmascarado en el servidor | Propuesta, por decidir si se muestra |
| Conteos de Gestión rápida | No existen | `counts` en `/metrics` | Propuesta |
| Campo `entry_type` en accesos | Está en la tarea de backend, no en el diseño | Confirmar si se agrega | Por decidir |

---

## 5. Comportamiento del frontend ante campos opcionales

Todo lo marcado como **Propuesta** es opcional en el frontend. Si no llega, el dashboard no falla:

| Campo | Si llega | Si no llega |
| :--- | :--- | :--- |
| `occupancy` | Muestra el porcentaje (por ejemplo `78%`) | Muestra `—` |
| `daily_reservations` | Dibuja el gráfico de área con las iniciales L M M J V S D | Muestra "No hay reservas en los últimos 7 días." |
| `service_occupancy` | Muestra una barra de progreso por servicio | Muestra "No hay servicios para mostrar." |
| `counts` | Muestra el número en cada tarjeta de Gestión rápida | Muestra un texto fijo sin número |
| `user.document_last4` | Muestra `CC •••• 2481` bajo el nombre del cliente | No muestra esa línea |
| `reservation` (en accesos) | Muestra cliente y servicio | Muestra `—` en esas dos columnas |
| `limit` | Trae solo los registros pedidos | El dashboard recorta a 5 en el frontend como protección |

---

## 6. Nota de infraestructura

`middleware.ts` está en la raíz del proyecto. Cuando el proyecto usa la carpeta `src/`, Next.js espera `src/middleware.ts`, así que es posible que la ruta `/admin` no esté protegida por rol. No se modifica en este PR. Mientras tanto, la protección real de los datos recae en que cada endpoint `/api/admin/*` valide el rol `admin` en el servidor.