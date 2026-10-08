# Tarea 2: Pulido de Componentes UI (`CategoryCard`)

## Descripción
Implementación y optimización visual de la tarjeta de categorías, asegurando que cumpla con los estándares de diseño responsivo, accesibilidad y experiencia de usuario.

## Archivos Implementados
- [`src/components/shared/CategoryCard.tsx`](/c:/Users/Tania/Desktop/complejo-deportivo/src/components/shared/CategoryCard.tsx)
- [`src/app/page.tsx`](/c:/Users/Tania/Desktop/complejo-deportivo/src/app/page.tsx) (para vista previa)

## Flujo y Lógica

### 1. `CategoryCard.tsx`
El componente fue construido siguiendo una lista de verificación de criterios estrictos:
- **Dimensiones**: Lógica de CSS para mantener 220px en desktop y 180px en mobile.
- **Visuales**:
    - Imagen de fondo con `object-cover`.
    - Overlay de gradiente lineal para asegurar que el texto blanco sea legible sobre cualquier imagen.
    - Implementación de un Badge en la esquina superior derecha para mostrar la cantidad de servicios.
- **Interacción**:
    - Toda la card es clickeable.
    - Efecto de escala (`scale-105`) y zoom de imagen en hover.
    - Flecha circular con transición de estado al pasar el mouse.
- **Fallback**: Lógica para mostrar un gradiente estilizado cuando la imagen no está disponible.

### 2. `page.tsx` (Vista Previa)
Se modificó la página principal para servir como entorno de pruebas.
- **Lógica**: Implementación de un grid responsivo que renderiza múltiples `CategoryCard` utilizando datos mock.
- **Funcionalidad**: Permitió validar el comportamiento responsivo y los estados de hover en tiempo real.

## Criterios de Aceptación Cumplidos
- [x] Dimensiones correctas (Desktop/Mobile).
- [x] Overlay de legibilidad implementado.
- [x] Badge de servicios visible.
- [x] Efectos de hover (Escala y Zoom) activos.
- [x] Formato de moneda es-CO correcto.
- [x] Soporte para Dark Mode.
