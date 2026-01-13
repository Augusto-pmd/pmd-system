# Auditoría Auth State - Guía de Validación

**Fecha**: 2024-12-19  
**Objetivo**: Validar que hay un solo user en toda la app, que permissions no está vacío, y que el Sidebar re-renderiza cuando user cambia

---

## 🔍 LOGS DE AUDITORÍA AGREGADOS

### 1. En `store/authStore.ts`

**Logs agregados en**:
- `login()` → cuando se setea user después de login
- `refreshSession()` → cuando se setea user después de refresh
- `loadMe()` → cuando se setea user después de loadMe

**Formato de logs**:
```
🟢 [AUTH STORE] login() → set(user)
🟢 [AUTH STORE] user.id: <id>
🟢 [AUTH STORE] user.role.permissions.length: <número>
🟢 [AUTH STORE] user.role.permissions: [array]
```

---

### 2. En `components/layout/Sidebar.tsx`

**Logs agregados**:
- Contador de renders del Sidebar
- Detección de cambios de user
- Validación de un solo user
- Validación de permissions no vacío
- Validación de re-render cuando user cambia

**Formato de logs**:
```
🔵 [AUDIT] ========================================
🔵 [AUDIT] 1. UN SOLO USER:
🔵 [AUDIT]    user existe: true/false
🔵 [AUDIT]    user.id: <id>
🔵 [AUDIT]    user.email: <email>

🔵 [AUDIT] 2. PERMISSIONS NO VACÍO:
🔵 [AUDIT]    permissions existe: true/false
🔵 [AUDIT]    permissions es Array: true/false
🔵 [AUDIT]    permissions.length: <número>
🔵 [AUDIT]    ✅ PASS: permissions no vacío (si length > 0)
🔵 [AUDIT]    ❌ FAIL: permissions vacío o no existe (si length === 0)

🔵 [AUDIT] 3. RE-RENDER CUANDO USER CAMBIA:
🔵 [AUDIT]    renderCount: <número>
🔵 [AUDIT]    userChanged: true/false
🔵 [AUDIT]    ✅ PASS: Sidebar re-renderiza cuando user cambia
🔵 [AUDIT] ========================================

🟡 [SIDEBAR] ⚡ RE-RENDER DETECTADO: user cambió (solo cuando cambia)
🟡 [SIDEBAR] Render #<número> | user.id: <id> | userChanged: true/false
```

---

### 3. En `context/AuthContext.tsx`

**Logs agregados**:
- Verificación de que AuthContext lee del mismo store

**Formato de logs**:
```
🟣 [AUTH CONTEXT] user desde store: <id>
🟣 [AUTH CONTEXT] user desde hook: <id>
🟣 [AUTH CONTEXT] ✅ Mismo user: true/false
```

---

## ✅ CRITERIOS DE VALIDACIÓN

### 1. Un solo user en toda la app

**Validar**:
- ✅ `🟢 [AUTH STORE]` muestra un solo `user.id` en todos los logs
- ✅ `🟣 [AUTH CONTEXT]` muestra el mismo `user.id` que el store
- ✅ `🔵 [AUDIT] 1. UN SOLO USER:` muestra `user existe: true` y un `user.id` consistente

**Si FALLA**:
- ❌ Diferentes `user.id` en diferentes logs → hay múltiples users
- ❌ `user.id` undefined o null → user no está siendo seteado correctamente

---

### 2. user.role.permissions no vacío

**Validar**:
- ✅ `🟢 [AUTH STORE] user.role.permissions.length:` muestra un número > 0
- ✅ `🔵 [AUDIT] 2. PERMISSIONS NO VACÍO:` muestra `✅ PASS: permissions no vacío`
- ✅ `🔵 [AUDIT] permissions.length:` muestra un número > 0

**Si FALLA**:
- ❌ `permissions.length: 0` → permissions está vacío
- ❌ `permissions es Array: false` → permissions no es un array
- ❌ `permissions existe: false` → permissions no existe

---

### 3. Cambiar user → Sidebar re-renderiza

**Validar**:
- ✅ `🟡 [SIDEBAR] ⚡ RE-RENDER DETECTADO: user cambió` aparece cuando user cambia
- ✅ `🟡 [SIDEBAR] userChanged: true` cuando user cambia
- ✅ `🔵 [AUDIT] 3. RE-RENDER CUANDO USER CAMBIA:` muestra `✅ PASS: Sidebar re-renderiza cuando user cambia`

**Cómo probar**:
1. Hacer login → observar logs
2. Hacer logout → observar logs
3. Hacer login con otro usuario → observar logs
4. Verificar que `userChanged: true` aparece cuando cambia el user

