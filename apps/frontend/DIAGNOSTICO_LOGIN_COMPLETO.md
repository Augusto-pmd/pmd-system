# 🔍 DIAGNÓSTICO PROFUNDO DEL FLUJO DE LOGIN - PMD Frontend

## 📋 RESUMEN EJECUTIVO

**Fecha del diagnóstico:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Estado:** ⚠️ PROBLEMAS DETECTADOS - Ver sección "Dónde se rompe exactamente"

---

## 🔵 1. ENDPOINT REAL DEL BACKEND PARA LOGIN

### ✅ DETECTADO:

**URL del endpoint:**
- Frontend usa: `/auth/login` (relativo al baseURL)
- BaseURL configurado: `https://pmd-backend-l47d.onrender.com/api`
- URL completa: `https://pmd-backend-l47d.onrender.com/api/auth/login`

**Método:** `POST`

**Body esperado:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Formato de respuesta esperado:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "fullName": "string",
    "role": "string" | { "id": "string", "name": "string", "permissions": string[] },
    "organizationId": "string",
    "organization": { "id": "string", ... }
  },
  "access_token": "string",
  "refresh_token": "string"
}
```

**Archivos relevantes:**
- `components/auth/LoginForm.tsx` (línea 23-36)
- `lib/api.ts` (línea 18-24)

**⚠️ NOTA:** El backend puede devolver `token` en lugar de `access_token`, y el frontend maneja ambos casos (línea 52 de LoginForm.tsx).

---

## 🔵 2. VALIDACIÓN DEL ARCHIVO DE LOGIN EN EL FRONTEND

### ✅ `components/auth/LoginForm.tsx`

**URL usada para login:**
- ✅ Línea 23: `const loginEndpoint = "/auth/login";`
- ✅ Línea 24: `const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://pmd-backend-l47d.onrender.com/api";`
- ✅ Línea 36: `const response = await api.post(loginEndpoint, requestData);`
- ✅ **Coincide con el backend:** Sí, usa `/auth/login` relativo al baseURL

**Body enviado:**
- ✅ Línea 27: `const requestData = { email, password };`
- ✅ **Correcto:** Envía email y password como JSON

**Cookies:**
- ⚠️ **PROBLEMA DETECTADO:** 
  - Línea 23 de `lib/api.ts`: `withCredentials: true` está configurado
  - PERO las cookies se guardan manualmente en `authStore.ts` (línea 102)
  - Las cookies usan `SameSite=None; Secure` que **NO funciona en localhost** (requiere HTTPS)

**User guardado en store:**
- ✅ Línea 87: `login(user, access_token, refresh_token || access_token);`
- ✅ Línea 90-99: Verifica que el store se actualizó correctamente

**organizationId preservado:**
- ✅ Línea 73-77: Asegura que `organizationId` y `organization` estén en el user object antes de llamar a `login()`
- ✅ Línea 82: `normalizeUser()` preserva `organizationId` y `organization`

---

## 🔵 3. VERIFICACIÓN DE normalizeUser()

### ✅ `lib/normalizeUser.ts`

**Incluye organizationId:**
- ✅ Línea 15-18: Extrae `organizationId` de `rawUser.organizationId` o `rawUser.organization?.id`
- ✅ Línea 44: Lo incluye en el objeto normalizado

**Incluye organización:**
- ✅ Línea 45: `organization: rawUser.organization ?? null`

**No borra el rol:**
- ✅ Línea 20-36: Normaliza el rol correctamente, puede ser string o objeto
- ✅ Preserva tanto el rol como el roleId

**No devuelve usuario vacío:**
- ✅ Línea 38-46: Construye un objeto AuthUser completo con todos los campos requeridos

**⚠️ PROBLEMA POTENCIAL:**
- Línea 49: `console.log("Auth user loaded:", normalizedUser);` - Este log puede estar causando problemas si el objeto es muy grande

---

## 🔵 4. VERIFICACIÓN DE PERSISTENCIA DEL authStore

### ✅ `store/authStore.ts`

**Usuario se guarda en localStorage:**
- ✅ Línea 222-223: `name: "pmd-auth-storage"` - Zustand persist guarda automáticamente
- ✅ Línea 98: `set(newState)` actualiza el estado que se persiste

