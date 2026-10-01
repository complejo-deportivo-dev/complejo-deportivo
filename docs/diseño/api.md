# Diseño de API y Endpoints

Sistema de Reservas del Complejo Deportivo. Documento de la Fase 1 (Diseño), a cargo de Dev 3.

Aquí se define qué endpoints tiene el sistema, quién puede usarlos y qué recibe y responde cada uno. No hay código.

Este documento se basa en la guía del equipo, la capa de diseño, las respuestas del cliente y el MER de la base de datos. Los nombres de campos salen del MER. Lo que el MER no define y hubo que suponer está marcado como **(estimación)**. Lo que sigue abierto está marcado como **(por confirmar)** y se junta en la sección 7.

Documentos relacionados: `architecture.md` (Tech Lead), `database.md` (Dev 1), `reservas.md` (Dev 2) e `integraciones.md` (Dev 4).

## Contexto rápido del complejo

El complejo tiene 4 categorías:

| Categoría | Servicios |
|---|---|
| Canchas | Cancha de polideportivo, 2 canchas sintéticas (5 vs 5) y 1 cancha grande (11 vs 11) |
| Piscinas | Piscina olímpica, piscina con olas, piscina de niños y piscina de toboganes |
| Zonas húmedas | Sauna y turco |
| Gimnasio | 1 gimnasio de gran capacidad |

Hay dos formas de manejar el QR, y de ahí salen varias reglas de la API:

- **Cancha de fútbol:** un solo QR deja entrar a todo el grupo (`qr_type = group`).
- **Piscina, gimnasio y zonas húmedas:** un QR por persona (`qr_type = individual`). Por eso estas reservas llevan `quantity`.

Los acompañantes no son lo mismo que las personas que usan el servicio. Solo las personas que usan el servicio (`quantity`) ocupan cupo. Los acompañantes (máximo 5 por reserva) no ocupan cupo.

**Tipos de ID según el MER:** `users` usa UUID. `categories`, `services` y `time_slots` usan número entero pequeño (`smallint`). `reservations`, `qr_codes`, `payments` y `access_logs` usan número entero (`int`). Por eso, en los endpoints, todos los IDs son números, menos el del usuario.



## 1. Formato estándar de respuesta

Toda la API responde en JSON y siempre con la misma forma.

**Cuando sale bien**

```json
{ "data": { } }
```

`data` puede ser un objeto, una lista o `null` si no hay nada que devolver.

**Cuando hay un error**

```json
{ "error": "descripción del error" }
```

El mensaje va en español y se entiende sin ser técnico. No muestra detalles internos como nombres de tablas.

**Códigos HTTP que usamos**

| Código | Cuándo |
|---|---|
| 200 | Todo salió bien |
| 201 | Se creó algo nuevo |
| 400 | Los datos están mal o no se cumple una regla del negocio |
| 401 | No hay sesión iniciada |
| 403 | Hay sesión, pero ese rol no tiene permiso |
| 404 | Lo que se busca no existe |
| 409 | Choque con el estado actual (por ejemplo, un QR ya usado) |
| 500 | Falla inesperada del servidor |

**Roles** (columna `users.role` del MER)

| Rol | Quién es |
|---|---|
| Público | Cualquier persona, sin iniciar sesión |
| Cliente (`client`) | Usuario con sesión que hace reservas |
| Empleado (`employee`) | Personal que revisa los ingresos |
| Admin (`admin`) | Quien administra el complejo |

Los roles no se heredan. Cada endpoint dice exactamente quién lo puede usar.



## 2. Lista de endpoints

Resumen rápido. El detalle de cada uno está en la sección 3.

| Módulo | Método | Ruta | Rol |
|---|---|---|---|
| Autenticación | POST | `/api/auth/register` | Público |
| Autenticación | POST | `/api/auth/login` | Público |
| Autenticación | GET | `/api/auth/callback` | Público |
| Autenticación | POST | `/api/auth/logout` | Cliente, Empleado, Admin |
| Autenticación | POST | `/api/auth/forgot-password` | Público |
| Autenticación | POST | `/api/auth/reset-password` | Público (con enlace de recuperación) |
| Servicios | GET | `/api/categories` | Público |
| Servicios | GET | `/api/services` | Público |
| Servicios | GET | `/api/services/:id` | Público |
| Servicios | GET | `/api/services/:id/slots` | Público |
| Reservas | POST | `/api/reservations` | Cliente |
| Reservas | GET | `/api/reservations` | Cliente |
| Reservas | GET | `/api/reservations/:id` | Cliente |
| Pagos | POST | `/api/payments/create-intent` | Cliente |
| Pagos | POST | `/api/webhooks/stripe` | Stripe (por firma) |
| QR y acceso | POST | `/api/access/validate-qr` | Empleado |
| QR y acceso | GET | `/api/access/search` | Empleado |
| QR y acceso | POST | `/api/access/validate-document` | Empleado |
| QR y acceso | POST | `/api/access/reentry` | Empleado |
| Admin | GET, POST | `/api/admin/categories` | Admin |
| Admin | PATCH, DELETE | `/api/admin/categories/:id` | Admin |
| Admin | GET, POST | `/api/admin/services` | Admin |
| Admin | PATCH, DELETE | `/api/admin/services/:id` | Admin |
| Admin | GET, POST | `/api/admin/time-slots` | Admin |
| Admin | PATCH, DELETE | `/api/admin/time-slots/:id` | Admin |
| Admin | GET, POST | `/api/admin/employees` | Admin |
| Admin | PATCH, DELETE | `/api/admin/employees/:id` | Admin |
| Admin | GET | `/api/admin/metrics` | Admin |

