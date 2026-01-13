# Auditoría de Requests de Creación - PMD Frontend

**Fecha**: 2024-12-19  
**Objetivo**: Validar que todas las requests POST/PATCH funcionan correctamente después de la corrección del forwarding de body.

---

## 📋 Checklist de Validación

### 1. POST /api/suppliers

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `suppliers`
3. Crear un nuevo proveedor desde la UI
4. Verificar en la request `POST /api/suppliers`:

#### Validaciones:

- [ ] **Request Payload presente**
  - En Network tab, click en la request `POST /api/suppliers`
  - Ir a tab **Payload** o **Request**
  - Verificar que existe un objeto JSON con campos

- [ ] **Content-Type: application/json**
  - En la misma request, ir a tab **Headers**
  - Buscar `Content-Type` en **Request Headers**
  - Verificar: `Content-Type: application/json`

- [ ] **Body con campos esperados**
  - En tab **Payload** o **Request**, verificar que el body contiene:
    - `nombre` o `name` (string)
    - Otros campos opcionales según el formulario

- [ ] **Response != 400**
  - En tab **Headers**, verificar **Status Code**
  - Debe ser: `200` o `201` (NO `400`)
  - Si es `400`, verificar el mensaje de error en tab **Response**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { "nombre": "...", ... }
✅ Response: 200/201 (NO 400)
```

---

### 2. POST /api/works

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `works`
3. Crear una nueva obra desde la UI
4. Verificar en la request `POST /api/works`:

#### Validaciones:

- [ ] **Request Payload presente**
  - Verificar que existe un objeto JSON en el body

- [ ] **Content-Type: application/json**
  - Verificar header `Content-Type: application/json`

- [ ] **Body con campos esperados**
  - Verificar que el body contiene:
    - `nombre` (string, requerido)
    - Campos opcionales: `direccion`, `fechaInicio`, `fechaFin`, `estado`, `descripcion`, etc.

- [ ] **Response != 400**
  - Status Code: `200` o `201`

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { "nombre": "...", ... }
✅ Response: 200/201 (NO 400)
```

---

### 3. POST /api/cashboxes

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `cashboxes`
3. Crear una nueva caja desde la UI
4. Verificar en la request `POST /api/cashboxes`:

#### Validaciones:

- [ ] **Request Payload presente**
- [ ] **Content-Type: application/json**
- [ ] **Body con campos esperados**
  - Verificar campos según el formulario de creación de caja
- [ ] **Response != 400**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { ... }
✅ Response: 200/201 (NO 400)
```

---

### 4. POST /api/expenses

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `expenses`
3. Crear un nuevo gasto desde la UI
4. Verificar en la request `POST /api/expenses`:

#### Validaciones:

- [ ] **Request Payload presente**
- [ ] **Content-Type: application/json**
- [ ] **Body con campos esperados**
- [ ] **Response != 400**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { ... }
✅ Response: 200/201 (NO 400)
```

---

### 5. POST /api/incomes

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `incomes`
3. Crear un nuevo ingreso desde la UI
4. Verificar en la request `POST /api/incomes`:

#### Validaciones:

- [ ] **Request Payload presente**
- [ ] **Content-Type: application/json**
- [ ] **Body con campos esperados**
- [ ] **Response != 400**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { ... }
✅ Response: 200/201 (NO 400)
```

---

### 6. POST /api/contracts

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `contracts`
3. Crear un nuevo contrato desde la UI
4. Verificar en la request `POST /api/contracts`:

#### Validaciones:

- [ ] **Request Payload presente**
- [ ] **Content-Type: application/json**
- [ ] **Body con campos esperados**
- [ ] **Response != 400**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { ... }
✅ Response: 200/201 (NO 400)
```

---

### 7. POST /api/alerts

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `alerts`
3. Crear una nueva alerta desde la UI
4. Verificar en la request `POST /api/alerts`:

#### Validaciones:

- [ ] **Request Payload presente**
- [ ] **Content-Type: application/json**
- [ ] **Body con campos esperados**
- [ ] **Response != 400**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { ... }
✅ Response: 200/201 (NO 400)
```

---

### 8. POST /api/work-documents

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `work-documents`
3. Crear un nuevo documento desde la UI
4. Verificar en la request `POST /api/work-documents`:

#### Validaciones:

- [ ] **Request Payload presente**
- [ ] **Content-Type: application/json** (o `multipart/form-data` si es upload de archivo)
- [ ] **Body con campos esperados**
- [ ] **Response != 400**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json (o multipart/form-data)
✅ Body: { ... }
✅ Response: 200/201 (NO 400)
```

---

### 9. POST /api/users

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `users`
3. Crear un nuevo usuario desde la UI
4. Verificar en la request `POST /api/users`:

#### Validaciones:

- [ ] **Request Payload presente**
- [ ] **Content-Type: application/json**
- [ ] **Body con campos esperados**
  - `email` (string, requerido)
  - `password` (string, requerido)
  - Otros campos según el formulario
- [ ] **Response != 400**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { "email": "...", "password": "...", ... }
✅ Response: 200/201 (NO 400)
```

---

### 10. POST /api/roles

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `roles`
3. Crear un nuevo rol desde la UI
4. Verificar en la request `POST /api/roles`:

#### Validaciones:

- [ ] **Request Payload presente**
- [ ] **Content-Type: application/json**
- [ ] **Body con campos esperados**
  - `name` (string, requerido)
  - `permissions` (array, opcional)
- [ ] **Response != 400**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { "name": "...", "permissions": [...] }
✅ Response: 200/201 (NO 400)
```

