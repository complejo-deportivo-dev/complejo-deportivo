# Diseño de API y Endpoints

Sistema de Reservas del Complejo Deportivo. Documento de la Fase 1 (Diseño), a cargo de Dev 3.

Aquí se define qué endpoints tiene el sistema, quién puede usarlos y qué responde cada uno. No hay código. Lo que todavía no está decidido queda marcado como **(por confirmar)** y se junta al final, en la sección 6.

Este documento se basa en la guía del equipo, la capa de diseño y el documento de respuestas del cliente. Si algo aquí choca con esos documentos, mandan ellos.

Documentos relacionados: `architecture.md` (Tech Lead), `database.md` (Dev 1), `reservas.md` (Dev 2) e `integraciones.md` (Dev 4).

---

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

---

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

**Roles**

| Rol | Quién es |
|---|---|
| Público | Cualquier persona, sin iniciar sesión |
| Cliente (`client`) | Usuario con sesión que hace reservas |
| Empleado (`employee`) | Personal que revisa los ingresos |
| Admin (`admin`) | Quien administra el complejo |

Los roles no se heredan. Cada endpoint dice exactamente quién lo puede usar.

---

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

---

## 3. Endpoints por módulo

### 3.1 Autenticación

Supabase Auth se encarga del registro, el login, Google OAuth y la recuperación de contraseña. Estos endpoints son la entrada desde el frontend. Cómo se guarda la sesión se define en `architecture.md` e `integraciones.md`.

#### POST /api/auth/register
- **Propósito:** Crear una cuenta nueva de cliente.
- **Rol:** Público
- **Body (entrada):** `{ full_name, email, password }`
- **Respuesta OK:** `201` `{ data: { user_id, email } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `400` "El correo ya está registrado"
- **Validaciones:**
  - El correo tiene formato válido
  - La contraseña cumple el mínimo que pide Supabase Auth
  - `full_name` no está vacío
  - El rol siempre es `client`. El usuario no lo puede elegir.

#### POST /api/auth/login
- **Propósito:** Iniciar sesión con correo y contraseña.
- **Rol:** Público
- **Body (entrada):** `{ email, password }`
- **Respuesta OK:** `200` `{ data: { user: { id, email, role } } }`
- **Errores:**
  - `400` "Correo y contraseña son obligatorios"
  - `401` "Correo o contraseña incorrectos"
- **Validaciones:**
  - Vienen los dos campos
  - El mensaje de error es el mismo falle el correo o la contraseña, para no dar pistas

#### GET /api/auth/callback
- **Propósito:** Recibir la respuesta de Google y crear la sesión.
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

---

### 3.2 Servicios (público / cliente)

#### GET /api/categories
- **Propósito:** Listar las categorías del complejo (Canchas, Piscinas, Zonas húmedas y Gimnasio).
- **Rol:** Público
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: [ { id, name } ] }`
- **Errores:** `500` "Error al obtener las categorías"
- **Validaciones:** Ninguna. Solo devuelve las categorías activas.

#### GET /api/services
- **Propósito:** Listar los servicios disponibles.
- **Rol:** Público
- **Body (entrada):** No lleva. Opcional en la URL: `category_id`.
- **Respuesta OK:** `200` `{ data: [ { id, name, description, category_id, price, qr_type } ] }`
- **Errores:**
  - `400` "category_id inválido"
  - `500` "Error al obtener los servicios"
- **Validaciones:** Si viene `category_id`, tiene que tener un formato válido. Solo devuelve servicios activos.

