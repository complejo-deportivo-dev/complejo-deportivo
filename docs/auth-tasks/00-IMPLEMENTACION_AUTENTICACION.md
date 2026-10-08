# Documentación Técnica de Implementación de Autenticación y Recuperación de Cuenta

Este documento detalla la implementación del sistema de autenticación, control de acceso basado en roles (RBAC) y el flujo de recuperación de contraseñas para el sistema del Complejo Deportivo.

## 1. Arquitectura General

El sistema utiliza un enfoque de **Defensa en Profundidad**, separando la validación de entrada, la lógica de negocio y la persistencia de datos.

### Stack Tecnológico
- **Next.js (App Router)**: Framework base para el frontend y API routes.
- **Supabase Auth & SSR**: Gestión de identidad, sesiones, OAuth y seguridad de contraseñas (`@supabase/ssr`, `@supabase/supabase-js`).
- **Prisma ORM**: Acceso tipado a la base de datos PostgreSQL para datos de perfil extendidos (`@prisma/client`, `prisma`).
- **Zod**: Validación de esquemas en tiempo de ejecución para todas las entradas de la API.
- **TypeScript**: Tipado estricto en todo el proyecto para reducir errores en tiempo de desarrollo.
- **Tailwind CSS**: Sistema de diseño y estilos responsivos.
- **Lucide React**: Librería de iconos para la interfaz de usuario.
- **Stripe**: Integración de pasarela de pagos para las reservas.


---

## 2. Detalle de Implementaciones

### A. Sistema de Autenticación (Login, Register, Logout)
Se implementó una arquitectura de servicios (`authService`) para desacoplar los Route Handlers de la lógica de Supabase.

- **Registro**: Valida los datos con Zod $\rightarrow$ Crea usuario en Supabase Auth $\rightarrow$ Almacena metadatos iniciales.
- **Login**: Autentica mediante Supabase $\rightarrow$ Recupera el perfil del usuario y su rol desde la tabla `public.users` mediante Prisma para asegurar que el usuario esté activo y registrado en el sistema interno.
- **Logout**: Cierra la sesión de Supabase y limpia las cookies del navegador.

### B. Flujo de Recuperación de Contraseña (Password Recovery)
Implementado siguiendo estrictos criterios de seguridad para evitar la enumeración de cuentas.

1. **`POST /api/auth/forgot-password`**:
   - Valida el email con Zod.
   - Solicita a Supabase el envío de un email de recuperación.
   - **Criterio de Seguridad**: Siempre devuelve un `200 OK` con el mismo mensaje, sin importar si el email existe o no, evitando que atacantes descubran correos registrados.

2. **`POST /api/auth/reset-password`**:
   - **Validación de Complejidad**: Zod obliga a que la contraseña tenga $\geq 8$ caracteres, al menos una mayúscula y un número.
   - **Validación de Sesión**: Verifica que el usuario haya llegado a través de un enlace válido de Supabase (`getSession`). Si la sesión de recuperación no existe o expiró, devuelve `401 Unauthorized`.
   - **Actualización**: Utiliza `supabase.auth.updateUser` para cambiar la contraseña de forma segura.

### C. Middleware y RBAC (Control de Acceso)
El `middleware.ts` actúa como el guardián del sistema:
- **Gestión de Sesiones**: Refresca la sesión de Supabase en cada solicitud.
- **Protección de Rutas**:
    - `/admin/**` $\rightarrow$ Solo accesible por rol `admin`.
    - `/employee/**` $\rightarrow$ Solo accesible por rol `employee`.
    - `/client/**` $\rightarrow$ Solo accesible por rol `client`.
- **Redirecciones**: Envía a los usuarios no autenticados al `/login` y a los autenticados fuera de las páginas de registro/login.

---

## 3. Análisis de Herramientas Utilizadas

### Zod (Validaciones)
Zod se utilizó para crear "contratos" de entrada. Esto garantiza que:
- No lleguen datos mal formateados a los servicios.
- Los errores de validación sean consistentes y claros.
- El sistema sea resiliente a ataques de inyección de datos malformados.

### Supabase Auth & OAuth
Se configuró la integración con Google OAuth y la gestión de sesiones mediante cookies SSR (`@supabase/ssr`). La ventaja es que Supabase maneja el hashing de contraseñas y la seguridad de los tokens, eliminando la necesidad de gestionar secretos de cifrado manualmente.

### Prisma (Integración de Datos)
Mientras Supabase maneja la *Identidad* (email, password, session), Prisma maneja el *Perfil* (nombre, rol, documento).
- Se utilizó Prisma en el login para verificar que el usuario autenticado en Supabase tenga un registro correspondiente en `public.users` con el rol adecuado.

---

## 4. Matriz de Validaciones y Pruebas Realizadas

| Componente | Caso de Prueba | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- |
| Forgot Password | Email inválido | `400 Bad Request` | ✅ |
| Forgot Password | Email registrado | `200 OK` (Mensaje genérico) | ✅ |
| Forgot Password | Email NO registrado | `200 OK` (Mensaje genérico) | ✅ |
| Reset Password | Password corta (<8) | `400 Bad Request` | ✅ |
| Reset Password | Password sin mayúsculas | `400 Bad Request` | ✅ |
| Reset Password | Sin sesión de recuperación | `401 Unauthorized` | ✅ |
| Reset Password | Password válida + Sesión | `200 OK` | ✅ |
| Middleware | Acceso `/admin` como `client` | Redirección a `/unauthorized` | ✅ |
| Middleware | Acceso `/client` sin login | Redirección a `/login` | ✅ |

