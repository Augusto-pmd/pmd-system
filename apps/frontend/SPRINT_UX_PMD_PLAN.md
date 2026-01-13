# Sprint UX PMD - Plan de Implementación

## Resumen Ejecutivo

### Objetivo
Mejorar significativamente la usabilidad general del sistema PMD (desktop y mobile) sin romper arquitectura ni lógica existente.

### Contexto
- ✅ Sistema PMD integrado y estable
- ✅ Usuarios no técnicos
- ✅ Uso diario intensivo
- ✅ Problemas principales identificados: navegación, mobile, formularios, feedback

### Alcance del Sprint
- **Duración estimada:** 4-6 semanas
- **Enfoque:** Mejoras incrementales sin romper funcionalidad existente
- **Prioridad:** Mobile-first, luego desktop

### Principios Rectores
1. **No romper:** Mantener toda funcionalidad existente
2. **Incremental:** Cambios progresivos, no big bang
3. **Reutilizable:** Componentes que se puedan usar en todos los módulos
4. **Medible:** Cada mejora debe tener impacto cuantificable

---

## Fases del Sprint UX

### 🔴 FASE 1: NAVEGACIÓN Y CONTEXTO
**Duración:** 1 semana  
**Prioridad:** CRÍTICA  
**Impacto:** ⭐⭐⭐⭐⭐  
**Esfuerzo:** MEDIO

#### Objetivos
- Usuario siempre sabe dónde está
- Navegación contextual clara
- Eliminar desorientación

#### Componentes a Crear

1. **`components/ui/Breadcrumbs.tsx`**
   - Props: `items: Array<{ label: string, href: string | null }>`
   - Funcionalidad: Navegación jerárquica clickeable
   - Estilo: Consistente con Header
   - Mobile: Colapsable si hay muchos niveles

2. **`hooks/useBreadcrumbs.ts`**
   - Input: `pathname` (usePathname)
   - Output: Array de breadcrumbs generado automáticamente
   - Lógica: Mapear rutas a labels legibles
   - Fallback: Si no hay mapeo, usar pathname

#### Componentes a Modificar

1. **`components/ui/Header.tsx`**
   - Agregar prop `title?: string`
   - Agregar prop `breadcrumbs?: BreadcrumbItem[]`
   - Agregar prop `showBack?: boolean`
   - Mostrar breadcrumbs antes del título
   - Botón "Volver" contextual (no `router.back()`)

2. **Páginas de detalle** (migración progresiva)
   - `/works/[id]/page.tsx`
   - `/cash-movements/[id]/page.tsx`
   - `/alerts/[id]/page.tsx`
   - `/documents/[id]/page.tsx`
   - `/users/[id]/page.tsx`
   - `/roles/[id]/page.tsx`
   - `/accounting/[id]/page.tsx`
   
   **Cambio:** Reemplazar `BotonVolver` por `Header` con breadcrumbs

3. **`components/ui/BotonVolver.tsx`**
   - ⚠️ **DEPRECAR** (mantener por compatibilidad)
   - Agregar `@deprecated` JSDoc
   - Redirigir uso a `Header` con breadcrumbs

#### Implementación Sin Tocar Pantallas Existentes

✅ **Se puede hacer:**
- Crear `Breadcrumbs` component (no afecta nada)
- Crear `useBreadcrumbs` hook (no afecta nada)
- Mejorar `Header` (solo agrega props opcionales)
- Agregar breadcrumbs a páginas nuevas

⚠️ **Requiere migración progresiva:**
- Reemplazar `BotonVolver` en páginas existentes
- Agregar breadcrumbs a páginas de detalle
- Mapear rutas a labels legibles

#### Impacto Esperado
- ⬇️ **-80% desorientación** ("¿dónde estoy?")
- ⬇️ **-50% uso de botón "Volver"** (navegación más clara)
- ⬆️ **+40% confianza** en navegación profunda

#### Riesgos
- ⚠️ **Bajo:** Cambios son aditivos (no rompen nada)
- ⚠️ **Mitigación:** Mantener `BotonVolver` deprecado por compatibilidad
- ⚠️ **Testing:** Probar navegación profunda (3+ niveles)

