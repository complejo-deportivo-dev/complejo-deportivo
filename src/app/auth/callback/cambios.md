# Documentación de Cambios: Auth Callback

Este documento detalla las modificaciones realizadas en la ruta de callback de autenticación para alinearla con los requerimientos técnicos y el diseño de la API del proyecto.

## 1. ¿Qué se cambió?
Se reemplazó la lógica completa del archivo `src/app/auth/callback/route.ts`. Se pasó de una redirección simple basada en un parámetro de URL (`next`) a una redirección inteligente basada en el **rol del usuario** almacenado en la base de datos.

## 2. ¿Por qué se cambió?
El flujo anterior era insuficiente para las necesidades del sistema, ya que:
- No distinguía entre los diferentes tipos de usuarios (Admin, Empleado, Cliente).
- No validaba si el usuario autenticado en Supabase Auth tenía un perfil correspondiente en la tabla `public.users`.
- No seguía el contrato de manejo de errores definido en la documentación de diseño.

## 3. ¿Cómo se decidió qué cambiar?
La decisión se basó en el análisis comparativo entre el código existente y el archivo `contexto.md`. Se identificaron las brechas funcionales y se aplicó el siguiente razonamiento:
1. **Identificación**: El usuario ya está autenticado mediante el código de Google $\rightarrow$ Necesitamos saber quién es en nuestro sistema.
2. **Acceso a Datos**: La única fuente de verdad para el rol es la tabla `public.users` $\rightarrow$ Se integró **Prisma**.
3. **Destino**: Dependiendo del rol, el usuario debe aterrizar en un dashboard diferente para evitar accesos no autorizados o rutas irrelevantes.

## 4. Análisis de Criterios de Aceptación

### Criterios NO cumplidos (Antes)
- [ ] **Redirección por Rol**: No existía; redirigía a una ruta genérica.
- [ ] **Consulta de Perfil**: No consultaba `public.users` mediante Prisma.
- [ ] **Manejo de Errores**: Redirigía a `/?error=auth_callback` en lugar de `/login?error=oauth`.
- [ ] **Validación de Existencia**: No verificaba si el usuario de Auth existía en la tabla pública.

### Criterios cumplidos (Después)
- [x] **Intercambio de Código**: Implementado `exchangeCodeForSession`.
- [x] **Lectura de Rol**: Se obtiene el rol directamente desde la DB mediante Prisma.
- [x] **Redirección Dinámica**: 
    - `admin` $\rightarrow$ `/admin`
    - `employee` $\rightarrow$ `/employee`
    - `client` $\rightarrow$ `/client`
- [x] **Contrato de Errores**: Redirección correcta a `/login?error=oauth` en cualquier fallo.
- [x] **Seguridad**: No se confía en parámetros del cliente para definir el destino, sino en la base de datos.