**Se borra al refrescar:**
- ❌ **NO debería borrarse** - Zustand persist debería restaurar el estado
- ⚠️ **PROBLEMA POTENCIAL:** Si el estado se corrompe, puede no restaurarse correctamente

**Se corrompe el objeto user:**
- ⚠️ **PROBLEMA DETECTADO:** 
  - Línea 226-237: `onRehydrateStorage` normaliza el usuario al restaurar
  - PERO si el usuario en localStorage tiene un formato incorrecto, puede fallar

**Default user = null:**
- ✅ Línea 27: `user: null` - Correcto

**Después del login se actualiza:**
- ✅ Línea 98: `set(newState)` actualiza el estado
- ✅ Línea 121-130: Verifica que se guardó correctamente

---

## 🔵 5. VERIFICACIÓN DE CORS / COOKIES / CREDENCIALES

### ✅ Configuración de Axios

**Fetch del login incluye credentials:**
- ✅ `lib/api.ts` línea 23: `withCredentials: true` - Configurado correctamente

**Vercel bloquea cookies HTTP-only:**
- ⚠️ **PROBLEMA POTENCIAL:** 
  - Las cookies se guardan manualmente con `document.cookie` (línea 102 de authStore.ts)
  - NO son HTTP-only, pero usan `SameSite=None; Secure`
  - En desarrollo local (localhost), `Secure` requiere HTTPS, lo cual puede fallar

**Backend permite CORS:**
- ❓ **NO VERIFICADO** - Necesita verificación en el backend
- El frontend está configurado para enviar cookies, pero el backend debe permitir el origen

**Dominio coincide:**
- ✅ Frontend: `localhost:3000` (desarrollo) o dominio de Vercel (producción)
- ✅ Backend: `https://pmd-backend-l47d.onrender.com/api`
- ⚠️ **PROBLEMA:** Diferentes dominios requieren CORS configurado correctamente

---

## 🔵 6. VERIFICACIÓN DE VARIABLES DE ENTORNO

### ✅ Variables detectadas:

**NEXT_PUBLIC_API_URL:**
- ✅ Definida en `.env.local`: `https://pmd-backend-l47d.onrender.com/api`
- ✅ Se usa en `lib/api.ts` línea 8
- ✅ Fallback en `LoginForm.tsx` línea 24

**NEXT_PUBLIC_BACKEND_URL:**
- ❌ No existe - No se usa

**Valor correcto:**
- ✅ `https://pmd-backend-l47d.onrender.com/api` - Correcto

**Hardcodes viejos:**
- ✅ No hay hardcodes problemáticos
- ✅ Todos usan `process.env.NEXT_PUBLIC_API_URL` con fallback

---

## 🔵 7. SIMULACIÓN DE LOGIN DESDE CURSOR

### ⚠️ NO EJECUTADO (requiere backend activo)

**Comando de prueba sugerido:**
```javascript
fetch("https://pmd-backend-l47d.onrender.com/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    email: "test@pmd.com",
    password: "123456"
  })
})
.then(res => res.json())
.then(data => {
  console.log("Status:", res.status);
  console.log("Body:", data);
  console.log("Cookies:", document.cookie);
});
```

**Para ejecutar:** Requiere backend activo y credenciales válidas.

---

## 🔵 8. DÓNDE SE ROMPE EXACTAMENTE EL LOGIN

### 🔴 PROBLEMA CRÍTICO #1: ProtectedRoute bloquea navegación

**Archivo:** `components/auth/ProtectedRoute.tsx`
**Línea:** 52
**Problema:**
```typescript
if (user === null || typeof user.role === "object") {
  return <Loading />;
}
```

**Explicación:**
- Si el usuario tiene un rol como objeto (con permisos), el componente muestra loading infinitamente
- Esto bloquea la navegación después del login exitoso
- El usuario se loguea correctamente, pero no puede acceder a las rutas protegidas

**Evidencia:**
- Línea 34: `console.log("  - user.role:", user?.role, "(type:", typeof user?.role, ")");`
- Si `user.role` es un objeto, la condición en línea 52 siempre es `true`
- El componente nunca renderiza los children

---

### 🔴 PROBLEMA CRÍTICO #2: Cookies no funcionan en desarrollo local