No hay endpoints para cancelar ni para reembolsar. Está fuera del alcance de esta versión, y el no-show se cobra igual.

Cada endpoint de la sección 3 sigue esta plantilla:

```
### [MÉTODO] /api/[RUTA]
- Propósito:
- Rol:
- Body (entrada):
- Respuesta OK:
- Errores:
- Validaciones:
```



## 3. Endpoints por módulo

### 3.1 Autenticación

Supabase Auth se encarga del registro, el login, Google OAuth y la recuperación de contraseña. Estos endpoints son la entrada desde el frontend. Cómo se guarda la sesión se define en `architecture.md` e `integraciones.md`. El usuario vive en la tabla `users`, y su `id` es el mismo de Supabase Auth.

#### POST /api/auth/register
- **Propósito:** Crear una cuenta nueva de cliente y su fila en `users`.
- **Rol:** Público
- **Body (entrada):** `{ name, email, password, number_document? }`
  - `number_document` es la cédula. Es opcional aquí porque también se puede pedir al reservar (ver `POST /api/reservations`).
- **Respuesta OK:** `201` `{ data: { user_id, email } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `400` "El correo ya está registrado"
- **Validaciones:**
  - `email` tiene formato válido y máximo 100 caracteres
  - `name` no está vacío y tiene máximo 50 caracteres
  - `number_document`, si viene, tiene máximo 20 caracteres
  - La contraseña cumple el mínimo que pide Supabase Auth
  - El rol siempre es `client`. El usuario no lo puede elegir.

#### POST /api/auth/login
- **Propósito:** Iniciar sesión con correo y contraseña.
- **Rol:** Público
- **Body (entrada):** `{ email, password }`
- **Respuesta OK:** `200` `{ data: { user: { id, name, email, role } } }`
- **Errores:**
  - `400` "Correo y contraseña son obligatorios"
  - `401` "Correo o contraseña incorrectos"
- **Validaciones:**
  - Vienen los dos campos
  - El mensaje de error es el mismo falle el correo o la contraseña, para no dar pistas

#### GET /api/auth/callback
- **Propósito:** Recibir la respuesta de Google y crear la sesión. Si es la primera vez, crea la fila en `users` con rol `client`.
- **Rol:** Público
- **Body (entrada):** No lleva. Google manda un `code` en la URL.
- **Respuesta OK:** Redirige a la pantalla inicial según el rol.
- **Errores:**
  - `400` "No se pudo iniciar sesión con Google"
- **Validaciones:**
  - El `code` viene y es válido

#### POST /api/auth/logout
- **Propósito:** Cerrar la sesión.
- **Rol:** Cliente, Empleado, Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: null }`
- **Errores:**
  - `401` "No autenticado"
- **Validaciones:**
  - Hay una sesión activa

#### POST /api/auth/forgot-password
- **Propósito:** Mandar un correo con el enlace para cambiar la contraseña.
- **Rol:** Público
- **Body (entrada):** `{ email }`
- **Respuesta OK:** `200` `{ data: { message: "Si el correo existe, recibirás un enlace" } }`
- **Errores:**
  - `400` "Correo inválido"
- **Validaciones:**
  - El correo tiene formato válido
  - Siempre responde lo mismo, exista o no el correo, para no revelar qué cuentas hay

#### POST /api/auth/reset-password
- **Propósito:** Guardar la contraseña nueva desde el enlace de recuperación.
- **Rol:** Público (solo con el enlace de recuperación válido)
- **Body (entrada):** `{ password }`
- **Respuesta OK:** `200` `{ data: null }`
- **Errores:**
  - `400` "Contraseña inválida"
  - `401` "El enlace venció o no es válido"
- **Validaciones:**
  - El enlace de recuperación sigue vigente
  - La contraseña cumple el mínimo



### 3.2 Servicios (público / cliente)

Tablas: `categories`, `services`, `time_slots`.

#### GET /api/categories
- **Propósito:** Listar las categorías del complejo (Canchas, Piscinas, Zonas húmedas y Gimnasio).
- **Rol:** Público
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: [ { id, name } ] }`
- **Errores:** `500` "Error al obtener las categorías"
- **Validaciones:** Ninguna.

#### GET /api/services
- **Propósito:** Listar los servicios disponibles.
- **Rol:** Público
- **Body (entrada):** No lleva. Opcional en la URL: `category_id`.
- **Respuesta OK:** `200` `{ data: [ { id, name, category_id, hour_price, capacity, max_companions, qr_type } ] }`
- **Errores:**
  - `400` "category_id inválido"
  - `500` "Error al obtener los servicios"
- **Validaciones:** Si viene `category_id`, tiene que ser un número. Solo devuelve servicios con `is_active = true`.

#### GET /api/services/:id
- **Propósito:** Ver el detalle de un servicio.
- **Rol:** Público
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: { id, name, category_id, hour_price, capacity, max_companions, qr_type } }`
- **Errores:** `404` "Servicio no encontrado"
- **Validaciones:** El `id` es un número. El servicio está activo.

`qr_type` puede ser `group` (un QR para todo el grupo) o `individual` (un QR por persona). Con eso el frontend sabe si tiene que pedir la cantidad de personas. `max_companions` es el máximo de acompañantes (5) y los acompañantes no cuentan en el cupo. `hour_price` es el precio por hora.

#### GET /api/services/:id/slots
- **Propósito:** Ver las franjas de un servicio en una fecha y si están disponibles.
- **Rol:** Público
- **Body (entrada):** No lleva. Obligatorio en la URL: `date` (`YYYY-MM-DD`).
- **Respuesta OK:** `200` `{ data: [ { time_slot_id, time_start, time_end, available } ] }`
  Si el servicio es `individual`, cada franja trae también `remaining_capacity` (cupos que quedan).
