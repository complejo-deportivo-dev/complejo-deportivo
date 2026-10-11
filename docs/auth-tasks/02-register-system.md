# Tarea 4: Implementación del Sistema de Registro

## Descripción
Desarrollo del flujo de alta de nuevos usuarios, gestionando la creación de la identidad en Supabase y la asignación de metadatos iniciales.

## Archivos Implementados
- [`src/services/auth.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/src/services/auth.ts) (método `register`)
- [`src/app/api/auth/register/route.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/api/auth/register/route.ts)

## Flujo y Lógica

### 1. `src/services/auth.ts` (Lógica de Negocio)
El método `register` se encarga de la orquestación del alta:
- **Creación de Cuenta**: Utiliza `supabase.auth.signUp`.
- **Metadatos**: Envía el nombre y el documento de identidad dentro del campo `options.data`. Esto permite que la información básica del usuario viaje junto con la cuenta de Supabase.
- **Redirección**: Configura `emailRedirectTo` para enviar al usuario al callback de autenticación una vez confirme su correo.
- **Control de Duplicados**: Detecta errores de "user already exists" y los traduce a un error interno `EMAIL_ALREADY_REGISTERED`.

### 2. `src/app/api/auth/register/route.ts` (Controlador API)
- **Validación**: Implementa un esquema de Zod para validar que el nombre, email, password y documento cumplan con los requisitos mínimos.
- **Ejecución**: Llama al servicio de registro y maneja la respuesta.

## Criterios de Aceptación Cumplidos
- [x] Validación de campos obligatorios con Zod.
- [x] Creación de usuario en Supabase Auth.
- [x] Almacenamiento de metadatos en el registro de Supabase.
- [x] Manejo de errores de usuario ya registrado.
