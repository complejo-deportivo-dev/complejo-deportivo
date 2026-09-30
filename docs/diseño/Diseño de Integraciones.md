# Diseño de Integraciones

Cada sección termina con **cómo se configura** y **cómo se usa**.

---

## 1. Supabase Auth

### Configuración
1. Crear el proyecto en Supabase y copiar `URL`, `anon key` y `service_role key` (Project Settings → API).
2. Authentication → URL Configuration:
   - **Site URL:** el valor de `NEXT_PUBLIC_APP_URL` de producción.
   - **Redirect URLs:** `http://localhost:3000/**`, el dominio final y el patrón de previews de Vercel.
3. Authentication → Providers → **Google**: pegar Client ID y Client Secret (Google Cloud Console). En Google, registrar como redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
4. Authentication → Email: activar **Confirm email**.

### Uso
- **Registro (email/contraseña):** `supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${APP_URL}/auth/callback` } })`.
- **Confirmación por correo:** el usuario abre el enlace, llega a `/auth/callback`, que ejecuta `exchangeCodeForSession(code)` y redirige a la app. Sin confirmar no puede iniciar sesión.
- **Login con Google:** `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${APP_URL}/auth/callback` } })`. Vuelve por el mismo `/auth/callback`.
- **Recuperar contraseña:**
  1. `supabase.auth.resetPasswordForEmail(email, { redirectTo: `${APP_URL}/auth/reset` })`.
  2. En `/auth/reset` el usuario escribe la nueva clave y se llama `supabase.auth.updateUser({ password })`.
- **Rol del usuario:** tabla `profiles` con columna `role` (valor por defecto `cliente`). Se crea con un trigger sobre `auth.users` (insert). El rol **no** se guarda en `user_metadata` porque el usuario puede editarlo. Los cambios de rol (ej. `admin`) se hacen solo desde servidor o SQL.
- **Qué cliente se usa** (paquete `@supabase/ssr`):
  - `createBrowserClient` → componentes de cliente (`'use client'`).
  - `createServerClient` → Server Components, Route Handlers, Server Actions y middleware (lee/escribe cookies).
  - Cliente con `SUPABASE_SERVICE_ROLE_KEY` → **solo servidor** y solo donde hace falta saltar RLS (ej. webhook de Stripe). Nunca importarlo desde código de cliente.

---

## 2. Stripe (modo prueba)

### Configuración
1. Dashboard de Stripe en **modo test**. Copiar `sk_test_...` y `pk_test_...` (Developers → API keys).
2. Instalar `stripe` (servidor) y `@stripe/stripe-js` + `@stripe/react-stripe-js` (cliente).
3. Crear el endpoint de webhook en Stripe apuntando a `https://<dominio>/api/webhooks/stripe`, con los eventos de abajo. Copiar su `whsec_...` a `STRIPE_WEBHOOK_SECRET`.

### Flujo del pago
1. El cliente selecciona la franja y pulsa reservar.
2. El servidor crea la reserva en estado `pending` (la franja queda retenida).
3. El servidor crea el **PaymentIntent** y devuelve su `client_secret`.
4. El cliente confirma el pago con Stripe Elements (`confirmPayment`).
5. Stripe llama al webhook → el sistema confirma la reserva, genera los tokens y los QRs, y envía el correo con Resend.

### Creación del PaymentIntent
- Ruta: `POST /api/payments/create-intent`.
- El **monto se calcula en el servidor** a partir de la franja; nunca se recibe del cliente.
- Se guarda `reservation_id` en `metadata` para poder relacionar el evento con la reserva.

```ts
const intent = await stripe.paymentIntents.create({
  amount,            // en la unidad mínima de la moneda
  currency,
  metadata: { reservation_id },
  automatic_payment_methods: { enabled: true },
});
```