---

### 🔴 FASE 2: MOBILE UX
**Duración:** 1.5 semanas  
**Prioridad:** CRÍTICA  
**Impacto:** ⭐⭐⭐⭐  
**Esfuerzo:** MEDIO-ALTO

#### Objetivos
- Tap targets accesibles (48px mínimo)
- Sidebar optimizado para mobile
- Gestos naturales (swipe)
- Acciones primarias siempre accesibles

#### Componentes a Crear

1. **`hooks/useSwipe.ts`**
   - Input: `elementRef`, `onSwipeLeft`, `onSwipeRight`
   - Output: Handlers de touch events
   - Funcionalidad: Detectar swipe gestures
   - Threshold: 50px mínimo para activar

2. **`components/ui/ActionBar.tsx`** (Mobile)
   - Props: `primaryAction`, `secondaryActions[]`
   - Funcionalidad: Barra sticky en bottom para mobile
   - Estilo: Fondo blanco, sombra, altura 64px
   - Desktop: No se muestra

#### Componentes a Modificar

1. **`components/layout/Sidebar.tsx`**
   - Aumentar tap targets: `py-4` (16px) mínimo
   - Espaciado entre items: `gap-2` (8px)
   - Ancho mobile: `w-56` (224px) o `max-w-[85vw]`
   - Agregar hook `useSwipe` para cerrar con swipe left
   - Mejorar indicador de página actual (más visible)

2. **`components/layout/SidebarToggle.tsx`**
   - Aumentar tamaño: `48px × 48px` mínimo
   - Mejorar posición: `top-4 left-4` (mantener)
   - Aumentar padding: `p-4` (16px)

3. **`components/ui/Button.tsx`**
   - Asegurar altura mínima: `min-height: 48px` en mobile
   - Agregar media query para mobile
   - Mantener desktop como está

4. **Formularios** (migración progresiva)
   - Agregar `ActionBar` sticky en mobile
   - Botones "Guardar" / "Cancelar" siempre visibles
   - Desktop: Mantener footer del modal

#### Implementación Sin Tocar Pantallas Existentes

✅ **Se puede hacer:**
- Crear `useSwipe` hook (no afecta nada)
- Crear `ActionBar` component (no afecta nada)
- Mejorar `Sidebar` spacing (solo CSS)
- Aumentar `SidebarToggle` tamaño (solo CSS)

⚠️ **Requiere migración progresiva:**
- Agregar `ActionBar` a formularios existentes
- Probar en dispositivos reales (iOS/Android)

#### Impacto Esperado
- ⬇️ **-75% errores de tap** en mobile
- ⬆️ **+60% velocidad** de navegación mobile
- ⬆️ **+50% satisfacción** mobile

#### Riesgos
- ⚠️ **Medio:** Cambios en Sidebar pueden afectar desktop
- ⚠️ **Mitigación:** Usar media queries, mantener desktop intacto
- ⚠️ **Testing:** Probar en iOS Safari, Android Chrome

---

### 🔴 FASE 3: FORMULARIOS
**Duración:** 2 semanas  
**Prioridad:** CRÍTICA  
**Impacto:** ⭐⭐⭐⭐⭐  
**Esfuerzo:** ALTO

#### Objetivos
- Formularios seccionados y organizados
- Validación progresiva (tiempo real)
- Feedback inmediato
- Botones siempre accesibles

#### Componentes a Crear

1. **`components/ui/FormSection.tsx`**
   - Props: `title`, `collapsible?`, `defaultOpen?`, `children`
   - Funcionalidad: Sección colapsable de formulario
   - Estilo: Borde, padding, icono de colapsar
   - Mobile: Por defecto colapsado si hay 3+ secciones

2. **`components/ui/FormField.tsx`** (mejorar existente)
   - Agregar prop `showValidation?: boolean`
   - Agregar prop `validateOnBlur?: boolean`
   - Mostrar icono de check cuando válido
   - Mostrar error inmediatamente en `onBlur`

3. **`hooks/useFormValidation.ts`**
   - Input: `schema` (reglas de validación), `formData`
   - Output: `errors`, `isValid`, `validateField(fieldName)`
   - Funcionalidad: Validación en tiempo real
   - Integración: Con `FormField` para validación progresiva