- **Errores:**
  - `400` "La fecha es obligatoria o tiene un formato inválido"
  - `400` "No se puede consultar una fecha pasada"
  - `400` "Solo se puede reservar con máximo 15 días de anticipación"
  - `404` "Servicio no encontrado"
- **Validaciones:**
  - La fecha no es pasada
  - La fecha no pasa de hoy + 15 días

**Cómo se calcula la disponibilidad (estimación).** En el MER, `time_slots` solo tiene hora de inicio y de fin, sin fecha. Eso quiere decir que las franjas de un servicio se repiten todos los días. La fecha vive en `reservations.reservation_date`. Para una fecha dada, una franja cuenta como ocupada cuando existe una reserva de esa fecha que la usa (a través de `reservations_slots`) y que está en uno de estos casos:

- `confirmed` o `completed`
- `pending` con `expires_at` todavía en el futuro (el bloqueo de 10 minutos)

Para servicios `group`, una reserva ocupada deja la franja no disponible. Para servicios `individual`, `remaining_capacity = capacity - suma de quantity` de esas reservas, y `available` es verdadero si queda cupo. Si la fecha es hoy, las franjas que ya empezaron aparecen como no disponibles.



### 3.3 Reservas (cliente)

Tablas: `reservations`, `reservations_slots`, `time_slots`, `services`, `users`.

Una reserva no guarda el servicio directamente. Se llega al servicio a través de sus franjas: `reservations` → `reservations_slots` → `time_slots` → `services`. Por eso una reserva puede tener varias franjas seguidas, y todas tienen que ser del mismo servicio.

#### POST /api/reservations
- **Propósito:** Crear una reserva en estado `pending` y bloquear las franjas por 10 minutos.
- **Rol:** Cliente con sesión
- **Body (entrada):** `{ service_id, time_slot_ids, reservation_date, quantity?, number_document? }`
  - `time_slot_ids` es una lista con una o más franjas. Para franjas seguidas se mandan varias (por ejemplo 5-6pm y 6-7pm).
  - `reservation_date` es la fecha de la reserva (`YYYY-MM-DD`).
  - `quantity` solo se manda cuando el servicio es `individual`.
  - `number_document` es la cédula. Solo es obligatoria si el usuario todavía no la tiene guardada en su perfil. Se guarda en `users.number_document` **(estimación)**.
- **Respuesta OK:** `201` `{ data: { reservation_id, expires_at, amount } }`
- **Errores:**
  - `400` "Debes indicar tu cédula para reservar"
  - `400` "Franja no disponible"
  - `400` "Las franjas deben ser del mismo servicio y seguidas"
  - `400` "Conflicto de horario: ya tienes una reserva en esa franja"
  - `400` "No se permiten reservas en fechas pasadas"
  - `400` "No se puede reservar con más de 15 días de anticipación"
  - `400` "Cantidad de personas inválida"
  - `400` "La cantidad supera el cupo disponible"
  - `401` "No autenticado"
  - `404` "Servicio o franja no encontrados"
- **Validaciones:**
  - Hay sesión y el rol es `client`
  - `service_id` y cada `time_slot_id` existen, y todas las franjas son de ese servicio, que está activo
  - Las franjas son seguidas: la hora de fin de una es la hora de inicio de la siguiente **(estimación)**
  - La fecha no es pasada ni pasa de hoy + 15 días
  - Todas las franjas están libres para esa fecha. Si dos clientes piden la misma al mismo tiempo, solo uno la consigue y el otro recibe "Franja no disponible".
  - El cliente no tiene otra reserva activa que se cruce en horario ese día. Puede tener las que quiera en horarios distintos, sin límite. (Ojo con la excepción de la cancha, está en los pendientes.)
  - Si el servicio es `individual`: `quantity` es obligatorio, un número entero mayor que 0 y no puede pasar del cupo que queda
  - Si el servicio es `group`: se ignora `quantity` y se guarda 1 **(estimación)**
  - `number_document` tiene máximo 20 caracteres
- **Qué se guarda:** una fila en `reservations` con `status = pending` y `expires_at = ahora + 10 minutos` (lo calcula el servidor), y una fila en `reservations_slots` por cada franja.
- **Cómo se calcula `amount` (estimación):** `hour_price` × horas totales de las franjas, y se multiplica por `quantity` si el servicio es `individual`. La tabla `reservations` no guarda el monto. Se calcula aquí y se guarda en `payments.amount` al crear el pago.

#### GET /api/reservations
- **Propósito:** Listar las reservas del cliente que tiene la sesión iniciada.
- **Rol:** Cliente
- **Body (entrada):** No lleva. Opcional en la URL: `status`.
- **Respuesta OK:** `200` `{ data: [ { reservation_id, service: { id, name }, reservation_date, slots: [ { time_slot_id, time_start, time_end } ], status, quantity, amount, expires_at } ] }`
  - `amount` sale de `payments.amount` cuando ya hay pago. Si no, se calcula igual que al crear la reserva.
- **Errores:**
  - `400` "Estado inválido"
  - `401` "No autenticado"
- **Validaciones:**
  - Solo devuelve las reservas del usuario de la sesión (`reservations.id_user`). Nunca se acepta un `user_id` por parámetro.
  - `status` tiene que ser uno de estos: `pending`, `confirmed`, `failed`, `expired`, `completed`