### Webhook (`POST /api/webhooks/stripe`)
| Evento | Qué hace el sistema |
|---|---|
| `payment_intent.succeeded` | Marca la reserva `confirmed`, genera los tokens y los QRs, envía el correo con Resend. |
| `payment_intent.payment_failed` | Marca la reserva `failed` y libera las franjas. |

- **Idempotencia:** Stripe puede reenviar eventos. Antes de actuar, verificar que la reserva no esté ya `confirmed`.
- Usa el cliente de Supabase con service role (no hay sesión de usuario en un webhook).
- Responder `200` rápido; si algo falla, responder `500` para que Stripe reintente.

### Validación de la firma
Leer el **cuerpo crudo** (`await req.text()`, no `req.json()`) y verificar:

```ts
const sig = req.headers.get('stripe-signature')!;
const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```
Si lanza error, responder `400` y no procesar nada.

### Probar en local (Stripe CLI)
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
- El CLI imprime un `whsec_...` **propio de la sesión local**: úsalo como `STRIPE_WEBHOOK_SECRET` en `.env.local`.
- Simular eventos: `stripe trigger payment_intent.succeeded`.
- Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura y CVC.

### Claves de test vs. producción
| | Test | Producción |
|---|---|---|
| Secret key | `sk_test_...` | `sk_live_...` |
| Publishable key | `pk_test_...` | `pk_live_...` |
| Webhook secret | `whsec_...` del endpoint test (o del CLI en local) | `whsec_...` distinto, del endpoint live |
| Dinero real | No | Sí |

Los datos de test y live están separados en Stripe. Nunca mezclar claves de un modo con el `whsec` del otro.

---

## 3. Resend (correos)

### Configuración
1. Crear cuenta y API key en Resend → `RESEND_API_KEY`.
2. **Producción:** verificar el dominio (registros DNS SPF/DKIM) y definir `RESEND_FROM_EMAIL` con una dirección de ese dominio.
3. **Desarrollo:** usar el remitente de prueba de Resend (`onboarding@resend.dev`), que solo puede enviar al correo de la cuenta de Resend. Para simular resultados, usar las direcciones de prueba `delivered@resend.dev` y `bounced@resend.dev`.

### Correos que se envían
| Correo | Quién lo envía | Cuándo |
|---|---|---|
| Confirmación de cuenta | Supabase Auth (SMTP por defecto o configurado con Resend) | Al registrarse |
| Recuperación de contraseña | Supabase Auth | Al pedir el reset |
| Confirmación de reserva con QR | Nuestra app vía Resend | Tras `payment_intent.succeeded` |

### Cómo se usa
```ts
await resend.emails.send({
  from: process.env.RESEND_FROM_EMAIL!,
  to: user.email,
  subject: 'Reserva confirmada',
  html,
  attachments: qrAttachments, // Array con los buffers de los QRs generados
});
```
- **Desarrollo:** los envíos quedan registrados en el dashboard de Resend → Emails, y con las direcciones `resend.dev` no llegan a personas reales.
- **Producción:** envío real al correo del cliente.

### Formato del correo con QR
- **Asunto:** "Reserva confirmada".
- **Cuerpo:** fecha, hora y franja reservada, junto con los accesos correspondientes e indicación "Presenta este código al ingresar".
  - **Servicios `group` (canchas):** se envía 1 solo código QR para todo el grupo incrustado como `<img src="cid:qr" alt="Código QR de tu reserva" />`.
  - **Servicios `individual` (piscina, gimnasio, zona húmeda):** se envían N QRs, uno por persona ($N = \text{reservation.quantity}$). Todos van en el mismo correo, cada uno identificado con su respectivo identificador o entrada para que el titular los reparta.

---

## 4. QR

### Configuración
- Librería: `qrcode` (`npm i qrcode`). Solo se usa en servidor.

