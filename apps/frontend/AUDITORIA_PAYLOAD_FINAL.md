# Auditoría Payload Final - Validación en Network Tab

**Fecha**: 2024-12-19  
**Objetivo**: Validar que los payloads enviados al backend contengan EXACTAMENTE los campos del DTO, sin propiedades extra

---

## 🔍 Cómo Realizar la Auditoría

### Paso 1: Abrir Chrome DevTools
1. Presionar `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Ir a la pestaña **Network**
3. Asegurarse de que el filtro está en **All** o **XHR**

### Paso 2: Limpiar y Filtrar
1. Clic en el botón **Clear** (🚫) para limpiar requests anteriores
2. Filtrar por el recurso específico (ej: `suppliers`, `works`, `cashboxes`)

### Paso 3: Realizar la Acción
1. Crear un nuevo recurso desde la UI (ej: "Nuevo Proveedor", "Nueva Obra", "Nueva Caja")
2. Completar el formulario y hacer clic en "Guardar"

### Paso 4: Inspeccionar el Request
1. Buscar el request `POST` en la lista
2. Clic en el request para abrir detalles
3. Ir a la pestaña **Payload** o **Request**

---

## ✅ Checklist de Validación

### 1. POST /api/suppliers

#### Campos Esperados del DTO:
```typescript
{
  name: string;                    // ✅ REQUERIDO
  cuit?: string;                   // ✅ Opcional
  email?: string;                  // ✅ Opcional
  phone?: string;                  // ✅ Opcional
  category?: string;               // ✅ Opcional
  status?: "provisional" | "approved" | "blocked" | "rejected";  // ✅ Opcional
  address?: string;                // ✅ Opcional
}
```

#### ✅ Validaciones:

- [ ] **Payload contiene SOLO campos del DTO**
  - ✅ `name` está presente
  - ✅ NO hay `nombre` (solo `name`)
  - ✅ NO hay `telefono` (solo `phone` si existe)
  - ✅ NO hay `direccion` (solo `address` si existe)
  - ✅ NO hay `contacto` o `contactName`
  - ✅ NO hay `notes` o `notas`
  - ✅ NO hay campos duplicados

- [ ] **No hay propiedades extra**
  - ✅ Solo aparecen campos definidos en el DTO
  - ✅ No hay campos con prefijos `_` o `__`
  - ✅ No hay campos calculados o derivados

- [ ] **Enums correctos**
  - ✅ Si `status` está presente, debe ser uno de: `"provisional"`, `"approved"`, `"blocked"`, `"rejected"`
  - ✅ NO debe ser `"Provisional"` (mayúscula) ni `"PROVISIONAL"` (todo mayúscula)

- [ ] **Tipos correctos**
  - ✅ `name` es `string` (no `null`, no `undefined`)
  - ✅ `cuit` es `string` o no está presente
  - ✅ `email` es `string` o no está presente
  - ✅ `phone` es `string` o no está presente
  - ✅ `status` es `string` (uno de los valores del enum) o no está presente

- [ ] **Status Code**
  - ✅ Response Status: `201 Created`
  - ✅ NO `400 Bad Request`
  - ✅ NO `422 Unprocessable Entity`

#### ❌ Ejemplos de Payloads INCORRECTOS:

```json
// ❌ INCORRECTO: Campos duplicados
{
  "nombre": "Proveedor S.A.",
  "name": "Proveedor S.A.",
  "telefono": "+54 11 1234-5678",
  "phone": "+54 11 1234-5678"
}

// ❌ INCORRECTO: Campos extra no en DTO
{
  "name": "Proveedor S.A.",
  "contacto": "Juan Pérez",
  "notes": "Notas adicionales"
}

