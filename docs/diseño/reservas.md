# Diseño del Sistema de Reservas

## 1. Estados de una reserva

El ciclo de vida de una reserva está gestionado por un autómata de estados finitos que garantiza la consistencia del sistema. Los estados definidos son los siguientes:

- **`pending`**: El cliente ha seleccionado una franja horaria disponible y la reserva ha sido registrada en el sistema. En este estado se activa el bloqueo temporal del cupo. El estado es asignado por el **Sistema Backend** cuando el cliente inicia la reserva y permanece hasta que se complete el pago o expire el tiempo límite.
- **`confirmed`**: El pago fue procesado exitosamente por la pasarela. La reserva queda garantizada y el código QR de acceso es generado y enviado al cliente. Este estado es actualizado por el **Sistema Backend (vía Webhook de Stripe)** inmediatamente al recibir la confirmación del evento de pago exitoso.
- **`failed`**: El proceso de pago fue rechazado por la pasarela, cancelado o abandonado por el usuario. La reserva queda invalidada y la franja horaria se libera inmediatamente para otros usuarios. Este estado es establecido por el **Sistema Backend / Webhook de Stripe** o por las validaciones de fallo de pago.
- **`expired`**: Transcurrió el tiempo límite de bloqueo temporal sin que el cliente realizara el pago. La franja horaria es liberada automáticamente. Este estado lo asigna un **Job programado (`pg_cron` en BD)** que monitorea y limpia periódicamente las reservas en `pending` vencidas.
- **`completed`**: El cliente se presentó en las instalaciones dentro del horario correspondiente y el empleado validó su ingreso mediante el escaneo del código QR. El estado es actualizado por el **Empleado** tras escanear el QR y pulsar explícitamente el botón "Dar acceso".

---

## 2. Flujo completo de una reserva

El flujo de una reserva abarca desde la selección inicial hasta el ingreso del usuario a las instalaciones:

1. **Selección de Franja Horaria**: El cliente navega por el catálogo de categorías y servicios, elige la fecha deseada y consulta las franjas horarias disponibles.
2. **Validación de Disponibilidad e Inserción en `pending`**: El cliente solicita reservar una franja. El sistema valida en la base de datos que el horario esté libre y que el cliente no posea reservas simultáneas. Se crea el registro de reserva en estado `pending` y se asigna la fecha límite en `reservations.expires_at`.
3. **Bloqueo Temporal y Redirección a Pago**: La franja horaria queda bloqueada temporalmente para otros usuarios mientras el cliente es redirigido a la pasarela de pago (Stripe).
4. **Procesamiento del Pago**: 
   - **Caso Exitoso**: Stripe procesa el pago e impacta el backend mediante un Webhook asíncrono. El sistema cambia el estado a `confirmed`, genera un token QR único de acceso y envía un correo electrónico de confirmación con el QR adjunto.
   - **Caso Fallido o Abandonado**: Si Stripe reporta fallo en el pago o transcurre el tiempo límite de `expires_at`, la reserva pasa a `failed` o `expired` y la franja queda libre para la comunidad.
5. **Ingreso y Validación en las Instalaciones**: El cliente acude al complejo deportivo y presenta su código QR desde su dispositivo móvil. El empleado abre la aplicación en vista de escaneo, lee el código QR con la cámara de su celular y el sistema valida en tiempo real la vigencia, horario y estado del QR. Al presionar el botón "Dar acceso", la reserva se marca como `completed` y el QR se inhabilita para futuros accesos.

---

## 3. Bloqueo temporal

Para evitar el sobrecupo y garantizar una reserva justa durante la transacción de pago, se implementa un mecanismo de bloqueo temporal:

- **Cómo se bloquea**: Se ejecuta mediante un campo en la tabla de la base de datos denominado `reservations.expires_at`. Al momento de crear la reserva en estado `pending`, este campo se llena con la fecha y hora exacta en que finalizará la ventana de oportunidad para pagar (`NOW() + intervalo_duracion`).
- **Cuánto dura**: La ventana de bloqueo temporal está fijada en **10 minutos**.
- **Quién lo libera**: Si no se registra el pago en el tiempo estipulado, la liberación es gestionada de manera automática por procesos de base de datos (`pg_cron`) o por validaciones al consultar la disponibilidad en tiempo real.

---

## 4. Expiración automática

- **Qué pasa si no se paga a tiempo**: La reserva pierde toda validez, su estado pasa a `expired` y la franja horaria queda nuevamente abierta a consulta pública.
- **Cómo se libera (Job/Cron)**: Se utiliza la extensión de PostgreSQL **`pg_cron`** configurada directamente en la base de datos Supabase. El job ejecuta una función almacenada que identifica todas las reservas cuya condición cumpla `status = 'pending' AND expires_at < NOW()`, actualizando su estado a `expired` y liberando la disponibilidad del cupo.
- **Cada cuánto corre el job**: El job programado se ejecuta de manera continua **cada 1 minuto** para garantizar una rápida liberación de franjas bloqueadas ineficientemente.

---

## 5. Confirmación por pago

