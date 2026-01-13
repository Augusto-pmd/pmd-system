# Debug Sidebar Vacío - Logs Temporales Agregados

**Fecha**: 2024-12-19  
**Objetivo**: Detectar por qué el Sidebar queda vacío y corregir la evaluación de permisos

---

## 🔍 Logs Temporales Agregados

### 1. En `components/layout/Sidebar.tsx`

**Logs agregados**:
```typescript
console.log("[SIDEBAR] user:", user);
console.log("[SIDEBAR] permissions:", user?.role?.permissions);
console.log("[SIDEBAR] permissions type:", typeof user?.role?.permissions);
console.log("[SIDEBAR] permissions isArray:", Array.isArray(user?.role?.permissions));
if (Array.isArray(user?.role?.permissions)) {
  console.log("[SIDEBAR] permissions length:", user.role.permissions.length);
  console.log("[SIDEBAR] permissions values:", user.role.permissions);
  console.log("[SIDEBAR] permissions sample:", user.role.permissions.slice(0, 5));
}
```

**Ubicación**: Líneas 70-80 (después de obtener el user)

---

### 2. En `lib/acl.ts` - Función `useCan()`

**Logs agregados**:
```typescript
console.log("[ACL] checking permission:", permission);
console.log("[ACL] available permissions:", permissions);
console.log("[ACL] permissions length:", permissions.length);
console.log("[ACL] permission type:", typeof permission);
if (permissions.length > 0) {
  console.log("[ACL] permissions types:", permissions.map(p => typeof p));
  console.log("[ACL] permissions sample:", permissions.slice(0, 5));
}

// Si no hay coincidencia, verificar problemas de formato
if (!hasPermission && permissions.length > 0) {
  console.log("[ACL] ❌ No match found for:", permission);
  console.log("[ACL] Checking lowercase match:", hasLowerMatch);
  if (hasLowerMatch) {
    console.log("[ACL] ⚠️ Found lowercase match:", matchingPermission, "vs requested:", permission);
  }
  // Verificar permisos similares
  if (similarPermissions.length > 0) {
    console.log("[ACL] Similar permissions found:", similarPermissions);
  }
}

console.log(`[ACL] useCan("${permission}"): ${hasPermission ? "✅ TRUE" : "❌ FALSE"}`);
```

**Ubicación**: Líneas 122-157 (dentro de `useCan()`)

---

## ✅ Corrección Implementada

### `useCan()` ahora es Reactivo

**Problema detectado**: `useCan()` usaba `getUserPermissions()` que a su vez usaba `useAuthStore.getState()`, lo cual NO es reactivo. Esto significa que `useCan()` no se re-evaluaba cuando el usuario cambiaba.

**Solución implementada**:
```typescript
export function useCan(permission: Permission): boolean {
  // 🔍 HACER REACTIVO: Usar selector reactivo en lugar de getState()
  const user = useAuthStore((state) => state.user);
  
  // Obtener permisos de forma reactiva con useMemo
  const permissions: Permission[] = useMemo(() => {
    if (!user?.role?.permissions) {
      return [];
    }
    
    if (!Array.isArray(user.role.permissions)) {
      return [];
    }
    
    // Filtrar solo strings válidos
    return user.role.permissions.filter((p: string): p is Permission => 
      typeof p === "string" && p.length > 0
    );
  }, [user?.role?.permissions]);
  
  // ... resto de la lógica
}
```

**Cambios**:
- ✅ `useCan()` ahora usa `useAuthStore((state) => state.user)` (reactivo)
- ✅ Permisos se calculan con `useMemo()` que se re-evalúa cuando `user?.role?.permissions` cambia
- ✅ El hook se re-evalúa automáticamente cuando el usuario o sus permisos cambian

---

## 🔍 Qué Verificar en la Consola

### 1. Verificar que user existe:
```
[SIDEBAR] user: { ... }
[SIDEBAR] permissions: [ ... ]
```

### 2. Verificar que permissions es un array:
```
[SIDEBAR] permissions type: object
[SIDEBAR] permissions isArray: true
[SIDEBAR] permissions length: X
```

### 3. Verificar valores de permisos:
```
[SIDEBAR] permissions values: ["works.read", "suppliers.read", ...]
[SIDEBAR] permissions sample: ["works.read", "suppliers.read", ...]
```

### 4. Verificar comparación en ACL:
```
[ACL] checking permission: works.read
[ACL] available permissions: ["works.read", "suppliers.read", ...]
[ACL] permissions length: X
[ACL] useCan("works.read"): ✅ TRUE o ❌ FALSE
```

### 5. Si hay problema de formato:
```
[ACL] ❌ No match found for: works.read
[ACL] Checking lowercase match: true/false
[ACL] ⚠️ Found lowercase match: "Works.Read" vs requested: "works.read"
[ACL] Similar permissions found: ["works.read", "works.create", ...]
```

---

## 🎯 Posibles Problemas a Detectar

### 1. Permisos vacíos
**Síntoma**: `permissions length: 0`
**Causa**: El backend no está enviando permisos o el usuario no tiene rol asignado
**Solución**: Verificar que el backend envíe `user.role.permissions` como array

### 2. Permisos en formato incorrecto
**Síntoma**: `⚠️ Found lowercase match: "Works.Read" vs requested: "works.read"`
**Causa**: El backend envía permisos con mayúsculas pero el frontend espera lowercase
**Solución**: Normalizar permisos a lowercase en el normalizador o en `useCan()`

### 3. Strings no coinciden exactamente
**Síntoma**: `❌ No match found for: works.read` pero `Similar permissions found: ["work.read", ...]`
**Causa**: El backend usa `work.read` pero el frontend espera `works.read` (plural)
**Solución**: Corregir strings en el backend o mapear en el frontend

### 4. useCan no se re-evalúa
**Síntoma**: Los logs muestran permisos correctos pero `useCan()` siempre retorna `false`
**Causa**: `useCan()` no era reactivo (YA CORREGIDO)
**Solución**: Ya implementado - `useCan()` ahora es reactivo

---

## 📋 Checklist de Validación

- [ ] Abrir consola del navegador
- [ ] Verificar logs `[SIDEBAR]` - user y permissions deben existir
- [ ] Verificar logs `[ACL]` - permissions debe tener valores
- [ ] Verificar que al menos un `useCan()` retorna `✅ TRUE`
- [ ] Verificar que `visibleItems.length > 0`
- [ ] Verificar que el Sidebar muestra opciones

---

## 🔧 Próximos Pasos

1. **Ejecutar la aplicación** y revisar la consola
2. **Identificar el problema** basado en los logs
3. **Aplicar la corrección** según el problema detectado:
   - Si hay problema de formato → Normalizar a lowercase
   - Si hay strings diferentes → Corregir nombres
   - Si permissions está vacío → Verificar backend
4. **Remover logs temporales** una vez corregido

---

## ⚠️ Nota Importante

Los logs agregados son **TEMPORALES** y deben ser removidos una vez que se identifique y corrija el problema. Están marcados con comentarios `🔍 LOGS TEMPORALES PARA DEBUGGING`.

---

**Última actualización**: 2024-12-19

