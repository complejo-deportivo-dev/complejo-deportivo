# Tarea 6: Flujo de OAuth Callback (Google)

## Descripción
Implementación del endpoint de retorno para la autenticación mediante Google OAuth, gestionando el intercambio de códigos por sesiones y la asignación de roles.

## Archivos Implementados
- [`src/app/auth/callback/route.ts`](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/auth/callback/route.ts)
- [`src/app/auth/callback/cambios.md`](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/auth/callback/cambios.md) (Documentación de decisiones)

## Flujo y Lógica

### 1. `src/app/auth/callback/route.ts`
Este endpoint es el punto de entrada después de que el usuario acepta los permisos en Google. El flujo es el siguiente:
- **Intercambio de Código**: Recupera el `code` de la URL y utiliza el cliente de Supabase para ejecutar `exchangeCodeForSession`. Esto establece la sesión del usuario en las cookies del navegador.
- **Recuperación de Rol**: Una vez establecida la sesión, el sistema consulta la tabla `public.users` mediante Prisma utilizando el ID del usuario autenticado.
- **Lógica de Redirección**: Según el rol recuperado (`admin`, `employee` o `client`), el middleware o el callback redirige al usuario a su respectivo dashboard:
    - `admin` $\rightarrow$ `/admin`
    - `employee` $\rightarrow$ `/employee`
    - `client` $\rightarrow$ `/client`
- **Manejo de Errores**: Si ocurre un fallo en el intercambio o el usuario no tiene un rol asignado, se redirige a una página de error o al login.

## Criterios de Aceptación Cumplidos
- [x] Intercambio exitoso de código por sesión.
- [x] Lectura de rol desde la base de datos interna.
- [x] Redirección dinámica basada en el rol del usuario.
- [x] Documentación de cambios implementados.
