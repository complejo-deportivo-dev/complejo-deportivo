## Error en el endpoint login

este es el error que aparece cuando se intenta hacer un login :point_down:

```bash
[AUTH_LOGIN_ERROR] Error [PrismaClientKnownRequestError]: 
Invalid `__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].public_users.findUnique()` invocation in
/home/ruta_ts/Escritorio/complejo-deportivo/.next/dev/server/chunks/[root-of-the-server]__00tzifv._.js:971:170

  968 if (authError || !authData.user) {
  969     throw new Error("INVALID_CREDENTIALS");
  970 }
→ 971 const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].public_users.findUnique(
Authentication failed against the database server, the provided database credentials for `postgres` are not valid
    at <unknown> (src/services/auth.ts:18:44)
    at async Object.login (src/services/auth.ts:18:18)
    at async POST (src/app/api/auth/login/route.ts:24:18)
  16 |     }
  17 |
> 18 |     const user = await prisma.public_users.findUnique({
     |                                            ^
  19 |       where: { id: authData.user.id },
  20 |       select: {
  21 |         id: true, {
  code: 'P1000',
  meta: {
    modelName: 'public_users',
    driverAdapterError: Error [DriverAdapterError]: AuthenticationFailed
        at ignore-listed frames {
      [cause]: [Object]
    }
  },
  clientVersion: '7.10.0'
}
 POST /api/auth/login 500 in 2.9s (next.js: 472ms, application-code: 2.4s)


```

## Descripción de Errores Encontrados

*   **P1000 (AuthenticationFailed):** Indica que el servidor de base de datos rechazó las credenciales (usuario o contraseña) proporcionadas en la cadena de conexión (`DATABASE_URL`).
*   **P1011 (TlsConnectionError - self-signed certificate):** Ocurre cuando el cliente de base de datos (Prisma) no puede verificar la cadena de confianza del certificado SSL presentado por el servidor (Supabase), comúnmente en entornos de desarrollo.
*   **E394 (Module not found - @/services/auth):** Error de compilación en Next.js por una configuración incorrecta en `tsconfig.json` que impedía al empaquetador resolver los alias de rutas.

## Intentos de solución realizados

1. **Corrección de credenciales y puerto:** Se actualizó el archivo `.env` para usar el Transaction Pooler de Supabase (puerto 6543) y se intentaron múltiples configuraciones de usuario/contraseña, ya que el error `P1000` persistía.
2. **Ajustes de SSL:** Se probaron configuraciones como `sslmode=require`, `sslmode=no-verify`, `sslmode=disable` y `sslmode=verify-full` en la `DATABASE_URL` para mitigar el error `P1011` y la validación estricta de certificados.
3. **Gestión del servidor:** Se forzó el reinicio continuo del servidor de desarrollo mediante `taskkill` y `npm run dev` para asegurar la aplicación de los cambios en las variables de entorno y configuración.
4. **Alias de rutas:** Se corrigió el archivo `tsconfig.json` añadiendo explícitamente `baseUrl` y `paths` para mapear `@/*` a `./src/*`, resolviendo así el error de importación de módulos.

A pesar de estos intentos, el error `AuthenticationFailed` (P1000) o `TlsConnectionError` (P1011) persiste en el login, indicando problemas continuos en la autenticación SSL o de credenciales entre Prisma y Supabase.

## SOLUCIÓN

se soluciono el error de conexion que presentava el endpoint del login

- las credenciales para la conexión que utiliza prisma se pueden encontrar en supabase en el apartado de 

```bash
connet to your proyect
    |
    └── ORM (Third-party library)
        |
        └── PRISMA
            |
            └── Configure ORM
```