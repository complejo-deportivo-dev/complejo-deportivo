# Tarea 8: Flujo de Recuperación de Contraseña

## Descripción
Implementación del ciclo completo de recuperación de acceso para usuarios que olvidaron su contraseña, priorizando la seguridad y la prevención de la enumeración de cuentas.

## Archivos Implementados
- [`src/services/auth.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/src/services/auth.ts) (métodos `forgotPassword` y `resetPassword`)
- [`src/app/api/auth/forgot-password/route.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/api/auth/forgot-password/route.ts)
- [`src/app/api/auth/reset-password/route.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/api/auth/reset-password/route.ts)

## Flujo y Lógica

### 1. Solicitud de Recuperación (`forgot-password`)
- **Lógica**: El usuario envía su email $\rightarrow$ Zod valida el formato $\rightarrow$ Supabase envía un email con un token único.
- **Seguridad**: El endpoint siempre responde con el mismo mensaje (`200 OK`), independientemente de si el email existe en la base de datos. Esto evita que atacantes prueben correos para saber quién tiene cuenta en el sistema.

### 2. Restablecimiento de Contraseña (`reset-password`)
- **Validación de Sesión**: El usuario llega con un token en la URL. El endpoint verifica que exista una sesión de recuperación activa mediante `supabase.auth.getSession()`. Si el token expiró o es inválido, devuelve `401`.
- **Criterios de Password**: Zod valida que la nueva contraseña sea segura ($\geq 8$ caracteres, una mayúscula y un número).
- **Actualización**: Se ejecuta `supabase.auth.updateUser({ password })` para cambiar la clave de forma segura.

## Criterios de Aceptación Cumplidos
- [x] Implementación de `resetPasswordForEmail` con redirección a `/auth/reset`.
- [x] Prevención total de enumeración de cuentas.
- [x] Validación estricta de complejidad de contraseña.
- [x] Verificación obligatoria de sesión de recuperación antes del cambio.
- [x] Respuestas HTTP correctas (`200`, `400`, `401`).
