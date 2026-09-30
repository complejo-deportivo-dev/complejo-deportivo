# Sistema Visual — Complejo Deportivo

**Documento:** `docs/diseño/ui-sistema.md`
**Fase:** 1 — Diseño
**Versión del sistema:** v1.0 (sistema base)
**Figma:** `https://www.figma.com/design/nnwYut08NXAzbln8nvPLnX/Sin-t%C3%ADtulo?node-id=0-1&t=WNzdy5Ahc30jKUdS-1` (página "Sistema Visual")

---

## 1. Propósito y dirección visual

Este documento define las reglas visuales que garantizan que la aplicación se vea consistente en todas las pantallas: colores, tipografía, espaciados y componentes base. Es la referencia para Dev 6 (wireframes y flujos) y para la implementación en Tailwind durante la Fase 2.

**Dirección:** deportiva, fresca, limpia y de confianza. Azul para confianza y acción, naranja para energía y contraste, y neutros nítidos para lectura prolongada. Bordes suaves, mucho aire y buen contraste. No es oscura ni agresiva, porque el público es mixto (familias con niños, grupos de amigos y adultos).

**Enfoque:** el sistema se diseñó primero para escritorio (1280 px) y se adaptará después a tablet y móvil.

**Idioma de la interfaz:** español.

> Las decisiones de este documento salen del criterio del equipo. El cliente no definió lineamientos visuales.

---

## 2. Layout y cuadrícula

| Parámetro | Valor |
|---|---|
| Tablero principal (desktop) | 1280 px |
| Márgenes laterales | 64 px |
| Columnas | 12 |
| Gutter | 24 px |

### Breakpoints

| Nombre | Ancho | Estado |
|---|---|---|
| Mobile | 375 px | Por adaptar |
| Tablet | 768 px | Por adaptar |
| Desktop | 1280 px | Diseñado (marco principal) |

---

## 3. Color

Las escalas usan pasos 50–900. Los valores son HEX.

### 3.1 Primario — confianza, navegación y selección

| Paso | HEX |
|---|---|
| 50 | `#EAF3FA` |
| 100 | `#D0E2F1` |
| 200 | `#A3C6E3` |
| 300 | `#6BA3D1` |
| 400 | `#3A83BF` |
| **500** | **`#0B5FA5`** |
| 600 | `#094F88` |
| 700 | `#073F70` |
| 800 | `#062F54` |
| 900 | `#041F38` |

### 3.2 Secundario — energía, destacados y llamadas complementarias

| Paso | HEX |
|---|---|
| 50 | `#FFF7ED` |
| 100 | `#FFEDD5` |
| 200 | `#FDBA74` |
| 300 | `#FB923C` |
| 400 | `#F97316` |
| **500** | **`#EA580C`** |
| 600 | `#C2410C` |
| 700 | `#9A3412` |
| 800 | `#7C2D12` |
| 900 | `#431407` |

### 3.3 Semánticos

| Token | HEX | Uso |
|---|---|---|
| Éxito | `#16A34A` | Confirmaciones, acceso válido |
| Éxito fondo | `#DCFCE7` | Fondos de éxito |
| Error | `#DC2626` | Errores, acceso inválido, acciones destructivas |
| Error fondo | `#FEE2E2` | Fondos de error |
| Aviso | `#EAB308` | Advertencias, contador por vencer |
| Aviso fondo | `#FEF9C3` | Fondos de aviso |
| Texto de aviso | `#713F12` | Texto sobre fondo de aviso |

### 3.4 Neutros — texto, bordes y superficies

| Token | HEX | Uso |
|---|---|---|
| Ink | `#0F172A` | Texto principal |
| Slate | `#475569` | Texto secundario |
| Muted | `#94A3B8` | Placeholder, texto deshabilitado |
| Border | `#E2E8F0` | Bordes y divisores |
| Canvas | `#F8FAFC` | Fondo general de la app |
| White | `#FFFFFF` | Superficies (cards, inputs, modales) |

### 3.5 Nota de accesibilidad

El texto blanco sobre naranja tiene un contraste justo con los pasos claros. Para botones o textos con fondo naranja se recomienda usar `secondary-500` o `secondary-600`. El texto sobre fondo de aviso siempre usa `#713F12`.

---

## 4. Tipografía

**Fuente:** Inter.

| Estilo | Tamaño / Altura de línea | Peso | Ejemplo de uso |
|---|---|---|---|
| H1 | 40 / 48 | Bold | Título principal de página |
| H2 | 32 / 40 | Bold | Títulos de sección |
| H3 | 24 / 32 | Medium | Subtítulos, títulos de modal |
| H4 | 20 / 28 | Medium | Títulos de card |
| Body | 16 / 24 | Regular | Texto general |
| Small | 14 / 20 | Regular | Texto de apoyo |
| Caption | 12 / 16 | Regular | Metadatos, etiquetas pequeñas |
| Botón | 16 / 24 | Medium | Etiqueta de botones |

