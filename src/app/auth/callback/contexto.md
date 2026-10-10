## Objetivo

Implementar el callback de Google OAuth encargado de recibir el `code` enviado después del consentimiento del usuario, intercambiarlo por una sesión de Supabase y redirigir al usuario automáticamente según su rol.

Esta ruta **no pertenece a** `/api/`, ya que corresponde al flujo de autenticación de la aplicación.

---

## Contrato

Según `docs/diseño/api.md`, sección 3.1:

**Método:** `GET`
**Ruta:** `auth\callback`
**Rol:** Público

### Query params

```
code: string
```

El parámetro `code` es enviado por Google/Supabase después de completar el flujo OAuth.

### Respuesta exitosa

La ruta no devuelve JSON. Debe realizar una redirección según el rol obtenido desde `public.users`:

RolRedirección`admin/adminemployee/employeeclient/client`

### Respuesta de error

Si ocurre cualquier error durante el proceso OAuth:

```
/login?error=oauth
```

---

## Implementación

### 1. Crear Route Handler

Crear exactamente:

```
src/app/auth/callback/route.ts
```

Importante: **NO crear esta ruta dentro de** `src/app/api/`.

La estructura debe quedar:

```
src/
└── app/
    └── auth/
        └── callback/
            └── route.ts
```

---

### 2. Leer el parámetro `code`

Obtener el parámetro `code` desde la URL recibida.

Ejemplo:

```
/auth/callback?code=xxxxx
```

Si el parámetro no existe, redirigir inmediatamente a:

```
/login?error=oauth
```

---

### 3. Intercambiar el código por una sesión

Utilizar el cliente de Supabase correspondiente al entorno server:

```
await supabase.auth.exchangeCodeForSession(code)
```

Si el intercambio falla, redirigir a:

```
/login?error=oauth
```

---

### 4. Obtener el usuario autenticado

Después de realizar correctamente el intercambio, obtener el usuario autenticado desde Supabase Auth.

El usuario debe existir en:

```
auth.users
```

---

### 5. Verificar `public.users`

El trigger:

```
on_auth_user_created
```

debe encargarse de crear la fila correspondiente en:

```
public.users
```

para usuarios nuevos.

La implementación debe consultar la información del usuario en `public.users` para obtener su rol.

Si por alguna razón el usuario autenticado no tiene una fila en `public.users`, manejar el caso de forma segura, creando la fila si corresponde o confiando en el trigger existente según la configuración del proyecto.

---

### 6. Obtener el rol

El rol debe obtenerse desde:

```
public.users.role
```

Los valores esperados son:

```
admin
employee
client
```

El rol no debe provenir de parámetros enviados por el cliente.

---

### 7. Redirigir según el rol

Una vez obtenido el rol:

```
admin     → /admin
employee  → /employee
client    → /client
```

La respuesta final del callback debe ser una redirección HTTP.

---

## Validaciones y manejo de errores

### Código OAuth

Si no existe:

```
code
```

redirigir a:

```
/login?error=oauth
```

### Error al intercambiar sesión

Si:

```
exchangeCodeForSession(code)
```

devuelve un error, redirigir a:

```
/login?error=oauth
```

### Usuario no encontrado en `public.users`

Si el usuario existe en `auth.users` pero no existe en `public.users`, manejar el caso sin romper el flujo.

La prioridad es mantener la consistencia entre:

```
auth.users
public.users
```

y utilizar el trigger `on_auth_user_created` como mecanismo principal para nuevos usuarios.

### Rol inválido o inexistente

Si no es posible determinar un rol válido, no realizar una redirección administrativa por defecto. Manejar el error de autenticación y redirigir a:

```
/login?error=oauth
```

---

## Configuración previa de Supabase

Antes de probar el endpoint, verificar la configuración en Supabase.

### Authentication → URL Configuration

**Site URL:**

```
http://localhost:3000
```

**Redirect URLs:**

```
http://localhost:3000/**
http://localhost:3000/auth/callback
```

### Authentication → Providers → Google

Google debe estar habilitado y configurado con:

```
Client ID
Client Secret
```

