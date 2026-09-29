# Diseño de API y Endpoints

## 1. Formato estándar de respuesta
Cómo responde la API en caso de éxito y en caso de error.
- Éxito: { data: ... }
- Error: { error: "error descripción" }

## 2. Lista de endpoints
Para cada endpoint, llenar:

### [MÉTODO] /api/ [RUTA]
- **Propósito:** 
- **Rol:** quién puede usarlo (público, cliente, empleado, admin)
- **Body (entrada):** qué datos recibe
- **Respuesta OK:** qué devuelve
- **Errores:** códigos HTTP y mensajes
- **Validaciones:** qué se valida antes de procesar

## 3. Endpoints por módulo

### Autenticación
- Registro, login, logout, recuperar contraseña

### Servicios (público / cliente)
- Listar categorías y servicios
- Ver franjas disponibles de un servicio

### Reservas (cliente)
- Crear reserva
- Listar mis reservas

### Pagos
- Crear PaymentIntent
- Webhook de Stripe

### QR (empleado)
- Validar QR escaneado

### Admin
- CRUD de categorías
- CRUD de servicios
- CRUD de horarios
- CRUD de empleados
- Ver métricas