Notas:
- El botón de tamaño S usa etiqueta de 14 px.
- Color de texto por defecto: `Ink`. Texto secundario: `Slate`.

---

## 5. Espaciado, radios y sombras

### 5.1 Escala de espaciado (base 4 px)

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64` (px)

### 5.2 Radios

| Token | Valor | Uso |
|---|---|---|
| radius-4 | 4 px | Elementos pequeños |
| radius-8 | 8 px | Botones, inputs |
| radius-12 | 12 px | Cards, modales |
| radius-pill | 999 px | Badges, chips |

### 5.3 Sombras

Formato: desplazamiento X, desplazamiento Y, blur, opacidad.

| Token | Valor | Uso |
|---|---|---|
| shadow-sm | 0 · 1 · 3 · 8 % | Elevación baja |
| shadow-md | 0 · 6 · 16 · 10 % | Cards destacadas |
| shadow-lg | 0 · 16 · 36 · 14 % | Modales |

---

## 6. Componentes base

Todos los componentes se construyen con Auto Layout y variantes en Figma.

### 6.1 Button

**Tamaños**

| Tamaño | Alto |
|---|---|
| S | 32 px (etiqueta 14 px) |
| M | 40 px |
| L | 48 px |

**Jerarquías**

| Variante | Descripción |
|---|---|
| Primario | Fondo `primary-500`, texto blanco |
| Secundario | Fondo blanco, borde y texto `primary-500` |
| Acento naranja | Fondo naranja (`secondary`), texto blanco (ver nota de accesibilidad) |
| Peligro | Fondo `Error`, texto blanco |
| Ghost | Solo texto en `primary`, sin fondo |
| Disabled | Fondo `Border`, texto `Muted` |

**Estados interactivos**

| Estado | Descripción |
|---|---|
| Default | Estilo base |
| Hover | Tono más oscuro del color base |
| Focus | Anillo de 2 px en `primary-300` |
| Error | Estilo de peligro (ej. "Reintentar") |
| Loading | Spinner y etiqueta ("Procesando") |

> El botón de error usa el mismo estilo visual que Peligro.

### 6.2 Input

- Alto: 44 px.
- Etiqueta y texto de ayuda siempre visibles.
- Ícono opcional a la izquierda; en contraseña, ícono de ojo a la derecha.

**Estados:** normal, foco, error (borde y mensaje en rojo), disabled / no editable (candado).

**Tipos:** texto, correo, contraseña y cédula.

### 6.3 Card

Radio 12 px, borde suave y sombra contextual.

| Variante | Contenido |
|---|---|
| Servicio | Imagen, categoría, precio, título, descripción, badge de franjas libres y enlace a horarios |
| Reserva | Badge de estado, identificador de reserva, título, fecha y franja, resumen (personas, total) y acciones |
| Simple | Fondo oscuro con ícono, título, texto y enlace |

### 6.4 Badge

Forma pill de 24 px con punto de 6 px a la izquierda, para que el estado no dependa solo del color.

| Badge en UI | Estado del sistema | Colores |
|---|---|---|
| Pendiente | `pending` | Fondo `Aviso fondo`, texto `#713F12` |
| Confirmada | `confirmed` | Fondo `Éxito fondo`, texto verde oscuro |
| Fallida | `failed` | Fondo `Error fondo`, texto rojo oscuro |
| Expirada | `expired` | Fondo gris (`Border`), texto `Slate` |
| Completada | `completed` | Fondo `primary-100`, texto `primary-700` |

### 6.5 Modal

- Ancho: 480 px, radio 12 px, `shadow-lg`.
- Estructura: título (H3), botón de cerrar, texto y dos acciones alineadas a la derecha.
- Fondo con overlay oscuro.
- Ejemplo del sistema: **"¿Confirmar tu reserva?"** con acciones **Ver detalles** (secundaria) y **Confirmar**.

> El sistema no incluye cancelaciones ni reembolsos en esta versión. Los modales del producto no deben ofrecer esa acción.

---

## 7. Patrones de reserva

### 7.1 Chip de franja

Tamaño 88 × 44 px. Muestra la hora de inicio en formato 24 h (ej. `08:00`).

| Estado | Descripción |
|---|---|
| Libre | Borde `Border`, fondo blanco |
| Ocupada | Fondo gris, texto `Muted` tachado |
| Seleccionada | Fondo `primary-500`, texto blanco |

### 7.2 Selector de personas

Controles − / +, con mínimo 1 persona. Cuenta las personas que usan el servicio.

| Estado | Descripción |
|---|---|
| Mínimo | Botón − deshabilitado |
| Activo | Valor intermedio |
| Grupo | Hasta la capacidad máxima del servicio |

**Regla de capacidad:** la cantidad máxima depende del servicio. Se debe mostrar la regla antes de bloquear el incremento.

### 7.3 Chips de categoría

Ícono de 18 px, alto 44 px, forma pill. Estados: activa (fondo `primary-500`) e inactiva (fondo blanco con borde).