4. **`components/ui/FormProgress.tsx`**
   - Props: `completed`, `total`
   - Funcionalidad: Barra de progreso visual
   - Estilo: Barra verde, porcentaje
   - Ubicación: Arriba del formulario

#### Componentes a Modificar

1. **`components/forms/WorkForm.tsx`**
   - Seccionar en: "Información Básica", "Fechas y Estado", "Presupuesto y Responsable", "Descripción"
   - Agregar validación progresiva (onBlur)
   - Agregar `FormProgress`
   - Agregar `ActionBar` sticky en mobile

2. **Otros formularios** (migración progresiva)
   - `components/forms/SupplierForm.tsx`
   - `components/forms/UserForm.tsx`
   - `components/forms/RoleForm.tsx`
   - `app/(authenticated)/cashbox/components/MovementForm.tsx`
   - `app/(authenticated)/alerts/components/AlertForm.tsx`
   - `app/(authenticated)/documents/components/DocumentForm.tsx`

   **Patrón:** Aplicar mismo seccionado y validación progresiva

3. **`components/ui/Input.tsx`** (mejorar existente)
   - Agregar prop `required?: boolean` (muestra asterisco)
   - Agregar prop `error?: string` (muestra error)
   - Agregar prop `valid?: boolean` (muestra check)
   - Agregar `onBlur` handler para validación

#### Implementación Sin Tocar Pantallas Existentes

✅ **Se puede hacer:**
- Crear `FormSection` component (no afecta nada)
- Crear `useFormValidation` hook (no afecta nada)
- Crear `FormProgress` component (no afecta nada)
- Mejorar `FormField` (solo agrega props opcionales)

⚠️ **Requiere migración progresiva:**
- Seccionar formularios existentes uno por uno
- Agregar validación progresiva
- Probar cada formulario después de migrar

#### Impacto Esperado
- ⬇️ **-40% tiempo** de completado de formularios
- ⬆️ **+50% tasa de éxito** (menos errores)
- ⬇️ **-60% abandono** de formularios largos
- ⬆️ **+70% satisfacción** con formularios

#### Riesgos
- ⚠️ **Alto:** Cambios en formularios pueden romper lógica existente
- ⚠️ **Mitigación:** Migrar un formulario a la vez, testear exhaustivamente
- ⚠️ **Testing:** Validar que datos se envían correctamente después de cambios

---

### 🟡 FASE 4: ACCIONES Y CONFIRMACIONES
**Duración:** 1 semana  
**Prioridad:** MEDIA  
**Impacto:** ⭐⭐⭐⭐  
**Esfuerzo:** BAJO-MEDIO

#### Objetivos
- Jerarquía visual clara de acciones
- Confirmaciones consistentes
- Reducir acciones accidentales

#### Componentes a Crear

**Ninguno nuevo** - Usar componentes existentes mejorados

#### Componentes a Modificar

1. **`components/ui/Button.tsx`**
   - Agregar variante `danger`
   - Estilo: Rojo (`#FF3B30`), borde rojo
   - Hover: Rojo más oscuro
   - Uso: Solo para acciones destructivas

2. **`components/ui/ConfirmationModal.tsx`** (mejorar existente)
   - Mejorar variante `danger`
   - Estilo más prominente para acciones destructivas
   - Agregar icono de advertencia
   - Mensaje más claro: "Esta acción no se puede deshacer"

3. **Reemplazar modales custom por `ConfirmationModal`**
   - `components/works/WorksList.tsx` - Delete modal
   - `components/alerts/AlertsList.tsx` - Delete modal
   - `components/documents/DocumentsList.tsx` - Delete modal
   - `components/audit/AuditList.tsx` - Delete modal
   - `app/(authenticated)/alerts/[id]/page.tsx` - Delete modal

   **Patrón:** Usar `ConfirmationModal` con `variant="danger"`

4. **Botones de acción en listas**
   - Cambiar botones delete de `outline` a `danger`
   - Cambiar botones delete de `primary` rojo a `danger`
   - Unificar estilo en todos los módulos

