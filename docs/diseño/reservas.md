# Diseño del Sistema de Reservas

## 1. Estados de una reserva

El ciclo de vida de una reserva está gestionado por un autómata de estados finitos que garantiza la consistencia del sistema. Los estados definidos son los siguientes:

- **`pending`**: El cliente ha seleccionado una franja horaria disponible (y la cantidad de personas en servicios individuales) y la reserva ha sido registrada en el sistema. En este estado se activa el bloqueo temporal creando los registros en `reservation_slots` (`is_active = true`) y estableciendo `reservations.expires_at`. El estado es asignado por el **Sistema Backend** cuando el cliente inicia la reserva y permanece hasta que se complete el pago o expire el tiempo límite de 10 minutos.
- **`confirmed`**: El pago fue procesado exitosamente por la pasarela (Stripe). La reserva queda garantizada y se generan los códigos QR de acceso (guardados en `qr_codes` y enviados al cliente). Este estado es actualizado por el **Sistema Backend (vía Webhook de Stripe)** inmediatamente al recibir la confirmación del evento de pago exitoso.
- **`failed`**: El proceso de pago fue rechazado o declinado por la pasarela (Stripe). La reserva queda invalidada y sus franjas en `reservation_slots` se liberan inmediatamente marcando `is_active = false`. Este estado es establecido por el **Sistema Backend / Webhook de Stripe** ante un fallo explícito en el cobro.
- **`expired`**: Transcurrió el tiempo límite de bloqueo temporal (10 minutos) sin que el cliente realizara el pago (por ejemplo, abandono del checkout). La reserva queda invalidada y sus franjas en `reservation_slots` son liberadas marcando `is_active = false`. Este estado lo asigna un **Job programado (`pg_cron` en BD)** que monitorea y limpia periódicamente las reservas en `pending` vencidas.
- **`completed`**: El cliente (o los asistentes) se presentó en las instalaciones dentro del horario correspondiente y el empleado validó su ingreso mediante el escaneo del código QR. El estado es actualizado por el **Empleado** tras escanear el QR y pulsar explícitamente el botón "Dar acceso".

---

## 2. Flujo completo de una reserva

El flujo de una reserva abarca desde la selección inicial hasta el ingreso del usuario a las instalaciones:

1. **Selección de Franja Horaria**: El cliente navega por el catálogo de categorías y servicios, elige la fecha deseada y consulta las franjas horarias disponibles.
2. **Selección de Cantidad de Personas**: En servicios de tipo `individual` (ej. piscina, gimnasio), el cliente selecciona la cantidad de personas o cupos a reservar ($N = \text{quantity}$). En servicios de tipo `group` (ej. canchas deportivas), el alquiler cubre la franja completa para el grupo y la cantidad es 1.
3. **Validación de Disponibilidad e Inserción en `pending`**: El cliente solicita reservar. El sistema valida en la base de datos que haya disponibilidad suficiente para la cantidad solicitada y que el cliente no posea reservas simultáneas. Se crea el registro de reserva en estado `pending`, se asocian las franjas en `reservation_slots` (`is_active = true`) y se asigna la fecha límite en `reservations.expires_at` (10 minutos).
4. **Bloqueo Temporal y Redirección a Pago**: La franja horaria (o los cupos correspondientes) queda bloqueada temporalmente para otros usuarios mientras el cliente es redirigido a la pasarela de pago (Stripe Checkout).
5. **Procesamiento del Pago**: 
   - **Caso Exitoso**: Stripe procesa el pago e impacta el backend mediante un Webhook asíncrono (`POST /api/webhooks/stripe`). El sistema cambia el estado de la reserva a `confirmed`, genera los tokens QR opacos en la tabla `qr_codes` (1 QR para servicios `group`, $N$ QRs para servicios `individual`) y envía un correo electrónico de confirmación con los códigos QR adjuntos.
   - **Caso Pago Rechazado (`failed`)**: Si Stripe rechaza la transacción (fondos insuficientes, tarjeta declinada, etc.), el Webhook notifica el fallo, el sistema pasa la reserva a `failed` y libera inmediatamente las franjas en `reservation_slots` marcando `is_active = false`.
   - **Caso Abandono / Tiempo Vencido (`expired`)**: Si el cliente abandona el proceso o no completa el pago antes de que venza `expires_at`, el job de `pg_cron` cambia el estado de la reserva a `expired` y libera las franjas en `reservation_slots` marcando `is_active = false`.