- **Cómo llega la confirmación de Stripe**: La confirmación no depende de la navegación del usuario en el frontend, sino de una llamada directa servidor a servidor enviada por Stripe a través de un Webhook seguro (`POST /api/webhooks/stripe`) firmado criptográficamente.
- **Qué cambia en el sistema al confirmar**: 
  1. El estado de la reserva cambia de `pending` a `confirmed`.
  2. Se genera un token criptográfico único asociado a la reserva y se guarda su representación en código QR.
  3. Se dispara una tarea asíncrona que envía un correo electrónico de confirmación al cliente (vía Resend/SendGrid) con los detalles de la reserva y el código QR de ingreso.
- **Qué pasa si el pago falla**: Si la transacción es declinada o falla en la pasarela, Stripe notifica el evento de fallo. El sistema cambia el estado a `failed` y libera inmediatamente la franja horaria reservada.

---

## 6. Control de concurrencia

- **Cómo se evita que dos clientes confirmen la misma franja**: Para prevenir que dos o más usuarios intenten reservar o confirmar la misma franja de forma paralela, el sistema emplea transacciones con bloqueos explícitos (*locks* / transacciones SQL) en la base de datos.
- **Diferencia entre servicios de cupo 1 y cupo N**: 
  - **Servicios de Cupo 1 (Canchas individuales)**: Una franja horaria solo admite **1 reserva confirmada o pendiente activa** por instancia física (ej. Cancha 1).
  - **Servicios de Cupo N (Servicios grupales / Piscinas / Gimnasios)**: Permite múltiples reservas concurrentes sobre la misma franja siempre que la suma de cupos activos (`pending` + `confirmed`) no exceda la capacidad máxima (`capacity`) parametrizada para la instancia.
- **Dónde vive la validación**: Toda la lógica y control de concurrencia habita estrictamente a nivel de **Base de Datos** (mediante constraints, funciones almacenadas SQL y transacciones). No se confía en el código de la aplicación frontend o backend Next.js para evitar condiciones de carrera (*race conditions*) bajo alta carga.

---

## 7. Control de capacidad

- **Cómo se valida el cupo máximo en servicios grupales**: Al intentar reservar un servicio grupal, el sistema calcula en tiempo real la capacidad ocupada mediante la consulta de reservas activas en la franja (`status IN ('pending', 'confirmed') AND (expires_at > NOW() OR status = 'confirmed')`). Si la cantidad total es menor a la `capacity` máxima configurada por el administrador, se permite el bloqueo del cupo.
- **Qué pasa cuando la franja está llena**: Cuando la suma de reservas alcanza el límite de capacidad, la franja se marca automáticamente como **"no disponible"** o **"sin cupo"** en la interfaz del usuario y la BD rechaza de forma atómica cualquier intento adicional de reserva en ese horario.

---

## 8. Restricciones de negocio

Las siguientes reglas de negocio (RN) se aplican rigurosamente en toda la plataforma:

- **Fechas y Horas Pasadas (RN-04)**: No se permiten búsquedas, selecciones ni creaciones de reservas en fechas o franjas horarias que ya hayan transcurrido.
- **Reservas Simultáneas del Mismo Cliente (RN-03)**: Un mismo usuario no puede mantener dos reservas activas (`pending` o `confirmed`) cuyos rangos de tiempo se solapen, incluso si pertenecen a servicios o instalaciones distintas. Esto evita la monopolización o imposibilidad física de asistencia.
- **Zona Horaria Oficial**: Toda la persistencia, validación de franjas, cálculo de expiración y lógica de fechas opera bajo la zona horaria **`America/Bogotá`** (UTC-5).

---

## 9. Sistema QR

- **Cuándo se genera**: El código QR se genera de forma única e instantánea en cuanto la reserva cambia al estado `confirmed` tras el webhook exitoso de pago.
- **Qué contiene el token**: El token embebido en el QR contiene un identificador firmado único e infalsificable (UUID/JWT) que vincula el ID de reserva, el ID de cliente, la instancia del servicio y el rango de la franja horaria.
- **Cómo se valida al escanear**: 
  1. El empleado escanea el código QR utilizando la cámara de su teléfono móvil.
  2. El sistema decodifica el token y valida tres condiciones indispensables: 
     - Que la reserva exista y su estado sea `confirmed`.
     - Que la fecha y hora actual correspondan exactamente a la franja horaria reservada.
     - Que la reserva no haya sido utilizada previamente (`used = false`).
  3. Si la validación es exitosa, se muestran los datos del servicio y cliente, permitiendo al empleado pulsar el botón explícito **"Dar acceso"**.
- **Hasta cuándo es válido (Uso único, RN-05, RN-06)**: El QR es de **un solo uso**. Al presionar "Dar acceso", el sistema actualiza la reserva a estado `completed` y marca el código como usado, quedando inhabilitado para reutilización. Asimismo, expirada la franja horaria, el QR queda automáticamente vencido e inservible.
- **Qué pasa con accesos grupales**: En servicios grupales, cada reserva individual o cupo adquirido emite su correspondiente token QR único de ingreso, garantizando el control de acceso individualizado por cada persona o cupo reservado.

---