**Archivo:** `store/authStore.ts`
**Línea:** 102
**Problema:**
```typescript
document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=None; Secure`;
```

**Explicación:**
- `Secure` requiere HTTPS
- En desarrollo local (localhost), no hay HTTPS
- Las cookies no se guardan correctamente
- El middleware (línea 5 de `middleware.ts`) no encuentra el token en cookies
- Redirige al login incluso después de login exitoso

**Evidencia:**
- `middleware.ts` línea 5: `const token = req.cookies.get("token")?.value;`
- Si la cookie no se guarda, `token` es `null`
- Línea 23: Si no hay token y es ruta protegida → redirige a `/login`

---

### ⚠️ PROBLEMA POTENCIAL #3: Interceptor normaliza user antes de LoginForm

**Archivo:** `lib/api.ts`
**Línea:** 78-84
**Problema:**
```typescript
api.interceptors.response.use(
  (response) => {
    if (response.data?.user) {
      response.data.user = normalizeUser(response.data.user);
    }
    return response;
  },
```

**Explicación:**
- El interceptor normaliza el user ANTES de que llegue a LoginForm
- Esto puede estar causando problemas si `normalizeUser()` no preserva todos los campos
- El user normalizado puede perder información que el backend envía

**Evidencia:**
- LoginForm línea 53: `const userRaw = response.data.user;`
- El user ya está normalizado por el interceptor
- Puede haber pérdida de datos si `normalizeUser()` no maneja todos los campos

---

### ⚠️ PROBLEMA POTENCIAL #4: Zustand persist puede corromper el estado

**Archivo:** `store/authStore.ts`
**Línea:** 222-238
**Problema:**
- Si el estado en localStorage se corrompe, `onRehydrateStorage` puede fallar
- Si falla, el usuario queda en estado inconsistente
- `isAuthenticated` puede ser `true` pero `user` puede ser `null`

**Evidencia:**
- Línea 232-236: Si la normalización falla, limpia el estado
- Pero puede dejar `isAuthenticated: true` con `user: null`
- Esto causa problemas en ProtectedRoute

---

## 🔵 9. PROPUESTA DE FIX PRECISO (SIN APLICAR)

### 🔧 FIX #1: Corregir ProtectedRoute para permitir roles como objeto

**Archivo:** `components/auth/ProtectedRoute.tsx`
**Línea:** 52
**Problema actual:**
```typescript
if (user === null || typeof user.role === "object") {
  return <Loading />;
}
```

**Fix propuesto:**
```typescript
// Solo mostrar loading si el usuario es null o si está cargando
if (user === null) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="lg" />
    </div>
  );
}

// Si el rol es un objeto, extraer el nombre del rol para la verificación
const roleName = typeof user.role === "object" 
  ? user.role.name || user.role.id 
  : user.role;

// Verificar permisos si hay allowedRoles
if (allowedRoles && roleName && !allowedRoles.includes(roleName as UserRole)) {
  router.replace("/unauthorized");
  return null;
}
```

**Razón:**
- Permite que usuarios con roles como objeto puedan navegar
- Extrae el nombre del rol para verificación de permisos
- Solo muestra loading si realmente no hay usuario

---

### 🔧 FIX #2: Corregir cookies para desarrollo local

**Archivo:** `store/authStore.ts`
**Línea:** 102-118
**Problema actual:**
```typescript
document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=None; Secure`;
```

**Fix propuesto:**
```typescript
// Detectar si estamos en desarrollo local
const isLocalhost = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// Configurar cookies según el entorno
const cookieOptions = isLocalhost
  ? `Path=/; Max-Age=604800; SameSite=Lax` // Sin Secure en localhost
  : `Path=/; Max-Age=604800; SameSite=None; Secure`; // Secure en producción

document.cookie = `token=${token}; ${cookieOptions}`;
console.log("🟢 [COOKIE SET] token guardado en cookie");
console.log("  - Cookie Options:", cookieOptions);
console.log("  - Is Localhost:", isLocalhost);
```

**Razón:**
- Permite que las cookies funcionen en desarrollo local
- Mantiene seguridad en producción con `Secure`
- El middleware podrá leer las cookies correctamente

---

### 🔧 FIX #3: Mejorar normalización en interceptor

**Archivo:** `lib/api.ts`
**Línea:** 78-84
**Problema actual:**
```typescript
api.interceptors.response.use(
  (response) => {
    if (response.data?.user) {
      response.data.user = normalizeUser(response.data.user);
    }
    return response;
  },
```