#### Implementación Sin Tocar Pantallas Existentes

✅ **Se puede hacer:**
- Agregar variante `danger` a Button (no afecta nada)
- Mejorar `ConfirmationModal` (solo mejora existente)

⚠️ **Requiere migración progresiva:**
- Reemplazar modales custom por `ConfirmationModal`
- Cambiar botones delete a variante `danger`
- Probar cada módulo después de cambiar

#### Impacto Esperado
- ⬇️ **-90% acciones destructivas accidentales**
- ⬆️ **+100% consistencia** visual de acciones
- ⬆️ **+50% confianza** en acciones críticas

#### Riesgos
- ⚠️ **Bajo:** Cambios son principalmente visuales
- ⚠️ **Mitigación:** Mantener funcionalidad existente, solo cambiar estilo
- ⚠️ **Testing:** Verificar que confirmaciones funcionan correctamente

---

### 🟡 FASE 5: FEEDBACK (LOADING, SUCCESS, ERROR)
**Duración:** 1 semana  
**Prioridad:** MEDIA  
**Impacto:** ⭐⭐⭐  
**Esfuerzo:** MEDIO

#### Objetivos
- Mensajes específicos y accionables
- Feedback durante acciones
- Skeleton loaders
- Mejor percepción de velocidad

#### Componentes a Crear

1. **`components/ui/Skeleton.tsx`**
   - Props: `width?`, `height?`, `rounded?`, `lines?`
   - Funcionalidad: Placeholder animado
   - Estilo: Gris claro, animación shimmer
   - Variantes: `text`, `card`, `table`, `form`

2. **`components/ui/SkeletonCard.tsx`**
   - Funcionalidad: Skeleton para cards de lista
   - Estilo: Mismo tamaño que cards reales
   - Uso: Reemplazar `LoadingState` en listas

3. **`components/ui/SkeletonTable.tsx`**
   - Funcionalidad: Skeleton para tablas
   - Estilo: Filas animadas
   - Uso: Reemplazar `LoadingState` en tablas

#### Componentes a Modificar

1. **`components/ui/Toast.tsx`**
   - Agregar prop `action?: { label: string, onClick: () => void }`
   - Mostrar botón de acción si existe
   - Estilo: Botón destacado en toast
   - Duración: Extender si hay acción

2. **`components/ui/Button.tsx`**
   - Agregar prop `loading?: boolean`
   - Mostrar spinner cuando `loading={true}`
   - Deshabilitar botón durante loading
   - Texto: "Guardando..." o mantener texto original

3. **Reemplazar `LoadingState` por Skeletons**
   - `components/works/WorksList.tsx` - SkeletonCard
   - `components/suppliers/SupplierCard.tsx` - SkeletonCard
   - `components/alerts/AlertsList.tsx` - SkeletonTable
   - `components/documents/DocumentsList.tsx` - SkeletonCard
   - `components/accounting/AccountingTable.tsx` - SkeletonTable

4. **Mejorar mensajes de toast**
   - `app/(authenticated)/works/page.tsx` - Mensajes específicos
   - `app/(authenticated)/suppliers/page.tsx` - Mensajes específicos
   - Otros módulos - Mensajes accionables

#### Implementación Sin Tocar Pantallas Existentes

✅ **Se puede hacer:**
- Crear componentes Skeleton (no afecta nada)
- Mejorar `Toast` (solo agrega prop opcional)
- Agregar `loading` a Button (solo agrega prop opcional)

⚠️ **Requiere migración progresiva:**
- Reemplazar `LoadingState` por Skeletons
- Mejorar mensajes de toast en cada módulo
- Agregar `loading` state a botones de submit

#### Impacto Esperado
- ⬆️ **+30% percepción** de velocidad
- ⬆️ **+40% comprensión** de errores
- ⬇️ **-50% frustración** con mensajes genéricos

#### Riesgos
- ⚠️ **Bajo:** Cambios son principalmente visuales
- ⚠️ **Mitigación:** Mantener `LoadingState` por compatibilidad
- ⚠️ **Testing:** Verificar que skeletons no afectan performance

---