## 5. Archivos Clave y su Función

- `src/services/auth.ts`: [Centraliza la lógica de negocio de autenticación.](/c:/Users/Tania/Desktop/complejo-deportivo/src/services/auth.ts)
- `middleware.ts`: [Gestiona la seguridad perimetral y el RBAC.](/c:/Users/Tania/Desktop/complejo-deportivo/middleware.ts)
- `src/app/api/auth/forgot-password/route.ts`: [Orquestador de solicitud de recuperación.](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/api/auth/forgot-password/route.ts)
- `src/app/api/auth/reset-password/route.ts`: [Orquestador de cambio de contraseña.](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/api/auth/reset-password/route.ts)
- `src/types/database.ts`: [Define la estructura de datos sincronizada con Supabase/Prisma.](/c:/Users/Tania/Desktop/complejo-deportivo/src/types/database.ts)


---

## 6. Historial de Tareas Realizadas

A continuación se detalla cada una de las actividades desarrolladas durante esta sesión, siguiendo la cronología del proyecto:

### 1. [Infraestructura de Tipos Centralizada](/c:/Users/Tania/Desktop/complejo-deportivo/docs/auth-tasks/01-infraestructura-tipos.md)
Se creó un sistema de tipos robusto para garantizar la consistencia de los datos en toda la aplicación.
- **`src/types/database.ts`**: Sincronización de los tipos de la base de datos con Supabase y Prisma.
- **`src/types/api.ts`**: Definición de los contratos de solicitud y respuesta para los endpoints de la API.
- **`src/types/index.ts`**: Exportaciones consolidadas para facilitar la importación de tipos.

### 2. [Pulido de Componentes UI (`CategoryCard`)](/c:/Users/Tania/Desktop/complejo-deportivo/docs/auth-tasks/02-category-card.md)
Implementación y auditoría de la tarjeta de categorías según criterios de aceptación estrictos.
- **Mejoras visuales**: Implementación de overlays degradados, badges de cantidad de servicios y efectos de zoom en hover.
- **Responsividad**: Ajuste de dimensiones para Desktop (220px) y Mobile (180px).
- **Vista Previa**: Integración de una cuadrícula de tarjetas en `page.tsx` con datos mock para validación visual.

### 3. [Implementación del Sistema de Login](/c:/Users/Tania/Desktop/complejo-deportivo/docs/auth-tasks/03-login-system.md)
Creación del flujo de entrada de usuarios.
- **`src/services/auth.ts`**: Implementación de la lógica de autenticación mediante Supabase y verificación de perfil mediante Prisma.
- **`src/app/api/auth/login/route.ts`**: Endpoint con validación Zod y manejo de errores unificado para evitar la enumeración de cuentas.

### 4. [Implementación del Sistema de Registro](/c:/Users/Tania/Desktop/complejo-deportivo/docs/auth-tasks/04-register-system.md)
Creación del flujo de alta de nuevos usuarios.
- **`src/app/api/auth/register/route.ts`**: Endpoint que gestiona la creación de usuarios en Supabase Auth y la asignación de metadatos iniciales.

### 5. [Implementación del Sistema de Logout](/c:/Users/Tania/Desktop/complejo-deportivo/docs/auth-tasks/05-logout-system.md)
Gestión de la salida segura del sistema.
- **`src/app/api/auth/logout/route.ts`**: Implementación del cierre de sesión y limpieza total de cookies de sesión.

### 6. [Flujo de OAuth Callback (Google)](/c:/Users/Tania/Desktop/complejo-deportivo/docs/auth-tasks/06-oauth-callback.md)
Implementación del puente entre el proveedor de identidad externo y la aplicación.
- **`src/app/auth/callback/route.ts`**: Lógica para intercambiar el código de Google por una sesión, recuperar el rol del usuario y redirigirlo al dashboard correspondiente (`/admin`, `/employee` o `/client`).
- **`cambios.md`**: Documentación técnica de las decisiones tomadas en el callback.

### 7. [Implementación de Middleware y RBAC](/c:/Users/Tania/Desktop/complejo-deportivo/docs/auth-tasks/07-middleware-rbac.md)
Creación de la capa de seguridad perimetral.
- **`middleware.ts`**: Control de acceso basado en roles, refresco de sesiones y redirecciones inteligentes basadas en el estado de autenticación y el rol del usuario.

### 8. [Flujo de Recuperación de Contraseña](/c:/Users/Tania/Desktop/complejo-deportivo/docs/auth-tasks/08-password-recovery.md)
Implementación del ciclo completo de "Olvidé mi contraseña".
- **`POST /api/auth/forgot-password`**: Solicita el enlace de recuperación sin revelar la existencia de la cuenta.
- **`POST /api/auth/reset-password`**: Valida la complejidad de la nueva contraseña y la vigencia de la sesión de recuperación antes de actualizar los datos en Supabase Auth.