#### GET /api/services/:id
- **Propósito:** Ver el detalle de un servicio.
- **Rol:** Público
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: { id, name, description, category_id, price, qr_type, max_companions } }`
- **Errores:** `404` "Servicio no encontrado"
- **Validaciones:** El `id` tiene un formato válido.

`qr_type` puede ser `group` (un QR para todo el grupo) o `individual` (un QR por persona). Con eso el frontend sabe si tiene que pedir la cantidad de personas. `max_companions` es el máximo de acompañantes (5) y los acompañantes no cuentan en el cupo.

#### GET /api/services/:id/slots
- **Propósito:** Ver las franjas disponibles de un servicio en una fecha.
- **Rol:** Público
- **Body (entrada):** No lleva. Obligatorio en la URL: `date` (`YYYY-MM-DD`).
- **Respuesta OK:** `200` `{ data: [ { time_slot_id, start_time, end_time, available } ] }`
  Si el servicio es `individual`, cada franja trae también `remaining_capacity` (cupos que quedan).
- **Errores:**
  - `400` "La fecha es obligatoria o tiene un formato inválido"
  - `400` "No se puede consultar una fecha pasada"
  - `400` "Solo se puede reservar con máximo 15 días de anticipación"
  - `404` "Servicio no encontrado"
- **Validaciones:**
  - La fecha no es pasada
  - La fecha no pasa de hoy + 15 días
  - Una franja bloqueada por otro cliente (10 minutos) aparece como no disponible

---

### 3.3 Reservas (cliente)

#### POST /api/reservations
- **Propósito:** Crear una reserva en estado `pending` y bloquear la franja por 10 minutos.
- **Rol:** Cliente con sesión
- **Body (entrada):** `{ service_id, time_slot_id, holder_document, holder_name?, quantity? }`
  - `holder_document` es la cédula del titular. Es obligatoria, porque es lo que permite encontrar la reserva si el cliente llega sin QR.
  - `holder_name` es opcional. Se manda cuando la reserva es a nombre de otra persona. Si no viene, se usa el nombre del cliente.
  - `quantity` solo se manda cuando el servicio es `individual`.
- **Respuesta OK:** `201` `{ data: { reservation_id, expires_at, amount } }`
- **Errores:**
  - `400` "La cédula del titular es obligatoria"
  - `400` "Franja no disponible"
  - `400` "Conflicto de horario: ya tienes una reserva en esa franja"
  - `400` "No se permiten reservas en fechas pasadas"
  - `400` "No se puede reservar con más de 15 días de anticipación"
  - `400` "Cantidad de personas inválida"
  - `400` "La cantidad supera el cupo disponible"
  - `401` "No autenticado"
  - `404` "Servicio o franja no encontrados"
- **Validaciones:**
  - Hay sesión y el rol es `client`
  - `holder_document` viene y no está vacío
  - La franja es del servicio que se pidió
  - La fecha no es pasada ni pasa de hoy + 15 días
  - La franja está libre. Si dos clientes piden la misma al mismo tiempo, solo uno la consigue y el otro recibe "Franja no disponible".
  - El cliente no tiene otra reserva en ese mismo horario. Puede tener las que quiera en horarios distintos, sin límite. (Ojo con la excepción de la cancha, está en los pendientes.)
  - Franjas seguidas (por ejemplo 5-6pm y 6-7pm) sí se permiten mientras estén libres, y no cuentan como choque de horario
  - Si el servicio es `individual`: `quantity` es obligatorio, un número entero mayor que 0 y no puede pasar del cupo que queda en la franja
  - Si el servicio es `group`: se ignora `quantity`
  - `expires_at` lo calcula el servidor (ahora + 10 minutos). El cliente no lo manda.

#### GET /api/reservations
- **Propósito:** Listar las reservas del cliente que tiene la sesión iniciada.
- **Rol:** Cliente
- **Body (entrada):** No lleva. Opcional en la URL: `status`.
- **Respuesta OK:** `200` `{ data: [ { reservation_id, service_name, holder_name, date, start_time, end_time, status, quantity, amount } ] }`
- **Errores:**
  - `400` "Estado inválido"
  - `401` "No autenticado"
- **Validaciones:**
  - Solo devuelve las reservas del usuario de la sesión. Nunca se acepta un `user_id` por parámetro.
  - `status` tiene que ser uno de estos: `pending`, `confirmed`, `failed`, `expired`, `completed`

#### GET /api/reservations/:id
- **Propósito:** Ver el detalle de una reserva. Si ya está confirmada, incluye sus códigos QR.
- **Rol:** Cliente
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: { reservation_id, service, holder_name, holder_document, date, start_time, end_time, status, quantity, amount, expires_at, qr_codes: [ { qr_id, token, used } ] } }`
  - Servicio `group`: `qr_codes` trae 1 QR.
  - Servicio `individual`: trae N QR, uno por persona.
  - Si la reserva no está `confirmed`, `qr_codes` viene vacío.