// ❌ INCORRECTO: Enum incorrecto
{
  "name": "Proveedor S.A.",
  "status": "Provisional"  // ❌ Debe ser "provisional" (lowercase)
}
```

#### ✅ Ejemplo de Payload CORRECTO:

```json
{
  "name": "Proveedor S.A.",
  "cuit": "20-12345678-9",
  "email": "proveedor@ejemplo.com",
  "phone": "+54 11 1234-5678",
  "status": "provisional",
  "address": "Av. Corrientes 1234"
}
```

---

### 2. POST /api/works

#### Campos Esperados del DTO:
```typescript
{
  nombre: string;                  // ✅ REQUERIDO
  direccion?: string;              // ✅ Opcional
  fechaInicio?: string;            // ✅ ISO date: YYYY-MM-DD
  fechaFin?: string;               // ✅ ISO date: YYYY-MM-DD
  estado?: string;                 // ✅ Opcional
  descripcion?: string;            // ✅ Opcional
  metrosCuadrados?: number;        // ✅ Opcional (NUMBER, no string)
  responsableId?: string;           // ✅ Opcional (UUID)
  presupuesto?: number;            // ✅ Opcional (NUMBER, no string)
}
```

#### ✅ Validaciones:

- [ ] **Payload contiene SOLO campos del DTO**
  - ✅ `nombre` está presente
  - ✅ NO hay `name` (solo `nombre`)
  - ✅ NO hay `address` (solo `direccion` si existe)
  - ✅ NO hay `startDate` (solo `fechaInicio` si existe)
  - ✅ NO hay `endDate` (solo `fechaFin` si existe)
  - ✅ NO hay `description` (solo `descripcion` si existe)
  - ✅ NO hay `squareMeters` (solo `metrosCuadrados` si existe)
  - ✅ NO hay `managerId` (solo `responsableId` si existe)
  - ✅ NO hay `budget` (solo `presupuesto` si existe)

- [ ] **No hay propiedades extra**
  - ✅ Solo aparecen campos definidos en el DTO
  - ✅ No hay campos calculados o derivados

- [ ] **Fechas en formato "YYYY-MM-DD"**
  - ✅ `fechaInicio` (si existe) es `"2024-01-15"` (NO `"2024-01-15T00:00:00.000Z"`)
  - ✅ `fechaFin` (si existe) es `"2024-12-31"` (NO `"2024-12-31T00:00:00.000Z"`)
  - ✅ NO hay timestamps ni fechas con hora

- [ ] **Números como `number` (no string)**
  - ✅ `metrosCuadrados` (si existe) es `1500.5` (NO `"1500.5"`)
  - ✅ `presupuesto` (si existe) es `5000000` (NO `"5000000"`)

- [ ] **UUIDs como string**
  - ✅ `responsableId` (si existe) es un string UUID válido

- [ ] **Status Code**
  - ✅ Response Status: `201 Created`
  - ✅ NO `400 Bad Request`
  - ✅ NO `422 Unprocessable Entity`

#### ❌ Ejemplos de Payloads INCORRECTOS:

```json
// ❌ INCORRECTO: Campos duplicados
{
  "nombre": "Obra Test",
  "name": "Obra Test",
  "startDate": "2024-01-15",
  "fechaInicio": "2024-01-15"
}

// ❌ INCORRECTO: Fecha con timestamp
{
  "nombre": "Obra Test",
  "fechaInicio": "2024-01-15T00:00:00.000Z"  // ❌ Debe ser "2024-01-15"
}

// ❌ INCORRECTO: Números como string
{
  "nombre": "Obra Test",
  "metrosCuadrados": "1500.5",  // ❌ Debe ser 1500.5 (number)
  "presupuesto": "5000000"       // ❌ Debe ser 5000000 (number)
}

