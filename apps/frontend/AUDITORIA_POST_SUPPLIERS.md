# Auditoría POST /api/suppliers

**Fecha**: 2024-12-19  
**Endpoint**: `POST /api/suppliers`

---

## ✅ Checklist de Validación

### 1. Request Payload presente
- [ ] Abrir DevTools (F12) → Tab **Network**
- [ ] Filtrar por: `suppliers`
- [ ] Crear un nuevo proveedor desde la UI
- [ ] Click en request `POST /api/suppliers`
- [ ] Ir a tab **Payload** o **Request**
- [ ] **Resultado**: ✅ PRESENTE / ❌ AUSENTE

**Evidencia esperada**:
```json
{
  "nombre": "Proveedor Test",
  "email": "test@example.com",
  ...
}
```

---

### 2. Content-Type: application/json
- [ ] En la misma request, ir a tab **Headers**
- [ ] Buscar `Content-Type` en **Request Headers**
- [ ] **Resultado**: ✅ `application/json` / ❌ Otro valor o ausente

**Evidencia esperada**:
```
Content-Type: application/json
```

---

### 3. Body con campos esperados
- [ ] En tab **Payload** o **Request**, verificar que el body contiene:
  - `nombre` o `name` (string)
  - Otros campos según el formulario
- [ ] **Resultado**: ✅ Campos presentes / ❌ Campos faltantes

**Campos típicos esperados**:
- `nombre` / `name` (requerido)
- `email` (opcional)
- `telefono` / `phone` (opcional)
- `direccion` / `address` (opcional)

---

### 4. Response != 400
- [ ] En tab **Headers**, verificar **Status Code**
- [ ] **Resultado**: ✅ `200` o `201` / ❌ `400` u otro error

**Si es 400, verificar Response tab**:
```json
{
  "error": "Request body is required" // o "Invalid JSON in request body"
}
```

---

## 📊 Resultado Final

| Validación | Estado | Notas |
|------------|--------|-------|
| Request Payload presente | ✅ / ❌ | |
| Content-Type: application/json | ✅ / ❌ | |
| Body con campos esperados | ✅ / ❌ | |
| Response != 400 | ✅ / ❌ | Status: ___ |

### Resultado General: ✅ OK / ❌ FAIL

---

## 🔍 Screenshots de Referencia

### Network Tab - Request Headers
```
Request URL: http://localhost:3000/api/suppliers
Request Method: POST
Status Code: 200 OK

Request Headers:
  Content-Type: application/json
  Authorization: Bearer <token>
```

### Network Tab - Request Payload
```json
{
  "nombre": "Proveedor Test",
  "email": "test@example.com",
  "telefono": "1234567890"
}
```

---

## 🚨 Errores Comunes

### Error 400: "Request body is required"
**Causa**: El body está vacío  
**Solución**: Verificar que el formulario envía datos

### Error 400: "Invalid JSON in request body"
**Causa**: El body no es JSON válido  
**Solución**: Verificar serialización del objeto

### Content-Type incorrecto
**Causa**: Header no presente o incorrecto  
**Solución**: Verificar route handler

---

**Última actualización**: 2024-12-19

