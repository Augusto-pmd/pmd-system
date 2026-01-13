# Auditoría UX PMD - Validación de Criterios

## Objetivo
Validar 5 criterios críticos de usabilidad en el sistema PMD actual.

---

## Criterio 1: ¿El usuario siempre sabe dónde está?

### ✅ PASS / ❌ FAIL: **❌ FAIL**

### Evidencia

#### ❌ No hay breadcrumbs
- **Archivo:** `components/ui/Header.tsx`
- **Línea:** 110
- **Problema:** Header tiene prop `title` pero no se usa consistentemente
- **Impacto:** Usuario no ve jerarquía de navegación

#### ❌ Título no se muestra en todas las páginas
- **Archivo:** `app/(authenticated)/works/[id]/page.tsx`
- **Línea:** 17 (usa `BotonVolver`, no Header con título)
- **Problema:** Páginas de detalle no usan Header con título
- **Impacto:** Usuario no sabe en qué página está

#### ❌ No hay indicador de página actual en mobile
- **Archivo:** `components/layout/Sidebar.tsx`
- **Línea:** 227-233
- **Problema:** `isActive` solo resalta con borde, puede no ser visible en mobile
- **Impacto:** Difícil saber qué módulo está activo en mobile

### Ejemplos de Páginas Sin Contexto

| Página | Header con Título | Breadcrumbs | Botón Volver |
|--------|-------------------|-------------|--------------|
| `/works` | ❌ No | ❌ No | ✅ Sí (`BotonVolver`) |
| `/works/[id]` | ❌ No | ❌ No | ✅ Sí (`BotonVolver`) |
| `/cash-movements/[id]` | ❌ No | ❌ No | ✅ Sí (`BotonVolver`) |
| `/dashboard` | ❌ No | ❌ No | ❌ No |
| `/alerts` | ❌ No | ❌ No | ⚠️ Parcial |

### Resultado
**❌ FAIL** - Usuario NO siempre sabe dónde está

---

## Criterio 2: ¿Puede volver atrás sin pensar?

### ✅ PASS / ❌ FAIL: **❌ FAIL**

### Evidencia

#### ❌ `BotonVolver` usa `router.back()` sin contexto
- **Archivo:** `components/ui/BotonVolver.tsx`
- **Línea:** 10
- **Código:** `onClick={() => router.back()}`
- **Problema:** Puede llevar a página externa o inesperada
- **Impacto:** Usuario puede terminar fuera del sistema

#### ❌ No hay navegación contextual
- **Archivo:** `app/(authenticated)/works/[id]/page.tsx`
- **Línea:** 17
- **Problema:** Usa `BotonVolver` que va al historial, no a `/works`
- **Impacto:** Comportamiento impredecible

#### ⚠️ Algunas páginas tienen navegación contextual
- **Archivo:** `app/(authenticated)/works/[id]/page.tsx`
- **Línea:** 49, 62
- **Evidencia:** En caso de error, usa `router.push("/works")` (correcto)
- **Problema:** Solo en casos de error, no en navegación normal

### Uso de `router.back()`

| Archivo | Línea | Uso | Problema |
|---------|-------|-----|----------|
| `components/ui/BotonVolver.tsx` | 10 | `router.back()` | ❌ Sin contexto |
| `app/unauthorized/page.tsx` | 24 | `router.back()` | ⚠️ Aceptable (página de error) |

### Resultado
**❌ FAIL** - Usuario NO puede volver atrás sin pensar (comportamiento impredecible)

---

## Criterio 3: ¿Mobile es usable con una mano?

### ✅ PASS / ❌ FAIL: **❌ FAIL**

### Evidencia

#### ⚠️ SidebarToggle: Tamaño aceptable pero mejorable
- **Archivo:** `components/layout/SidebarToggle.tsx`
- **Línea:** 14
- **Código:** `p-3` (12px padding) + icono `w-6 h-6` (24px) = ~48px total
- **Estado:** ✅ Aceptable (48px es el mínimo recomendado)
- **Mejora sugerida:** Aumentar a `p-4` (16px) para más margen

#### ❌ Sidebar items: Tap targets pequeños
- **Archivo:** `components/layout/Sidebar.tsx`
- **Línea:** 308
- **Código:** `py-3` (12px vertical padding)
- **Problema:** Tap target efectivo ~44px (menor a 48px recomendado)
- **Impacto:** Errores de tap en mobile

