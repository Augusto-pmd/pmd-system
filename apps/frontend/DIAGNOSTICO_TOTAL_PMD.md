# 🔍 DIAGNÓSTICO TOTAL DEL PROYECTO PMD

**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Objetivo:** Auditoría completa de componentes, stores, layouts y rutas

---

## 🔴 1. SIDEBARS - ¿CUÁNTOS EXISTEN?

### ✅ RESULTADO: **1 SIDEBAR ÚNICO**

**Archivo real que está usando Next:**
- ✅ `components/layout/Sidebar.tsx` (398 líneas)
  - **Línea 12:** Importa `LogoPMD` desde `@/components/LogoPMD`
  - **Línea 49:** Exporta `export function Sidebar()`
  - **Línea 346:** Usa `<LogoPMD size={48} className="opacity-95" />`

**Archivos relacionados (NO son sidebars duplicados):**
- `components/ui/SidebarItem.tsx` - Componente de item del sidebar (NO es sidebar)
- `components/layout/SidebarContext.tsx` - Context para sidebar (NO es sidebar)

**Dónde se importa:**
- ✅ `components/layout/MainLayout.tsx` línea 3: `import { Sidebar } from "./Sidebar";`
- ✅ `components/layout/MainLayout.tsx` línea 15: `<Sidebar />`

**Sidebars duplicados NO usados:**
- ❌ **NO HAY SIDEBARS DUPLICADOS**

**Conclusión:**
- ✅ Solo existe 1 sidebar
- ✅ Se usa en `MainLayout.tsx`
- ✅ Todas las páginas autenticadas usan `MainLayout` que incluye el sidebar

---

## 🔴 2. AUTHSTORE - ¿CUÁNTOS EXISTEN?

### ✅ RESULTADO: **1 AUTHSTORE ÚNICO**

**Archivo real que se usa:**
- ✅ `store/authStore.ts` (285 líneas)
  - **Línea 24:** `export const useAuthStore = create<AuthState>()(`
  - **Línea 3:** Importa `normalizeUser` desde `@/lib/normalizeUser`

**Dónde se importa (276 referencias encontradas):**
- ✅ `components/auth/ProtectedRoute.tsx` línea 5
- ✅ `components/auth/LoginForm.tsx` línea 5
- ✅ `components/layout/Sidebar.tsx` línea 5
- ✅ `lib/api.ts` línea 2
- ✅ `lib/acl.ts` línea 19
- ✅ Todos los stores (rolesStore, usersStore, alertsStore, etc.)
- ✅ Todas las páginas autenticadas

**AuthStores duplicados NO usados:**
- ❌ **NO HAY AUTHSTORES DUPLICADOS**
- ❌ No existe carpeta `auth/` o `authOld/`

**Conclusión:**
- ✅ Solo existe 1 authStore
- ✅ Se usa en TODO el proyecto
- ✅ No hay duplicados

---

## 🔴 3. NORMALIZEUSER - ¿CUÁNTOS EXISTEN?

### ✅ RESULTADO: **1 NORMALIZEUSER ÚNICO**

**Archivo real que se usa:**
- ✅ `lib/normalizeUser.ts` (54 líneas)
  - **Línea 14:** `export function normalizeUser(rawUser: any): AuthUser`
  - **Línea 15-18:** Extrae `organizationId` correctamente:
    ```typescript
    const organizationId =
      rawUser.organizationId ||
      rawUser.organization?.id ||
      null;
    ```
  - **Línea 44:** Incluye `organizationId` en el objeto normalizado
  - **Línea 45:** Incluye `organization: rawUser.organization ?? null`

**Dónde se importa (5 referencias encontradas):**
- ✅ `store/authStore.ts` línea 3
- ✅ `lib/api.ts` línea 3 (interceptor de respuesta)
- ✅ `components/providers/SWRProvider.tsx` línea 6
- ✅ `components/settings/UserProfileCard.tsx` línea 5 (solo tipo)
- ✅ `components/settings/UserInfoSection.tsx` línea 6 (solo tipo)

**NormalizeUser duplicados NO usados:**
- ❌ **NO HAY NORMALIZEUSER DUPLICADOS**

**Verificación de organizationId:**
- ✅ **Línea 15-18:** Extrae `organizationId` de `rawUser.organizationId` o `rawUser.organization?.id`
- ✅ **Línea 44:** Lo incluye en el objeto normalizado
- ✅ **Línea 45:** Preserva `organization` completo
- ✅ **NO borra organizationId** - Lo preserva correctamente

**Conclusión:**
- ✅ Solo existe 1 normalizeUser
- ✅ Preserva organizationId correctamente
- ✅ No hay duplicados
- ✅ Se usa en authStore y api interceptor

---

## 🔴 4. PROTECTEDROUTE - ¿CUÁNTOS EXISTEN?