---

### 11. POST /api/cash-movements

#### Pasos de Auditoría:
1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por: `cash-movements`
3. Crear un nuevo movimiento de caja desde la UI
4. Verificar en la request `POST /api/cash-movements`:

#### Validaciones:

- [ ] **Request Payload presente**
- [ ] **Content-Type: application/json**
- [ ] **Body con campos esperados**
  - `cashbox_id` (UUID, requerido)
  - `type` (string: "income" | "expense", requerido)
  - `amount` (number, requerido)
  - `currency` (string: "ARS" | "USD", requerido)
  - `date` (ISO8601 string, requerido)
- [ ] **Response != 400**

#### Resultado Esperado:
```
✅ Request Payload: PRESENTE
✅ Content-Type: application/json
✅ Body: { "cashbox_id": "...", "type": "...", "amount": ..., ... }
✅ Response: 200/201 (NO 400)
```

---

## 🔍 Cómo Verificar en Chrome DevTools

### Paso 1: Abrir Network Tab
1. Presionar `F12` o `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
2. Click en tab **Network**

### Paso 2: Filtrar Requests
1. En el campo de búsqueda, escribir el nombre del recurso (ej: `suppliers`, `works`)
2. O usar el filtro `XHR` para ver solo requests AJAX

### Paso 3: Realizar la Acción
1. Crear un nuevo recurso desde la UI (ej: click en "Nuevo Proveedor")
2. Llenar el formulario y hacer submit

### Paso 4: Inspeccionar la Request
1. En Network tab, buscar la request `POST /api/<resource>`
2. Click en la request para abrir el detalle

### Paso 5: Verificar Headers
1. Click en tab **Headers**
2. Scroll hasta **Request Headers**
3. Buscar `Content-Type: application/json`

### Paso 6: Verificar Payload
1. Click en tab **Payload** o **Request**
2. Verificar que existe un objeto JSON con los campos esperados

### Paso 7: Verificar Response
1. Click en tab **Headers**
2. Verificar **Status Code** (debe ser `200` o `201`, NO `400`)
3. Si es `400`, click en tab **Response** para ver el mensaje de error

---

## 📊 Resultado de Auditoría

### Template de Reporte:

```
## Auditoría POST /api/<resource>

**Fecha**: YYYY-MM-DD
**Usuario**: [nombre]
**Navegador**: Chrome/Firefox/Safari [versión]

### Validaciones:

- [ ] Request Payload presente: ✅ / ❌
- [ ] Content-Type: application/json: ✅ / ❌
- [ ] Body con campos esperados: ✅ / ❌
- [ ] Response != 400: ✅ / ❌

### Detalles:

**Request Payload**:
```json
{
  "campo1": "valor1",
  "campo2": "valor2"
}
```

**Response Status**: 200 / 201 / 400 / 500

**Response Body** (si hay error):
```json
{
  "error": "...",
  "message": "..."
}
```

### Resultado Final: ✅ OK / ❌ FAIL

**Notas**:
- [Descripción de cualquier problema encontrado]
```

---

## 🚨 Errores Comunes a Verificar

### Error 400: "Request body is required"
**Causa**: El body está vacío o es una cadena vacía  
**Solución**: Verificar que el formulario envía datos correctamente

### Error 400: "Invalid JSON in request body"
**Causa**: El body no es JSON válido  
**Solución**: Verificar que el frontend está serializando correctamente el objeto

### Error 400: Backend validation error
**Causa**: El body es válido pero falta un campo requerido o tiene un formato incorrecto  
**Solución**: Verificar que todos los campos requeridos están presentes y tienen el formato correcto

### Content-Type incorrecto
**Causa**: El header `Content-Type` no está presente o es incorrecto  
**Solución**: Verificar que el route handler está seteando `Content-Type: application/json`

---

## ✅ Checklist Final

- [ ] POST /api/suppliers: ✅ OK / ❌ FAIL
- [ ] POST /api/works: ✅ OK / ❌ FAIL
- [ ] POST /api/cashboxes: ✅ OK / ❌ FAIL
- [ ] POST /api/expenses: ✅ OK / ❌ FAIL
- [ ] POST /api/incomes: ✅ OK / ❌ FAIL
- [ ] POST /api/contracts: ✅ OK / ❌ FAIL
- [ ] POST /api/alerts: ✅ OK / ❌ FAIL
- [ ] POST /api/work-documents: ✅ OK / ❌ FAIL
- [ ] POST /api/users: ✅ OK / ❌ FAIL
- [ ] POST /api/roles: ✅ OK / ❌ FAIL
- [ ] POST /api/cash-movements: ✅ OK / ❌ FAIL

---

## 📝 Notas

- Esta auditoría debe realizarse después de cada corrección de route handlers
- Si algún endpoint falla, verificar los logs del servidor (Next.js console)
- Los errores 400 ahora tienen mensajes más claros gracias a la validación agregada
- Si el body está vacío o es JSON inválido, el error se detecta antes de llegar al backend

---

**Última actualización**: 2024-12-19

