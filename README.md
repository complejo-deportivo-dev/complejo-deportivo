# Sistema de Reservas — Complejo Deportivo

Aplicación web para gestionar el ciclo completo de reservas de un complejo deportivo: reserva de instalaciones, pago en línea y control de acceso digital mediante código QR.

---

## 📑 Tabla de Contenido

1. [Descripción general](#1-descripción-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Roles del sistema](#3-roles-del-sistema)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Setup local](#5-setup-local)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Base de datos](#7-base-de-datos)
8. [Documentación técnica](#8-documentación-técnica)
9. [Flujo de trabajo del equipo](#9-flujo-de-trabajo-del-equipo)

---

## 1. Descripción General

El sistema reemplaza el proceso manual de reservas (llamadas, WhatsApp, cuadernos) con una plataforma centralizada accesible desde el celular.

**Funcionalidades core:**
- Reserva de instalaciones por franja horaria con bloqueo temporal
- Pago en línea con Stripe (modo prueba)
- Confirmación por correo con código QR de acceso
- Validación de QR por empleados desde el celular (sin hardware adicional)
- Panel de administración con métricas

**Zona horaria:** `America/Bogota`

---

## 2. Stack Tecnológico

| Área | Tecnología |
|------|------------|
| Framework | Next.js (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth + Google OAuth |
| Pagos | Stripe (modo prueba) |
| Email | Resend |
| QR | `qrcode` (npm) |
| Estilos | Tailwind CSS |
| Deploy | Vercel |
| Control de versiones | GitHub |
| Gestión de tareas | Trello |
| Comunicación | Discord |

---

## 3. Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| **Administrador** | Gestiona categorías, servicios, horarios, empleados y métricas |
| **Cliente** | Se registra, reserva, paga y recibe QR de acceso |
| **Empleado** | Escanea QR y valida el ingreso desde su celular |

---

## 4. Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/             → Login, registro, recuperación de contraseña
│   ├── (admin)/            → Panel de administración
│   ├── (client)/           → Vistas del cliente
│   ├── (employee)/         → Vista de escaneo QR
│   └── api/                → Route Handlers (endpoints del backend)
├── components/
│   ├── ui/                 → Componentes base: Button, Input, Card
│   └── shared/             → Componentes reutilizables entre vistas
├── features/
│   ├── auth/               → Lógica de autenticación
│   ├── reservations/       → Lógica de reservas y bloqueo temporal
│   ├── payments/           → Integración con Stripe
│   └── qr/                 → Generación y validación de QR
├── services/               → Llamadas a Supabase, Stripe y Resend
├── lib/                    → Configuración de clientes (supabase, stripe)
├── hooks/                  → Custom hooks de React
├── types/                  → Tipos TypeScript del proyecto
└── utils/                  → Funciones utilitarias puras
```

---

## 5. Setup Local

### Requisitos previos

- Node.js 20+
- npm o yarn
- Cuenta en Supabase
- Cuenta en Stripe
- Cuenta en Resend
- Stripe CLI (para probar webhooks en local)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd <nombre-del-repo>

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves (ver sección 6)

# 4. Correr el servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`

### Stripe CLI (webhooks en local)

```bash
# Instalar Stripe CLI: https://stripe.com/docs/stripe-cli

# Escuchar webhooks y redirigir al servidor local
stripe listen --forward-to localhost:3000/api/payments/webhook

# El CLI imprime un webhook secret — copiarlo en STRIPE_WEBHOOK_SECRET del .env.local
```

---

## 6. Variables de Entorno

Copiar `.env.example` a `.env.local` y completar los valores.

```bash
cp .env.example .env.local
```

| Variable | Descripción | Dónde obtenerla |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada de Supabase (solo servidor) | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe (solo servidor) | Stripe → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Secret del webhook de Stripe | Stripe CLI al correr `stripe listen` |
| `RESEND_API_KEY` | Clave de Resend para emails | Resend → API Keys |
| `NEXT_PUBLIC_APP_URL` | URL base de la app | `http://localhost:3000` en local |

> ⚠️ Nunca subir `.env.local` al repositorio. Ya está en `.gitignore`.

---

## 7. Base de Datos

El modelo de datos está documentado en [`docs/diseño/database.md`](docs/diseño/database.md).

**Tablas principales:**

| Tabla | Propósito |
|-------|-----------|
| `users` | Usuarios con rol asignado (admin, client, employee) |
| `categories` | Categorías de servicios (Canchas, Piscinas, etc.) |
| `services` | Instancias individuales (Cancha 1, Piscina Olímpica) |
| `time_slots` | Franjas horarias disponibles por servicio y fecha |
| `reservations` | Reservas con estados: pending, confirmed, failed, expired, completed |
| `payments` | Registro de pagos y referencia a Stripe |
| `qr_codes` | Token único por reserva confirmada |
| `access_logs` | Registro de cada escaneo y validación de QR |

**Para crear las tablas:** ejecutar el SQL de `docs/diseño/database.md` en el SQL Editor de Supabase.

---

## 8. Documentación Técnica

Toda la documentación técnica está en la carpeta `docs/`:

| Archivo | Contenido |
|---------|-----------|
| [`docs/diseño/architecture.md`](docs/diseño/architecture.md) | Arquitectura general y criterios de desarrollo |
| [`docs/diseño/database.md`](docs/diseño/database.md) | Modelo ER, tablas, relaciones y RLS |
| [`docs/diseño/api.md`](docs/diseño/api.md) | Endpoints, métodos, parámetros y roles |
| [`docs/diseño/reservas.md`](docs/diseño/reservas.md) | Flujo de reservas, estados y concurrencia |
| [`docs/diseño/integraciones.md`](docs/diseño/integraciones.md) | Stripe, Supabase Auth, Resend, QR y deploy |
| [`docs/diseño/ui-sistema.md`](docs/diseño/ui-sistema.md) | Sistema visual: colores, tipografía, componentes |
| [`docs/diseño/ui-flujos.md`](docs/diseño/ui-flujos.md) | Wireframes y flujos de usuario por rol |
| [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) | Protocolo Git del equipo |

---

## 9. Flujo de Trabajo del Equipo

Ver [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) para el protocolo completo.

**Resumen:**

```
main          → Producción. Solo merge desde develop vía PR aprobado.
develop       → Integración. Solo recibe merges desde feature/* vía PR.
feature/*     → Desarrollo individual por feature.
```

- Rama nueva por cada feature
- Commit al terminar cada tarea
- Push al final del día
- PR cada 2-3 días
- Merge con `develop` cada mañana

---


*Última actualización: Septiembre 2026*