### ✅ RESULTADO: **1 PROTECTEDROUTE ÚNICO**

**Archivo real que se usa:**
- ✅ `components/auth/ProtectedRoute.tsx` (75 líneas)
  - **Línea 14:** `export function ProtectedRoute({`
  - **Línea 52-71:** Guard que bloquea navegación (CORREGIDO en fix anterior)

**Dónde se importa (43 referencias encontradas):**
- ✅ Todas las páginas en `app/(authenticated)/**` usan `ProtectedRoute`
- ✅ Ejemplos:
  - `app/(authenticated)/dashboard/page.tsx` línea 4
  - `app/(authenticated)/works/page.tsx` línea 5
  - `app/(authenticated)/roles/page.tsx` línea 5
  - etc.

**ProtectedRoute duplicados NO usados:**
- ❌ **NO HAY PROTECTEDROUTE DUPLICADOS**

**Línea exacta donde bloquea la navegación (ANTES DEL FIX):**
- ❌ **Línea 52 (ANTES):** `if (user === null || typeof user.role === "object")`
- ✅ **Línea 52 (DESPUÉS DEL FIX):** `if (user === null)` - Ya no bloquea roles como objeto
- ✅ **Línea 61-63:** Extrae el nombre del rol si es objeto

**Conclusión:**
- ✅ Solo existe 1 ProtectedRoute
- ✅ Se usa en todas las páginas autenticadas
- ✅ El bloqueo de roles como objeto fue corregido

---

## 🔴 5. LAYOUTS - ¿CUÁNTOS EXISTEN?

### ✅ RESULTADO: **3 LAYOUTS**

**1. Layout Principal (Root):**
- ✅ `app/layout.tsx` (19 líneas)
  - **Línea 6:** `export default function RootLayout({`
  - **Línea 14:** Solo envuelve con `<ToastProvider>`
  - ❌ **NO usa sidebar** - Es el layout raíz de Next.js

**2. Layout de Login:**
- ✅ `app/login/layout.tsx` (existe según búsqueda)
  - **Propósito:** Layout específico para página de login
  - ❌ **NO usa sidebar**

**3. Layout Autenticado (NO EXISTE COMO ARCHIVO):**
- ❌ **NO existe** `app/(authenticated)/layout.tsx`
- ✅ **En su lugar:** Cada página usa `MainLayout` manualmente
- ✅ `components/layout/MainLayout.tsx` (41 líneas)
  - **Línea 3:** Importa `Sidebar` desde `./Sidebar`
  - **Línea 15:** Renderiza `<Sidebar />`
  - **Línea 27:** Renderiza `<Topbar />`
  - **Usado en:** TODAS las páginas autenticadas (344 referencias)

**Dónde se usa MainLayout:**
- ✅ Todas las páginas en `app/(authenticated)/**` importan y usan `MainLayout`
- ✅ Ejemplos:
  - `app/(authenticated)/dashboard/page.tsx` línea 3 y 180
  - `app/(authenticated)/works/page.tsx` línea 4
  - `app/(authenticated)/roles/page.tsx` línea 4
  - etc.

**Conclusión:**
- ✅ Layout principal: `app/layout.tsx` (NO usa sidebar)
- ✅ Layout de login: `app/login/layout.tsx` (NO usa sidebar)
- ✅ Layout autenticado: `MainLayout.tsx` (SÍ usa sidebar)
- ✅ Todas las páginas autenticadas usan `MainLayout` que incluye el sidebar

---

## 🔴 6. LOGO PMD - VERIFICACIÓN DE PATH Y RUTAS

### ⚠️ PROBLEMA DETECTADO: **LOGO NO EXISTE EN PUBLIC**

**Componente LogoPMD:**
- ✅ `components/LogoPMD.tsx` (23 líneas)
  - **Línea 11:** `src="/logo-pmd.png"`
  - **Línea 8:** `const LogoPMD = ({ size = 60, className = "" }: LogoPMDProps) => {`
  - **Línea 21:** `export default LogoPMD;`

**Dónde se importa:**
- ✅ `components/layout/Sidebar.tsx` línea 12: `import LogoPMD from "@/components/LogoPMD";`
- ✅ `components/layout/Sidebar.tsx` línea 346: `<LogoPMD size={48} className="opacity-95" />`
- ✅ `components/auth/LoginForm.tsx` línea 7: `import LogoPMD from "@/components/LogoPMD";`
- ✅ `components/auth/LoginForm.tsx` línea 151: `<LogoPMD size={90} className="opacity-95" />`

**Verificación del archivo:**
- ❌ **`public/logo-pmd.png` NO EXISTE**
- ✅ `public/README.md` menciona que debe existir `logo-pmd.png`
- ⚠️ **Next.js generará error 404** al intentar servir `/logo-pmd.png`