Las credenciales deben configurarse mediante variables de entorno o la configuración segura correspondiente. No deben almacenarse directamente en el código.

---

## Seguridad

- La ruta debe ser pública porque forma parte del flujo OAuth.
- No confiar en un rol enviado por query params, cookies manipuladas o datos del cliente.
- El rol debe obtenerse desde `public.users`.
- No exponer tokens, contraseñas, `client_secret` ni información sensible en la respuesta.
- Utilizar el cliente server-side de Supabase.
- Mantener la gestión de sesión mediante Supabase SSR.
- Los errores OAuth deben utilizar una respuesta genérica para evitar exponer información interna.
- Prisma, si se utiliza para consultar `public.users`, debe ejecutarse únicamente en servidor.

---

## Flujo completo

```
Usuario
   │
   ▼
"Continuar con Google"
   │
   ▼
Google OAuth
   │
   ▼
Consentimiento del usuario
   │
   ▼
/auth/callback?code=...
   │
   ▼
exchangeCodeForSession(code)
   │
   ▼
Usuario autenticado
   │
   ▼
Consultar public.users
   │
   ▼
Obtener role
   │
   ├── admin ──────► /admin
   │
   ├── employee ───► /employee
   │
   └── client ─────► /client
```

En caso de error:

```
/auth/callback?code=...
          │
          ▼
       Error
          │
          ▼
/login?error=oauth
```

---

## Referencias

- `docs/diseño/api.md` — sección 3.1
- `docs/diseño/integraciones.md` — sección 1, Supabase Auth + Google OAuth
- `src/types/api.ts`
- `src/types/database.ts`
- Configuración de Supabase Authentication
- Provider Google OAuth

---

## Pruebas

Realizar el flujo completo desde la interfaz:

1. Abrir la pantalla de login.
2. Hacer clic en **"Continuar con Google"**.
3. Completar el consentimiento/autenticación en Google.
4. Verificar que Google redirige a `/auth/callback`.
5. Verificar que el callback intercambia correctamente el `code`.
6. Verificar que el usuario existe en `auth.users`.
7. Verificar que el usuario existe en `public.users`.
8. Verificar que el rol obtenido coincide con el registrado.
9. Verificar la redirección correspondiente.

### Casos de error

Probar:

- Callback sin `code`.
- `code` inválido o expirado.
- Error en `exchangeCodeForSession`.
- Usuario autenticado sin registro correspondiente en `public.users`.
- Usuario con rol inválido.

En los casos de error debe terminar en:

```
/login?error=oauth
```

---

## Criterios de aceptación

- □ Existe `src/app/auth/callback/route.ts`.
- □ La ruta es `/auth/callback` y no `/api/auth/callback`.
- □ El método implementado es `GET`.
- □ La ruta es accesible sin autenticación previa.
- □ Se obtiene correctamente el query param `code`.
- □ Si no existe `code`, se redirige a `/login?error=oauth`.
- □ Se utiliza `supabase.auth.exchangeCodeForSession(code)`.
- □ Si falla el intercambio, se redirige a `/login?error=oauth`.
- □ Se obtiene correctamente el usuario autenticado después del intercambio.
- □ Se verifica la existencia del usuario en `public.users`.
- □ El rol se obtiene desde `public.users`.
- □ `admin` redirige a `/admin`.
- □ `employee` redirige a `/employee`.
- □ `client` redirige a `/client`.
- □ Un rol inválido no provoca una redirección incorrecta.
- □ Los nuevos usuarios quedan registrados en `auth.users` y `public.users`.
- □ El flujo utiliza correctamente el trigger `on_auth_user_created`.
- □ No se exponen contraseñas, tokens, secretos ni información sensible.
- □ Las credenciales de Google no están hardcodeadas.
- □ La sesión se gestiona mediante Supabase SSR.
- □ Cualquier error OAuth termina en `/login?error=oauth`.
- □ Se probó el flujo completo de Google OAuth.
- □ Se verificó manualmente la redirección para cada rol.
- □ El código cumple TypeScript y lint.
- □ No se introduce lógica de negocio innecesaria dentro del Route Handler.
