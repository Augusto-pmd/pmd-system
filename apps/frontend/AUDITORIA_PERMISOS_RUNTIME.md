# Auditoría Post-Fix de Permisos - Runtime Validation

## Objetivo
Validar en runtime que el sistema de permisos funciona correctamente después del fix.

## Validaciones Requeridas

### ✅ 1. user.role.permissions existe
**Archivo:** `lib/acl.ts` línea 58-61  
**Log esperado:**
```
🟡 [ACL AUDIT] ✅ PASS: user.role.permissions existe
```

**Evidencia:**
- Si `user.role.permissions` es `undefined` o `null` → `❌ FAIL`
- Si `user.role.permissions` existe → `✅ PASS`

---

### ✅ 2. user.role.permissions es Array
**Archivo:** `lib/acl.ts` línea 64-68  
**Log esperado:**
```
🟡 [ACL AUDIT] ✅ PASS: user.role.permissions es Array
```

**Evidencia:**
- Si `Array.isArray(user.role.permissions)` es `false` → `❌ FAIL`
- Si `Array.isArray(user.role.permissions)` es `true` → `✅ PASS`

---

### ✅ 3. user.role.permissions no es vacío
**Archivo:** `lib/acl.ts` línea 70-74  
**Log esperado:**
```
🟡 [ACL AUDIT] ✅ PASS: user.role.permissions no está vacío (length: X)
```

**Evidencia:**
- Si `user.role.permissions.length === 0` → `❌ FAIL`
- Si `user.role.permissions.length > 0` → `✅ PASS`

---

### ✅ 4. ACL loguea "using explicit permissions"
**Archivo:** `lib/acl.ts` línea 82  
**Log esperado:**
```
🟡 [ACL AUDIT] ✅ PASS: Using explicit permissions from backend
🟡 [ACL AUDIT] Permisos explícitos: X permisos válidos
🟡 [ACL AUDIT] Lista de permisos: [...]
```

**Evidencia:**
- Si el log muestra "Using explicit permissions from backend" → `✅ PASS`
- Si el log muestra "ERROR: user.role.permissions no está presente o está vacío" → `❌ FAIL`

---

### ✅ 5. useCan() retorna true para módulos habilitados
**Archivo:** `lib/acl.ts` línea 90-99  
**Log esperado:**
```
🟡 [ACL AUDIT] useCan("works.read"): ✅ TRUE
🟡 [ACL AUDIT] useCan("suppliers.read"): ✅ TRUE
🟡 [ACL AUDIT] useCan("accounting.read"): ✅ TRUE
🟡 [ACL AUDIT] useCan("cashbox.read"): ✅ TRUE
🟡 [ACL AUDIT] useCan("documents.read"): ✅ TRUE
🟡 [ACL AUDIT] useCan("alerts.read"): ✅ TRUE
```

**Evidencia:**
- Si `useCan("works.read")` retorna `true` → `✅ PASS`
- Si `useCan("works.read")` retorna `false` → `❌ FAIL`

---

## Cómo Ejecutar la Auditoría

### Opción 1: Logs Automáticos
Los logs se ejecutan automáticamente cuando:
1. El usuario se autentica
2. El Sidebar se renderiza
3. Se llama a `getUserPermissions()`

**Ver logs en consola del navegador:**
- Abrir DevTools (F12)
- Ir a la pestaña "Console"
- Buscar logs que empiecen con `🟡 [ACL AUDIT]` o `🔵 [SIDEBAR AUDIT]`

### Opción 2: Script de Auditoría Manual
**Archivo:** `lib/audit-permissions.ts`

**Ejecutar en consola del navegador:**
```javascript
// Importar y ejecutar
import { auditPermissions } from '@/lib/audit-permissions';
const result = auditPermissions();
console.log('Resultado auditoría:', result);
```

O usar la función global (si está disponible):
```javascript
window.auditPermissions()
```

---

## Checklist de Validación

| Test | Archivo | Línea | Estado Esperado | Log Esperado |
|------|---------|-------|-----------------|--------------|
| user.role.permissions existe | `lib/acl.ts` | 58-61 | ✅ PASS | `✅ PASS: user.role.permissions existe` |
| Es Array | `lib/acl.ts` | 64-68 | ✅ PASS | `✅ PASS: user.role.permissions es Array` |
| No es vacío | `lib/acl.ts` | 70-74 | ✅ PASS | `✅ PASS: user.role.permissions no está vacío` |
| ACL loguea "using explicit permissions" | `lib/acl.ts` | 82 | ✅ PASS | `✅ PASS: Using explicit permissions from backend` |
| useCan() retorna true | `lib/acl.ts` | 90-99 | ✅ PASS | `✅ TRUE` para módulos habilitados |

---

## Logs de Ejemplo (Éxito)

```
🟡 [ACL AUDIT] getUserPermissions() llamado
🟡 [ACL AUDIT] user existe? true
🟡 [ACL AUDIT] ✅ PASS: user.role existe
🟡 [ACL AUDIT] ✅ PASS: user.role.permissions existe
🟡 [ACL AUDIT] ✅ PASS: user.role.permissions es Array
🟡 [ACL AUDIT] ✅ PASS: user.role.permissions no está vacío (length: 25)
🟡 [ACL AUDIT] ✅ PASS: Using explicit permissions from backend
🟡 [ACL AUDIT] Permisos explícitos: 25 permisos válidos
🟡 [ACL AUDIT] Lista de permisos: ["works.read", "works.create", ...]
🟡 [ACL AUDIT] useCan("works.read"): ✅ TRUE
🟡 [ACL AUDIT] useCan("suppliers.read"): ✅ TRUE
```

---

## Logs de Ejemplo (Fallo)

```
🟡 [ACL AUDIT] getUserPermissions() llamado
🟡 [ACL AUDIT] user existe? true
🟡 [ACL AUDIT] ✅ PASS: user.role existe
🟡 [ACL AUDIT] ❌ FAIL: user.role.permissions no existe
```

O:

```
🟡 [ACL AUDIT] ✅ PASS: user.role.permissions existe
🟡 [ACL AUDIT] ❌ FAIL: user.role.permissions no es Array. Tipo: string
```

---

## Resultado Esperado

### ✅ PASS
- Todos los tests pasan
- Logs muestran `✅ PASS` para todas las validaciones
- `useCan()` retorna `true` para módulos habilitados
- Sidebar renderiza items correctamente

### ❌ FAIL
- Algún test falla
- Logs muestran `❌ FAIL` para alguna validación
- `useCan()` retorna `false` cuando debería retornar `true`
- Sidebar no renderiza items

---

## Archivos Modificados para Auditoría

1. **`lib/acl.ts`**
   - Agregadas validaciones explícitas con logs `[ACL AUDIT]`
   - Log "Using explicit permissions from backend"
   - Logs en `useCan()` para permisos críticos

2. **`components/layout/Sidebar.tsx`**
   - Agregadas validaciones explícitas con logs `[SIDEBAR AUDIT]`
   - Validación completa de estructura de user

3. **`lib/audit-permissions.ts`** (nuevo)
   - Script de auditoría manual
   - Función `auditPermissions()` para ejecutar validaciones

---

## Próximos Pasos

1. **Ejecutar la aplicación**
2. **Autenticarse con un usuario**
3. **Abrir consola del navegador**
4. **Buscar logs `[ACL AUDIT]` y `[SIDEBAR AUDIT]`**
5. **Verificar que todos los tests muestren `✅ PASS`**
6. **Confirmar que `useCan()` retorna `true` para módulos habilitados**
7. **Verificar que el Sidebar renderiza items correctamente**