6. **Ingreso y Validación en las Instalaciones**: El cliente o asistentes acuden al complejo deportivo y presentan su código QR desde su dispositivo móvil. El empleado abre la aplicación en vista de escaneo, lee el código QR con la cámara de su celular y el servidor busca el token opaco en la tabla `qr_codes` para resolver la reserva y validar en tiempo real la vigencia, horario y estado. Al presionar el botón "Dar acceso", el QR se marca como usado (`used = true`), la reserva se actualiza a `completed` y el QR queda inhabilitado para futuros accesos.

---

## 3. Bloqueo temporal

Para evitar el sobrecupo y garantizar una reserva justa durante la transacción de pago, se implementa un mecanismo de bloqueo temporal:

- **Cómo se bloquea**: Se ejecuta mediante la creación de registros en la tabla `reservation_slots` con `is_active = true` y el campo `reservations.expires_at`. Al momento de crear la reserva en estado `pending`, este campo se llena con la fecha y hora exacta en que finalizará la ventana de oportunidad para pagar (`NOW() + INTERVAL '10 minutes'`).
- **Cuánto dura**: La ventana de bloqueo temporal está fijada en **10 minutos**.
- **Quién lo libera**: 
  - Si el cliente abandona el flujo y transcurre el tiempo límite, la liberación la realiza automáticamente el job de base de datos (`pg_cron`), pasando la reserva a `expired` y marcando `is_active = false` en `reservation_slots`.
  - Si la pasarela de pago rechaza la transacción, el webhook de Stripe marca la reserva como `failed` y libera las franjas marcando `is_active = false` en `reservation_slots`.

---

## 4. Expiración automática

- **Qué pasa si no se paga a tiempo (Abandono)**: La reserva pierde toda validez, su estado pasa a `expired` y la franja horaria queda nuevamente libre para otros usuarios.
- **Cómo se libera (Job/Cron)**: Se utiliza la extensión de PostgreSQL **`pg_cron`** configurada directamente en la base de datos Supabase. El job ejecuta una función almacenada periódica que identifica todas las reservas cuya condición cumpla `status = 'pending' AND expires_at < NOW()`. Al procesar cada reserva vencida:
  1. Actualiza el estado de la reserva a `expired`.
  2. Actualiza los registros asociados en `reservation_slots` marcando **`is_active = false`** para liberar de forma efectiva los cupos y la disponibilidad de las franjas.
- **Cada cuánto corre el job**: El job programado se ejecuta de manera continua **cada 1 minuto** para garantizar una rápida liberación de franjas bloqueadas ineficientemente.

---

## 5. Confirmación por pago

- **Cómo llega la confirmación de Stripe**: La confirmación no depende de la navegación del usuario en el frontend, sino de una llamada directa servidor a servidor enviada por Stripe a través de un Webhook seguro (`POST /api/webhooks/stripe`) firmado criptográficamente.
- **Qué cambia en el sistema al confirmar**: 
  1. El estado de la reserva cambia de `pending` a `confirmed`.
  2. Se generan los tokens QR opacos (UUIDs aleatorios generados con `crypto.randomBytes(32)`), registrándolos en la tabla `qr_codes`:
     - 1 código QR para servicios `group` (cancha completa).
     - $N$ códigos QR para servicios `individual` (donde $N = \text{reservation.quantity}$).
  3. Se dispara una tarea asíncrona que envía un correo electrónico de confirmación al cliente (vía Resend/SendGrid) con los detalles de la reserva y los códigos QR adjuntos.
- **Qué pasa si el pago falla**: Si la transacción es declinada o rechazada por la pasarela, Stripe notifica el evento de fallo. El sistema cambia el estado a `failed` y libera inmediatamente las franjas horarias marcando `is_active = false` en `reservation_slots`.

---

## 6. Control de concurrencia

- **Cómo se evita que dos clientes confirmen la misma franja**: Para prevenir que dos o más usuarios intenten reservar o confirmar la misma franja de forma paralela, el sistema emplea transacciones con bloqueos explícitos (*locks* / transacciones SQL) en la base de datos sobre la tabla `reservation_slots`.
- **Diferencia entre servicios `group` y servicios `individual`**: 
  - **Servicios `group` (Canchas / Reserva de espacio completo)**: Una franja horaria solo admite **1 reserva activa** (`pending` no expirada o `confirmed` con `is_active = true` en `reservation_slots`) por instancia física (ej. Cancha 1).
  - **Servicios `individual` (Cupo por persona / Piscina / Gimnasio)**: Permite múltiples reservas concurrentes sobre la misma franja siempre que la suma de cupos activos (`quantity` de reservas `pending` no expiradas + `confirmed` con `is_active = true` en `reservation_slots`) no exceda la capacidad máxima (`capacity`) parametrizada para la instancia.
