# Diseño de Base de Datos

Sistema de reservas para un complejo de eventos deportivos.
Roles: `client`, `employee`, `admin`. Motor asumido: PostgreSQL.

> Las líneas marcadas con **(+)** son cambios o adiciones propuestos respecto al diagrama original.

---

## 1. Diagrama ER

![Diagrama entidad-relación](./img/entidad%20relacion.drawio.png)

- Link editable: [Draw.io](https://app.diagrams.net/#G1pO3WvI1ozu9esfN7otVwImVovvQnWFLn#%7B%22pageId%22%3A%22lpF6tNtvktFja9sjnH21%22%7D)

### Cambios propuestos al diagrama

| # | Cambio | Motivo |
|---|--------|--------|
| 1 | **(+)** Agregar `slot_date date` a `reservation_slots` | Los `time_slots` son fijos (sin fecha); la fecha es necesaria para controlar cupos |
| 2 | `QR_codes` → `reservations` pasa de 1:1 a **1:N** | Servicios con `qr_type = 'individual'` generan un QR por persona |
| 3 | `payments` → `reservations` es **N:1** | Puede haber varios intentos de pago por reserva |
| 4 | `access_logs` → `QR_codes` y `access_logs` → `reservations` pasan a **N:1** | Un mismo QR puede tener varios intentos (p. ej. un escaneo concedido y luego uno denegado) |
| 5 | `users.created_at` de `timestamp` a `timestamptz` | Unificar con el resto |
| 6 | **(+)** Agregar `is_active boolean` a `categories` | Borrado lógico |
| 7 | **(+)** Agregar `is_active boolean` a `reservation_slots` | Permite el índice único parcial para servicios de cupo 1 (ver sección 4) |

---

## 2. Tablas

### 2.1 `users`

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | `uuid` | **PK**, default `gen_random_uuid()` |
| `name` | `varchar(50)` | NOT NULL |
| `email` | `varchar(100)` | NOT NULL, **UNIQUE** |
| `number_document` | `varchar(20)` | NOT NULL, **(+) UNIQUE** |
| `role` | `text` | NOT NULL, CHECK `role IN ('client','admin','employee')`, default `'client'` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

### 2.2 `categories`

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | `smallint` | **PK** (identity) |
| `name` | `varchar(200)` | NOT NULL, **UNIQUE** |
| `is_active` | `boolean` | **(+)** NOT NULL, default `true` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

### 2.3 `services`

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | `smallint` | **PK** (identity) |
| `name` | `varchar(50)` | NOT NULL |
| `id_category` | `smallint` | **FK → categories.id**, NOT NULL, `ON DELETE RESTRICT` |
| `capacity` | `smallint` | NOT NULL, CHECK `capacity > 0` |
| `max_companions` | `smallint` | NOT NULL, default `0`, CHECK `max_companions >= 0` |
| `qr_type` | `text` | NOT NULL, CHECK `qr_type IN ('group','individual')` |
| `is_active` | `boolean` | NOT NULL, default `true` |
| `hour_price` | `numeric(8,2)` | NOT NULL, CHECK `hour_price >= 0` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

Constraints adicionales: `UNIQUE (id_category, name)`.

### 2.4 `time_slots`

Plantilla fija de franjas horarias por servicio (no se generan por día).

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | `smallint` | **PK** (identity) |
| `id_service` | `smallint` | **FK → services.id**, NOT NULL, `ON DELETE RESTRICT` |
| `time_start` | `time` | NOT NULL |
| `time_end` | `time` | NOT NULL |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

Constraints adicionales:
- CHECK `time_end > time_start` (no se permiten franjas que crucen la medianoche).
- `UNIQUE (id_service, time_start, time_end)`.
- Opcional: *exclusion constraint* para evitar franjas solapadas del mismo servicio (requiere `btree_gist`).

### 2.5 `reservations`

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | `int` | **PK** (identity) |
| `id_user` | `uuid` | **FK → users.id**, NOT NULL, `ON DELETE RESTRICT` |
| `quantity` | `smallint` | NOT NULL, CHECK `quantity > 0` |
| `reservation_date` | `timestamptz` | NOT NULL (fecha/hora de uso reservada) |
| `expires_at` | `timestamptz` | NOT NULL (límite para pagar mientras está `pending`) |
| `status` | `text` | NOT NULL, default `'pending'`, CHECK `status IN ('pending','confirmed','failed','expired','completed')` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

Reglas de negocio (validadas en backend/trigger):
- `quantity` = titular + acompañantes, por lo tanto `quantity <= services.max_companions + 1`.
- `quantity <= services.capacity`.

### 2.6 `reservation_slots`

Tabla intermedia entre reservas y franjas (una reserva puede abarcar varias franjas consecutivas).

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | `int` | **PK** (identity) |
| `id_reservation` | `int` | **FK → reservations.id**, NOT NULL, `ON DELETE CASCADE` |
| `id_time_slot` | `smallint` | **FK → time_slots.id**, NOT NULL, `ON DELETE RESTRICT` |
| `slot_date` | `date` | **(+)** NOT NULL (día local del complejo) |
| `is_active` | `boolean` | **(+)** NOT NULL, default `true` (pasa a `false` si la reserva se cancela, expira o falla) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

Constraints adicionales: `UNIQUE (id_reservation, id_time_slot, slot_date)`.

### 2.7 `payments`

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | `int` | **PK** (identity) |
| `id_reservation` | `int` | **FK → reservations.id**, NOT NULL, `ON DELETE RESTRICT` |
| `stripe_payment_intent_id` | `varchar` | NOT NULL, **UNIQUE** |
| `status` | `text` | NOT NULL, default `'pending'`, CHECK `status IN ('pending','succeeded','failed')` |
| `amount` | `numeric(10,2)` | NOT NULL, CHECK `amount >= 0` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

Constraints adicionales:
- **(+)** Índice único parcial para permitir como máximo **un** pago exitoso por reserva:
  `CREATE UNIQUE INDEX ux_payments_one_succeeded ON payments (id_reservation) WHERE status = 'succeeded';`

### 2.8 `qr_codes`

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | `int` | **PK** (identity) |
| `id_reservation` | `int` | **FK → reservations.id**, NOT NULL, `ON DELETE RESTRICT` |
| `token` | `varchar(64)` | NOT NULL, **UNIQUE** |
| `used_at` | `timestamptz` | NULL (NULL = aún no usado) |
| `used_by` | `uuid` | **FK → users.id**, NULL (empleado que lo escaneó) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

Constraints adicionales:
- CHECK `(used_at IS NULL) = (used_by IS NULL)` (si se usó, debe constar quién).
- `used_by` debe ser un usuario con `role = 'employee'` (validación por trigger o backend, ya que un CHECK no puede consultar otra tabla).

### 2.9 `access_logs`

Se crea un registro por **cada** escaneo, sea concedido o denegado.

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | `int` | **PK** (identity) |
| `id_reservation` | `int` | **FK → reservations.id**, NOT NULL, `ON DELETE RESTRICT` |
| `id_employee` | `uuid` | **FK → users.id**, NOT NULL, `ON DELETE RESTRICT` |
| `id_qr_code` | `int` | **FK → qr_codes.id**, NOT NULL, `ON DELETE RESTRICT` |
| `result` | `text` | NOT NULL, CHECK `result IN ('granted','denied')` |
| `scanned_at` | `timestamptz` | NOT NULL, default `now()` |

Tabla de solo inserción (sin `UPDATE` ni `DELETE`).

---

## 3. Relaciones

| Relación | Cardinalidad | Notas |
|----------|--------------|-------|
| `categories` → `services` | 1:N | Un servicio pertenece a una categoría |
| `services` → `time_slots` | 1:N | Franjas fijas por servicio |
| `users` → `reservations` | 1:N | Un cliente puede tener muchas reservas |
| `reservations` ↔ `time_slots` | N:M | Resuelta con `reservation_slots` |
| `reservations` → `reservation_slots` | 1:N | |
| `time_slots` → `reservation_slots` | 1:N | |
| `reservations` → `payments` | 1:N | Varios intentos de pago; solo uno puede ser `succeeded` |
| `reservations` → `qr_codes` | 1:N | 1 QR si `qr_type = 'group'`; `quantity` QR si `'individual'` |
| `users` (empleado) → `qr_codes` (`used_by`) | 1:N | Quién escaneó el QR |
| `qr_codes` → `access_logs` | 1:N | Cada intento de escaneo genera un log |
| `reservations` → `access_logs` | 1:N | |
| `users` (empleado) → `access_logs` | 1:N | |

---

## 4. Constraints críticos

### 4.1 Concurrencia (cupos 1 y N)

La disponibilidad se calcula por **(franja, día)**:

```
ocupados(slot, fecha) = SUM(reservations.quantity)
    de reservas con reservation_slots.is_active = true
    y reservations.status IN ('pending','confirmed','completed')
    (las 'pending' cuentan solo mientras expires_at > now())
```

Se puede reservar si `ocupados + quantity <= services.capacity`.

**Servicios con capacidad N (`capacity > 1`)**
1. Dentro de una transacción, bloquear las franjas solicitadas con `pg_advisory_xact_lock(id_time_slot, slot_date_as_int)`, **siempre en orden ascendente** de `id_time_slot` para evitar deadlocks.
2. Calcular `ocupados` y validar contra `capacity`.
3. Insertar `reservations` (`pending`) y `reservation_slots`.
4. `COMMIT` libera el bloqueo.

Alternativa: `SELECT ... FROM time_slots WHERE id = $1 FOR UPDATE` sobre cada franja.

**Servicios con capacidad 1 (`capacity = 1`, uso exclusivo)**
Además del bloqueo anterior, la base de datos lo garantiza con un índice único parcial. Se necesita una columna `service_capacity_is_one`, o bien crear el índice solo para esos servicios mediante un trigger. La forma más simple es validar en el trigger de inserción de `reservation_slots`; como respaldo:

```sql
CREATE UNIQUE INDEX ux_slot_exclusive
  ON reservation_slots (id_time_slot, slot_date)
  WHERE is_active;   -- aplica solo si el servicio es de cupo 1 (validado por trigger)
```

> Nota: este índice solo es correcto para servicios de cupo 1. Para servicios con `capacity > 1` no puede existir, por lo que debe manejarse con el bloqueo + conteo descritos arriba. Alternativa limpia: mantener un contador `booked` en una tabla `slot_availability (id_time_slot, slot_date, booked)` con `CHECK (booked <= capacity)` y actualizarlo con `UPDATE ... SET booked = booked + $q WHERE booked + $q <= capacity` (atómico).

**Liberación de cupos**: un job periódico marca como `expired` las reservas `pending` con `expires_at < now()` y pone `is_active = false` en sus `reservation_slots`. También se libera si el pago falla.

### 4.2 Unicidad del QR

- `qr_codes.token` es **UNIQUE**.
- El token es aleatorio (≥ 32 bytes de `crypto.randomBytes`, codificado en base64url o hex) y no contiene datos personales.
- Un QR se consume **una sola vez**:
  ```sql
  UPDATE qr_codes
     SET used_at = now(), used_by = $employee
   WHERE token = $token AND used_at IS NULL
  RETURNING id;
  ```
  Si no devuelve filas, el QR ya fue usado y el acceso se **deniega** (atomicidad evita doble escaneo simultáneo).
- Los QR solo se generan cuando el pago pasa a `succeeded` (y la reserva a `confirmed`).

### 4.3 Estados de reserva

| Estado | Significado |
|--------|-------------|
| `pending` | Creada, cupo retenido hasta `expires_at`, pago sin confirmar |
| `confirmed` | Pago exitoso, QR generado y enviado |
| `failed` | El pago falló |
| `expired` | Venció `expires_at` sin pago |
| `completed` | El QR fue escaneado con acceso concedido |

Transiciones permitidas:

```
pending   → confirmed   (webhook de pago 'succeeded')
pending   → failed      (pago fallido)
pending   → expired     (expires_at vencido)
confirmed → completed   (acceso concedido)
```

Cualquier otra transición se rechaza (trigger o capa de servicio). `failed`, `expired` y `completed` son estados finales.

**Reglas de validación de acceso** (el empleado escanea):
1. El token existe.
2. `qr_codes.used_at IS NULL`.
3. `reservations.status = 'confirmed'`.
4. La hora actual está dentro de la ventana de la reserva (desde el inicio de la primera franja hasta el fin de la última, en `slot_date`).

Si todo se cumple → `result = 'granted'`; en cualquier otro caso → `result = 'denied'`. En ambos casos se inserta un `access_logs`.

---

## 5. Índices

| Tabla | Índice | Uso |
|-------|--------|-----|
| `users` | `UNIQUE (email)` | Login / búsqueda |
| `users` | `UNIQUE (number_document)` | Búsqueda por documento |
| `services` | `(id_category)` | Listar servicios por categoría |
| `services` | `(is_active)` parcial `WHERE is_active` | Catálogo visible |
| `time_slots` | `UNIQUE (id_service, time_start, time_end)` | Franjas de un servicio |
| `reservations` | `(id_user, created_at DESC)` | "Mis reservas" |
| `reservations` | `(status, expires_at)` parcial `WHERE status = 'pending'` | Job de expiración |
| `reservations` | `(reservation_date)` | Consultas por día |
| `reservation_slots` | `(id_time_slot, slot_date) WHERE is_active` | **Cálculo de disponibilidad** (consulta más crítica) |
| `reservation_slots` | `(id_reservation)` | Franjas de una reserva |
| `payments` | `(id_reservation)` | Pagos por reserva |
| `payments` | `UNIQUE (stripe_payment_intent_id)` | Webhooks idempotentes |
| `qr_codes` | `UNIQUE (token)` | **Escaneo** (consulta más frecuente en puerta) |
| `qr_codes` | `(id_reservation)` | QR de una reserva |
| `access_logs` | `(id_qr_code)`, `(id_reservation)` | Historial por QR/reserva |
| `access_logs` | `(id_employee, scanned_at DESC)` | Auditoría por empleado |
| `access_logs` | `(scanned_at)` | Reportes por fecha |

---

## 6. RLS por tabla

Los permisos se definen por rol (`client`, `employee`, `admin`). Se aplican en el backend (guards/middleware) y, como defensa en profundidad, pueden reforzarse con Row Level Security de PostgreSQL usando variables de sesión (`SET LOCAL app.user_id = '<uuid>'; SET LOCAL app.role = '<rol>';`) establecidas por el backend en cada transacción.

Leyenda: **R** = leer, **C** = crear, **U** = actualizar, **D** = eliminar, `own` = solo sus propios registros, `—` = sin acceso.

| Tabla | client | employee | admin |
|-------|--------|----------|-------|
| `users` | R/U `own` (sin cambiar `role`) | R `own` | R/C/U/D todos (empleados: C/U/D; el borrado es lógico o restringido si tiene historial) |
| `categories` | R (solo `is_active`) | R | R/C/U, D lógico (`is_active = false`) |
| `services` | R (solo `is_active`) | R | R/C/U, D lógico |
| `time_slots` | R | R | R/C/U/D (D restringido si hay reservas) |
| `reservations` | C, R `own`; U limitado (cancelar propia en `pending`) | R (solo las del QR que escanea) | R todas; U de estado solo vía procesos del sistema |
| `reservation_slots` | C/R `own` (vía su reserva) | R | R |
| `payments` | R `own` | — | R |
| `qr_codes` | R `own` | R/U (solo marcar uso al escanear) | R |
| `access_logs` | — | C (con `id_employee = app.user_id`), R `own` | R |

Notas:
- `payments` y el cambio de estado de `reservations` a `confirmed` los escribe **únicamente el backend** (webhook de Stripe), nunca el cliente.
- `access_logs` es de solo inserción para todos los roles (sin `UPDATE`/`DELETE`).
- Un empleado no puede crear ni modificar reservas, pagos ni usuarios.

Ejemplo de políticas:

```sql
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_own_reservations ON reservations
  FOR SELECT USING (
    current_setting('app.role') = 'client'
    AND id_user = current_setting('app.user_id')::uuid
  );

CREATE POLICY admin_all_reservations ON reservations
  FOR SELECT USING (current_setting('app.role') = 'admin');

ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY employee_insert_logs ON access_logs
  FOR INSERT WITH CHECK (
    current_setting('app.role') = 'employee'
    AND id_employee = current_setting('app.user_id')::uuid
  );
```

---

## 7. Decisiones de diseño

### 7.1 Generación de slots
- Los `time_slots` son una **plantilla fija por servicio** (hora inicio/fin), no se generan por día.
- La disponibilidad por día se obtiene combinando la plantilla con `reservation_slots.slot_date`; no es necesario pre-generar filas futuras.
- Si el horario de un servicio cambia, se desactiva la franja anterior y se crea una nueva (las reservas históricas conservan su referencia).
- Una reserva puede abarcar varias franjas consecutivas (de ahí `reservation_slots`), y el precio se calcula con `hour_price` × horas.

### 7.2 Zona horaria
- Todos los instantes se guardan en `timestamptz` (UTC internamente).
- Las franjas (`time`) y `slot_date` (`date`) se interpretan en la **zona horaria local del complejo** (`America/Bogota`), definida como constante de configuración.
- Para comparar: `(slot_date + time_start) AT TIME ZONE 'America/Bogota'`.
- La validación de ventana de acceso y la expiración usan `now()` del servidor de base de datos, nunca la hora del dispositivo del cliente o del empleado.

### 7.3 Formato del QR
- El QR codifica únicamente el `token` opaco (aleatorio, sin datos personales).
- Al escanear, el backend resuelve el token y devuelve al empleado la información de la reserva (cliente, servicio, franjas, cantidad, estado).
- `qr_type = 'group'` → 1 QR por reserva (válido para todo el grupo, un solo uso).
- `qr_type = 'individual'` → `quantity` QR por reserva, cada uno de un solo uso.
- Se envía por correo al confirmarse el pago, como imagen PNG incrustada.
- Opcional: guardar `SHA-256(token)` en vez del token en claro.

### 7.4 Validación de capacidad
- La validación se hace **dentro de la transacción de creación de la reserva**, con bloqueo por (franja, día), y no solo en el frontend.
- `capacity` define el máximo de personas simultáneas por franja y día; `max_companions` limita el tamaño de cada reserva individual.
- Las reservas `pending` retienen cupo hasta `expires_at` para evitar sobreventa mientras se paga.
- Los precios se calculan en el backend a partir de `hour_price` y se guardan en `payments.amount` (así un cambio de tarifa no altera pagos históricos).
- Eliminar categorías/servicios es **borrado lógico** (`is_active = false`) con `ON DELETE RESTRICT` en las FK, para preservar el historial de reservas.
