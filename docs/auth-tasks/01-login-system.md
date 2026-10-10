# Tarea 3: Implementación del Sistema de Login

## Descripción
Desarrollo del flujo de inicio de sesión seguro, integrando la autenticación de identidad de Supabase con la validación de perfiles internos mediante Prisma.

## Archivos Implementados
- [`src/services/auth.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/src/services/auth.ts) (método `login`)
- [`src/app/api/auth/login/route.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/api/auth/login/route.ts)

## Flujo y Lógica

### 1. `src/services/auth.ts` (Lógica de Negocio)
El método `login` implementa un flujo de dos pasos:
- **Paso 1: Autenticación**: Utiliza `supabase.auth.signInWithPassword` para validar las credenciales. Si falla, lanza un error `INVALID_CREDENTIALS`.
- **Paso 2: Verificación de Perfil**: Una vez autenticado el usuario en Supabase, Prisma busca el registro correspondiente en la tabla `public.users`. 
- **Justificación**: Esto asegura que solo los usuarios que han sido creados en el sistema interno (no solo en Supabase Auth) puedan ingresar, permitiendo controlar el acceso mediante el campo `role`.

### 2. `src/app/api/auth/login/route.ts` (Controlador API)
Actúa como la interfaz pública del servicio:
- **Validación**: Utiliza Zod para validar que el email y el password estén presentes y tengan el formato correcto.
- **Manejo de Errores**: Captura los errores del servicio y devuelve respuestas HTTP estandarizadas.
- **Seguridad**: Devuelve mensajes de error genéricos para evitar la enumeración de cuentas (no indica si el error fue el password o el email).

## Criterios de Aceptación Cumplidos
- [x] Validación de entrada con Zod.
- [x] Autenticación mediante Supabase Auth.
- [x] Verificación de rol y existencia en `public.users` vía Prisma.
- [x] Respuestas API estandarizadas.