| Chip en UI | Categoría del sistema |
|---|---|
| Canchas | Canchas |
| Piscinas | Piscinas |
| Sauna / turco | Zonas húmedas |
| Gimnasio | Gimnasio |

---

## 8. Pago, acceso y feedback

### 8.1 Contador de pago

Representa el bloqueo temporal de la franja mientras se paga. Duración: **10:00 minutos**, con barra de progreso.

| Variante | Condición | Colores |
|---|---|---|
| Base | Más de 2 minutos restantes | Fondo `primary-50`, borde y texto `primary` |
| Aviso | Menos de 2 minutos | Fondo `Aviso fondo`, texto `#713F12` |
| Expirado | 00:00, pago bloqueado | Fondo `Error fondo`, texto `Error` |

Al expirar, la franja vuelve a estar disponible y se debe ofrecer una nueva búsqueda.

### 8.2 Tarjeta QR

- Código de 200 × 200 px con zona segura de 16 px alrededor (no recolorear los módulos).
- Debajo: título del pase e identificador de reserva.

| Variante | Descripción |
|---|---|
| Lista para escanear | Tarjeta blanca con el QR visible |
| Ya escaneado | Borde verde, QR atenuado y etiqueta "Ya escaneado" |

**Múltiples QR:** el componente se repite según el tipo de servicio. La cancha de fútbol genera un solo QR para todo el grupo; los demás servicios (piscina, gimnasio y zonas húmedas) generan un QR por persona. En reservas con varias personas, las tarjetas se muestran una por cada QR.

**Reingreso:** el QR se invalida al primer escaneo. Los reingresos los valida manualmente el empleado.

### 8.3 Banner de escaneo

Alto 96 px, ancho completo, con ícono, resultado visible a distancia, hora y código de registro.

| Variante | Colores | Ejemplo |
|---|---|---|
| Válido | Verde con borde izquierdo de énfasis | "Acceso válido" + nombre, servicio y franja |
| Inválido | Rojo con borde izquierdo de énfasis | "Acceso inválido" + motivo (pase expirado o ya utilizado) |

---

## 9. Tokens para Tailwind

Referencia para la Fase 2. **No es código a implementar en esta fase.**

```js
// tailwind.config.js (referencia)
theme: {
  extend: {
    colors: {
      primary: {
        50: '#EAF3FA', 100: '#D0E2F1', 200: '#A3C6E3', 300: '#6BA3D1',
        400: '#3A83BF', 500: '#0B5FA5', 600: '#094F88', 700: '#073F70',
        800: '#062F54', 900: '#041F38',
      },
      secondary: {
        50: '#FFF7ED', 100: '#FFEDD5', 200: '#FDBA74', 300: '#FB923C',
        400: '#F97316', 500: '#EA580C', 600: '#C2410C', 700: '#9A3412',
        800: '#7C2D12', 900: '#431407',
      },
      success: { DEFAULT: '#16A34A', soft: '#DCFCE7' },
      error:   { DEFAULT: '#DC2626', soft: '#FEE2E2' },
      warning: { DEFAULT: '#EAB308', soft: '#FEF9C3', text: '#713F12' },
      ink: '#0F172A',
      slate: '#475569',
      muted: '#94A3B8',
      border: '#E2E8F0',
      canvas: '#F8FAFC',
    },
    fontFamily: { sans: ['Inter', 'sans-serif'] },
    fontSize: {
      h1: ['40px', '48px'], h2: ['32px', '40px'], h3: ['24px', '32px'],
      h4: ['20px', '28px'], body: ['16px', '24px'], small: ['14px', '20px'],
      caption: ['12px', '16px'],
    },
    spacing: {
      1: '4px', 2: '8px', 3: '12px', 4: '16px',
      6: '24px', 8: '32px', 12: '48px', 16: '64px',
    },
    borderRadius: { sm: '4px', md: '8px', lg: '12px', pill: '999px' },
    boxShadow: {
      sm: '0 1px 3px rgba(15,23,42,0.08)',
      md: '0 6px 16px rgba(15,23,42,0.10)',
      lg: '0 16px 36px rgba(15,23,42,0.14)',
    },
    screens: { md: '768px', lg: '1280px' },
  },
}
```

---

## 10. Logo

**Estado: pendiente.** Depende de la definición del nombre de la marca. Se entregarán tres versiones del mismo logo:

| Versión | Uso |
|---|---|
| Principal | Ícono + nombre sobre fondo claro (encabezado, login, correos) |
| Reducida | Solo ícono en formato cuadrado (favicon, espacios pequeños) |
| Invertida | Logo en blanco para fondos oscuros o de color |

Mientras tanto, el sistema usa el texto provisional "Complejo Deportivo".

---

## 11. Notas para el reviewer

- Los ejemplos de contenido en Figma (servicios, precios, fechas y nombres) son solo ilustrativos y no representan datos reales del complejo.
- Pendiente: sección de logo, a la espera de la definición del nombre.
- Pendiente: adaptación a Tablet (768 px) y Mobile (375 px).