#### GET /api/reservations/:id
- **Propósito:** Ver el detalle de una reserva. Si ya está confirmada, incluye sus códigos QR.
- **Rol:** Cliente
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: { reservation_id, service: { id, name }, reservation_date, slots: [ { time_slot_id, time_start, time_end } ], status, quantity, amount, expires_at, qr_codes: [ { qr_id, token, used } ] } }`
  - `used` es verdadero cuando `qr_codes.used_at` tiene fecha.
  - Servicio `group`: `qr_codes` trae 1 QR.
  - Servicio `individual`: trae N QR, uno por persona.
  - Si la reserva no está `confirmed`, `qr_codes` viene vacío.
- **Errores:**
  - `401` "No autenticado"
  - `404` "Reserva no encontrada"
- **Validaciones:**
  - La reserva es del usuario de la sesión. Si es de otra persona, responde `404` y no `403`, para no confirmar que existe.



### 3.4 Pagos

Tablas: `payments`, `reservations`, `qr_codes`. El pago es solo en línea. No se puede pagar en el lugar.

#### POST /api/payments/create-intent
- **Propósito:** Crear el PaymentIntent de Stripe para pagar una reserva pendiente.
- **Rol:** Cliente
- **Body (entrada):** `{ reservation_id }`
- **Respuesta OK:** `200` `{ data: { client_secret, amount, expires_at } }`
- **Errores:**
  - `400` "La reserva ya no está pendiente"
  - `400` "El tiempo de pago venció. La franja fue liberada"
  - `401` "No autenticado"
  - `404` "Reserva no encontrada"
  - `500` "No se pudo iniciar el pago"
- **Validaciones:**
  - La reserva es del usuario
  - Está en estado `pending`
  - `expires_at` todavía no pasó (bloqueo de 10 minutos)
  - El monto lo calcula el servidor. Nunca se recibe del cliente.
- **Qué se guarda:** una fila en `payments` con `status = pending`, el `stripe_payment_intent_id` y el `amount`. Si la reserva ya tiene un pago `pending`, se reutiliza en vez de crear otro **(estimación)**.

#### POST /api/webhooks/stripe
- **Propósito:** Recibir de Stripe el resultado del pago (`payment_intent.succeeded` y `payment_intent.payment_failed`) y actualizar el pago y la reserva.
- **Rol:** Solo Stripe. No usa sesión de usuario, se valida con la firma del webhook.
- **Body (entrada):** El evento de Stripe (cuerpo sin modificar) y la cabecera `stripe-signature`.
- **Respuesta OK:** `200` `{ data: { received: true } }`
- **Errores:**
  - `400` "Firma inválida"
  - `500` "Error al procesar el evento" (Stripe lo vuelve a intentar)
- **Validaciones:**
  - La firma del evento es válida
  - El pago se busca por `stripe_payment_intent_id`. Si no existe en `payments`, se ignora.
  - Si el pago ya estaba en `succeeded`, el evento repetido no hace nada. El MER no guarda el id del evento, así que esa fila de `payments` es lo que evita procesarlo dos veces **(estimación)**.
  - Pago exitoso y `expires_at` vigente: `payments.status = succeeded`, la reserva pasa a `confirmed` y se crean los QR en `qr_codes` (1 si el servicio es `group`, `quantity` si es `individual`, según `services.qr_type`)
  - Pago exitoso pero **fuera de tiempo** (más de 10 minutos): la reserva no se confirma (queda `expired`) y la franja queda libre. Se responde `200` para que Stripe no insista, y el caso queda registrado. El dinero ya cobrado es un tema por confirmar.
  - Si llegan dos pagos para la misma franja y fecha, el segundo se rechaza: no se confirma esa reserva
  - Pago fallido: `payments.status = failed`, la reserva pasa a `failed` y la franja se libera
  - Al confirmar se mandan los QR por correo (ver `integraciones.md`)



### 3.5 QR y control de acceso (empleado)

Tablas: `qr_codes`, `access_logs`, `reservations`, `users`.

El empleado solo valida. No cuenta personas al escanear. Varios empleados pueden escanear al mismo tiempo desde distintas zonas, así que cada validación tiene que resolverse sin chocar con las demás (ver sección 4).

Sobre los acompañantes: en servicios grupales (cancha) no pueden entrar si el titular no está, y esperan al titular en una zona establecida. En los demás servicios se revisa que la información sea coherente. Esto lo controla el empleado en la puerta. La API no tiene cómo comprobar quién está presente.

Cada validación guarda una fila en `access_logs` con el empleado (`id_employee`), la reserva, el resultado (`granted` o `denied`) y la hora (`scanned_at`).

#### POST /api/access/validate-qr
- **Propósito:** Validar un QR escaneado y registrar el ingreso.
- **Rol:** Empleado
- **Body (entrada):** `{ token }`
- **Respuesta OK:** `200` `{ data: { valid: true, reservation_id, service_name, holder_name, reservation_date, time_start, time_end, quantity } }`
  - `holder_name` es `users.name` del dueño de la reserva.
  - `time_start` y `time_end` van desde el inicio de la primera franja hasta el fin de la última.
- **Errores:**
  - `400` "El código QR es obligatorio"
  - `400` "La reserva no está confirmada"
  - `400` "El código no corresponde a la fecha de hoy"
  - `401` "No autenticado"
  - `403` "No tienes permiso para validar accesos"
  - `404` "Código QR no reconocido"
  - `409` "Este código QR ya fue usado"
- **Validaciones:**
  - El rol es `employee`
  - El QR existe y la reserva está `confirmed`
  - El QR se usa una sola vez. El primer escaneo guarda `used_at` y `used_by` (el empleado) en `qr_codes`.
  - Si dos empleados escanean el mismo QR a la vez, solo uno recibe éxito y el otro recibe `409`
  - `reservation_date` es hoy. Si alguien del grupo llega tarde, se permite mientras los datos coincidan con la reserva (servicio, franja y titular).
  - Los intentos rechazados de un QR conocido (ya usado, otra fecha, reserva sin confirmar) se guardan en `access_logs` con `result = denied`. Un token que no existe no se puede guardar, porque `access_logs` pide un QR **(estimación)**.

#### GET /api/access/search
- **Propósito:** Buscar reservas para validar a mano (reingreso o cliente sin QR).
- **Rol:** Empleado
- **Body (entrada):** No lleva. En la URL, al menos uno de: `holder_name`, `number_document` (cédula) o `reservation_id`.
- **Respuesta OK:** `200` `{ data: [ { reservation_id, holder_name, number_document, service_name, reservation_date, time_start, time_end, status } ] }`
- **Errores:**
  - `400` "Debes enviar nombre, cédula o número de reserva"
  - `401` "No autenticado"
  - `403` "No tienes permiso"
- **Validaciones:**
  - El rol es `employee`
  - Viene al menos un criterio de búsqueda
  - `holder_name` busca coincidencias parciales en `users.name`. `number_document` busca en `users.number_document`.
  - Solo devuelve reservas `confirmed` (o `completed` el mismo día) con `reservation_date` de hoy

#### POST /api/access/validate-document
- **Propósito:** Dar acceso con la cédula física cuando el cliente no tiene el QR a la mano.
- **Rol:** Empleado
- **Body (entrada):** `{ reservation_id, number_document }`
- **Respuesta OK:** `200` `{ data: { valid: true, reservation_id, holder_name, service_name, time_start, time_end } }`
- **Errores:**
  - `400` "Reserva y cédula son obligatorias"
  - `400` "La cédula no coincide con el titular de la reserva"
  - `400` "La reserva no está confirmada"
  - `401` "No autenticado"
  - `403` "No tienes permiso"
  - `404` "Reserva no encontrada"
- **Validaciones:**
  - El rol es `employee`
  - `number_document` coincide con `users.number_document` del dueño de la reserva
  - La reserva está `confirmed` y su fecha es hoy
  - Los datos coinciden con la reserva (servicio, franja y titular)
  - Queda en `access_logs` como ingreso manual. Esta tabla no tiene una columna para distinguirlo de un ingreso con QR (ver pendientes).

#### POST /api/access/reentry
- **Propósito:** Registrar un reingreso dentro de la misma franja, validado a mano por el empleado (nombre del titular, servicio y franja).
- **Rol:** Empleado
- **Body (entrada):** `{ reservation_id }`
- **Respuesta OK:** `200` `{ data: { valid: true, reservation_id, holder_name } }`
- **Errores:**
  - `400` "El número de reserva es obligatorio"
  - `400` "La franja de esta reserva ya terminó"
  - `400` "Esta reserva todavía no tiene un primer ingreso"
  - `401` "No autenticado"
  - `403` "No tienes permiso"
  - `404` "Reserva no encontrada"
- **Validaciones:**
  - El rol es `employee`
  - Ya existe un ingreso `granted` de esa reserva en `access_logs`
  - La hora actual está entre el inicio de la primera franja y el fin de la última
  - Queda en `access_logs` como reingreso



### 3.6 Admin

Todos los endpoints de este módulo son solo para `admin`. Sin sesión responden `401`. Con otro rol responden `403` "No tienes permiso".

Los campos son los del MER (`database.md`). El MER no tiene `is_active` en `categories`, `time_slots` ni `users`, así que esos recursos solo se pueden crear, editar y borrar.

#### Categorías

##### GET /api/admin/categories
- **Propósito:** Listar todas las categorías.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: [ { id, name } ] }`
- **Errores:** `401`, `403`
- **Validaciones:** El rol es `admin`

