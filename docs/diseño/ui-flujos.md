# Flujos de Usuario

> Sistema de Reservas — Complejo Deportivo · Fase 1 — Diseño
> Archivo: `docs/diseño/ui-flujos.md`

## 1. Figma 
    https://www.figma.com/design/1hCC1pNkVWNxanpjJm1oTc/Complejo-Deportivo?node-id=1-2&p=f&t=XutCJIX6stz0bMff-0

    
## 2. Flujos

### 2.1 Flujo del Cliente

```mermaid
flowchart TD
    A[Inicio] --> B{¿Tiene cuenta?}
    B -->|No| C[Registro]
    C --> D[Correo de verificación]
    D --> E{¿Verificó el correo?}
    E -->|No| F[Reenviar correo] --> D
    E -->|Sí| G[Login]
    B -->|Sí| G
    G --> H[Ver categorías]

    H --> I[Ver servicios]
    I --> J[Ver franjas disponibles<br/>hoy hasta 15 días]
    J --> K[Seleccionar franja]

    K --> L{¿Servicio individual?}
    L -->|Sí| M[Seleccionar cantidad de personas]
    L -->|No| N[Ingresar cédula del titular]
    M --> N

    N --> O{¿Franja libre y sin conflicto<br/>de horario del cliente?}
    O -->|No| P[Mensaje de error] --> J
    O -->|Sí| Q[Bloqueo temporal de 10 minutos]

    Q --> R[Pago con Stripe]
    R --> S{¿Resultado del pago?}
    S -->|Exitoso en menos de 10 min| T[Reserva confirmada]
    S -->|Fallido| U[Franja liberada] --> J
    S -->|Tiempo vencido| V[Franja liberada<br/>pago rechazado] --> J

    T --> W[Recibe QR por correo]
    W --> X[Mis reservas]
    X --> Y[Mostrar QR en el complejo]
```

---

### 2.2 Selección de cantidad de personas

Solo para servicios individuales, antes del pago.

```mermaid
flowchart TD
    A[Franja seleccionada] --> B{¿Servicio individual?}
    B -->|No| C[Pasar a datos del titular y pago]
    B -->|Sí| D[Pantalla de cantidad de personas]
    D --> E{¿Cantidad dentro del cupo?}
    E -->|No| F[Mensaje: supera el cupo] --> D
    E -->|Sí| G[Se actualiza el total]
    G --> H[Continuar al pago]
```

---

### 2.3 Vista de múltiples QR para el titular

```mermaid
flowchart TD
    A[Mis reservas] --> B[Abrir reserva individual]
    B --> C[Lista de QR<br/>Persona 1, Persona 2, ... Persona N]
    C --> D{¿Qué hace el titular?}
    D -->|Ver un QR| E[QR ampliado para el ingreso]
    D -->|Compartir un QR| F[Enviar o descargar ese QR]
    D -->|Compartir todos| G[Enviar todos los QR al grupo]
    E --> C
    F --> C
    G --> C
```

Para servicios grupales (cancha) se muestra un único QR para todo el grupo.

---

### 2.4 Flujo del Admin

```mermaid
flowchart TD
    A[Login] --> B[Dashboard]

    B --> C[Crear categoría]
    C --> D[Crear servicio]
    D --> E[Definir capacidad]
    E --> F[Definir horarios]
    F --> G[Servicio visible para clientes]
    G --> B

    B --> H[Gestionar empleados]
    H --> B

    B --> I[Ver métricas]
    I --> B
```

---

### 2.5 Flujo del Empleado

```mermaid
flowchart TD
    A[Login] --> B[Abrir escáner]
    B --> C[Escanear QR]

    C --> D{¿QR válido?}
    D -->|No| X1[Denegar acceso]

    D -->|Sí| E{¿Dentro de la franja?}
    E -->|No| X2[Denegar acceso]

    E -->|Sí| F{¿Ya fue usado?}
    F -->|Sí| G[Reingreso: validación manual]
    F -->|No| H[Mostrar datos de la reserva]

    H --> I[Dar acceso]
    I --> J[Se invalida el QR y se registra en access_logs]

    X1 --> B
    X2 --> B
    J --> B
    G --> B

    B --> K[Cliente sin QR: validación por cédula]
    K --> B
```

---

### 2.6 Pantalla de reingreso

```mermaid
flowchart TD
    A[Reingreso] --> B[Buscar por nombre del titular,<br/>cédula o número de reserva]
    B --> C{¿Se encontró la reserva?}
    C -->|No| D[Reserva no encontrada] --> B
    C -->|Sí| E[Mostrar titular, servicio y franja]
    E --> F{¿Información coherente?}
    F -->|No| G[Denegar acceso]
    F -->|Sí| H[Permitir ingreso]
    H --> I[Registrar en access_logs]
```

---

### 2.7 Pantalla de validación por cédula

```mermaid
flowchart TD
    A[Cliente sin QR muestra su cédula física] --> B[Empleado abre validación por cédula]
    B --> C[Ingresar número de cédula]
    C --> D{¿Se encontró la reserva?}
    D -->|No| E[Reserva no encontrada] --> C
    D -->|Sí| F[Mostrar datos de la reserva]
    F --> G{¿Servicio, franja y titular coherentes?}
    G -->|No| H[Denegar acceso]
    G -->|Sí| I[Dar acceso manual]
    I --> J[Registrar en access_logs]
```

---

### 2.8 Pantallas comunes

```mermaid
flowchart TD
    A[Login] --> B{¿Credenciales correctas?}
    B -->|Sí, cliente| C[Inicio cliente]
    B -->|Sí, empleado| D[Escáner QR]
    B -->|Sí, admin| E[Dashboard admin]
    B -->|No| F[Mensaje de error] --> A

    A --> G[Registro] --> H[Correo de verificación] --> A

    A --> I[Recuperar contraseña]
    I --> J[Correo con enlace]
    J --> K[Nueva contraseña] --> A

    L[Cualquier pantalla] -->|Error| M[Página de error]
    M --> N[Volver al inicio]
```

---

### 2.9 Navegación entre pantallas

```mermaid
flowchart LR
    L[Login] -->|cliente| C[Inicio cliente]
    L -->|empleado| E[Escáner QR]
    L -->|admin| A[Dashboard admin]
    L --> R[Registro]
    L --> P[Recuperar contraseña]

    C --> S[Detalle de servicio y franjas]
    S --> Q[Cantidad de personas]
    S --> PG[Pago]
    Q --> PG
    PG --> CQ[Confirmación con QR]
    CQ --> MR[Mis reservas]
    C --> MR
    MR --> MQ[Vista de múltiples QR]

    E --> RE[Reingreso]
    E --> CD[Validación por cédula]

    A --> AC[Categorías y servicios]
    A --> AH[Horarios]
    A --> AE[Empleados]
    A --> AM[Métricas]

    ERR[Página de error]
```