#### ❌ Button: Tamaños pequeños en mobile
- **Archivo:** `components/ui/Button.tsx`
- **Línea:** 80, 85
- **Código:** 
  - `sm`: `height: 36px` ❌ (muy pequeño)
  - `md`: `height: 44px` ⚠️ (aceptable pero mejorable)
  - `lg`: `height: 48px` ✅ (correcto)
- **Problema:** Variante `sm` es demasiado pequeña para mobile
- **Impacto:** Errores de tap frecuentes

#### ❌ No hay botones sticky en mobile
- **Archivo:** Formularios (ej: `components/forms/WorkForm.tsx`)
- **Problema:** Botones "Guardar" / "Cancelar" al final del scroll
- **Impacto:** Usuario debe hacer scroll para acceder a acciones críticas
- **Requisito mobile:** Botones primarios deben ser sticky en bottom

#### ❌ No hay gesto swipe para cerrar sidebar
- **Archivo:** `components/layout/Sidebar.tsx`
- **Problema:** Solo se cierra con click en overlay o botón
- **Impacto:** Menos natural en mobile (usuarios esperan swipe)

#### ⚠️ Sidebar ocupa mucho espacio en mobile
- **Archivo:** `components/layout/Sidebar.tsx`
- **Línea:** 274
- **Código:** `w-64` (256px)
- **Problema:** Ocupa 70-80% de pantalla en mobile pequeño
- **Impacto:** Reduce espacio visible de contenido

### Medidas Actuales vs Recomendadas

| Elemento | Actual | Recomendado | Estado |
|----------|--------|-------------|--------|
| SidebarToggle | ~48px | 48px+ | ⚠️ Aceptable |
| Sidebar items | ~44px | 48px+ | ❌ Pequeño |
| Button sm | 36px | 48px+ | ❌ Muy pequeño |
| Button md | 44px | 48px+ | ⚠️ Aceptable |
| Button lg | 48px | 48px+ | ✅ Correcto |
| Spacing entre items | 0px | 8px+ | ❌ Sin spacing |

### Resultado
**❌ FAIL** - Mobile NO es completamente usable con una mano

---

## Criterio 4: ¿Las acciones críticas están claras?

### ✅ PASS / ❌ FAIL: **❌ FAIL**

### Evidencia

#### ❌ No hay variante `danger` en Button
- **Archivo:** `components/ui/Button.tsx`
- **Línea:** 53-74
- **Variantes existentes:** `primary`, `secondary`, `outline`, `ghost`, `icon`
- **Problema:** No existe `danger` o `destructive`
- **Impacto:** Acciones destructivas no están claramente diferenciadas

#### ❌ Delete usa estilos inconsistentes
- **Archivo:** `components/works/WorksList.tsx`
- **Línea:** 228-230
- **Código:** `variant="outline"` + `text-red-600`
- **Problema:** Delete usa `outline` (igual que cancel)

- **Archivo:** `components/alerts/AlertsList.tsx`
- **Línea:** 346-350
- **Código:** `variant="primary"` + `bg-red-600`
- **Problema:** Delete usa `primary` rojo (inconsistente con otros módulos)

- **Archivo:** `components/audit/AuditList.tsx`
- **Línea:** 264-267
- **Código:** `variant="outline"` + `color: "#FF3B30"`
- **Problema:** Delete usa `outline` con color inline (inconsistente)

#### ⚠️ Confirmaciones existen pero inconsistentes
- **Archivo:** `components/ui/ConfirmationModal.tsx`
- **Línea:** 14
- **Estado:** Existe componente reutilizable con `variant="danger"`
- **Problema:** No se usa consistentemente

- **Archivo:** `components/alerts/AlertsList.tsx`
- **Línea:** 320-356
- **Estado:** Modal custom (no usa `ConfirmationModal`)
- **Problema:** Estilo diferente a otros módulos

- **Archivo:** `components/works/WorksList.tsx`
- **Línea:** 255-295
- **Estado:** Modal custom con múltiples opciones
- **Problema:** No sigue patrón estándar

### Jerarquía Visual Actual

| Acción | Variante Actual | Problema |
|--------|-----------------|----------|
| Crear | `primary` | ✅ Correcto |
| Editar | `outline` o `ghost` | ⚠️ Aceptable |
| Cancelar | `outline` | ✅ Correcto |
| **Delete** | `outline` + rojo | ❌ Inconsistente |
| **Delete** | `primary` + rojo | ❌ Inconsistente |

### Resultado
**❌ FAIL** - Las acciones críticas NO están claramente diferenciadas