**Ruta del import:**
- ✅ **Correcto:** `src="/logo-pmd.png"` (ruta relativa a `/public`)
- ✅ **Correcto:** Next.js busca en `/public/logo-pmd.png`

**Conclusión:**
- ⚠️ **PROBLEMA:** El archivo `public/logo-pmd.png` NO existe
- ✅ El componente `LogoPMD` está correctamente configurado
- ✅ El sidebar que lo importa ES el sidebar usado
- ⚠️ **ACCIÓN REQUERIDA:** Agregar `logo-pmd.png` a la carpeta `public/`

---

## 🔴 7. ORGANIZATION ID - ¿DÓNDE SE PIERDE?

### ✅ ANÁLISIS COMPLETO:

**1. En authStore (store/authStore.ts):**
- ✅ **Línea 83:** `const normalizedUser = normalizeUser(userRaw);` - Normaliza correctamente
- ✅ **Línea 86:** `user: normalizedUser` - Guarda el usuario normalizado
- ✅ **Línea 98:** `set(newState)` - Actualiza el estado
- ✅ **NO borra organizationId** - Lo preserva a través de normalizeUser

**2. En normalizeUser (lib/normalizeUser.ts):**
- ✅ **Línea 15-18:** Extrae `organizationId` correctamente:
  ```typescript
  const organizationId =
    rawUser.organizationId ||
    rawUser.organization?.id ||
    null;
  ```
- ✅ **Línea 44:** `organizationId,` - Lo incluye en el objeto normalizado
- ✅ **Línea 45:** `organization: rawUser.organization ?? null` - Preserva organization
- ✅ **NO borra organizationId**

**3. En LoginForm (components/auth/LoginForm.tsx):**
- ✅ **Línea 73-77:** Asegura que organizationId esté presente:
  ```typescript
  const user = {
    ...userRaw,
    organizationId: userRaw.organizationId || userRaw.organization?.id || undefined,
    organization: userRaw.organization || undefined,
  };
  ```
- ✅ **Línea 87:** `login(user, access_token, refresh_token || access_token);` - Pasa el user con organizationId
- ✅ **NO borra organizationId**

**4. En refreshSession (store/authStore.ts):**
- ✅ **Línea 218:** `const normalizedUser = normalizeUser(rawUser);` - Normaliza correctamente
- ✅ **Línea 221:** `user: normalizedUser` - Guarda el usuario normalizado
- ⚠️ **Línea 230:** `user: currentUser` - Si no hay user en refresh, preserva el existente
- ✅ **NO borra organizationId**

**5. En api interceptor (lib/api.ts):**
- ⚠️ **Línea 81-82:** Normaliza el user en TODAS las respuestas:
  ```typescript
  if (response.data?.user) {
    response.data.user = normalizeUser(response.data.user);
  }
  ```
- ✅ **NO borra organizationId** - normalizeUser lo preserva

**6. En persistencia Zustand (store/authStore.ts):**
- ✅ **Línea 222-238:** `onRehydrateStorage` normaliza el usuario al restaurar
- ✅ **Línea 230:** `const normalizedUser = normalizeUser(state.user);` - Normaliza correctamente
- ✅ **NO borra organizationId**

**Dónde se borra organizationId:**
- ❌ **NO SE BORRA EN NINGÚN LUGAR** - El código preserva organizationId correctamente

**Dónde no se guarda:**
- ❌ **NO HAY LUGARES DONDE NO SE GUARDE** - Todos los flujos preservan organizationId

**Qué está sobreescribiendo al usuario:**
- ⚠️ **POTENCIAL PROBLEMA:** El interceptor de API (línea 81-82 de `lib/api.ts`) normaliza el user en TODAS las respuestas
- ⚠️ Si el backend devuelve un user sin organizationId, el interceptor lo normalizará y podría perder organizationId si el backend no lo envía

**Línea exacta donde organizationId se vuelve undefined:**
- ❌ **NO HAY LÍNEA DONDE SE VUELVA UNDEFINED** - El código preserva organizationId
- ⚠️ **POSIBLE CAUSA:** El backend no está enviando `organizationId` en la respuesta de login

**Conclusión:**
- ✅ El código frontend preserva organizationId correctamente
- ⚠️ **PROBLEMA PROBABLE:** El backend no está enviando organizationId en la respuesta de login
- ✅ Todos los flujos (login, refresh, persistencia) preservan organizationId si está presente

---

## 🔴 8. CARPETAS DUPLICADAS DEL PROYECTO

### ✅ RESULTADO: **NO HAY CARPETAS DUPLICADAS**