## Backlog Priorizado (Matriz Impacto/Esfuerzo)

### 🔴 ALTA PRIORIDAD (Alto Impacto, Bajo-Medio Esfuerzo)

| Tarea | Impacto | Esfuerzo | Prioridad | Fase |
|-------|---------|----------|-----------|------|
| **Breadcrumbs component** | ⭐⭐⭐⭐⭐ | 🟡 Medio | 1 | Fase 1 |
| **Header con título contextual** | ⭐⭐⭐⭐⭐ | 🟢 Bajo | 2 | Fase 1 |
| **Tap targets 48px mobile** | ⭐⭐⭐⭐ | 🟢 Bajo | 3 | Fase 2 |
| **Sidebar spacing mejorado** | ⭐⭐⭐⭐ | 🟢 Bajo | 4 | Fase 2 |
| **FormSection component** | ⭐⭐⭐⭐⭐ | 🟡 Medio | 5 | Fase 3 |
| **Validación progresiva** | ⭐⭐⭐⭐⭐ | 🟡 Medio | 6 | Fase 3 |

### 🟡 MEDIA PRIORIDAD (Alto Impacto, Alto Esfuerzo o Medio Impacto, Bajo Esfuerzo)

| Tarea | Impacto | Esfuerzo | Prioridad | Fase |
|-------|---------|----------|-----------|------|
| **Variante danger en Button** | ⭐⭐⭐⭐ | 🟢 Bajo | 7 | Fase 4 |
| **ConfirmationModal unificado** | ⭐⭐⭐⭐ | 🟡 Medio | 8 | Fase 4 |
| **Skeleton loaders** | ⭐⭐⭐ | 🟡 Medio | 9 | Fase 5 |
| **Toast con acciones** | ⭐⭐⭐ | 🟢 Bajo | 10 | Fase 5 |
| **Gesto swipe sidebar** | ⭐⭐⭐ | 🟡 Medio | 11 | Fase 2 |
| **ActionBar sticky mobile** | ⭐⭐⭐ | 🟡 Medio | 12 | Fase 2 |

### 🟢 BAJA PRIORIDAD (Bajo Impacto o Alto Esfuerzo)

| Tarea | Impacto | Esfuerzo | Prioridad | Fase |
|-------|---------|----------|-----------|------|
| **PageTemplate component** | ⭐⭐⭐ | 🟡 Medio | 13 | Fase 6 |
| **Unificar estilos cards** | ⭐⭐ | 🟡 Medio | 14 | Fase 6 |
| **Documentar patrones UX** | ⭐⭐ | 🟢 Bajo | 15 | Fase 6 |

---

## Reglas UX PMD (Para No Volver a Romperlo)

### 🎯 Regla 1: Navegación Siempre Contextual

**✅ HACER:**
- Todas las páginas de detalle deben tener breadcrumbs
- Header debe mostrar título de página actual
- Botón "Volver" debe ir a página padre conocida (no `router.back()`)

**❌ NO HACER:**
- Usar `router.back()` sin contexto
- Páginas sin breadcrumbs en navegación profunda
- Headers sin título

**Archivo de referencia:** `components/ui/Header.tsx`

---

### 🎯 Regla 2: Mobile-First Tap Targets

**✅ HACER:**
- Todos los elementos interactivos: mínimo 48px × 48px
- Espaciado entre elementos táctiles: mínimo 8px
- Botones primarios: sticky en bottom en mobile

**❌ NO HACER:**
- Tap targets menores a 44px
- Botones muy juntos (< 8px)
- Acciones críticas ocultas al final del scroll en mobile

**Archivo de referencia:** `components/ui/Button.tsx`

---

### 🎯 Regla 3: Formularios Siempre Seccionados

**✅ HACER:**
- Formularios con 5+ campos: usar `FormSection`
- Validación progresiva (onBlur)
- Indicadores visuales (asterisco, check)
- Botones sticky en mobile

**❌ NO HACER:**
- Formularios largos sin seccionar
- Validación solo al submit
- Campos sin indicador de requerido

**Archivo de referencia:** `components/ui/FormSection.tsx`

---

### 🎯 Regla 4: Jerarquía Visual de Acciones