- **Errores:**
  - `401` "No autenticado"
  - `404` "Reserva no encontrada"
- **Validaciones:**
  - La reserva es del usuario de la sesión. Si es de otra persona, responde `404` y no `403`, para no confirmar que existe.

---

### 3.4 Pagos

El pago es solo en línea. No se puede pagar en el lugar.

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

#### POST /api/webhooks/stripe
- **Propósito:** Recibir de Stripe el resultado del pago (`payment_intent.succeeded` y `payment_intent.payment_failed`) y actualizar la reserva.
- **Rol:** Solo Stripe. No usa sesión de usuario, se valida con la firma del webhook.
- **Body (entrada):** El evento de Stripe (cuerpo sin modificar) y la cabecera `stripe-signature`.
- **Respuesta OK:** `200` `{ data: { received: true } }`
- **Errores:**
  - `400` "Firma inválida"
  - `500` "Error al procesar el evento" (Stripe lo vuelve a intentar)
- **Validaciones:**
  - La firma del evento es válida
  - El evento no se procesó antes (se guarda el id del evento para no repetirlo)
  - Pago exitoso y `expires_at` vigente: la reserva pasa a `confirmed` y se generan los QR (1 si el servicio es `group`, N si es `individual`, según `services.qr_type`)
  - Pago exitoso pero **fuera de tiempo** (más de 10 minutos): se rechaza, la reserva no se confirma y la franja queda libre. Se responde `200` para que Stripe no insista, y el rechazo se registra.
  - Si llegan dos pagos para la misma franja, el segundo se rechaza
  - Pago fallido: la reserva pasa a `failed` y la franja se libera
  - Al confirmar se mandan los QR por correo (ver `integraciones.md`)

---

### 3.5 QR y control de acceso (empleado)

El empleado solo valida. No cuenta personas al escanear. Varios empleados pueden escanear al mismo tiempo desde distintas zonas, así que cada validación tiene que resolverse sin chocar con las demás (ver sección 4).

Sobre los acompañantes: en servicios grupales (cancha) no pueden entrar si el titular no está, y esperan al titular en una zona establecida. En los demás servicios se revisa que la información sea coherente. Esto lo controla el empleado en la puerta. La API no tiene cómo comprobar quién está presente.

#### POST /api/access/validate-qr
- **Propósito:** Validar un QR escaneado y registrar el ingreso.
- **Rol:** Empleado
- **Body (entrada):** `{ token }`
- **Respuesta OK:** `200` `{ data: { valid: true, reservation_id, service_name, holder_name, start_time, end_time, quantity } }`
- **Errores:**
  - `400` "El código QR es obligatorio"
  - `400` "La reserva no está confirmada"
  - `400` "El código no corresponde a la franja de hoy"
  - `401` "No autenticado"
  - `403` "No tienes permiso para validar accesos"
  - `404` "Código QR no reconocido"
  - `409` "Este código QR ya fue usado"
- **Validaciones:**
  - El rol es `employee`
  - El QR existe y la reserva está `confirmed`
  - El QR se usa una sola vez. El primer escaneo lo invalida y activa la reserva.
  - Si dos empleados escanean el mismo QR a la vez, solo uno recibe éxito y el otro recibe `409`
  - La franja es de hoy. Si alguien del grupo llega tarde, se permite mientras los datos coincidan con la reserva (servicio, franja y titular).
  - Cada escaneo queda guardado en `access_logs`

#### GET /api/access/search
- **Propósito:** Buscar reservas para validar a mano (reingreso o cliente sin QR).
- **Rol:** Empleado
- **Body (entrada):** No lleva. En la URL, al menos uno de: `holder_name`, `document` (cédula) o `reservation_id`.
- **Respuesta OK:** `200` `{ data: [ { reservation_id, holder_name, document, service_name, start_time, end_time, status } ] }`
- **Errores:**
  - `400` "Debes enviar nombre, cédula o número de reserva"
  - `401` "No autenticado"
  - `403` "No tienes permiso"
- **Validaciones:**
  - El rol es `employee`
  - Viene al menos un criterio de búsqueda
  - Solo devuelve reservas `confirmed` (o ya activadas) con franja de hoy