**Si FALLA**:
- ❌ `userChanged: false` cuando debería ser `true` → Sidebar no detecta cambios
- ❌ `renderCount` no aumenta cuando user cambia → Sidebar no re-renderiza

---

## 📋 CHECKLIST DE VALIDACIÓN

### Paso 1: Abrir consola del navegador
- [ ] Abrir DevTools (F12)
- [ ] Ir a la pestaña "Console"
- [ ] Limpiar consola (opcional)

### Paso 2: Hacer login
- [ ] Ir a `/login`
- [ ] Ingresar credenciales
- [ ] Hacer login
- [ ] Observar logs en consola

### Paso 3: Validar un solo user
- [ ] Buscar logs `🟢 [AUTH STORE]`
- [ ] Verificar que todos muestran el mismo `user.id`
- [ ] Buscar logs `🟣 [AUTH CONTEXT]`
- [ ] Verificar que `✅ Mismo user: true`
- [ ] Buscar logs `🔵 [AUDIT] 1. UN SOLO USER:`
- [ ] Verificar que `user existe: true` y hay un `user.id`

### Paso 4: Validar permissions no vacío
- [ ] Buscar logs `🔵 [AUDIT] 2. PERMISSIONS NO VACÍO:`
- [ ] Verificar que `permissions.length:` muestra un número > 0
- [ ] Verificar que aparece `✅ PASS: permissions no vacío`
- [ ] Verificar que `permissions sample:` muestra permisos

### Paso 5: Validar re-render cuando user cambia
- [ ] Observar `🟡 [SIDEBAR] Render #1` en el primer render
- [ ] Hacer logout
- [ ] Hacer login nuevamente
- [ ] Observar `🟡 [SIDEBAR] ⚡ RE-RENDER DETECTADO: user cambió`
- [ ] Verificar que `userChanged: true`
- [ ] Verificar que `renderCount` aumenta
- [ ] Buscar logs `🔵 [AUDIT] 3. RE-RENDER CUANDO USER CAMBIA:`
- [ ] Verificar que aparece `✅ PASS: Sidebar re-renderiza cuando user cambia`

---

## 🎯 RESULTADO ESPERADO

### ✅ OK (Todos los criterios pasan)

**Logs esperados**:
```
🟢 [AUTH STORE] login() → set(user)
🟢 [AUTH STORE] user.id: 123
🟢 [AUTH STORE] user.role.permissions.length: 15
🟢 [AUTH STORE] user.role.permissions: ["works.read", "suppliers.read", ...]

🟣 [AUTH CONTEXT] user desde store: 123
🟣 [AUTH CONTEXT] user desde hook: 123
🟣 [AUTH CONTEXT] ✅ Mismo user: true

🔵 [AUDIT] 1. UN SOLO USER:
🔵 [AUDIT]    user existe: true
🔵 [AUDIT]    user.id: 123
🔵 [AUDIT]    user.email: user@example.com

🔵 [AUDIT] 2. PERMISSIONS NO VACÍO:
🔵 [AUDIT]    permissions existe: true
🔵 [AUDIT]    permissions es Array: true
🔵 [AUDIT]    permissions.length: 15
🔵 [AUDIT]    ✅ PASS: permissions no vacío
🔵 [AUDIT]    permissions sample: ["works.read", "suppliers.read", ...]

🔵 [AUDIT] 3. RE-RENDER CUANDO USER CAMBIA:
🔵 [AUDIT]    renderCount: 2
🔵 [AUDIT]    userChanged: true
🔵 [AUDIT]    ✅ PASS: Sidebar re-renderiza cuando user cambia

🟡 [SIDEBAR] ⚡ RE-RENDER DETECTADO: user cambió
🟡 [SIDEBAR] Render #2 | user.id: 123 | userChanged: true
```

---

### ❌ FAIL (Al menos un criterio falla)

**Ejemplos de fallos**:

1. **Múltiples users**:
```
🟢 [AUTH STORE] user.id: 123
🟢 [AUTH STORE] user.id: 456  ❌ Diferente user.id
```

2. **Permissions vacío**:
```
🔵 [AUDIT] permissions.length: 0  ❌ Vacío
🔵 [AUDIT] ❌ FAIL: permissions vacío o no existe
```

3. **Sidebar no re-renderiza**:
```
🟡 [SIDEBAR] userChanged: false  ❌ No detecta cambio
🔵 [AUDIT] ⚠️ WARNING: user no cambió en este render
```

---

## 📝 NOTAS

- Los logs son **TEMPORALES** y deben ser removidos después de la auditoría
- Los logs pueden aparecer múltiples veces durante el ciclo de vida de la app
- El contador de renders (`sidebarRenderCount`) se reinicia al recargar la página
- Para probar el re-render, hacer logout y login nuevamente

---

**Última actualización**: 2024-12-19

