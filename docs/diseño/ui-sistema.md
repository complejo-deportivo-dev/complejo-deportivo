# Sistema Visual — Complejo Deportivo

**Documento:** `docs/diseño/ui-sistema.md`
**Responsable:** Dev 5
**Fase:** 1 — Diseño
**Versión del sistema:** v1.0 (sistema base)
**Figma:** `https://www.figma.com/design/nnwYut08NXAzbln8nvPLnX/Sin-t%C3%ADtulo?node-id=0-1&t=WNzdy5Ahc30jKUdS-1` (página "Sistema Visual")

---

## 1. Propósito y dirección visual

Este documento define las reglas visuales que garantizan que la aplicación se vea consistente en todas las pantallas: colores, tipografía, espaciados, iconografía y componentes base. Es la referencia para Dev 6 (wireframes y flujos) y para la implementación en Tailwind durante la Fase 2.

**Dirección:** deportiva, fresca, limpia y de confianza. Azul para confianza y acción, naranja para energía y contraste, y neutros nítidos para lectura prolongada. Bordes suaves, mucho aire y buen contraste. No es oscura ni agresiva, porque el público es mixto (familias con niños, grupos de amigos y adultos).

**Enfoque:** el sistema se diseñó primero para escritorio (1280 px) y se adaptará después a tablet y móvil. Solo existe modo claro en esta versión.

**Idioma de la interfaz:** español.

> Las decisiones de este documento salen del criterio del equipo. El cliente no definió lineamientos visuales.

---

## 2. Layout y cuadrícula

| Parámetro | Valor |
|---|---|
| Tablero principal (desktop) | 1280 px |
| Márgenes laterales | 64 px (`spacing-8`) |
| Columnas | 12 |
| Gutter | 24 px (`spacing-5`) |

### Breakpoints

| Nombre | Ancho | Estado |
|---|---|---|
| Mobile | 375 px | Por adaptar |
| Tablet | 768 px | Por adaptar |
| Desktop | 1280 px | Diseñado (marco principal) |

---

## 3. Paleta de colores