#### POST /api/access/validate-document
- **Propósito:** Dar acceso con la cédula física cuando el cliente no tiene el QR a la mano.
- **Rol:** Empleado
- **Body (entrada):** `{ reservation_id, document }`
- **Respuesta OK:** `200` `{ data: { valid: true, reservation_id, holder_name, service_name, start_time, end_time } }`
- **Errores:**
  - `400` "Reserva y cédula son obligatorias"
  - `400` "La cédula no coincide con el titular de la reserva"
  - `400` "La reserva no está confirmada"
  - `401` "No autenticado"
  - `403` "No tienes permiso"
  - `404` "Reserva no encontrada"
- **Validaciones:**
  - El rol es `employee`
  - La cédula coincide con la que el titular registró al reservar
  - La reserva está `confirmed` y la franja es de hoy
  - Los datos coinciden con la reserva (servicio, franja y titular)
  - Queda en `access_logs` como ingreso manual por cédula

#### POST /api/access/reentry
- **Propósito:** Registrar un reingreso dentro de la misma franja, validado a mano por el empleado (nombre del titular, servicio y franja).
- **Rol:** Empleado
- **Body (entrada):** `{ reservation_id }`
- **Respuesta OK:** `200` `{ data: { valid: true, reservation_id, holder_name } }`
- **Errores:**
  - `400` "El número de reserva es obligatorio"
  - `400` "La franja de esta reserva ya terminó"
  - `401` "No autenticado"
  - `403` "No tienes permiso"
  - `404` "Reserva no encontrada"
- **Validaciones:**
  - El rol es `employee`
  - La reserva ya tuvo un primer ingreso
  - La hora actual sigue dentro de la misma franja
  - Queda en `access_logs` como reingreso

---

### 3.6 Admin

Todos los endpoints de este módulo son solo para `admin`. Sin sesión responden `401`. Con otro rol responden `403` "No tienes permiso".

Los campos de cada recurso tienen que coincidir con las columnas de `database.md`.

#### Categorías