**✅ HACER:**
- Acción primaria: `variant="primary"`
- Acción secundaria: `variant="outline"`
- Acción destructiva: `variant="danger"`
- Acción terciaria: `variant="ghost"`

**❌ NO HACER:**
- Delete con `primary` o `outline` (usar `danger`)
- Acciones sin jerarquía clara
- Confirmaciones sin `ConfirmationModal`

**Archivo de referencia:** `components/ui/Button.tsx`, `components/ui/ConfirmationModal.tsx`

---

### 🎯 Regla 5: Feedback Siempre Específico y Accionable

**✅ HACER:**
- Mensajes de error: específicos y con acción sugerida
- Loading: mostrar spinner en botón durante submit
- Success: mensaje claro de qué se hizo
- Skeletons: usar en lugar de `LoadingState` en listas

**❌ NO HACER:**
- Mensajes genéricos ("Error al crear")
- Loading sin feedback visual
- Success sin mensaje
- `LoadingState` en listas (usar Skeletons)

**Archivo de referencia:** `components/ui/Toast.tsx`, `components/ui/Skeleton.tsx`

---

### 🎯 Regla 6: Consistencia Entre Módulos

**✅ HACER:**
- Mismo patrón de header/breadcrumbs
- Mismo estilo de botones de acción
- Mismo patrón de modales
- Mismo estilo de cards/tablas

**❌ NO HACER:**
- Headers diferentes entre módulos
- Botones de acción con estilos diferentes
- Modales custom cuando existe componente reutilizable

**Archivo de referencia:** `ANALISIS_USABILIDAD_PMD.md` (sección 3)

---

## Plan de Migración Progresiva

### Estrategia: "Agregar, No Reemplazar"

#### Fase 1: Componentes Base (Semana 1)
- ✅ Crear todos los componentes nuevos
- ✅ No tocar pantallas existentes
- ✅ Componentes listos para usar

#### Fase 2: Migración Módulo por Módulo (Semanas 2-5)
- ✅ Empezar con módulo menos crítico (ej: `/roles`)
- ✅ Aplicar mejoras
- ✅ Testear exhaustivamente
- ✅ Migrar siguiente módulo

#### Fase 3: Unificación (Semana 6)
- ✅ Revisar módulos migrados
- ✅ Asegurar consistencia
- ✅ Documentar patrones

### Orden de Migración Recomendado

1. **Módulo de prueba:** `/roles` (menos crítico, menos usuarios)
2. **Módulos simples:** `/alerts`, `/documents`
3. **Módulos complejos:** `/works`, `/suppliers`
4. **Módulos críticos:** `/cashbox`, `/accounting` (al final, cuando patrón esté probado)

---

## Métricas de Éxito

### KPIs a Medir

| Métrica | Baseline | Objetivo | Cómo Medir |
|---------|----------|----------|------------|
| **Clics promedio por tarea** | 3-4 | 2-3 | Analytics / Logs |
| **Tiempo en formularios** | 5-7 min | 3-4 min | Analytics |
| **Errores de tap mobile** | 15-20% | <5% | Error tracking |
| **Tasa de éxito creación** | 70% | 90% | Backend logs |
| **Preguntas "¿dónde estoy?"** | Alta | Baja | User feedback |
| **Satisfacción mobile** | 6/10 | 8/10 | Encuesta usuarios |

### Criterios de Aceptación

**Fase 1 (Navegación):**
- ✅ Todas las páginas de detalle tienen breadcrumbs
- ✅ Header muestra título en todas las páginas
- ✅ 0 uso de `router.back()` sin contexto

**Fase 2 (Mobile):**
- ✅ 100% tap targets ≥ 48px
- ✅ Sidebar se cierra con swipe
- ✅ Botones primarios sticky en mobile

**Fase 3 (Formularios):**
- ✅ Formularios largos seccionados
- ✅ Validación progresiva funcionando
- ✅ Botones sticky en mobile

**Fase 4 (Acciones):**
- ✅ 100% botones delete usan `variant="danger"`
- ✅ 100% confirmaciones usan `ConfirmationModal`
- ✅ 0 modales custom de delete