##### POST /api/admin/categories
- **Propósito:** Crear una categoría.
- **Rol:** Admin
- **Body (entrada):** `{ name }`
- **Respuesta OK:** `201` `{ data: { id, name } }`
- **Errores:**
  - `400` "El nombre es obligatorio"
  - `400` "Ya existe una categoría con ese nombre"
  - `401`, `403`
- **Validaciones:** El nombre no está vacío, tiene máximo 200 caracteres y no se repite (`name` es único en el MER)

##### PATCH /api/admin/categories/:id
- **Propósito:** Editar una categoría.
- **Rol:** Admin
- **Body (entrada):** `{ name }`
- **Respuesta OK:** `200` `{ data: { id, name } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `404` "Categoría no encontrada"
  - `401`, `403`
- **Validaciones:** El nombre no está vacío y no se repite

##### DELETE /api/admin/categories/:id
- **Propósito:** Eliminar una categoría.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: null }`
- **Errores:**
  - `404` "Categoría no encontrada"
  - `409` "La categoría tiene servicios asociados"
  - `401`, `403`
- **Validaciones:** No tiene servicios asociados

#### Servicios

##### GET /api/admin/services
- **Propósito:** Listar todos los servicios, activos o no.
- **Rol:** Admin
- **Body (entrada):** Ninguno. Opcional en la URL: `category_id`.
- **Respuesta OK:** `200` `{ data: [ { id, name, category_id, capacity, max_companions, qr_type, is_active, hour_price } ] }`
- **Errores:** `401`, `403`
- **Validaciones:** El rol es `admin`

