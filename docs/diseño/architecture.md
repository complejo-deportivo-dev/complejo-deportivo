# Arquitectura del Proyecto

Sistema de Reservas — Complejo Deportivo

---

## 📑 Tabla de Contenido

1. [Visión general y stack](#1-visión-general-y-stack)
2. [Diagrama de capas](#2-diagrama-de-capas)
3. [Estructura de carpetas](#3-estructura-de-carpetas)
4. [Server Components vs Client Components](#4-server-components-vs-client-components)
5. [Comunicación entre capas](#5-comunicación-entre-capas)
6. [Middleware y protección de rutas](#6-middleware-y-protección-de-rutas)
7. [Convenciones de código](#7-convenciones-de-código)
8. [Decisiones técnicas y justificación](#8-decisiones-técnicas-y-justificación)
9. [Reglas del equipo](#9-reglas-del-equipo)

---

## 1. Visión General y Stack

Aplicación web que gestiona el ciclo completo de reservas de un complejo deportivo: selección de servicio, bloqueo de franja horaria, pago en línea y control de acceso con QR digital.

**Zona horaria del sistema:** `America/Bogota` en todas las validaciones de fecha y hora.

### Stack

| Área                    | Tecnología                        |
| ----------------------- | --------------------------------- |
| Framework               | Next.js (App Router) + TypeScript |
| Base de datos           | Supabase (PostgreSQL)             |
| Autenticación           | Supabase Auth + Google OAuth      |
| Sesiones                | `@supabase/ssr`                   |
| Pagos                   | Stripe (modo prueba)              |
| Email                   | Resend                            |
| Estilos                 | Tailwind CSS                      |
| Deploy                  | Vercel                            |
| Fechas y zonas horarias | `date-fns-tz`                     |

---

## 2. Diagrama de Capas

```
┌─────────────────────────────────────────────────────┐
│                  CLIENTE (Browser)                  │
│         React Client Components + Tailwind          │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / fetch
┌────────────────────────▼────────────────────────────┐
│              NEXT.JS (Servidor / Vercel)             │
│                                                     │
│  ┌─────────────────┐     ┌───────────────────────┐  │
│  │ Server Components│     │    Route Handlers     │  │
│  │  (app/ pages)   │     │     (app/api/)        │  │
│  └────────┬────────┘     └──────────┬────────────┘  │
│           │                         │               │
└───────────┼─────────────────────────┼───────────────┘
            │                         │
     ┌──────▼──────┐         ┌────────▼────────────┐
     │  Supabase   │         │  Servicios externos │
     │ (DB + Auth) │         │  Stripe / Resend    │
     └─────────────┘         └─────────────────────┘
```

**Flujo de una reserva (ejemplo):**

```
Cliente selecciona franja
        ↓
POST /api/reservations
        ↓
Route Handler valida disponibilidad → Supabase
        ↓
Route Handler crea reserva pending + PaymentIntent → Supabase + Stripe
        ↓
Cliente completa el pago en Stripe
        ↓
Stripe envía webhook → POST /api/payments/webhook
        ↓
Webhook valida firma → confirma reserva → genera QR → envía correo
(→ Supabase + Resend)
```

> **Importante:** La generación del QR y el envío del correo solo ocurren en el webhook de Stripe cuando el pago es exitoso. Nunca al crear la reserva.

---

## 3. Estructura de Carpetas

```
src/
├── app/
│   ├── (auth)/              → Route group: login, registro, recuperación
│   ├── admin/               → Rutas exclusivas del Administrador
│   ├── client/              → Rutas del Cliente
│   ├── employee/            → Rutas del Empleado
│   ├── api/                 → Route Handlers
│   ├── unauthorized/
│   │   └── page.tsx         → Página pública de acceso denegado
│   └── page.tsx             → Home público (redirige según rol)
├── components/
│   ├── ui/
│   └── shared/
├── features/
│   ├── auth/
│   ├── reservations/
│   ├── payments/
│   └── qr/
├── services/
├── lib/
├── hooks/
├── types/
└── utils/
```

### Propósito de cada carpeta

#### `app/`

Rutas y páginas del sistema según la convención de App Router de Next.js.

| Carpeta     | Contenido                                   | Por qué existe                                                                                                                            |
| ----------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `(auth)/`   | Login, registro, recuperación de contraseña | Route group: la URL queda limpia (`/login`, no `/auth/login`). Se protege con un `layout.tsx` propio que redirige si ya hay sesión activa |
| `admin/`    | Panel de administración completo            | Ruta real: la URL es `/admin/*`, lo que permite al middleware detectar el rol y proteger                                                  |
| `client/`   | Catálogo, reservas, pago, mis reservas      | Ruta real: la URL es `/client/*`, protegida por middleware                                                                                |
| `employee/` | Vista de escaneo QR                         | Ruta real: la URL es `/employee/*`, protegida por middleware                                                                              |
| `api/`      | Route Handlers del backend                  | Toda la lógica de negocio e integraciones con Stripe y Resend viven aquí                                                                  |

#### `components/`

Componentes de UI reutilizables. **No contienen lógica de negocio.**

| Carpeta   | Contenido                                                                          |
| --------- | ---------------------------------------------------------------------------------- |
| `ui/`     | Elementos base: `Button`, `Input`, `Card`, `Badge`, `Modal`                        |
| `shared/` | Componentes más complejos reutilizables: `Navbar`, `ServiceCard`, `TimeSlotPicker` |

#### `features/`

Lógica de negocio agrupada por dominio funcional. Cada feature tiene sus propios componentes, hooks y utilidades específicas. No se mezclan responsabilidades entre features.

| Feature         | Contenido                                                              |
| --------------- | ---------------------------------------------------------------------- |
| `auth/`         | Formularios de login/registro, lógica de OAuth, validaciones de sesión |
| `reservations/` | Selección de franja, bloqueo temporal, consulta de disponibilidad      |
| `payments/`     | Integración con Stripe Elements, manejo de estados de pago             |
| `qr/`           | Generación de QR, lógica de escaneo y validación por empleado          |

#### `services/`

Funciones que se comunican con servicios externos. **Son la única capa que llama a Supabase, Stripe o Resend directamente.**

```
services/
├── supabase/
│   ├── reservations.ts
│   ├── services.ts
│   └── users.ts
├── stripe/
│   └── payments.ts
└── resend/
    └── emails.ts
```

> **Regla:** Si necesitas consultar la BD o llamar a un servicio externo, hazlo en `services/`, no directamente en un componente o Route Handler.

#### `lib/`

Configuración e inicialización de clientes. Solo se instancian una vez.

```
lib/
├── supabase/
│   ├── client.ts    → cliente Supabase para el browser
│   └── server.ts    → cliente Supabase para el servidor (con cookies)
└── stripe.ts        → cliente de Stripe
```

#### `hooks/`

Custom hooks de React. Solo para lógica reutilizable del lado del cliente.

```
hooks/
├── use-auth.ts
├── use-availability.ts
└── use-qr-scanner.ts
```

#### `types/`

Tipos TypeScript del proyecto. Definición centralizada de todas las entidades.

```
types/
├── database.ts    → tipos de tablas de Supabase
├── api.ts         → tipos de request y response de cada endpoint
└── index.ts       → re-exporta todo
```

#### `utils/`

Funciones puras sin dependencias externas. No llaman a ningún servicio.

```
utils/
├── dates.ts        → formateo de fechas con zona horaria Bogotá
├── validators.ts   → validaciones reutilizables
└── formatters.ts   → formateo de moneda, textos, etc.
```

---

## 4. Server Components vs Client Components

### Regla base

> **Todo es Server Component por defecto. Se agrega `"use client"` solo cuando es estrictamente necesario.**

### Cuándo usar cada uno

| Criterio                                            | Server Component | Client Component |
| --------------------------------------------------- | ---------------- | ---------------- |
| Consultar la base de datos                          | ✅               | ❌               |
| Acceder a variables de entorno privadas             | ✅               | ❌               |
| Renderizar contenido estático o datos iniciales     | ✅               | ❌               |
| Usar `useState` o `useEffect`                       | ❌               | ✅               |
| Manejar eventos del usuario (onClick, onChange)     | ❌               | ✅               |
| Acceder a APIs del navegador (cámara, localStorage) | ❌               | ✅               |

### Ejemplos

```tsx
// Server Component — consulta la BD directamente
// app/client/services/page.tsx
import { getServices } from "@/services/supabase/services";

export default async function ServicesPage() {
  const services = await getServices();
  return <ServiceList services={services} />;
}
```

```tsx
// Client Component — maneja interacción del usuario
// features/reservations/TimeSlotPicker.tsx
'use client'

import { useState } from 'react'

export function TimeSlotPicker({ slots }) {
  const [selected, setSelected] = useState(null)
  return ( /* UI interactiva */ )
}
```

```tsx
// Patrón correcto: Server Component wrappea Client Component
// app/client/services/[id]/page.tsx
import { getServiceById } from "@/services/supabase/services";
import { TimeSlotPicker } from "@/features/reservations/TimeSlotPicker";

export default async function ServiceDetailPage({ params }) {
  const service = await getServiceById(params.id); // consulta en servidor
  return <TimeSlotPicker slots={service.slots} />; // interactividad en cliente
}
```

---

## 5. Comunicación entre Capas

### Server Components → Supabase

Los Server Components consultan la BD directamente usando el cliente de servidor. No pasan por un endpoint.

```ts
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } },
  );
}
```

### Client Components → Route Handlers

Los Client Components **nunca** llaman a Supabase directamente. Hacen fetch a los Route Handlers.

```ts
const response = await fetch("/api/reservations", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ service_id, time_slot_id }),
});
const data = await response.json();
```

### Route Handlers → Stripe / Resend / Supabase

```ts
// app/api/reservations/route.ts
import { createClient } from "@/lib/supabase/server";
import { createReservation } from "@/services/supabase/reservations";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const reservation = await createReservation(body);
    return Response.json({ data: reservation }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reservations]", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
```

### Formato estándar de respuesta de API

Todas las respuestas siguen este formato:

```ts
// Éxito
Response.json({ data: { ... } }, { status: 200 | 201 })

// Error
Response.json({ error: 'Descripción del error' }, { status: 400 | 401 | 403 | 404 | 500 })
```

---

## 6. Middleware y Protección de Rutas

El middleware corre antes de cada request. Valida la sesión y redirige según el rol.

### Lógica de protección

| Ruta                                      | Rol requerido                  | Sin sesión o rol incorrecto                                                                    |
| ----------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `/`                                       | Público                        | Redirige a `/login` o a la home del rol según sesión                                           |
| `/login`, `/register`, `/forgot-password` | Sin sesión                     | Protegido por `layout.tsx` del route group `(auth)` — redirige a home del rol si ya hay sesión |
| `/client/*`                               | `client`                       | Redirige a `/unauthorized`                                                                     |
| `/admin/*`                                | `admin`                        | Redirige a `/unauthorized`                                                                     |
| `/employee/*`                             | `employee`                     | Redirige a `/unauthorized`                                                                     |
| `/unauthorized`                           | Público                        | —                                                                                              |
| `/api/*`                                  | Validado en cada Route Handler | `401`                                                                                          |

### Estructura del middleware

```ts
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createServerClient(/* config con cookies */);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && user?.app_metadata?.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/client") && user?.app_metadata?.role !== "client") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (
    pathname.startsWith("/employee") &&
    user?.app_metadata?.role !== "employee"
  ) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/client/:path*", "/employee/:path*"],
};
```

> **Nota — `app_metadata` vs `user_metadata`:** El rol se lee desde `app_metadata`, no desde `user_metadata`. `user_metadata` es editable por el usuario desde el cliente y permite escalar privilegios. `app_metadata` solo es modificable desde el servidor con `service_role`.

> **Excepción — rutas de autenticación** (`/login`, `/register`, `/forgot-password`): Estas rutas viven en el route group `(auth)/` y no se protegen con middleware, porque el route group no aparece en la URL y el middleware no puede detectarlas por pathname. En su lugar, se protegen con un `layout.tsx` propio dentro de `(auth)/` que valida: si ya hay sesión activa, redirige a la home del rol correspondiente.

> **Regla:** protección por rol → middleware (`admin/client/employee`). Protección por sesión → `layout.tsx` del grupo `(auth)`.

> **Nota:** El middleware es la primera capa de seguridad. Cada Route Handler debe validar autenticación también (defensa en profundidad).

---

## 7. Convenciones de Código

### Nombres de archivos

| Tipo               | Convención          | Ejemplo                         |
| ------------------ | ------------------- | ------------------------------- |
| Archivos generales | `kebab-case`        | `time-slot-picker.tsx`          |
| Componentes React  | `PascalCase`        | `TimeSlotPicker.tsx`            |
| Route Handlers     | `route.ts`          | `app/api/reservations/route.ts` |
| Layouts            | `layout.tsx`        | `app/client/layout.tsx`         |
| Páginas            | `page.tsx`          | `app/client/services/page.tsx`  |
| Hooks              | `use-kebab-case.ts` | `use-availability.ts`           |

### Manejo de errores

```ts
// En servicios: lanzar el error
export async function createReservation(data) {
  const { data: reservation, error } = await supabase
    .from("reservations")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(`Error creando reserva: ${error.message}`);
  return reservation;
}

// En Route Handlers: capturar y responder
export async function POST(request: Request) {
  try {
    const reservation = await createReservation(body);
    return Response.json({ data: reservation }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/reservations]", error);
    return Response.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
```

### Variables de entorno

```ts
// Correcto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Incorrecto — nunca hardcodear claves
const supabaseUrl = "https://xxxx.supabase.co";
```

- `NEXT_PUBLIC_*` → accesibles en cliente y servidor
- Sin prefijo → **solo servidor**
- `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` → **nunca en Client Components**

### Zona horaria

```ts
// Correcto — usar date-fns-tz
import { formatInTimeZone } from "date-fns-tz";

const ahora = formatInTimeZone(
  new Date(),
  "America/Bogota",
  "yyyy-MM-dd HH:mm:ss",
);

// Incorrecto — toLocaleString no es confiable para comparaciones
const ahoraMal = new Date().toLocaleString("en-US", {
  timeZone: "America/Bogota",
});
```

> **Regla:** En la BD, todas las columnas de fecha/hora usan `timestamptz`. Postgres almacena en UTC y convierte a `America/Bogota` con `SET timezone`. En JS, usar `date-fns-tz` para formatear. Nunca usar `new Date().toLocaleString()` para comparaciones.

> **Comparaciones de fechas:** `formatInTimeZone` devuelve un string, no permite comparar con `>` o `<`. Para comparaciones en JS, usar `fromZonedTime()` de `date-fns-tz` para convertir a `Date` con zona horaria. Preferiblemente, delegar las comparaciones directamente a Postgres con `NOW() AT TIME ZONE 'America/Bogota'`. No comparar strings de fechas.

---

## 8. Decisiones Técnicas y Justificación

| #   | Decisión                                           | Justificación                                                                                                    |
| --- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | **App Router** de Next.js                          | Estándar actual. Permite Server Components, layouts anidados y Route Handlers en un solo proyecto                |
| 2   | **Server Components por defecto**                  | Menos JavaScript en el cliente, mejor rendimiento, acceso directo a la BD sin exponer claves                     |
| 3   | **Route Handlers para la API** (no Server Actions) | Stripe requiere webhooks HTTP reales. Los Server Actions no pueden recibir eventos externos de Stripe            |
| 4   | **Middleware para protección de rutas**            | Capa de seguridad centralizada. Evita proteger cada página individualmente                                       |
| 5   | **Supabase Auth**                                  | Maneja email/password, Google OAuth, JWT y recuperación de contraseña sin código adicional                       |
| 6   | **`@supabase/ssr`**                                | Manejo correcto de sesiones con cookies en Next.js App Router. Es el cliente oficial para este contexto          |
| 7   | **Dos clientes de Supabase** (browser/server)      | El cliente de browser usa cookies del navegador. El de servidor lee cookies del request. Son contextos distintos |
| 8   | **Tailwind CSS**                                   | Estilos utilitarios sin archivos CSS separados. Compatible con Server y Client Components                        |
| 9   | **Vercel**                                         | Deploy optimizado para Next.js. Preview deployments por rama y variables de entorno por ambiente                 |

---

## 9. Reglas del Equipo

### No hacer sin consultar al Tech Lead

- Cambiar la estructura de carpetas definida en este documento
- Mover rutas fuera de `admin/`, `client/`, `employee/`. El middleware depende de esos prefijos para proteger por rol
- Agregar una librería que no esté en `docs/diseño/integraciones.md`
- Crear un cliente de Supabase fuera de `lib/supabase/`
- Usar `SUPABASE_SERVICE_ROLE_KEY` en un Client Component o en código accesible al browser
- Modificar el middleware
- Hacer push directo a `main` o `develop`
- Alterar el esquema de la BD después de que fue aprobado en Fase 1
- Cambiar el formato de respuesta de API definido en este documento

### Sí hacer siempre

- Crear componentes en `components/ui/` o `components/shared/` si son reutilizables
- Manejar todos los errores con try/catch en Route Handlers y servicios
- Validar autenticación en cada Route Handler (aunque el middleware ya lo haga)
- Usar `types/` para definir interfaces, nunca inline en los componentes
- Preguntar en `#bloqueos` de Discord antes de tomar cualquier decisión de arquitectura

### Recordar siempre

- Toda validación de fecha/hora usa `America/Bogota` en el servidor
- Las claves privadas nunca llegan al cliente
- El archivo `.env.local` nunca se sube al repo

---

_Última actualización: Septiembre 2026_