- **Dónde vive la validación**: Toda la lógica y control de concurrencia habita estrictamente a nivel de **Base de Datos** (mediante constraints, funciones almacenadas SQL y transacciones). No se confía en el código de la aplicación frontend o backend Next.js para evitar condiciones de carrera (*race conditions*) bajo alta carga.

---

## 7. Control de capacidad

- **Cómo se valida el cupo máximo en servicios individuales (`individual`)**: Al intentar reservar un servicio individual, el sistema calcula en tiempo real la capacidad ocupada mediante la consulta de cupos activos en la franja (`reservation_slots` con `is_active = true` asociadas a reservas con `status IN ('pending', 'confirmed') AND (expires_at > NOW() OR status = 'confirmed')`). Si `cupos_ocupados + cantidad_solicitada <= capacity`, se permite el registro en `pending`.
- **Qué pasa cuando la franja está llena**: Cuando la suma de cupos alcanza el límite de capacidad, la franja se marca automáticamente como **"no disponible"** o **"sin cupo"** en la interfaz del usuario y la BD rechaza de forma atómica cualquier intento adicional de reserva en ese horario.

---

## 8. Restricciones de negocio

Las siguientes reglas de negocio (RN) se aplican rigurosamente en toda la plataforma:

- **Fechas y Horas Pasadas (RN-04)**: No se permiten búsquedas, selecciones ni creaciones de reservas en fechas o franjas horarias que ya hayan transcurrido.
- **Reservas Simultáneas del Mismo Cliente (RN-03)**: Un mismo usuario no puede mantener dos reservas activas (`pending` o `confirmed`) cuyos rangos de tiempo se solapen, incluso si pertenecen a servicios o instalaciones distintas. Esto evita la monopolización o imposibilidad física de asistencia.
- **Zona Horaria Oficial**: Toda la persistencia, validación de franjas, cálculo de expiración y lógica de fechas opera bajo la zona horaria **`America/Bogotá`** (UTC-5).

---

## 9. Sistema QR

- **Cuándo se genera**: El código QR se genera de forma instantánea en cuanto la reserva cambia al estado `confirmed` tras procesar el webhook exitoso de pago de Stripe.
- **Qué contiene el token**: El token embebido en el QR es un **UUID / token opaco aleatorio seguro** (generado con `crypto.randomBytes(32)`). **No contiene datos personales, IDs de usuario, franjas ni información interna de la reserva**. Es un identificador opaco que no expone información sensible.
- **Cómo se valida al escanear**: 
  1. El empleado escanea el código QR utilizando la cámara de su teléfono móvil.
  2. La aplicación envía el token opaco al servidor.
  3. El servidor busca el token en la tabla `qr_codes` y resuelve la reserva asociada (`reservation_id`), validando en tiempo real las siguientes condiciones:
     - Que el token exista en `qr_codes` y la reserva asociada esté en estado `confirmed`.
     - Que la fecha y hora actual correspondan exactamente a la franja horaria reservada (`reservation_slots`).
     - Que el código QR no haya sido utilizado previamente (`used = false` en `qr_codes`).
  4. Si la validación es exitosa, el servidor retorna los datos del servicio y cliente para su visualización en pantalla, permitiendo al empleado pulsar el botón explícito **"Dar acceso"**.
- **Hasta cuándo es válido (Uso único, RN-05, RN-06)**: Cada QR es de **un solo uso**. Al presionar "Dar acceso", el sistema marca el código como usado (`qr_codes.used = true`), actualiza la reserva a estado `completed` y queda inhabilitado para reutilización. Asimismo, expirada la franja horaria, el QR queda automáticamente vencido e inservible.
- **Accesos según tipo de servicio**:
  - **Servicios `group` (Canchas de fútbol, tenis, pádel, etc.)**: Se genera **1 solo código QR** para todo el grupo que reservó la cancha.
  - **Servicios `individual` (Piscina, gimnasio, etc.)**: Se generan **$N$ códigos QR únicos**, uno por cada persona ($N = \text{reservation.quantity}$), permitiendo el acceso individualizado por cada cupo adquirido.

---