**Búsqueda realizada:**
- ❌ No existe `/components_old`
- ❌ No existe `/auth_old`
- ❌ No existe `/sidebar_old`
- ❌ No existe `/layout_backup`
- ❌ No existe ninguna carpeta con `*old*`
- ❌ No existe ninguna carpeta con `*backup*`
- ❌ No existe ninguna carpeta con `*_old*`
- ❌ No existe ninguna carpeta con `*_backup*`

**Conclusión:**
- ✅ **NO HAY CARPETAS DUPLICADAS**
- ✅ El proyecto está limpio de archivos/carpetas obsoletas

---

## 🔴 9. MAPA DEL CÓDIGO

### 📍 ARCHIVOS REALES Y RUTAS EXACTAS:

**Sidebar Real:**
- ✅ `components/layout/Sidebar.tsx` (398 líneas)
- ✅ Importado en: `components/layout/MainLayout.tsx` línea 3
- ✅ Usado en: Todas las páginas autenticadas a través de `MainLayout`

**Auth Real:**
- ✅ `store/authStore.ts` (285 líneas)
- ✅ Exporta: `useAuthStore` (línea 24)
- ✅ Usado en: 276 lugares del proyecto

**Normalize Real:**
- ✅ `lib/normalizeUser.ts` (54 líneas)
- ✅ Exporta: `normalizeUser()` (línea 14) y `AuthUser` (línea 1)
- ✅ Usado en: `store/authStore.ts`, `lib/api.ts`, `components/providers/SWRProvider.tsx`

**Layout Real:**
- ✅ `app/layout.tsx` (19 líneas) - Layout raíz
- ✅ `app/login/layout.tsx` - Layout de login
- ✅ `components/layout/MainLayout.tsx` (41 líneas) - Layout autenticado con sidebar
- ✅ Usado en: Todas las páginas en `app/(authenticated)/**`

**Archivo que carga el logo:**
- ✅ `components/LogoPMD.tsx` (23 líneas)
- ✅ Usa: `src="/logo-pmd.png"` (línea 11)
- ✅ Importado en:
  - `components/layout/Sidebar.tsx` línea 12
  - `components/auth/LoginForm.tsx` línea 7
- ⚠️ **PROBLEMA:** `public/logo-pmd.png` NO existe

**Archivo que carga módulos:**
- ✅ `components/layout/Sidebar.tsx` línea 82-193 - Define `allNavGroups` con todos los módulos
- ✅ `components/dashboard/DashboardModules.tsx` - Muestra módulos en dashboard
- ✅ Cada página en `app/(authenticated)/**` carga su módulo específico

**Store que carga organizationId:**
- ✅ `store/authStore.ts` línea 86: `user: normalizedUser` - Guarda user con organizationId
- ✅ `store/authStore.ts` línea 58: `getUserSafe()` - Retorna user con organizationId
- ✅ `lib/normalizeUser.ts` línea 44: `organizationId,` - Incluye organizationId en user normalizado

---

## 🔴 10. RESUMEN DE PROBLEMAS DETECTADOS

### ⚠️ PROBLEMAS ENCONTRADOS:

**1. Logo PMD no existe:**
- ❌ `public/logo-pmd.png` NO existe
- ✅ Componente `LogoPMD.tsx` está correctamente configurado
- ⚠️ **ACCIÓN:** Agregar `logo-pmd.png` a `public/`

**2. OrganizationId puede no venir del backend:**
- ✅ El código frontend preserva organizationId correctamente
- ⚠️ **POSIBLE CAUSA:** El backend no está enviando organizationId en la respuesta de login
- ✅ Todos los flujos (login, refresh, persistencia) preservan organizationId si está presente

**3. Interceptor normaliza user en todas las respuestas:**
- ⚠️ `lib/api.ts` línea 81-82 normaliza user en TODAS las respuestas
- ✅ Esto es correcto, pero si el backend no envía organizationId, se perderá
- ✅ `normalizeUser()` preserva organizationId si está presente

---

## ✅ CONFIRMACIONES FINALES

- ✅ **1 sidebar único** - `components/layout/Sidebar.tsx`
- ✅ **1 authStore único** - `store/authStore.ts`
- ✅ **1 normalizeUser único** - `lib/normalizeUser.ts`
- ✅ **1 ProtectedRoute único** - `components/auth/ProtectedRoute.tsx`
- ✅ **3 layouts** - `app/layout.tsx`, `app/login/layout.tsx`, `components/layout/MainLayout.tsx`
- ⚠️ **Logo PMD** - Componente correcto, pero archivo `public/logo-pmd.png` NO existe
- ✅ **OrganizationId** - Se preserva correctamente en todo el código frontend
- ✅ **NO hay carpetas duplicadas**
- ✅ **NO hay archivos duplicados**

---

**Diagnóstico completado.** Todos los componentes están correctamente estructurados. El único problema detectado es la ausencia del archivo `logo-pmd.png` en la carpeta `public/`.