---

## Criterio 5: ¿El sistema confirma siempre lo que pasa?

### ✅ PASS / ❌ FAIL: **⚠️ PASS PARCIAL**

### Evidencia

#### ✅ Toast system implementado y usado
- **Archivo:** `components/ui/Toast.tsx`
- **Línea:** 84-103
- **Estado:** Hook `useToast()` disponible con 4 tipos
- **Uso:** Se usa en múltiples módulos
- **Ejemplo:** `app/(authenticated)/works/page.tsx` líneas 27, 31

#### ✅ Loading states existen
- **Archivo:** `components/ui/LoadingState.tsx`
- **Estado:** Componente reutilizable
- **Uso:** Se usa en páginas de detalle
- **Ejemplo:** `app/(authenticated)/works/[id]/page.tsx` línea 37

#### ✅ Mensajes de éxito/error se muestran
- **Archivo:** `app/(authenticated)/works/page.tsx`
- **Línea:** 27, 31
- **Código:** `toast.success("Obra creada correctamente")`
- **Estado:** Funciona correctamente

#### ⚠️ Mensajes son genéricos
- **Archivo:** `app/(authenticated)/works/page.tsx`
- **Línea:** 31
- **Código:** `toast.error(err.message || "Error al crear la obra")`
- **Problema:** Mensaje genérico, no accionable
- **Impacto:** Usuario no sabe qué hacer para resolver

#### ❌ No hay feedback durante submit
- **Archivo:** `components/forms/WorkForm.tsx`
- **Problema:** Botón no muestra "Guardando..." durante submit
- **Impacto:** Usuario no sabe si la acción está procesando

#### ❌ No hay skeleton loaders
- **Archivo:** `components/ui/LoadingState.tsx`
- **Problema:** Muestra spinner genérico, no skeleton del contenido
- **Impacto:** Peor percepción de velocidad

#### ⚠️ Confirmaciones existen pero no siempre
- **Archivo:** `components/works/WorksList.tsx`
- **Línea:** 255-295
- **Estado:** Modal de confirmación para delete
- **Problema:** No todas las acciones críticas tienen confirmación

### Ejemplos de Feedback

| Acción | Loading | Success | Error | Confirmación |
|--------|---------|---------|-------|--------------|
| Crear obra | ❌ No | ✅ Sí | ✅ Sí | ❌ No |
| Editar obra | ❌ No | ✅ Sí | ✅ Sí | ❌ No |
| Eliminar obra | ⚠️ Parcial | ✅ Sí | ✅ Sí | ✅ Sí |
| Cerrar caja | ❌ No | ⚠️ Parcial | ✅ Sí | ❌ No |

### Resultado
**⚠️ PASS PARCIAL** - El sistema confirma la mayoría de acciones, pero:
- Mensajes son genéricos (no accionables)
- No hay feedback durante submit
- No todas las acciones críticas tienen confirmación

---

## Resumen de Auditoría

| Criterio | Estado | Prioridad | Impacto |
|----------|--------|-----------|---------|
| **1. ¿El usuario siempre sabe dónde está?** | ❌ **FAIL** | 🔴 ALTA | Desorientación |
| **2. ¿Puede volver atrás sin pensar?** | ❌ **FAIL** | 🔴 ALTA | Navegación impredecible |
| **3. ¿Mobile es usable con una mano?** | ❌ **FAIL** | 🔴 ALTA | Errores de tap, frustración |
| **4. ¿Las acciones críticas están claras?** | ❌ **FAIL** | 🟡 MEDIA | Acciones accidentales |
| **5. ¿El sistema confirma siempre lo que pasa?** | ⚠️ **PASS PARCIAL** | 🟡 MEDIA | Mensajes genéricos |

### Puntuación General: **1/5 PASS** (20%)

---

## Problemas Críticos Identificados

### 🔴 CRÍTICO 1: Navegación Sin Contexto
- **Problema:** No hay breadcrumbs, títulos inconsistentes
- **Impacto:** Usuario desorientado
- **Solución:** Implementar breadcrumbs y Header con título en todas las páginas

### 🔴 CRÍTICO 2: Volver Impredecible
- **Problema:** `router.back()` sin contexto
- **Impacto:** Usuario puede terminar fuera del sistema
- **Solución:** Navegación contextual (breadcrumbs o botón que va a página padre conocida)

### 🔴 CRÍTICO 3: Mobile No Optimizado
- **Problema:** Tap targets pequeños, botones no sticky
- **Impacto:** Errores de tap, acciones críticas ocultas
- **Solución:** Aumentar tap targets a 48px, botones sticky en mobile