##### GET /api/admin/categories
- **Propósito:** Listar todas las categorías, activas o no.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: [ { id, name, active } ] }`
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
- **Validaciones:** El nombre no está vacío y no se repite

##### PATCH /api/admin/categories/:id
- **Propósito:** Editar una categoría.
- **Rol:** Admin
- **Body (entrada):** `{ name?, active? }`
- **Respuesta OK:** `200` `{ data: { id, name, active } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `404` "Categoría no encontrada"
  - `401`, `403`
- **Validaciones:** Viene al menos un campo. Si cambia el nombre, no puede repetirse.

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
- **Respuesta OK:** `200` `{ data: [ { id, name, description, category_id, price, capacity, qr_type, max_companions, active } ] }`
- **Errores:** `401`, `403`
- **Validaciones:** El rol es `admin`

##### POST /api/admin/services
- **Propósito:** Crear un servicio.
- **Rol:** Admin
- **Body (entrada):** `{ name, description, category_id, price, capacity, qr_type, max_companions? }`
- **Respuesta OK:** `201` `{ data: { id, name, qr_type } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `404` "Categoría no encontrada"
  - `401`, `403`
- **Validaciones:**
  - `name` no está vacío
  - `price` es 0 o más
  - `capacity` es un entero mayor que 0
  - `qr_type` es `group` o `individual`
  - `max_companions` es un entero de 0 o más (por defecto 5)
  - La categoría existe

##### PATCH /api/admin/services/:id
- **Propósito:** Editar un servicio.
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
- **Propósito:** Eliminar (o desactivar) un servicio.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: null }`
- **Errores:**
  - `404` "Servicio no encontrado"
  - `409` "El servicio tiene reservas asociadas"
  - `401`, `403`
- **Validaciones:** No tiene reservas activas. Si tiene historial, se desactiva en vez de borrarse (por confirmar).

#### Horarios (franjas)

##### GET /api/admin/time-slots
- **Propósito:** Listar las franjas de un servicio.
- **Rol:** Admin
- **Body (entrada):** No lleva. En la URL: `service_id` (obligatorio) y `date` (opcional).
- **Respuesta OK:** `200` `{ data: [ { id, service_id, date, start_time, end_time, active } ] }`
- **Errores:**
  - `400` "service_id es obligatorio"
  - `401`, `403`
- **Validaciones:** El rol es `admin`

##### POST /api/admin/time-slots
- **Propósito:** Crear una franja horaria para un servicio.
- **Rol:** Admin
- **Body (entrada):** `{ service_id, date, start_time, end_time }`
- **Respuesta OK:** `201` `{ data: { id, service_id, date, start_time, end_time } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `400` "La hora de fin debe ser mayor que la de inicio"
  - `400` "La franja se cruza con otra existente"
  - `404` "Servicio no encontrado"
  - `401`, `403`
- **Validaciones:**
  - El servicio existe
  - `end_time` es mayor que `start_time`
  - No se cruza con otra franja del mismo servicio

##### PATCH /api/admin/time-slots/:id
- **Propósito:** Editar una franja.
- **Rol:** Admin
- **Body (entrada):** `{ start_time?, end_time?, active? }`
- **Respuesta OK:** `200` `{ data: { id, ... } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `404` "Franja no encontrada"
  - `409` "La franja tiene reservas activas"
  - `401`, `403`
- **Validaciones:** Las mismas del POST. No se cambian las horas si la franja tiene reservas activas.

##### DELETE /api/admin/time-slots/:id
- **Propósito:** Eliminar una franja.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: null }`
- **Errores:**
  - `404` "Franja no encontrada"
  - `409` "La franja tiene reservas asociadas"
  - `401`, `403`
- **Validaciones:** No tiene reservas activas

#### Empleados

##### GET /api/admin/employees
- **Propósito:** Listar los empleados.
- **Rol:** Admin
- **Body (entrada):** Ninguno
- **Respuesta OK:** `200` `{ data: [ { id, full_name, email, active } ] }`
- **Errores:** `401`, `403`
- **Validaciones:** El rol es `admin`

##### POST /api/admin/employees
- **Propósito:** Crear un usuario con rol `employee`.
- **Rol:** Admin
- **Body (entrada):** `{ full_name, email }`
- **Respuesta OK:** `201` `{ data: { id, full_name, email } }`
- **Errores:**
  - `400` "Datos inválidos"
  - `400` "El correo ya está registrado"
  - `401`, `403`
- **Validaciones:** El correo es válido y no se repite. El rol lo pone el servidor como `employee`. Cómo se le entrega la contraseña inicial queda por confirmar.

##### PATCH /api/admin/employees/:id
- **Propósito:** Editar o desactivar a un empleado.
- **Rol:** Admin
- **Body (entrada):** `{ full_name?, active? }`
- **Respuesta OK:** `200` `{ data: { id, full_name, email, active } }`
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
- **Validaciones:** Tiene rol `employee`. Si ya validó ingresos, se desactiva en vez de borrarse (por confirmar).

#### Métricas

##### GET /api/admin/metrics
- **Propósito:** Mostrar los números principales para el dashboard del admin.
- **Rol:** Admin
- **Body (entrada):** No lleva. Opcional en la URL: `from` y `to` (`YYYY-MM-DD`).
- **Respuesta OK:** `200` `{ data: { total_reservations, by_status, total_revenue, by_service, occupancy } }`
- **Errores:**
  - `400` "Rango de fechas inválido"
  - `401`, `403`
- **Validaciones:**
  - `from` no es mayor que `to`
  - Si no vienen fechas, se usa un rango por defecto (por confirmar)

Los indicadores exactos están por confirmar con el cliente. Lo de arriba es una propuesta.

---

## 4. Reglas que aplican a varios endpoints

**Bloqueo de 10 minutos.** `POST /api/reservations` guarda `expires_at = ahora + 10 minutos`. Tanto `create-intent` como el webhook de Stripe rechazan cualquier pago que llegue después. Si el pago llega tarde, la reserva no se confirma y la franja se libera.

**Anticipación máxima.** No se puede reservar en fechas pasadas ni con más de 15 días de anticipación. Se revisa en `GET /api/services/:id/slots` y en `POST /api/reservations`.

**Un cliente, un horario.** Un cliente no puede tener dos reservas al mismo horario. En horarios distintos puede tener todas las que quiera. Se revisa en `POST /api/reservations`.

**Dos clientes, la misma franja.** Si dos clientes piden la misma franja al mismo tiempo, solo uno la consigue y el otro recibe `400` "Franja no disponible". Cómo se logra por dentro lo definen `reservas.md` y `database.md`. A la API le toca devolver el error correcto.

**Varios empleados escaneando.** Hay varios empleados en distintas zonas escaneando a la vez. La validación de un QR se hace en un solo paso: marcarlo como usado solo si todavía no lo está. No se hace "primero leo y después actualizo", porque en ese espacio otro empleado podría escanear el mismo código. Así, si dos empleados escanean el mismo QR, uno entra y el otro recibe `409`.

**Webhook de Stripe.** Si llegan dos pagos para la misma franja, el segundo se rechaza. Además, un mismo evento de Stripe nunca se procesa dos veces.

**Cédula del titular.** Se pide al reservar y queda guardada. Es lo que permite encontrar la reserva cuando el cliente no tiene el QR.

**Seguridad básica.** El rol y el `user_id` siempre salen de la sesión, nunca del body. El monto de un pago siempre lo calcula el servidor. Los mensajes de error no muestran detalles internos.

**Sin cancelaciones ni reembolsos.** No hay endpoints para eso. El no-show se cobra.

---

## 5. De dónde viene cada regla

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

---

## 6. Pendientes por confirmar

Puntos donde este documento asume algo o depende de otra área. Se llevan a `#bloqueos` o al cierre de la Fase 1.

1. **Cédula del titular (Dev 1).** Ya se sabe que se pide al reservar y que sirve para buscar la reserva, y por eso `POST /api/reservations` la recibe. Falta definir dónde se guarda (`users` o `reservations`) y confirmar que, cuando se reserva a nombre de otra persona, la cédula que se pide es la de esa persona.
2. **Excepción de la cancha en reservas simultáneas (Dev 2 y Tech Lead).** El cliente dice que no se permiten dos reservas al mismo horario, salvo la cancha de fútbol, pero lo que explica es solo lo del QR de grupo. No queda claro si un cliente puede reservar una cancha y otro servicio a la misma hora. Aquí se asume que no.
3. **Franjas seguidas (Dev 2).** Ya se confirmó que se permiten. Falta decidir cómo se hace: una reserva por franja o una lista `time_slot_ids` en una sola petición. También define si se paga una vez o varias.
4. **Acompañantes (Dev 2).** Se sabe que el máximo es 5 y que no ocupan cupo. Falta saber si el número de acompañantes se manda en el body y se guarda, o si solo es un límite.
5. **Canchas y cupo (Dev 2).** El cliente habló de la cancha de fútbol con QR de grupo. Falta confirmar si la cancha de polideportivo también va con QR de grupo. Además, aquí se asume que una reserva `group` ocupa la franja completa.
6. **Pago tardío (Tech Lead y cliente).** Ya se sabe que si el pago llega pasados los 10 minutos se rechaza y la franja se libera. Falta definir qué pasa con el dinero que Stripe ya cobró, porque no hay reembolsos.
7. **Estado tras el primer escaneo (Dev 2).** El primer escaneo "activa la reserva", pero los estados definidos son `pending`, `confirmed`, `failed`, `expired` y `completed`. Falta confirmar a cuál pasa la reserva al escanear.
8. **Llegada antes o después de la franja.** Se permite que alguien llegue tarde si los datos son coherentes, pero no está definido cuánto antes o después de la franja se acepta el ingreso.
9. **Horarios (Dev 1 y cliente).** Falta definir si el admin crea las franjas una por una, por fecha, o si arma una plantilla semanal que las genera.
10. **Empleados (Dev 4).** Cómo recibe el empleado su contraseña inicial (invitación por correo con Resend, contraseña temporal, etc.).
11. **Borrado.** Para servicios y empleados con historial, decidir entre eliminar o desactivar.
12. **Métricas.** Confirmar con el cliente qué números quiere ver.
13. **QR por correo (Dev 4).** El documento del cliente habla de un envío múltiple de QR por correo. Falta definir si los QR de un servicio `individual` van todos en un solo correo o en uno por persona. Afecta lo que hace el webhook al confirmar.