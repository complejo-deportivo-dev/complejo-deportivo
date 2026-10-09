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