### 🟡 MEDIO 1: Acciones No Claramente Diferenciadas
- **Problema:** No hay variante `danger`, estilos inconsistentes
- **Impacto:** Acciones destructivas no obvias
- **Solución:** Agregar variante `danger` y unificar estilos

### 🟡 MEDIO 2: Feedback Genérico
- **Problema:** Mensajes no accionables, sin feedback durante submit
- **Impacto:** Usuario no sabe cómo resolver errores
- **Solución:** Mensajes específicos, loading en botones

---

## Recomendaciones Inmediatas

### Prioridad 1 (Esta Semana)
1. ✅ Agregar breadcrumbs a páginas de detalle
2. ✅ Reemplazar `router.back()` por navegación contextual
3. ✅ Aumentar tap targets a 48px mínimo

### Prioridad 2 (Próxima Semana)
4. ✅ Agregar variante `danger` a Button
5. ✅ Unificar confirmaciones con `ConfirmationModal`
6. ✅ Mejorar mensajes de toast (específicos y accionables)

### Prioridad 3 (Siguiente Sprint)
7. ✅ Botones sticky en mobile
8. ✅ Skeleton loaders
9. ✅ Feedback durante submit

---

## Evidencia por Criterio

### Criterio 1: ¿El usuario siempre sabe dónde está?
**Archivos Revisados:**
- `components/ui/Header.tsx` - No muestra título consistentemente
- `app/(authenticated)/works/[id]/page.tsx` - No usa Header con título
- `components/layout/Sidebar.tsx` - Indicador activo puede no ser visible

**Resultado:** ❌ **FAIL**

---

### Criterio 2: ¿Puede volver atrás sin pensar?
**Archivos Revisados:**
- `components/ui/BotonVolver.tsx` - Usa `router.back()` sin contexto
- `app/(authenticated)/works/[id]/page.tsx` - Usa `BotonVolver`
- `app/unauthorized/page.tsx` - Usa `router.back()` (aceptable en este caso)

**Resultado:** ❌ **FAIL**

---

### Criterio 3: ¿Mobile es usable con una mano?
**Archivos Revisados:**
- `components/layout/SidebarToggle.tsx` - ~48px (aceptable)
- `components/layout/Sidebar.tsx` - Items ~44px (pequeño)
- `components/ui/Button.tsx` - `sm`: 36px (muy pequeño), `md`: 44px (aceptable)
- Formularios - No hay botones sticky

**Resultado:** ❌ **FAIL**

---

### Criterio 4: ¿Las acciones críticas están claras?
**Archivos Revisados:**
- `components/ui/Button.tsx` - No hay variante `danger`
- `components/works/WorksList.tsx` - Delete usa `outline` + rojo
- `components/alerts/AlertsList.tsx` - Delete usa `primary` + rojo
- `components/audit/AuditList.tsx` - Delete usa `outline` + color inline
- `components/ui/ConfirmationModal.tsx` - Existe pero no se usa consistentemente

**Resultado:** ❌ **FAIL**

---

### Criterio 5: ¿El sistema confirma siempre lo que pasa?
**Archivos Revisados:**
- `components/ui/Toast.tsx` - ✅ Implementado
- `components/ui/LoadingState.tsx` - ✅ Implementado
- `app/(authenticated)/works/page.tsx` - ✅ Usa toasts
- `components/forms/WorkForm.tsx` - ❌ No muestra loading en botón
- Mensajes - ⚠️ Genéricos

**Resultado:** ⚠️ **PASS PARCIAL**

---

## Conclusión

El sistema PMD tiene **fundamentos sólidos** (toast system, loading states, confirmaciones) pero **falla en aspectos críticos de usabilidad**:

1. ❌ **Navegación:** Usuario no siempre sabe dónde está
2. ❌ **Volver:** Comportamiento impredecible
3. ❌ **Mobile:** No optimizado para una mano
4. ❌ **Acciones:** No claramente diferenciadas
5. ⚠️ **Feedback:** Funciona pero puede mejorar

**Puntuación:** **1/5 PASS** (20%)

**Recomendación:** Implementar mejoras de Fase 1 y Fase 2 del Sprint UX PMD para alcanzar al menos 4/5 PASS.

---

**Fecha de Auditoría:** Post-Análisis de Usabilidad  
**Estado:** ✅ Auditoría Completa - Lista para Acción