### Uso y almacenamiento
1. Al confirmar el pago en el webhook se generan los tokens aleatorios usando `crypto.randomBytes(32).toString('hex')` y se insertan en la tabla `qr_codes` en la columna `token` (`UNIQUE`):
   - **Servicios `group` (canchas):** 1 fila en `qr_codes`.
   - **Servicios `individual` (piscina, gimnasio, zona húmeda):** $N$ filas en `qr_codes` ($N = \text{reservation.quantity}$).
2. Se genera la imagen por cada token:
   - `QRCode.toDataURL(token)` → imagen en **base64** (data URL PNG), útil para mostrarla en la web.
   - `QRCode.toBuffer(token)` → buffer PNG, que es lo que se adjunta al correo.
3. Se adjuntan al correo como imágenes incrustadas (CID) según la cantidad correspondiente.

### Qué contiene el token
- Solo el **token aleatorio**. **No** el `reservation_id`: un id secuencial o predecible permitiría adivinar y falsificar accesos de otras reservas.
- Al escanear, el servidor busca el registro en `qr_codes` por su `token`, valida el estado de la reserva asociada (`confirmed`) y marca el código/reserva como utilizado.

> Nota: muchos clientes de correo bloquean imágenes en base64 dentro del HTML. Por eso en el correo se usan adjuntos incrustados (CID) y el base64 queda reservado para la visualización directa en la web.

---

## 5. Deploy (Vercel)

### Configuración
1. Importar el repositorio de GitHub en Vercel (detecta Next.js automáticamente).
2. Cargar las variables de entorno en Project Settings → Environment Variables, eligiendo el ambiente de cada una (Production / Preview / Development).
3. Agregar el dominio final en Settings → Domains y actualizar `NEXT_PUBLIC_APP_URL`, la Site URL de Supabase y el endpoint del webhook de Stripe.

### Uso
- **Deploy:** cada push a `main` genera un deploy de producción.
- **Preview deployments:** cada rama/PR genera una URL de preview propia. Los previews usan claves **de test** de Stripe y el proyecto/ambiente de Supabase de desarrollo.
- **Variables por ambiente:**
  | Ambiente | Stripe | Resend | `NEXT_PUBLIC_APP_URL` |
  |---|---|---|---|
  | Development (local) | test + CLI | remitente de prueba | `http://localhost:3000` |
  | Preview | test | remitente de prueba | URL del preview |
  | Production | live (cuando se pase a real) | dominio verificado | dominio final |
- Las variables `NEXT_PUBLIC_*` se incrustan **en el build**: si se cambian, hay que volver a desplegar.
- **Dominio final:** `[completar]`.

---

## 6. Variables de entorno

| Variable | Dónde corre | Para qué sirve | Dónde obtenerla |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente + servidor | URL del proyecto Supabase | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente + servidor | Clave pública; el acceso real lo limita RLS | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo servidor** | Salta RLS; para el webhook y tareas de admin | Supabase → Project Settings → API |
| `STRIPE_SECRET_KEY` | **Solo servidor** | Crear PaymentIntents y validar eventos | Stripe → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Cliente + servidor | Inicializar Stripe Elements en el navegador | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | **Solo servidor** | Validar la firma del webhook | Stripe → Webhooks (endpoint) o salida de `stripe listen` |
| `RESEND_API_KEY` | **Solo servidor** | Enviar correos | Resend → API Keys |
| `RESEND_FROM_EMAIL` | **Solo servidor** | Remitente de los correos | Dirección del dominio verificado en Resend |
| `NEXT_PUBLIC_APP_URL` | Cliente + servidor | URL base para redirects y enlaces | Local: `http://localhost:3000`; prod: dominio final |

**Reglas:**
- Solo las variables con prefijo `NEXT_PUBLIC_` llegan al navegador. Todo lo demás es **solo servidor**.
- Nunca poner prefijo `NEXT_PUBLIC_` a una clave secreta.
- `.env.local` va en `.gitignore`; el repositorio incluye un `.env.example` con los nombres y sin valores.
- El Client ID/Secret de Google **no** va en el `.env` de la app: se configura en el panel de Supabase.