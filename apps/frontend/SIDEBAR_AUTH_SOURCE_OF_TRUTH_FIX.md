# Sidebar Auth Source of Truth Fix - COMPLETE

**Fecha**: 2024-12-19  
**Objetivo**: Hacer que el Sidebar consuma el user AUTENTICADO REAL, con permisos, sin estados stale

---

## ✅ PROBLEMA IDENTIFICADO

1. **Duplicación de lógica**: `AuthContext` tenía funciones `login()`, `refresh()`, `loadMe()` que duplicaban la lógica del store
2. **Normalización inconsistente**: `AuthContext` usaba `forceAuthUserShape()` mientras el store usaba `normalizeUserWithDefaults()`
3. **loadMe no se ejecutaba al montar**: No había garantía de que `loadMe()` se ejecutara si había token pero no user
4. **Posibles estados stale**: El Sidebar podría leer un user sin permisos si `loadMe()` no se había ejecutado

---

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. AuthContext ahora DELEGA completamente al store

**Antes**: `AuthContext` tenía funciones que duplicaban la lógica del store:
```typescript
// ❌ ANTES: Duplicación de lógica
const login = async (email: string, password: string) => {
  const response = await loginService(email, password);
  const normalized = forceAuthUserShape(normalizeUser(user) || user);
  useAuthStore.setState({ user: normalized, ... });
  // ...
};
```

**Después**: `AuthContext` delega completamente al store:
```typescript
// ✅ DESPUÉS: Delegación completa
const loginStore = useAuthStore((state) => state.login);
const login = async (email: string, password: string) => {
  setLoading(true);
  try {
    const result = await loginStore(email, password);
    setLoading(false);
    if (result) {
      router.push("/dashboard");
      return true;
    }
    return false;
  } catch (e: any) {
    setLoading(false);
    throw e;
  }
};
```

**Archivo modificado**: `context/AuthContext.tsx`

**Cambios**:
- ✅ Eliminada función `forceAuthUserShape()` (ya no se usa)
- ✅ Eliminados imports innecesarios (`loginService`, `refreshService`, `loadMeService`, `normalizeUser`, `normalizeId`)
- ✅ Todas las funciones (`login`, `logout`, `refresh`, `loadMe`) ahora delegan al store
- ✅ El store es la ÚNICA fuente de verdad

---

### 2. loadMe se ejecuta automáticamente al montar

**Agregado**: `useEffect` en `AuthProvider` que ejecuta `loadMe()` si hay token pero no user:

```typescript
// ✅ Ejecutar loadMe al montar si hay token pero no user
useEffect(() => {
  if (loading) return; // Esperar a que termine la inicialización
  
  const token = useAuthStore.getState().token || 
    (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  if (token && !user) {
    // Ejecutar loadMe para obtener user con permisos
    loadMeStore().catch((error) => {
      console.warn("⚠️ [AuthProvider] Error al cargar perfil:", error);
    });
  }
}, [user, loading, loadMeStore]);
```

**Archivo modificado**: `context/AuthContext.tsx`

**Beneficio**: Garantiza que si hay token pero no user, se ejecuta `loadMe()` para obtener el user con permisos del backend.

---

### 3. Sidebar ya es reactivo (verificado)

**Estado actual**: El Sidebar ya usa `useAuthStore` de forma reactiva:

```typescript
// ✅ Hook reactivo: el componente re-renderiza cuando user cambia
const user = useAuthStore((state) => state.user);
```

**Verificación**:
- ✅ No hay estados locales (`useState`) que pisen el user
- ✅ El Sidebar re-renderiza automáticamente cuando `user` cambia en el store
- ✅ `useCan()` también es reactivo (ya corregido anteriormente)

**Archivo verificado**: `components/layout/Sidebar.tsx`

---

### 4. Normalización unificada

**Estado actual**: El store usa `normalizeUserWithDefaults()` que internamente llama a `normalizeUser()`:

```typescript
function normalizeUserWithDefaults(user: any): AuthUser | null {
  const normalized = normalizeUser(user);
  // ... normalización de role y organization
  // Preserva permissions del backend
  if (!normalized.role.permissions || !Array.isArray(normalized.role.permissions)) {
    normalized.role.permissions = [];
  }
  // Si permissions ya existe y es array válido, se preserva tal cual
  return normalized;
}
```

**Beneficio**: 
- ✅ Una sola función de normalización (`normalizeUserWithDefaults`)
- ✅ Preserva permissions del backend explícitamente
- ✅ No infiere permisos por `role.name`

**Archivo**: `store/authStore.ts`

---

## 📋 FLUJO COMPLETO DE AUTENTICACIÓN

### 1. Login
```
LoginForm → AuthContext.login() → store.login() → normalizeUserWithDefaults() → set(user con permissions)
```

### 2. Refresh
```
Interceptor/Manual → AuthContext.refresh() → store.refresh() → normalizeUserWithDefaults() → set(user con permissions)
```

### 3. LoadMe (al montar o manual)
```
AuthProvider useEffect → store.loadMe() → normalizeUserWithDefaults() → set(user con permissions)
```

### 4. Sidebar consume user
```
Sidebar → useAuthStore((state) => state.user) → user.role.permissions → useCan() → render items
```

---

## ✅ RESULTADO ESPERADO

1. ✅ **user.role.permissions.length > 0** en Sidebar
   - `loadMe()` se ejecuta automáticamente si hay token
   - Permissions se preservan del backend

2. ✅ **useCan() devuelve true**
   - `useCan()` es reactivo y se re-evalúa cuando user cambia
   - Permissions se comparan correctamente

3. ✅ **Sidebar renderiza ítems**
   - El Sidebar re-renderiza cuando user cambia
   - `visibleItems` se calcula basado en permisos reales

---

## 🔍 VERIFICACIÓN

### Checklist:
- [x] AuthContext delega completamente al store
- [x] loadMe se ejecuta al montar si hay token
- [x] Sidebar usa useAuthStore reactivo
- [x] No hay estados locales que pisen user
- [x] Normalización unificada (solo normalizeUserWithDefaults)
- [x] Permissions se preservan del backend

### Logs para verificar:
Los logs temporales en `Sidebar.tsx` y `lib/acl.ts` mostrarán:
- `[SIDEBAR] user:` - debe mostrar user con permissions
- `[SIDEBAR] permissions:` - debe mostrar array de permisos
- `[ACL] checking permission:` - debe mostrar permisos disponibles
- `[ACL] useCan("...")` - debe mostrar TRUE si el permiso existe

---

## 📝 ARCHIVOS MODIFICADOS

1. ✅ `context/AuthContext.tsx`
   - Eliminada duplicación de lógica
   - Todas las funciones delegan al store
   - Agregado useEffect para ejecutar loadMe al montar

2. ✅ `components/layout/Sidebar.tsx` (verificado, no modificado)
   - Ya usa useAuthStore reactivo
   - No hay estados locales

3. ✅ `store/authStore.ts` (verificado, no modificado)
   - Usa normalizeUserWithDefaults consistentemente
   - Preserva permissions del backend

4. ✅ `lib/acl.ts` (ya corregido anteriormente)
   - useCan() es reactivo
   - Se re-evalúa cuando user cambia

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecutar la aplicación** y verificar logs
2. **Confirmar que user.role.permissions.length > 0**
3. **Confirmar que useCan() devuelve true para al menos un permiso**
4. **Confirmar que el Sidebar renderiza ítems**
5. **Remover logs temporales** una vez confirmado

---

**Última actualización**: 2024-12-19