Paleta basada en **dark mode principal** con **azul agua + naranja energía**: el azul transmite confianza y remite a las piscinas; el naranja aporta energía y contraste cálido; los neutros azulados mantienen la temperatura de marca. Cada color tiene un nombre de token semántico (ver [11. Design Tokens](#11-design-tokens)).

> **Modo principal: Dark Mode.** El modo claro se implementará después si hay tiempo. Todos los componentes y vistas se construyen sobre la paleta dark.

### 3.1 Fondos y superficies

| Color | Valor | Uso recomendado | Justificación |
|---|---|---|---|
| Background | `#0A0F1E` | Fondo base de toda la aplicación | Azul muy oscuro; reduce el cansancio visual en sesiones largas y resalta los colores de marca. |
| Surface | `rgba(255,255,255,0.06)` | Cards, inputs, modales (con backdrop-blur 20px) | Capa traslúcida que genera profundidad; base del efecto glassmorphism. |
| Surface Elevated | `rgba(255,255,255,0.10)` | Modales y elementos elevados | Capa más opaca para elementos que requieren más contraste. |

### 3.2 Colores de marca

| Color | HEX | Uso recomendado | Justificación |
|---|---|---|---|
| Primary | `#0B5FA5` | Botones principales, links, elementos seleccionados (chip de franja, categoría activa) | Azul agua: confianza y acción; refuerza la identidad de un complejo con piscinas y pagos en línea. |
| Primary Hover | `#094F88` | Estado hover de elementos primarios | Tono más oscuro del primario (`primary-600`); indica interacción sin cambiar de color. |
| Primary Soft | `#EAF3FA` | Fondos suaves, contador de pago base, filas activas | Tono más claro del primario (`primary-50`); agrupa información sin competir con los botones. |
| Secondary | `#EA580C` | Acentos y llamadas de atención puntuales | Naranja energía: contraste cálido con el azul y referencia al dinamismo del deporte. |

**Escala completa del primario**

| Paso | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| HEX | `#EAF3FA` | `#D0E2F1` | `#A3C6E3` | `#6BA3D1` | `#3A83BF` | `#0B5FA5` | `#094F88` | `#073F70` | `#062F54` | `#041F38` |

**Escala completa del secundario**

| Paso | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 |
|---|---|---|---|---|---|---|---|---|---|---|
| HEX | `#FFF7ED` | `#FFEDD5` | `#FDBA74` | `#FB923C` | `#F97316` | `#EA580C` | `#C2410C` | `#9A3412` | `#7C2D12` | `#431407` |

### 3.3 Colores semánticos

| Color | HEX | Uso recomendado | Justificación |
|---|---|---|---|
| Success | `#16A34A` | Confirmaciones, reserva confirmada, acceso válido | Verde reconocible universalmente como "correcto". |
| Success Soft | `#DCFCE7` | Fondo de badges y banners de éxito | Versión suave para fondos, con el verde como texto y borde. |
| Error | `#DC2626` | Errores de formulario, pago fallido, acceso inválido, acciones destructivas | Rojo estándar de alerta; máxima visibilidad en estados negativos. |
| Error Soft | `#FEE2E2` | Fondo de badges y banners de error | Versión suave para fondos, con el rojo como texto y borde. |
| Warning | `#EAB308` | Avisos, pago pendiente, bloqueo por vencer | Amarillo de precaución; comunica "atención" sin ser un error. |
| Warning Soft | `#FEF9C3` | Fondo de badges y contador en aviso | Versión suave para fondos de advertencia. |
| Warning Text | `#713F12` | Texto sobre fondos de aviso | Marrón oscuro; el amarillo no tiene contraste suficiente como texto. |

### 3.4 Colores tipográficos

| Color | HEX | Uso recomendado | Justificación |
|---|---|---|---|
| Text Primary (Ink) | `#0F172A` | Títulos y texto principal | Casi negro azulado; contraste alto sin la dureza del negro puro. |
| Text Secondary (Slate) | `#475569` | Subtítulos, descripciones, metadatos | Gris azulado medio; crea jerarquía manteniendo la legibilidad. |
| Text Disabled (Muted) | `#94A3B8` | Placeholders, texto inactivo, elementos deshabilitados | Gris claro que se lee como "inactivo" sin confundirse con texto activo. |

### 3.5 Bordes

| Color | HEX | Uso recomendado | Justificación |
|---|---|---|---|
| Border | `#E2E8F0` | Contornos de inputs, cards y botones secundarios, divisores | Sutil sobre las superficies blancas; define límites sin ruido visual. |

### 3.6 Nota de accesibilidad

El texto blanco sobre naranja tiene un contraste justo con los pasos claros. Para botones o textos con fondo naranja se recomienda usar `secondary-500` o `secondary-600`. El texto sobre fondos de aviso siempre usa `Warning Text` (`#713F12`).

---

## 4. Tipografía

### Fuente principal — Inter

Sans-serif neutra, diseñada para interfaces de pantalla, con formas abiertas y números muy legibles.

**Razón de la elección:** garantiza legibilidad óptima en pantallas con información densa (franjas horarias, precios, formularios y estados), funciona bien en todos los tamaños de la escala y es gratuita y de fácil instalación (Google Fonts), sin problemas de licencia.

Pesos disponibles: 400 (Regular), 500 (Medium), 700 (Bold).

### Fuente secundaria

No aplica. Inter cubre tanto títulos como texto de lectura; el contraste jerárquico se logra con tamaño y peso.

> **Fallback:** `system-ui, sans-serif` si Inter no está disponible en el entorno.

### Escala tipográfica

Tamaños para escritorio.

| Nivel | Tamaño | Peso | Line Height | Letter Spacing | Fuente | Uso recomendado |
|---|---|---|---|---|---|---|
| **H1** | 40px | 700 (Bold) | 48px (1.2) | 0em | Inter | Título principal de página |
| **H2** | 32px | 700 (Bold) | 40px (1.25) | 0em | Inter | Títulos de sección |
| **H3** | 24px | 500 (Medium) | 32px (1.33) | 0em | Inter | Subtítulos, títulos de modal |
| **H4** | 20px | 500 (Medium) | 28px (1.4) | 0em | Inter | Títulos de card |
| **Body** | 16px | 400 (Regular) | 24px (1.5) | 0em | Inter | Texto general, descripciones |
| **Small** | 14px | 400 (Regular) | 20px (1.43) | 0em | Inter | Texto de apoyo, ayudas de formulario |
| **Caption** | 12px | 400 (Regular) | 16px (1.33) | 0em | Inter | Metadatos, etiquetas pequeñas, texto de estado |
| **Botón** | 16px | 500 (Medium) | 24px (1.5) | 0em | Inter | Etiqueta de botones |

Notas:
- El botón de tamaño S usa etiqueta de 14 px.
- Color de texto por defecto: `Text Primary`. Texto secundario: `Text Secondary`.

---

## 5. Espaciado

### Unidad base

**4px**, con una escala progresiva basada en múltiplos que garantiza consistencia matemática en todo el sistema.

### Escala de espaciado

| Token | Valor | Uso recomendado |
|---|---|---|
| `spacing-1` | 4px | Separación mínima (ícono + texto, elementos muy compactos) |
| `spacing-2` | 8px | Padding interno reducido, separación entre elementos relacionados |
| `spacing-3` | 12px | Padding estándar en componentes pequeños (inputs, chips) |
| `spacing-4` | 16px | Padding base de cards y contenedores; separación entre campos de formulario |
| `spacing-5` | 24px | Separación entre bloques dentro de una sección; gutter de la cuadrícula |
| `spacing-6` | 32px | Padding de secciones medianas |
| `spacing-7` | 48px | Separación entre secciones principales |
| `spacing-8` | 64px | Márgenes laterales de página en desktop |

### Criterios de uso

- **Padding interno de componentes:** `spacing-2` a `spacing-4`, según la densidad del componente.
- **Márgenes entre elementos de un mismo grupo** (ej. campos de formulario): `spacing-3` a `spacing-4`.
- **Separación entre secciones funcionales distintas:** `spacing-6` a `spacing-7`.
- **Márgenes de página en desktop:** `spacing-8`.

---

## 6. Radios y sombras

### Border radius

| Token | Valor | Uso recomendado |
|---|---|---|
| `radius-xs` | 4px | Elementos pequeños |
| `radius-sm` | 8px | Botones, inputs |
| `radius-md` | 12px | Cards, modales |
| `radius-full` | 999px | Badges, chips y píldoras |

### Elevación (sombras)

Formato: desplazamiento X, desplazamiento Y, blur, opacidad.

| Token | Valor | Uso recomendado |
|---|---|---|
| `shadow-sm` | 0 · 1 · 3 · 8 % | Elevación baja (cards en reposo) |
| `shadow-md` | 0 · 6 · 16 · 10 % | Cards destacadas |
| `shadow-lg` | 0 · 16 · 36 · 14 % | Modales |

---

## 7. Iconografía

### Librería

Una única librería de íconos para todo el producto. **La librería final debe coincidir con la que se registre en `integraciones.md`**, ya que no se pueden agregar librerías fuera de ese documento.

### Estilo

Lineal, geométrico y de esquinas suavemente redondeadas, coherente con los radios del sistema (ver [6. Radios y sombras](#6-radios-y-sombras)).

### Grosor

Trazo uniforme. Se usa un solo grosor dentro de un mismo contexto visual; no se mezclan grosores distintos en un mismo componente.

### Tamaños

| Token | Valor | Uso |
|---|---|---|
| `icon-sm` | 16px | Íconos inline con texto (Small/Caption) |
| `icon-md` | 18px | Chips de categoría, inputs y botones |
| `icon-lg` | 24px | Íconos destacados, encabezados de sección |
| `icon-xl` | 32px | Íconos grandes en estados de resultado (banner de escaneo) |

### Consistencia

Todos los íconos deben provenir de la misma librería y del mismo estilo dentro de un mismo contexto visual. No se permite mezclar librerías de íconos, para preservar la coherencia formal en todo el producto.

---

## 8. Componentes base

Todos los componentes se construyen con Auto Layout y variantes en Figma.

### 8.1 Button

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

### 8.2 Input

- Alto: 44 px.
- Etiqueta y texto de ayuda siempre visibles.
- Ícono opcional a la izquierda; en contraseña, ícono de ojo a la derecha.

**Estados:** normal, foco, error (borde y mensaje en rojo), disabled / no editable (candado).

**Tipos:** texto, correo, contraseña y cédula.

### 8.3 Card

Radio 12 px, borde suave y sombra contextual.

| Variante | Contenido |
|---|---|
| Servicio | Imagen, categoría, precio, título, descripción, badge de franjas libres y enlace a horarios |
| Reserva | Badge de estado, identificador de reserva, título, fecha y franja, resumen (personas, total) y acciones |
| Simple | Fondo oscuro con ícono, título, texto y enlace |

### 8.4 Badge

Forma pill de 24 px con punto de 6 px a la izquierda, para que el estado no dependa solo del color.

| Badge en UI | Estado del sistema | Colores |
|---|---|---|
| Pendiente | `pending` | Fondo `Warning Soft`, texto `Warning Text` |
| Confirmada | `confirmed` | Fondo `Success Soft`, texto verde oscuro |
| Fallida | `failed` | Fondo `Error Soft`, texto rojo oscuro |
| Expirada | `expired` | Fondo gris (`Border`), texto `Text Secondary` |
| Completada | `completed` | Fondo `primary-100`, texto `primary-700` |

### 8.5 Modal

- Ancho: 480 px, radio 12 px, `shadow-lg`.
- Estructura: título (H3), botón de cerrar, texto y dos acciones alineadas a la derecha.
- Fondo con overlay oscuro.
- Ejemplo del sistema: **"¿Confirmar tu reserva?"** con acciones **Ver detalles** (secundaria) y **Confirmar**.

> El sistema no incluye cancelaciones ni reembolsos en esta versión. Los modales del producto no deben ofrecer esa acción.

---

## 9. Patrones de reserva

### 9.1 Chip de franja

Tamaño 88 × 44 px. Muestra la hora de inicio en formato 24 h (ej. `08:00`).

| Estado | Descripción |
|---|---|
| Libre | Borde `Border`, fondo blanco |
| Ocupada | Fondo gris, texto `Muted` tachado |
| Seleccionada | Fondo `primary-500`, texto blanco |

### 9.2 Selector de personas

Controles − / +, con mínimo 1 persona. Cuenta las personas que usan el servicio.

| Estado | Descripción |
|---|---|
| Mínimo | Botón − deshabilitado |
| Activo | Valor intermedio |
| Grupo | Hasta la capacidad máxima del servicio |

**Regla de capacidad:** la cantidad máxima depende del servicio. Se debe mostrar la regla antes de bloquear el incremento.

### 9.3 Chips de categoría

Ícono de 18 px, alto 44 px, forma pill. Estados: activa (fondo `primary-500`) e inactiva (fondo blanco con borde).

| Chip en UI | Categoría del sistema |
|---|---|
| Canchas | Canchas |
| Piscinas | Piscinas |
| Sauna / turco | Zonas húmedas |
| Gimnasio | Gimnasio |

---

## 10. Pago, acceso y feedback

### 10.1 Contador de pago

Representa el bloqueo temporal de la franja mientras se paga. Duración: **10:00 minutos**, con barra de progreso.

| Variante | Condición | Colores |
|---|---|---|
| Base | Más de 2 minutos restantes | Fondo `Primary Soft`, borde y texto `primary` |
| Aviso | Menos de 2 minutos | Fondo `Warning Soft`, texto `Warning Text` |
| Expirado | 00:00, pago bloqueado | Fondo `Error Soft`, texto `Error` |

Al expirar, la franja vuelve a estar disponible y se debe ofrecer una nueva búsqueda.

### 10.2 Tarjeta QR

- Código de 200 × 200 px con zona segura de 16 px alrededor (no recolorear los módulos).
- Debajo: título del pase e identificador de reserva.

| Variante | Descripción |
|---|---|
| Lista para escanear | Tarjeta blanca con el QR visible |
| Ya escaneado | Borde verde, QR atenuado y etiqueta "Ya escaneado" |

**Múltiples QR:** el componente se repite según el tipo de servicio. La cancha de fútbol genera un solo QR para todo el grupo; los demás servicios (piscina, gimnasio y zonas húmedas) generan un QR por persona. En reservas con varias personas, las tarjetas se muestran una por cada QR.

**Reingreso:** el QR se invalida al primer escaneo. Los reingresos los valida manualmente el empleado.

### 10.3 Banner de escaneo

Alto 96 px, ancho completo, con ícono, resultado visible a distancia, hora y código de registro.

| Variante | Colores | Ejemplo |
|---|---|---|
| Válido | Verde con borde izquierdo de énfasis | "Acceso válido" + nombre, servicio y franja |
| Inválido | Rojo con borde izquierdo de énfasis | "Acceso inválido" + motivo (pase expirado o ya utilizado) |

---

## 11. Design Tokens

Tabla de referencia técnica: cada fila es una variable de diseño lista para implementarse como variable CSS o como token del tema de Tailwind. El **nombre del token no cambia**; solo cambiaría su valor si en el futuro se agrega un modo oscuro.

> **Naming convention:** `--categoría-nombre` (ej. `--color-background`, `--spacing-4`, `--radius-md`). Los colores de marca (`primary` y `secondary`) conservan la escala numérica 50–900 porque así están definidos en Figma; el resto de tokens es semántico (cada nombre indica su uso).

### Color

| Token | Valor | Uso |
|---|---|---|
| `--color-background` | `#F8FAFC` | Fondo base de la aplicación (Canvas) |
| `--color-surface` | `#FFFFFF` | Cards, inputs, modales (White) |
| `--color-primary` | `#0B5FA5` | Botones principales, links, selección (= `primary-500`) |
| `--color-primary-hover` | `#094F88` | Hover de elementos primarios (= `primary-600`) |
| `--color-primary-soft` | `#EAF3FA` | Fondos suaves (= `primary-50`) |
| `--color-secondary` | `#EA580C` | Acentos y llamadas puntuales (= `secondary-500`) |
| `--color-success` | `#16A34A` | Confirmaciones, acceso válido |
| `--color-success-soft` | `#DCFCE7` | Fondo de éxito |
| `--color-error` | `#DC2626` | Errores, pago fallido, acceso inválido |
| `--color-error-soft` | `#FEE2E2` | Fondo de error |
| `--color-warning` | `#EAB308` | Avisos, pago pendiente |
| `--color-warning-soft` | `#FEF9C3` | Fondo de aviso |
| `--color-warning-text` | `#713F12` | Texto sobre fondo de aviso |
| `--color-text-primary` | `#0F172A` | Títulos y texto principal (Ink) |
| `--color-text-secondary` | `#475569` | Subtítulos y metadatos (Slate) |
| `--color-text-disabled` | `#94A3B8` | Placeholders y texto inactivo (Muted) |
| `--color-border` | `#E2E8F0` | Bordes y divisores (Border) |
| `--color-primary-{50…900}` | Ver sección 3.2 | Escala completa del primario |
| `--color-secondary-{50…900}` | Ver sección 3.2 | Escala completa del secundario |

### Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--font-family-primary` | `"Inter", system-ui, sans-serif` | Toda la interfaz |
| `--font-size-h1` | `40px` | Título principal |
| `--font-size-h2` | `32px` | Títulos de sección |
| `--font-size-h3` | `24px` | Subtítulos, títulos de modal |
| `--font-size-h4` | `20px` | Títulos de card |
| `--font-size-body` | `16px` | Texto general y botones |
| `--font-size-small` | `14px` | Texto de apoyo |
| `--font-size-caption` | `12px` | Metadatos |
| `--font-weight-regular` | `400` | Texto general |
| `--font-weight-medium` | `500` | Subtítulos y botones |
| `--font-weight-bold` | `700` | H1 y H2 |

> Los valores de line-height por nivel están en la tabla de la sección 4 y no varían.

### Espaciado

| Token | Valor | Uso |
|---|---|---|
| `--spacing-1` | `4px` | Separación mínima |
| `--spacing-2` | `8px` | Padding interno reducido |
| `--spacing-3` | `12px` | Padding de componentes pequeños |
| `--spacing-4` | `16px` | Padding base de cards |
| `--spacing-5` | `24px` | Separación entre bloques; gutter |
| `--spacing-6` | `32px` | Padding de secciones medianas |
| `--spacing-7` | `48px` | Separación entre secciones |
| `--spacing-8` | `64px` | Márgenes laterales en desktop |

### Border radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | `4px` | Elementos pequeños |
| `--radius-sm` | `8px` | Botones e inputs |
| `--radius-md` | `12px` | Cards y modales |
| `--radius-full` | `999px` | Badges y chips |

### Elevación (sombra)

| Token | Valor | Uso |
|---|---|---|
| `--shadow-sm` | `0px 1px 3px rgba(15,23,42,0.08)` | Cards en reposo |
| `--shadow-md` | `0px 6px 16px rgba(15,23,42,0.10)` | Cards destacadas |
| `--shadow-lg` | `0px 16px 36px rgba(15,23,42,0.14)` | Modales |

### Iconografía

| Token | Valor | Uso |
|---|---|---|
| `--icon-sm` | `16px` | Inline con texto |
| `--icon-md` | `18px` | Chips, inputs y botones |
| `--icon-lg` | `24px` | Íconos destacados |
| `--icon-xl` | `32px` | Estados de resultado |

### Ejemplo de implementación en CSS

```css
:root {
  --color-background: #f8fafc;
  --color-surface: #ffffff;
  --color-primary: #0b5fa5;
  --color-primary-hover: #094f88;
  --color-secondary: #ea580c;
  --color-text-primary: #0f172a;
  --spacing-4: 16px;
  --radius-md: 12px;
}
```

### Referencia para Tailwind

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
    borderRadius: { xs: '4px', sm: '8px', md: '12px', full: '999px' },
    boxShadow: {
      sm: '0 1px 3px rgba(15,23,42,0.08)',
      md: '0 6px 16px rgba(15,23,42,0.10)',
      lg: '0 16px 36px rgba(15,23,42,0.14)',
    },
    screens: { md: '768px', lg: '1280px' },
  },
}
```

### Equivalencia en Figma

Los estilos de color y de texto de la página "Sistema Visual" corresponden a los tokens de este documento:

| Estilo en Figma | Token |
|---|---|
| Canvas | `--color-background` |
| White | `--color-surface` |
| Ink | `--color-text-primary` |
| Slate | `--color-text-secondary` |
| Muted | `--color-text-disabled` |
| Border | `--color-border` |
| Éxito / Error / Aviso (y sus fondos) | `--color-success`, `--color-error`, `--color-warning` (y `-soft`) |

Los componentes deben enlazarse siempre al estilo (nunca a un valor fijo), para poder cambiar un color desde un solo lugar.

---

## 12. Logo

**Estado: pendiente.** Depende de la definición del nombre de la marca. Se entregarán tres versiones del mismo logo:

| Versión | Uso |
|---|---|
| Principal | Ícono + nombre sobre fondo claro (encabezado, login, correos) |
| Reducida | Solo ícono en formato cuadrado (favicon, espacios pequeños) |
| Invertida | Logo en blanco para fondos oscuros o de color |

Mientras tanto, el sistema usa el texto provisional "Complejo Deportivo".

---

## 13. Notas para el reviewer

- Los ejemplos de contenido en Figma (servicios, precios, fechas y nombres) son solo ilustrativos y no representan datos reales del complejo.
- Pendiente: sección de logo, a la espera de la definición del nombre.
- Pendiente: adaptación a Tablet (768 px) y Mobile (375 px).
- Pendiente: confirmar la librería de íconos con Dev 4 para registrarla en `integraciones.md`.