##### POST /api/admin/services
- **Propósito:** Crear un servicio.
- **Rol:** Admin
- **Body (entrada):** `{ name, category_id, capacity, max_companions?, qr_type, hour_price, is_active? }`
- **Respuesta OK:** `201` `{ data: { id, name, qr_type } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `404` "Categoría no encontrada"
  - `401`, `403`
- **Validaciones:**
  - `name` no está vacío y tiene máximo 50 caracteres
  - `hour_price` es 0 o más, con máximo 2 decimales
  - `capacity` es un entero mayor que 0
  - `qr_type` es `group` o `individual`
  - `max_companions` es un entero de 0 o más (por defecto 5)
  - `is_active` es verdadero o falso (por defecto verdadero)
  - La categoría existe

##### PATCH /api/admin/services/:id
- **Propósito:** Editar un servicio, o activarlo y desactivarlo con `is_active`.
- **Rol:** Admin
- **Body (entrada):** Cualquier campo del POST, todos opcionales.
- **Respuesta OK:** `200` `{ data: { id, ... } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `404` "Servicio no encontrado"
  - `409` "No se puede cambiar el tipo de QR con reservas activas"
  - `401`, `403`
- **Validaciones:** Las mismas reglas del POST. `qr_type` no se puede cambiar si hay reservas activas.

##### DELETE /api/admin/services/:id
- **Propósito:** Quitar un servicio.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: { deleted: true } }` si se eliminó, o `{ data: { deactivated: true } }` si solo se desactivó
- **Errores:**
  - `404` "Servicio no encontrado"
  - `409` "El servicio tiene reservas activas"
  - `401`, `403`
- **Validaciones (estimación):**
  - Con reservas activas (pendientes vigentes o confirmadas a futuro): se rechaza con `409`
  - Con reservas pasadas solamente: se desactiva (`is_active = false`) para no perder el historial
  - Sin ninguna reserva: se elimina junto con sus franjas

#### Horarios (franjas)

Las franjas son horas del día que se repiten todos los días. No llevan fecha.

##### GET /api/admin/time-slots
- **Propósito:** Listar las franjas de un servicio.
- **Rol:** Admin
- **Body (entrada):** No lleva. Obligatorio en la URL: `service_id`.
- **Respuesta OK:** `200` `{ data: [ { id, service_id, time_start, time_end } ] }`
- **Errores:**
  - `400` "service_id es obligatorio"
  - `401`, `403`
- **Validaciones:** El rol es `admin`

##### POST /api/admin/time-slots
- **Propósito:** Crear una franja horaria para un servicio.
- **Rol:** Admin
- **Body (entrada):** `{ service_id, time_start, time_end }` (horas en formato `HH:MM`)
- **Respuesta OK:** `201` `{ data: { id, service_id, time_start, time_end } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `400` "La hora de fin debe ser mayor que la de inicio"
  - `400` "La franja se cruza con otra existente"
  - `404` "Servicio no encontrado"
  - `401`, `403`
- **Validaciones:**
  - El servicio existe
  - `time_end` es mayor que `time_start`
  - No se cruza con otra franja del mismo servicio

##### PATCH /api/admin/time-slots/:id
- **Propósito:** Editar una franja.
- **Rol:** Admin
- **Body (entrada):** `{ time_start?, time_end? }`
- **Respuesta OK:** `200` `{ data: { id, service_id, time_start, time_end } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `404` "Franja no encontrada"
  - `409` "La franja tiene reservas asociadas"
  - `401`, `403`
- **Validaciones:** Las mismas del POST. No se cambian las horas si la franja ya está en alguna reserva activa.

##### DELETE /api/admin/time-slots/:id
- **Propósito:** Eliminar una franja.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: null }`
- **Errores:**
  - `404` "Franja no encontrada"
  - `409` "La franja tiene reservas asociadas"
  - `401`, `403`
- **Validaciones:** La franja no aparece en `reservations_slots`. Con historial no se puede borrar, porque el MER no tiene forma de desactivarla.

#### Empleados

Los empleados son filas de `users` con `role = employee`.

##### GET /api/admin/employees
- **Propósito:** Listar los empleados.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: [ { id, name, email, number_document } ] }`
- **Errores:** `401`, `403`
- **Validaciones:** El rol es `admin`

##### POST /api/admin/employees
- **Propósito:** Crear un usuario con rol `employee`.
- **Rol:** Admin
- **Body (entrada):** `{ name, email, number_document? }`
- **Respuesta OK:** `201` `{ data: { id, name, email } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `400` "El correo ya está registrado"
  - `401`, `403`
- **Validaciones:** El correo es válido, tiene máximo 100 caracteres y no se repite. `name` tiene máximo 50. El rol lo pone el servidor como `employee`. Cómo se le entrega la contraseña inicial queda por confirmar.

##### PATCH /api/admin/employees/:id
- **Propósito:** Editar los datos de un empleado.
- **Rol:** Admin
- **Body (entrada):** `{ name?, number_document? }`
- **Respuesta OK:** `200` `{ data: { id, name, email, number_document } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `404` "Empleado no encontrado"
  - `401`, `403`
- **Validaciones:** El usuario existe y tiene rol `employee`

##### DELETE /api/admin/employees/:id
- **Propósito:** Eliminar a un empleado.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: null }`
- **Errores:**
  - `404` "Empleado no encontrado"
  - `409` "El empleado tiene registros de acceso asociados"
  - `401`, `403`
- **Validaciones:** Tiene rol `employee` y no aparece en `access_logs.id_employee` ni en `qr_codes.used_by`. Si ya validó ingresos no se puede borrar, porque `users` no tiene `is_active` (ver pendientes).

#### Métricas

##### GET /api/admin/metrics
- **Propósito:** Mostrar los números principales para el dashboard del admin.
- **Rol:** Admin
- **Body (entrada):** No lleva. Opcional en la URL: `from` y `to` (`YYYY-MM-DD`), que se aplican sobre `reservation_date`.
- **Respuesta OK:** `200` `{ data: { total_reservations, by_status, total_revenue, by_service, entries } }`
  - `by_status`: cantidad de reservas por cada estado
  - `total_revenue`: suma de `payments.amount` con `status = succeeded` (estimación)
  - `by_service`: lista con `service_id`, `name`, cantidad de reservas e ingresos
  - `entries`: cantidad de `granted` y `denied` en `access_logs`
- **Errores:**
  - `400` "Rango de fechas inválido"
  - `401`, `403`
- **Validaciones:**
  - `from` no es mayor que `to`
  - Si no vienen fechas, se usa un rango por defecto (por confirmar)

Los indicadores exactos están por confirmar con el cliente. Lo de arriba es una propuesta que se puede calcular con las tablas del MER.



## 4. Reglas que aplican a varios endpoints

**Bloqueo de 10 minutos.** `POST /api/reservations` guarda `expires_at = ahora + 10 minutos`. Tanto `create-intent` como el webhook de Stripe rechazan cualquier pago que llegue después. Si el pago llega tarde, la reserva no se confirma y la franja se libera.

**Anticipación máxima.** No se puede reservar en fechas pasadas ni con más de 15 días de anticipación. Se revisa en `GET /api/services/:id/slots` y en `POST /api/reservations`.

**Franjas sin fecha.** Las franjas se repiten todos los días. La fecha de una reserva está en `reservations.reservation_date`, y la disponibilidad se calcula cruzando fecha y franja.

**Un cliente, un horario.** Un cliente no puede tener dos reservas que se crucen en horario el mismo día. En horarios distintos puede tener todas las que quiera. Se revisa en `POST /api/reservations`.

**Dos clientes, la misma franja.** Si dos clientes piden la misma franja al mismo tiempo, solo uno la consigue y el otro recibe `400` "Franja no disponible". Cómo se logra por dentro lo definen `reservas.md` y `database.md`. A la API le toca devolver el error correcto.

**Varios empleados escaneando.** Hay varios empleados en distintas zonas escaneando a la vez. La validación de un QR se hace en un solo paso: marcarlo como usado solo si `used_at` todavía está vacío. No se hace "primero leo y después actualizo", porque en ese espacio otro empleado podría escanear el mismo código. Así, si dos empleados escanean el mismo QR, uno entra y el otro recibe `409`.

**Webhook de Stripe.** Si llegan dos pagos para la misma franja, el segundo se rechaza. Además, un mismo evento de Stripe nunca se procesa dos veces.

**Cédula del titular.** Vive en `users.number_document`. Se pide al reservar si el usuario todavía no la tiene, y es lo que permite encontrar la reserva cuando el cliente no tiene el QR.

**Seguridad básica.** El rol y el `user_id` siempre salen de la sesión, nunca del body. El monto de un pago siempre lo calcula el servidor. Los mensajes de error no muestran detalles internos.

**Sin cancelaciones ni reembolsos.** No hay endpoints para eso. El no-show se cobra.



## 5. Cómo se conecta con el MER

Tablas que usa cada módulo:

| Módulo | Tablas |
|---|---|
| Autenticación | `users` (más Supabase Auth) |
| Servicios | `categories`, `services`, `time_slots`, `reservations_slots`, `reservations` |
| Reservas | `reservations`, `reservations_slots`, `time_slots`, `services`, `users` |
| Pagos | `payments`, `reservations`, `qr_codes` |
| QR y acceso | `qr_codes`, `access_logs`, `reservations`, `users` |
| Admin | `categories`, `services`, `time_slots`, `users`, `payments`, `access_logs` |

Campos del MER que usa la API:

| Tabla | Campos |
|---|---|
| `users` | `id` (UUID), `name` (50), `email` (100, único), `number_document` (20), `role` (`client`, `admin`, `employee`), `created_at` |
| `categories` | `id`, `name` (200, único), `created_at` |
| `services` | `id`, `name` (50), `id_category`, `capacity`, `max_companions`, `qr_type` (`group`, `individual`), `is_active`, `hour_price` (8,2), `created_at` |
| `time_slots` | `id`, `id_service`, `time_start`, `time_end`, `created_at` |
| `reservations` | `id`, `id_user`, `quantity`, `reservation_date`, `expires_at`, `status` (`pending`, `confirmed`, `failed`, `expired`, `completed`), `created_at` |
| `reservations_slots` | `id`, `id_time_slot`, `id_reservation`, `created_at` |
| `payments` | `id`, `id_reservation`, `stripe_payment_intent_id` (único), `status` (`pending`, `succeeded`, `failed`), `amount` (10,2), `created_at` |
| `qr_codes` | `id`, `id_reservation`, `token`, `used_at`, `used_by` (UUID del empleado), `created_at` |
| `access_logs` | `id`, `id_reservation`, `id_employee`, `id_QR_code`, `result` (`granted`, `denied`), `scanned_at` |

En el JSON de la API las llaves foráneas se escriben como `service_id`, `category_id`, `user_id`, `reservation_id` y `time_slot_id`. Los demás campos usan el mismo nombre que en el MER.

## Diseño MER

<img width="1024" height="532" alt="image" src="https://github.com/user-attachments/assets/9e926852-2e76-4286-a636-36951e83ecbd" />


## 6. De dónde viene cada regla

El documento del cliente pide dejar claro si una regla la dio el cliente o la decidió el equipo.

| Regla | Origen |
|---|---|
| Anticipación máxima de 15 días | Cliente |
| Sin límite de reservas en horarios distintos, pero no dos al mismo horario | Cliente |
| Se puede reservar a nombre de otra persona | Cliente |
| Se pueden reservar franjas seguidas si están libres | Cliente |
| Máximo 5 acompañantes por reserva, y no consumen cupo | Cliente |
| El QR se invalida al primer escaneo y ese escaneo activa la reserva | Cliente |
| Reingreso en la misma franja, validado a mano por el empleado | Cliente y equipo |
| En la cancha, los acompañantes no entran sin el titular | Cliente |
| Llegada tarde de alguien del grupo si la información es coherente | Cliente y equipo |
| Ingreso sin QR con la cédula física | Cliente |
| La cédula se registra al momento de reservar | Equipo |
| El empleado solo valida el QR, no cuenta personas | Cliente |
| Bloqueo de 10 minutos y pago tardío rechazado | Cliente |
| Varios empleados escaneando a la vez | Cliente |
| Sin cancelaciones ni reembolsos (fuera de alcance de esta versión) | Cliente |
| Pago solo en línea, sin pago presencial | Equipo |
| El no-show se cobra igual, sin reembolso | Equipo |



## 7. Pendientes por confirmar

Puntos donde este documento asume algo o depende de otra área. Se llevan a `#bloqueos` o al cierre de la Fase 1.

1. **Reserva a nombre de otra persona (Dev 1 y Dev 2).** El cliente dijo que sí se puede, pero `reservations` solo guarda `id_user`, sin nombre ni cédula del titular. Con el MER actual, la reserva siempre queda a nombre del usuario que la hace. Si se quiere soportar, hay que agregar campos de titular (por ejemplo nombre y cédula) en `reservations`, y `POST /api/reservations` los recibiría en el body.
2. **Cédula al registrarse o al reservar (Dev 1 y Dev 4).** La cédula está en `users.number_document`. Aquí se pide al reservar si falta, porque con Google OAuth no llega. Falta confirmar si debe ser obligatoria desde el registro.
3. **Excepción de la cancha en reservas simultáneas (Dev 2 y Tech Lead).** El cliente dice que no se permiten dos reservas al mismo horario, salvo la cancha de fútbol, pero lo que explica es solo lo del QR de grupo. No queda claro si un cliente puede reservar una cancha y otro servicio a la misma hora. Aquí se asume que no.
4. **Reglas de franjas seguidas (Dev 2).** El MER resuelve que una reserva puede tener varias franjas (`reservations_slots`). Aquí se asume que deben ser del mismo servicio, del mismo día y sin huecos. Falta confirmar si hay un máximo de franjas por reserva.
5. **Cómo se calcula el monto (Dev 2, Tech Lead y cliente).** El MER solo tiene `hour_price`. Aquí se asume `hour_price` × horas, multiplicado por `quantity` en servicios `individual`. Falta confirmar si el precio es por persona o por reserva, y qué pasa si una franja no dura una hora.
6. **Acompañantes (Dev 1 y Dev 2).** `max_companions` existe, pero `reservations` no tiene dónde guardar cuántos acompañantes vienen. Si solo es un límite que revisa el empleado, no hace falta nada. Si se quiere registrar el número, falta una columna.
7. **Canchas y cupo (Dev 2).** El cliente habló de la cancha de fútbol con QR de grupo. Falta confirmar si la cancha de polideportivo también va con QR de grupo. Aquí se asume que una reserva `group` ocupa la franja completa.
8. **Pago tardío (Tech Lead y cliente).** Ya se sabe que si el pago llega pasados los 10 minutos se rechaza y la franja se libera. Falta definir qué pasa con el dinero que Stripe ya cobró, porque no hay reembolsos. Hoy el pago queda como `succeeded` y la reserva como `expired`.
9. **Estado tras el primer escaneo (Dev 2).** El primer escaneo "activa la reserva", pero los estados del MER no incluyen uno de "activa". Aquí el escaneo solo llena `used_at` y `used_by` en `qr_codes` y no cambia el estado de la reserva. Falta confirmar si debe pasar a otro estado.
10. **Registro de accesos (Dev 1).** `access_logs` no distingue entre ingreso con QR, ingreso por cédula y reingreso, y pide siempre un `id_QR_code`. Los ingresos manuales no tienen QR. Hay que permitir que ese campo quede vacío y agregar una columna con el tipo de acceso.
11. **Llegada antes o después de la franja.** Se permite que alguien llegue tarde si los datos son coherentes, pero no está definido cuánto antes o después de la franja se acepta el ingreso.
12. **Días cerrados (Dev 1 y cliente).** Como las franjas no tienen fecha, no hay forma de cerrar un servicio un día en particular (mantenimiento, festivos). Falta definir si se necesita y cómo se guardaría.
13. **Desactivar en vez de borrar (Dev 1).** Solo `services` tiene `is_active`. `categories`, `time_slots` y `users` no, así que con historial no se pueden quitar. Para empleados es lo más importante: sin `is_active` no se les puede quitar el acceso sin borrarlos.
14. **Empleados (Dev 4).** Cómo recibe el empleado su contraseña inicial (invitación por correo con Resend, contraseña temporal, etc.).
15. **Métricas.** Confirmar con el cliente qué números quiere ver.
16. **QR por correo (Dev 4).** El documento del cliente habla de un envío múltiple de QR por correo. Falta definir si los QR de un servicio `individual` van todos en un solo correo o en uno por persona. Afecta lo que hace el webhook al confirmar.
17. **Nombres en el MER (Dev 1).** La imagen dice `acccess_logs` (con tres c) y el campo `aumont` en `payments`. Aquí se usan `access_logs` y `amount`. Conviene corregirlo en el diagrama antes de crear las tablas.