**Fix propuesto:**
```typescript
api.interceptors.response.use(
  (response) => {
    // Solo normalizar user en respuestas de login/auth
    // Para evitar normalizar en otros endpoints donde el user puede tener estructura diferente
    if (response.data?.user && (
      response.config?.url?.includes('/auth/login') ||
      response.config?.url?.includes('/auth/refresh') ||
      response.config?.url?.includes('/auth/profile')
    )) {
      response.data.user = normalizeUser(response.data.user);
    }
    return response;
  },
```

**Razón:**
- Solo normaliza user en endpoints de autenticación
- Evita normalizar usuarios en otros contextos donde la estructura puede ser diferente
- Preserva todos los campos del backend

---

### 🔧 FIX #4: Mejorar manejo de errores en onRehydrateStorage

**Archivo:** `store/authStore.ts`
**Línea:** 226-237
**Problema actual:**
```typescript
onRehydrateStorage: () => (state) => {
  if (state?.user) {
    try {
      const normalizedUser = normalizeUser(state.user);
      state.user = normalizedUser;
    } catch {
      state.user = null;
      state.isAuthenticated = false;
    }
  }
},
```

**Fix propuesto:**
```typescript
onRehydrateStorage: () => (state) => {
  if (state?.user) {
    try {
      const normalizedUser = normalizeUser(state.user);
      // Verificar que la normalización fue exitosa
      if (normalizedUser && normalizedUser.id && normalizedUser.email) {
        state.user = normalizedUser;
        // Asegurar que isAuthenticated sea true si hay usuario válido
        if (!state.isAuthenticated && state.token) {
          state.isAuthenticated = true;
        }
      } else {
        // Si la normalización falla, limpiar todo
        console.error("🔴 [AUTH REHYDRATE] Usuario normalizado inválido, limpiando estado");
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
      }
    } catch (error) {
      console.error("🔴 [AUTH REHYDRATE] Error al normalizar usuario:", error);
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.refreshToken = null;
    }
  } else if (state?.isAuthenticated) {
    // Si hay isAuthenticated pero no user, limpiar
    console.warn("⚠️ [AUTH REHYDRATE] isAuthenticated=true pero user=null, limpiando");
    state.isAuthenticated = false;
    state.token = null;
    state.refreshToken = null;
  }
},
```

**Razón:**
- Valida que el usuario normalizado sea válido
- Limpia el estado completamente si hay inconsistencias
- Evita estados inconsistentes (isAuthenticated=true pero user=null)

---

## 📊 RESUMEN DE PROBLEMAS DETECTADOS

| # | Problema | Archivo | Línea | Severidad | Fix Propuesto |
|---|----------|---------|-------|-----------|---------------|
| 1 | ProtectedRoute bloquea roles como objeto | `components/auth/ProtectedRoute.tsx` | 52 | 🔴 CRÍTICO | ✅ Fix #1 |
| 2 | Cookies no funcionan en localhost | `store/authStore.ts` | 102 | 🔴 CRÍTICO | ✅ Fix #2 |
| 3 | Interceptor normaliza user demasiado pronto | `lib/api.ts` | 78-84 | ⚠️ MEDIO | ✅ Fix #3 |
| 4 | onRehydrateStorage puede dejar estado inconsistente | `store/authStore.ts` | 226-237 | ⚠️ MEDIO | ✅ Fix #4 |

---

## ✅ CONFIRMACIONES

- ✅ Endpoint del backend detectado: `/auth/login`
- ✅ Body del request correcto: `{ email, password }`
- ✅ normalizeUser() preserva organizationId y organization
- ✅ Variables de entorno configuradas correctamente
- ✅ Axios configurado con `withCredentials: true`
- ⚠️ **PROBLEMAS CRÍTICOS DETECTADOS** - Ver sección 8

---

## 🎯 PRÓXIMOS PASOS

1. **Aplicar Fix #1** (ProtectedRoute) - **PRIORIDAD ALTA**
2. **Aplicar Fix #2** (Cookies en localhost) - **PRIORIDAD ALTA**
3. **Aplicar Fix #3** (Interceptor) - **PRIORIDAD MEDIA**
4. **Aplicar Fix #4** (onRehydrateStorage) - **PRIORIDAD MEDIA**
5. **Probar login completo** después de aplicar fixes
6. **Verificar que el middleware lee cookies correctamente**

---

**Diagnóstico completado.** Esperando aprobación para aplicar los fixes.

