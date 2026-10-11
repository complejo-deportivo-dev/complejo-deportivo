# Tarea 7: Implementación de Middleware y RBAC

## Descripción
Desarrollo de una capa de seguridad perimetral mediante Next.js Middleware para gestionar la autenticación y el control de acceso basado en roles (RBAC) en tiempo real.

## Archivos Implementados
- [`middleware.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/middleware.ts)

## Flujo y Lógica

### 1. Gestión de Sesiones
El middleware intercepta cada solicitud entrante para:
- **Refresco de Sesión**: Utiliza la configuración de `@supabase/ssr` para refrescar el token de acceso si ha expirado, asegurando que la sesión sea persistente sin obligar al usuario a loguearse constantemente.

### 2. Control de Acceso Basado en Roles (RBAC)
Se implementó una matriz de permisos donde rutas específicas requieren roles específicos:
- **Protección**: Si un usuario intenta acceder a `/admin` pero su rol en `app_metadata` es `client`, el middleware bloquea la petición y redirige a `/unauthorized`.
- **Autenticación Obligatoria**: Cualquier ruta protegida que sea accedida sin una sesión activa redirige automáticamente al `/login`.

### 3. Redirecciones Inteligentes
- **Usuarios Autenticados**: Si un usuario ya inició sesión, el middleware evita que acceda a `/login` o `/register`, redirigiéndolo directamente a su dashboard según su rol.
- **Prevención de Bucles**: Se incluyó una excepción para la ruta `/unauthorized` para evitar bucles infinitos de redirección.

## Criterios de Aceptación Cumplidos
- [x] Refresco de sesión implementado.
- [x] Bloqueo de rutas por rol (Admin/Employee/Client).
- [x] Redirección de usuarios autenticados fuera de Login/Register.
- [x] Manejo de rutas públicas vs protegidas.