**Fase 5 (Feedback):**
- ✅ 100% listas usan Skeletons (no `LoadingState`)
- ✅ 100% mensajes de error son específicos
- ✅ 100% botones de submit muestran loading

---

## Riesgos y Mitigaciones

### Riesgo 1: Romper Funcionalidad Existente
**Probabilidad:** Media  
**Impacto:** Alto  
**Mitigación:**
- Migración módulo por módulo
- Testing exhaustivo después de cada cambio
- Mantener componentes antiguos deprecados por compatibilidad

### Riesgo 2: Cambios Visuales Rechazados por Usuarios
**Probabilidad:** Baja  
**Impacto:** Medio  
**Mitigación:**
- Cambios son incrementales
- Feedback de usuarios durante desarrollo
- Rollback fácil (componentes son independientes)

### Riesgo 3: Performance en Mobile
**Probabilidad:** Baja  
**Impacto:** Medio  
**Mitigación:**
- Skeletons son ligeros (solo CSS)
- Lazy loading de componentes pesados
- Testing en dispositivos reales

### Riesgo 4: Inconsistencias Durante Migración
**Probabilidad:** Media  
**Impacto:** Bajo  
**Mitigación:**
- Documentar patrones claramente
- Code review estricto
- Checklist de consistencia

---

## Checklist de Implementación

### Pre-Sprint
- [ ] Revisar y aprobar plan
- [ ] Asignar recursos
- [ ] Configurar ambiente de testing
- [ ] Documentar baseline de métricas

### Durante Sprint
- [ ] Crear componentes base (Fase 1)
- [ ] Migrar módulo de prueba (`/roles`)
- [ ] Obtener feedback de usuarios
- [ ] Ajustar según feedback
- [ ] Continuar migración módulo por módulo
- [ ] Testing continuo

### Post-Sprint
- [ ] Medir métricas finales
- [ ] Comparar con baseline
- [ ] Documentar lecciones aprendidas
- [ ] Actualizar guía de estilo
- [ ] Capacitar equipo en nuevos componentes

---

## Recursos Necesarios

### Componentes a Crear (7)
1. `components/ui/Breadcrumbs.tsx`
2. `components/ui/FormSection.tsx`
3. `components/ui/Skeleton.tsx`
4. `components/ui/SkeletonCard.tsx`
5. `components/ui/SkeletonTable.tsx`
6. `components/ui/ActionBar.tsx` (mobile)
7. `hooks/useBreadcrumbs.ts`
8. `hooks/useFormValidation.ts`
9. `hooks/useSwipe.ts`

### Componentes a Modificar (8)
1. `components/ui/Header.tsx`
2. `components/ui/Button.tsx`
3. `components/ui/Toast.tsx`
4. `components/ui/ConfirmationModal.tsx`
5. `components/ui/FormField.tsx`
6. `components/ui/Input.tsx`
7. `components/layout/Sidebar.tsx`
8. `components/layout/SidebarToggle.tsx`

### Páginas a Migrar (15+)
- Todas las páginas de detalle (`[id]/page.tsx`)
- Todos los formularios
- Todas las listas

---

## Timeline Estimado

| Fase | Duración | Dependencias |
|------|----------|--------------|
| **Fase 1: Navegación** | 1 semana | Ninguna |
| **Fase 2: Mobile UX** | 1.5 semanas | Fase 1 (opcional) |
| **Fase 3: Formularios** | 2 semanas | Fase 1, Fase 2 |
| **Fase 4: Acciones** | 1 semana | Ninguna (paralelo) |
| **Fase 5: Feedback** | 1 semana | Fase 3 |
| **Testing y Ajustes** | 1 semana | Todas las fases |
| **TOTAL** | **6-7 semanas** | - |

---

## Conclusión

Este Sprint UX PMD está diseñado para mejorar significativamente la usabilidad sin romper funcionalidad existente. Las mejoras son incrementales, reutilizables y medibles.

**Próximo paso:** Revisar y aprobar plan, luego comenzar con Fase 1 (Navegación).

---

**Fecha de Creación:** Post-Análisis de Usabilidad  
**Estado:** ✅ Plan Completo - Listo para Aprobación

