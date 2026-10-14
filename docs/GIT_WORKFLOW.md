# GIT WORKFLOW — Sistema de Reservas Complejo Deportivo

> **Este documento es de cumplimiento obligatorio para todo el equipo.**  
> Reemplaza los Rulesets de GitHub (plan pago). Su efectividad depende de que todos lo respeten.  
> Ante cualquier duda, consultar al Tech Lead antes de actuar.

---

## Tabla de Contenido

1. [Estructura de ramas](#1-estructura-de-ramas)
2. [Reglas por rama](#2-reglas-por-rama)
3. [Flujo de trabajo diario](#3-flujo-de-trabajo-diario)
4. [Convención de nombres de ramas](#4-convención-de-nombres-de-ramas)
5. [Convención de commits](#5-convención-de-commits)
6. [Pull Requests](#6-pull-requests)
7. [Code Review](#7-code-review)
8. [Manejo de conflictos](#8-manejo-de-conflictos)
9. [Comandos de referencia rápida](#9-comandos-de-referencia-rápida)
10. [Errores comunes y cómo resolverlos](#10-errores-comunes-y-cómo-resolverlos)

---

## 1. Estructura de Ramas

```
main
  └── develop
        ├── feature/auth
        ├── feature/reservations
        ├── feature/payments
        ├── feature/qr
        ├── feature/admin
        └── feature/notifications
```

| Rama | Propósito | Quién puede hacer push |
|------|-----------|------------------------|
| `main` | Producción. Código estable y desplegado | Nadie hace push directo. Solo merge desde `develop` vía PR |
| `develop` | Integración. Aquí se unen todas las features | Tech Lead + merges desde feature/* vía PR |
| `feature/*` | Desarrollo individual por feature | El dev asignado a esa feature |

---

## 2. Reglas por Rama

### `main`
- ❌ Nadie hace push directo a `main` bajo ninguna circunstancia
- ✅ Solo recibe merges desde `develop` vía Pull Request aprobado por el Tech Lead
- ✅ Cada merge a `main` representa una versión entregable y desplegada

### `develop`
- ❌ Nadie hace push directo
- ✅ Solo recibe merges desde ramas `feature/*` vía Pull Request aprobado
- ✅ Debe estar siempre en estado funcional (sin errores que rompan el proyecto)

### `feature/*`
- ✅ Cada dev trabaja libremente en su propia rama
- ✅ Hacer push diario aunque no esté terminado (backup)
- ❌ No tocar ramas `feature/*` de otros devs sin avisar

---

## 3. Flujo de Trabajo Diario

### Día 1 — Setup inicial (solo una vez)

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd <nombre-del-repo>

# 2. Posicionarse en develop
git checkout develop
git pull origin develop

# 3. Crear tu rama de feature
git checkout -b feature/nombre-de-tu-feature

# 4. Verificar que estás en la rama correcta
git branch
# Debe mostrar * feature/nombre-de-tu-feature
```

### Cada mañana — Antes de empezar a trabajar

```bash
# 1. Traer los últimos cambios de develop
git fetch origin
git checkout develop
git pull origin develop

# 2. Volver a tu rama y actualizarla
git checkout feature/nombre-de-tu-feature
git merge develop

# 3. Si hay conflictos, resolverlos (ver sección 8)
# 4. Continuar trabajando
```

### Durante el día — Al terminar cada tarea

```bash
# 1. Ver qué archivos cambiaste
git status

# 2. Agregar los cambios
git add .
# O agregar archivos específicos:
git add src/app/reservations/page.tsx

# 3. Hacer commit con mensaje claro
git commit -m "feat: agregar listado de reservas con filtro por fecha"

# 4. Subir al repositorio remoto
git push origin feature/nombre-de-tu-feature
```

### Al final del día — Obligatorio

```bash
# Asegurarse de subir todo lo del día
git push origin feature/nombre-de-tu-feature
```

> ⚠️ **Si no haces push al final del día y tu computador falla, pierdes el trabajo.**

---

## 4. Convención de Nombres de Ramas

### Formato

```
<tipo>/<descripción-en-kebab-case>
```

### Tipos permitidos

| Tipo | Cuándo usarlo |
|------|---------------|
| `feature/` | Nueva funcionalidad |
| `fix/` | Corrección de bug |
| `hotfix/` | Corrección urgente en producción |
| `docs/` | Cambios solo de documentación |
| `refactor/` | Reorganización de código sin cambio de funcionalidad |

### Ejemplos correctos ✅

```
feature/auth
feature/reservation-flow
feature/qr-scanner
feature/admin-dashboard
fix/payment-webhook-error
hotfix/qr-validation-bug
docs/api-endpoints
```

### Ejemplos incorrectos ❌

```
Feature/Auth          # No usar mayúsculas
feature/Auth Flow     # No usar espacios
mi-rama               # Sin tipo
feature/cosa          # Demasiado vago
rama-juan             # Nombre de persona, no de feature
```

---

## 5. Convención de Commits

### Formato

```
<tipo>: <descripción breve en minúsculas>
```

### Tipos de commit

| Tipo | Cuándo usarlo | Ejemplo |
|------|---------------|---------|
| `feat` | Nueva funcionalidad | `feat: agregar endpoint de creación de reserva` |
| `fix` | Corrección de bug | `fix: corregir validación de franja horaria vencida` |
| `docs` | Documentación | `docs: agregar descripción de endpoints en api.md` |
| `style` | Formato, espacios (sin cambio lógico) | `style: formatear componente de login` |
| `refactor` | Reorganizar código | `refactor: extraer lógica de QR a servicio separado` |
| `test` | Agregar o corregir tests | `test: agregar test de validación de capacidad` |
| `chore` | Tareas de configuración | `chore: instalar dependencia de stripe` |

### Reglas del mensaje

- ✅ Usar minúsculas
- ✅ Ser específico: describir QUÉ se hizo
- ✅ Máximo 72 caracteres en la primera línea
- ❌ No usar puntos al final
- ❌ No usar mensajes vagos

### Ejemplos correctos ✅

```
feat: crear tabla de reservas en supabase con RLS
fix: liberar franja cuando el pago de stripe falla
feat: agregar validación de zona horaria america/bogota
refactor: mover lógica de bloqueo temporal a feature/reservations
docs: actualizar readme con instrucciones de setup
chore: configurar stripe cli para desarrollo local
```

### Ejemplos incorrectos ❌

```
cambios
arreglé cosas
update
fix
WIP
asdfgh
```

---

## 6. Pull Requests

### Cuándo abrir un PR

- Al terminar una feature completa o una parte funcional de ella
- Cada **2 o 3 días** como máximo (no esperar a tener todo terminado)
- Cuando necesitas feedback del equipo sobre tu implementación

### Cómo abrir un PR

1. Ir a GitHub → tu repositorio
2. Click en **"Pull requests"** → **"New pull request"**
3. Base: `develop` ← Compare: `feature/tu-feature`
4. Usar el siguiente template:

---

### Template de PR

```markdown
## 📋 Descripción
Breve descripción de qué se implementó y por qué.

## ✅ Qué incluye este PR
- [ ] Cambio 1
- [ ] Cambio 2
- [ ] Cambio 3

## 🧪 Cómo testear
1. Clonar la rama: `git checkout feature/nombre`
2. Instalar dependencias: `npm install`
3. Correr el servidor: `npm run dev`
4. Ir a: `http://localhost:3000/ruta`
5. Hacer X acción
6. Verificar que Y resultado es correcto

## 📸 Screenshots (si hay cambios visuales)
<!-- Pegar imagen aquí -->

## ⚠️ Notas para el reviewer
<!-- Algo importante que deba saber antes de revisar -->

## 🔗 Relacionado con
<!-- Número de tarea en Trello o issue relacionado -->
```

---

### Reglas de los PRs

| Regla | Detalle |
|-------|---------|
| **Asignar reviewer** | Siempre asignar a otro dev (rotativo) |
| **Tiempo de review** | El reviewer responde el mismo día. Si no puede, avisa en `#code-review` |
| **Aprobaciones** | Mínimo 1 aprobación para mergear a `develop` |
| **Sin conflictos** | El PR no debe tener conflictos antes de mergear |
| **Sin errores** | El proyecto debe correr sin errores en la rama |
| **Merge** | Solo el dueño del PR mergea (después de aprobación) |

---

## 7. Code Review

### Para el reviewer

**Tiempo esperado:** 20 a 40 minutos por PR

**Qué revisar:**

- [ ] ¿El código hace lo que dice el PR?
- [ ] ¿Hay errores obvios o casos no manejados?
- [ ] ¿Las variables y funciones tienen nombres claros?
- [ ] ¿Se manejan los errores correctamente (try/catch)?
- [ ] ¿Hay lógica de negocio crítica sin validar?
- [ ] ¿El código sigue la arquitectura definida?
- [ ] ¿Hay algo que rompa funcionalidad existente?

**Cómo dar feedback:**

```
# Comentario bloqueante (debe corregirse antes de aprobar)
❌ Este endpoint no valida que el usuario esté autenticado.
   Agrega el middleware de auth antes de procesar la petición.

# Sugerencia (no bloquea la aprobación)
💡 Podrías extraer esta lógica a una función en utils/
   para reutilizarla en otros endpoints.

# Aprobación con comentario
✅ Bien implementado. Solo asegúrate de agregar el índice
   en time_slot_id antes de hacer merge.
```

### Para el autor del PR

- Responder cada comentario (aunque sea para decir que lo corregiste)
- Si no estás de acuerdo con un comentario, explica por qué
- Al corregir, hacer push en la misma rama — el PR se actualiza automáticamente
- Cuando corrijas todo, dejar un comentario: `"Cambios aplicados, listo para re-review"`

---

## 8. Manejo de Conflictos

### Prevención (mejor que solución)

- Comunicar en Discord cuando vayas a tocar un archivo compartido
- Hacer `git pull origin develop` y `git merge develop` en tu rama cada mañana
- No trabajar en archivos que otro dev esté modificando sin coordinarse

### Cómo resolver un conflicto

```bash
# 1. Actualizar develop
git fetch origin
git checkout develop
git pull origin develop

# 2. Volver a tu rama y aplicar los cambios
git checkout feature/tu-feature
git merge develop

# 3. Git te mostrará los archivos con conflicto
# Abrir cada archivo y buscar las marcas:
```

```
<<<<<<< HEAD
Tu código (lo que tienes en tu rama)
=======
Código de develop (lo que hay en develop)
>>>>>>> develop
```

```bash
# 4. Editar el archivo: elegir qué código mantener
#    (puede ser uno, el otro, o una combinación)
#    Eliminar las marcas <<<<<, ======= y >>>>>

# 5. Marcar el archivo como resuelto
git add archivo-resuelto.tsx

# 6. Continuar el merge
git merge --continue

# 7. Si hay más conflictos, repetir pasos 4-6
# 8. Al terminar, hacer push
git push origin feature/tu-feature
```

> ⚠️ **Ante cualquier conflicto que no entiendas, llama al Tech Lead antes de hacer cualquier cosa.**

---

## 9. Comandos de Referencia Rápida

### Comandos del día a día

```bash
# Ver en qué rama estás
git branch

# Ver estado de archivos modificados
git status

# Ver historial de commits
git log --oneline

# Traer cambios sin aplicarlos
git fetch origin

# Actualizar tu rama con los últimos cambios de develop
git pull origin develop
git merge develop

# Guardar cambios temporalmente (sin commit)
git stash

# Recuperar cambios guardados con stash
git stash pop

# Ver diferencias antes de hacer commit
git diff
```

### Comandos de ramas

```bash
# Crear rama nueva
git checkout -b feature/nombre

# Cambiar de rama
git checkout develop

# Ver todas las ramas (local y remota)
git branch -a

# Eliminar rama local (después de mergear)
git branch -D feature/nombre

# Eliminar rama remota (después de mergear)
git push origin --delete feature/nombre
```

### Comandos de commits

```bash
# Agregar todos los archivos
git add .

# Agregar archivo específico
git add src/app/page.tsx

# Hacer commit
git commit -m "feat: descripción clara"

# Modificar el último commit (antes de hacer push)
git commit --amend -m "feat: descripción corregida"

# Deshacer el último commit (mantiene los cambios)
git reset --soft HEAD~1
```

---

## 10. Errores Comunes y Cómo Resolverlos

### ❌ "Hice commit en develop directamente"

```bash
# 1. Deshacer el commit (mantiene los cambios)
git reset --soft HEAD~1

# 2. Cambiar a tu rama feature
git checkout feature/tu-feature

# 3. Hacer el commit en la rama correcta
git add .
git commit -m "feat: descripción"
git push origin feature/tu-feature
```

---

### ❌ "Hice push a main por error"

```bash
# NO intentes arreglarlo solo. Avisa al Tech Lead inmediatamente.
# El Tech Lead usará:
git revert <hash-del-commit>
git push origin main
```

---

### ❌ "Mi rama está muy desactualizada respecto a develop"

```bash
git checkout develop
git pull origin develop
git checkout feature/tu-feature
git merge develop
# Resolver conflictos si los hay
git push origin feature/tu-feature
```

---

### ❌ "Borré archivos por accidente"

```bash
# Si no hiciste commit todavía
git checkout -- .

# Si ya hiciste commit
git revert <hash-del-commit>
```

---



---



---

## ⚠️ Seguridad — Variables de Entorno

> **Esta es la regla más crítica de seguridad del proyecto.**

### NUNCA subir archivos de entorno al repo

Los archivos `.env`, `.env.local` y `.env.*` contienen claves privadas de Stripe, Supabase y otros servicios. Si se suben al repo, cualquier persona con acceso puede ver esas claves y comprometer el sistema.

**Verificar antes del primer commit:**

```bash
# Asegurarse de que .gitignore incluye:
.env
.env.local
.env.*
!.env.example
```

**Reglas:**

- ✅ El repo solo debe tener `.env.example` con los nombres de las variables (sin valores)
- ❌ Nunca subir `.env.local` ni ningún archivo con claves reales
- ❌ Nunca escribir una clave directamente en el código

**Si se sube un archivo `.env` por error:**

1. Avisar al Tech Lead **inmediatamente**
2. El Tech Lead revoca y rota todas las claves expuestas (Stripe, Supabase, Resend)
3. Se elimina el archivo del historial de Git con `git filter-repo` (herramienta recomendada)
4. Todos los devs deben actualizar sus `.env.local` con las nuevas claves

> El daño de subir claves al repo no se deshace solo borrando el archivo. El historial de Git guarda todo. Por eso se rotan las claves sin excepción.

---

## 🚨 Reglas de Oro (Memorizar)

1. **Nunca push directo a `main` o `develop`**
2. **Cada feature tiene su propia rama. Nunca dos personas en la misma rama.**
3. **Commit al terminar cada tarea, push al final del día**
4. **PR cada 2-3 días máximo**
5. **Merge con develop cada mañana**
6. **Ante una duda, preguntar antes de actuar**
7. **Nunca `git push --force` — usar `--force-with-lease`**
8. **El Tech Lead tiene la última palabra en decisiones de Git**

---

## ¿Necesitas ayuda?

Escribe en el canal **#bloqueos** de Discord con:

1. Qué estabas intentando hacer
2. Qué comando ejecutaste
3. Qué error o resultado obtuviste

El Tech Lead responde en máximo 1 hora en horario de trabajo.

---

*Documento mantenido por el Tech Lead. Última actualización: Septiembre 2026.*