// ❌ INCORRECTO: Campos extra
{
  "nombre": "Obra Test",
  "clienteId": "uuid",  // ❌ No está en el DTO
  "budget": 5000000     // ❌ Debe ser "presupuesto"
}
```

#### ✅ Ejemplo de Payload CORRECTO:

```json
{
  "nombre": "Edificio Residencial Centro",
  "direccion": "Av. Libertador 1234",
  "fechaInicio": "2024-01-15",
  "fechaFin": "2024-12-31",
  "estado": "planificada",
  "descripcion": "Obra residencial de 10 pisos",
  "metrosCuadrados": 1500.5,
  "responsableId": "123e4567-e89b-12d3-a456-426614174000",
  "presupuesto": 5000000
}
```

---

### 3. POST /api/cashboxes

#### Campos Esperados del DTO:
```typescript
{
  opening_date: string;            // ✅ REQUERIDO (ISO8601 date string)
  user_id: string;                 // ✅ REQUERIDO (UUID)
}
```

#### ✅ Validaciones:

- [ ] **Payload contiene SOLO campos del DTO**
  - ✅ `opening_date` está presente
  - ✅ `user_id` está presente
  - ✅ NO hay campos extra
  - ✅ NO hay `openingDate` (solo `opening_date`)
  - ✅ NO hay `userId` (solo `user_id`)

- [ ] **No hay propiedades extra**
  - ✅ Solo aparecen `opening_date` y `user_id`
  - ✅ No hay campos calculados o derivados

- [ ] **Fecha en formato ISO8601**
  - ✅ `opening_date` es `"2024-01-15T00:00:00.000Z"` (ISO8601 completo)
  - ✅ NO es solo `"2024-01-15"` (debe incluir hora y timezone)

- [ ] **UUID válido**
  - ✅ `user_id` es un string UUID válido (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

- [ ] **Status Code**
  - ✅ Response Status: `201 Created`
  - ✅ NO `400 Bad Request`
  - ✅ NO `422 Unprocessable Entity`

#### ❌ Ejemplos de Payloads INCORRECTOS:

```json
// ❌ INCORRECTO: Campos con nombres incorrectos
{
  "openingDate": "2024-01-15T00:00:00.000Z",  // ❌ Debe ser "opening_date"
  "userId": "uuid"                            // ❌ Debe ser "user_id"
}

// ❌ INCORRECTO: Fecha sin formato ISO8601 completo
{
  "opening_date": "2024-01-15",  // ❌ Debe incluir hora y timezone
  "user_id": "uuid"
}

// ❌ INCORRECTO: Campos extra
{
  "opening_date": "2024-01-15T00:00:00.000Z",
  "user_id": "uuid",
  "balance": 0  // ❌ No está en el DTO
}
```

#### ✅ Ejemplo de Payload CORRECTO:

```json
{
  "opening_date": "2024-01-15T00:00:00.000Z",
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

## 📊 Matriz de Validación

| Endpoint | Campos DTO | Campos Extra | Fechas | Enums | Números | Status |
|----------|------------|--------------|--------|-------|---------|--------|
| POST /api/suppliers | ✅ | ❌ | N/A | ✅ | N/A | 201 |
| POST /api/works | ✅ | ❌ | ✅ YYYY-MM-DD | N/A | ✅ number | 201 |
| POST /api/cashboxes | ✅ | ❌ | ✅ ISO8601 | N/A | N/A | 201 |

---

## 🔍 Cómo Detectar Problemas

### Si el Status es 400:
1. **Revisar el Response Body** en la pestaña **Response**
2. Buscar mensajes como:
   - `"property X should not exist"` → Campo extra no permitido
   - `"X must be a string"` → Tipo incorrecto
   - `"X must be one of the following values"` → Enum incorrecto
   - `"X must be a valid ISO date"` → Formato de fecha incorrecto

### Si el Status es 422:
1. Revisar el Response Body para ver qué campos fallaron la validación
2. Verificar que los tipos sean correctos (string, number, etc.)

---

## ✅ Resultado Esperado

### Para cada endpoint:

- ✅ **Payload contiene SOLO campos del DTO**
- ✅ **No hay propiedades extra**
- ✅ **Fechas en formato correcto** (YYYY-MM-DD para works, ISO8601 para cashboxes)
- ✅ **Enums correctos** (case-sensitive, valores exactos)
- ✅ **Números como `number`** (no string)
- ✅ **Status 201 Created**

---

## 📝 Notas Finales

### Diferencias entre Endpoints:

1. **Suppliers**: Usa `name` (inglés), no `nombre`
2. **Works**: Usa `nombre` (español), fechas en `YYYY-MM-DD`
3. **Cashboxes**: Usa `opening_date` y `user_id` (snake_case), fecha en ISO8601 completo

### Validación Automática:

Las funciones de mapeo en `lib/payload-mappers.ts` garantizan que:
- Solo se incluyan campos del DTO
- Las fechas se formateen correctamente
- Los números se conviertan a `number`
- Los enums se validen antes de enviar

**Si la auditoría manual falla, revisar las funciones de mapeo.**

---

**Última actualización**: 2024-12-19

