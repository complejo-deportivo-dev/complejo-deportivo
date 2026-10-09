# Guía de Pruebas de Endpoints

Esta guía explica cómo probar los endpoints de la API del proyecto utilizando `curl` (línea de comandos) y Postman (interfaz gráfica).

## Prerrequisitos
- El servidor debe estar corriendo (generalmente en `http://localhost:3000`).
- Si usas Postman, asegúrate de que esté instalado en tu computadora.

---

## 1. Probando con `curl` (Línea de Comandos)

`curl` es ideal para pruebas rápidas. Abre tu terminal y ejecuta los siguientes comandos según el endpoint que desees probar.

### Registro de Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Usuario Test", "email":"test@ejemplo.com", "password":"password123"}'
```

### Inicio de Sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@ejemplo.com", "password":"password123"}'
```

### Olvidé mi Contraseña
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@ejemplo.com"}'
```

---

## 2. Probando con Postman (Interfaz Gráfica)

Postman es recomendado para capturar capturas de pantalla claras para documentación.

### Pasos para cada Endpoint:

1.  **Abrir Postman**: Crea una nueva petición (`+`).
2.  **Configurar Método y URL**:
    *   Selecciona el método **POST** en el desplegable.
    *   Ingresa la URL correspondiente, por ejemplo: `http://localhost:3000/api/auth/login`.
3.  **Configurar Body (Cuerpo)**:
    *   Ve a la pestaña **Body**.
    *   Selecciona el formato **raw**.
    *   Selecciona el tipo **JSON** en el desplegable de la derecha.
    *   Pega el JSON necesario (como los ejemplos usados en `curl`).
4.  **Enviar**: Haz clic en **Send**.
5.  **Captura**: La respuesta aparecerá en la parte inferior. Asegúrate de que el panel de respuesta esté visible y haz tu captura de pantalla.

### Endpoints Disponibles
| Endpoint | Método | Descripción |
| :--- | :--- | :--- |
| `/api/auth/register` | POST | Registra un nuevo usuario |
| `/api/auth/login` | POST | Inicia sesión |
| `/api/auth/forgot-password` | POST | Solicita recuperación de contraseña |
| `/api/auth/logout` | POST | Cierra la sesión activa |
| `/api/auth/reset-password` | POST | Restablece la contraseña (requiere sesión) |

---
*Nota: Si el servidor devuelve un error 500, verifica que los servicios de base de datos estén corriendo correctamente.*
