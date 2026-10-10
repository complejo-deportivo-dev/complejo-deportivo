# Tarea 5: Implementación del Sistema de Logout

## Descripción
Implementación de la funcionalidad de cierre de sesión seguro, asegurando que todas las sesiones y cookies se invaliden correctamente tanto en el servidor como en el cliente.

## Archivos Implementados
- [`src/app/api/auth/logout/route.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/api/auth/logout/route.ts)

## Flujo y Lógica

### 1. `src/app/api/auth/logout/route.ts`
El endpoint de logout realiza las siguientes acciones secuenciales:
- **Cierre de Sesión de Supabase**: Ejecuta `supabase.auth.signOut()`. Esto invalida la sesión en el servidor de Supabase y revoca el token de acceso actual.
- **Limpieza de Cookies**: Aunque `signOut()` maneja gran parte del proceso, el endpoint asegura que las cookies de sesión en el navegador sean eliminadas o invalidadas para evitar que el middleware detecte una sesión residual.
- **Respuesta**: Devuelve un status `200 OK` indicando que la sesión ha sido terminada exitosamente.

## Criterios de Aceptación Cumplidos
- [x] Invalidación de sesión en Supabase.
- [x] Eliminación de cookies de sesión.
- [x] Respuesta API exitosa.
