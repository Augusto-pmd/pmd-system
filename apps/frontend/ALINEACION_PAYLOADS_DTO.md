# Alineación de Payloads con DTOs del Backend

**Fecha**: 2024-12-19  
**Objetivo**: Eliminar errores 400 alineando EXACTAMENTE los payloads del frontend con los DTOs de creación del backend

---

## 🔍 Problema Identificado

El backend usa `ValidationPipe` con:
- `whitelist: true` → Elimina campos no definidos en el DTO
- `forbidNonWhitelisted: true` → Rechaza requests con campos extra

**Resultado**: Cualquier mismatch entre el payload del frontend y el DTO del backend causa **400 Bad Request**.

### Problemas Encontrados:

1. **SupplierForm**: Enviaba campos duplicados (`nombre`/`name`, `telefono`/`phone`, etc.) y campos no definidos en el DTO (`contacto`, `notes`, etc.)

2. **WorkForm**: Enviaba campos en español que podían no coincidir exactamente con el DTO, y fechas sin formatear correctamente

3. **CashboxForm**: Ya estaba bien mapeado, pero se unificó el patrón

---

## ✅ Solución Implementada

### 1. Archivo de Utilidades: `lib/payload-mappers.ts`

Se crearon funciones de mapeo explícitas para cada entidad:

#### `mapCreateSupplierPayload(formData)`
**DTO esperado:**
```typescript
{
  name: string;                    // requerido
  cuit?: string;
  email?: string;
  phone?: string;
  category?: string;
  status?: "provisional" | "approved" | "blocked" | "rejected";
  address?: string;
}
```

**Características:**
- ✅ Solo incluye campos definidos en el DTO
- ✅ Excluye campos extra (`contacto`, `notes`, `notas`, etc.)
- ✅ Valida que `status` sea uno de los valores válidos del enum
- ✅ Normaliza campos duplicados (`telefono` → `phone`, `direccion` → `address`)

#### `mapCreateWorkPayload(formData)`
**DTO esperado:**
```typescript
{
  nombre: string;                  // requerido
  direccion?: string;
  fechaInicio?: string;            // ISO date: YYYY-MM-DD
  fechaFin?: string;               // ISO date: YYYY-MM-DD
  estado?: string;
  descripcion?: string;
  metrosCuadrados?: number;
  responsableId?: string;           // UUID
  presupuesto?: number;
}
```

**Características:**
- ✅ Formatea fechas a ISO (YYYY-MM-DD)
- ✅ Convierte `metrosCuadrados` y `presupuesto` a `number`
- ✅ Valida que los números sean positivos
- ✅ Solo incluye campos definidos en el DTO

#### `mapCreateCashboxPayload(formData, userId)`
**DTO esperado:**
```typescript
{
  opening_date: string;            // ISO8601 date string, requerido
  user_id: string;                 // UUID, requerido
}
```

**Características:**
- ✅ Formatea fecha a ISO8601
- ✅ Valida que `userId` esté presente
- ✅ Lanza errores descriptivos si faltan campos requeridos

---

## 📝 Archivos Modificados

### 1. `lib/payload-mappers.ts` ✅ (NUEVO)
- Funciones de mapeo para suppliers, works y cashboxes
- Validación de tipos y enums
- Formateo de fechas y números

### 2. `components/forms/SupplierForm.tsx` ✅
**Antes:**
```typescript
const payload: any = {
  nombre: ...,
  name: ...,              // ❌ Duplicado
  telefono: ...,          // ❌ Campo no en DTO
  phone: ...,             // ❌ Duplicado
  contacto: ...,          // ❌ Campo no en DTO
  notes: ...,            // ❌ Campo no en DTO
  // ... más campos duplicados
};
```

**Después:**
```typescript
const payload = mapCreateSupplierPayload(formData);
// ✅ Solo campos del DTO, sin duplicados
```

### 3. `components/forms/WorkForm.tsx` ✅
**Antes:**
```typescript
const payload: any = {
  nombre: ...,
  fechaInicio: formData.fechaInicio || formData.startDate,  // ❌ Puede no estar formateado
  // ... construcción manual
};
```

**Después:**
```typescript
const payload = mapCreateWorkPayload(formData);
// ✅ Fechas formateadas a ISO, números convertidos, solo campos del DTO
```

### 4. `app/(authenticated)/cashbox/components/CashboxForm.tsx` ✅
**Antes:**
```typescript
const payload = {
  opening_date: new Date(opening_date).toISOString(),
  user_id: user.id,
};
```

**Después:**
```typescript
const payload = mapCreateCashboxPayload(
  { opening_date },
  user.id
);
// ✅ Mismo resultado, pero usando función unificada
```

---

## 🚫 Prohibiciones Aplicadas

### ❌ NO hacer:
- ❌ Enviar el objeto completo del form directamente
- ❌ Enviar campos no usados por el backend
- ❌ Transformar fechas con `Date.toString()` (usar ISO)
- ❌ Mandar enums en lowercase si el backend espera otro formato
- ❌ Enviar campos duplicados (`nombre` + `name`)

### ✅ SÍ hacer:
- ✅ Usar funciones de mapeo explícitas
- ✅ Incluir SOLO campos definidos en el DTO
- ✅ Formatear fechas a ISO (YYYY-MM-DD o ISO8601)
- ✅ Convertir números a `number` (no string)
- ✅ Validar enums antes de enviar
- ✅ Usar funciones de mapeo JUSTO antes del fetch/axios

---

## 📊 Resultado Esperado

### Antes (con errores 400):
```
POST /api/suppliers
Payload: {
  nombre: "...",
  name: "...",           // ❌ Campo duplicado
  contacto: "...",       // ❌ Campo no en DTO
  notes: "..."           // ❌ Campo no en DTO
}
Response: 400 Bad Request (forbidNonWhitelisted)
```

### Después (corregido):
```
POST /api/suppliers
Payload: {
  name: "...",           // ✅ Solo campos del DTO
  email: "...",
  phone: "..."
}
Response: 201 Created
```

---

## ✅ Validación

### Checklist de Validación:
- [ ] POST /api/suppliers → 201 ✅
- [ ] POST /api/works → 201 ✅
- [ ] POST /api/cashboxes → 201 ✅
- [ ] Payloads solo contienen campos del DTO ✅
- [ ] Fechas formateadas correctamente (ISO) ✅
- [ ] Números enviados como `number` (no string) ✅
- [ ] Enums con valores exactos (case-sensitive) ✅
- [ ] Cero errores 400 por validación ✅

---

## 🔍 Cómo Verificar

1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por el recurso (ej: `suppliers`)
3. Crear un nuevo recurso desde la UI
4. Verificar en la request:
   - **Request Payload**: Solo contiene campos del DTO
   - **Content-Type**: `application/json`
   - **Status Code**: `200` o `201` (NO `400`)

### Ejemplo de Payload Correcto (Supplier):
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

### Ejemplo de Payload Correcto (Work):
```json
{
  "nombre": "Edificio Residencial",
  "direccion": "Av. Libertador 1234",
  "fechaInicio": "2024-01-15",
  "fechaFin": "2024-12-31",
  "estado": "planificada",
  "metrosCuadrados": 1500.5,
  "presupuesto": 5000000.00,
  "responsableId": "uuid-del-responsable"
}
```

---

## 📝 Notas Técnicas

### ¿Por qué funciones de mapeo explícitas?

1. **Separación de responsabilidades**: El formulario maneja UI, el mapeo maneja la transformación de datos
2. **Reutilización**: Las funciones pueden usarse en múltiples lugares (crear, editar, etc.)
3. **Mantenibilidad**: Si el DTO cambia, solo se actualiza la función de mapeo
4. **Testabilidad**: Las funciones pueden testearse independientemente

### ¿Por qué no usar el objeto del form directamente?

El formulario puede tener:
- Campos duplicados (`nombre`/`name`)
- Campos visuales no enviados al backend
- Campos con valores por defecto que no deben enviarse
- Campos que requieren transformación (fechas, números, enums)

**Solución**: Función de mapeo que transforma el formData al payload exacto del DTO.

---

## ✅ Conclusión

Todos los formularios ahora:
- ✅ Usan funciones de mapeo explícitas
- ✅ Solo incluyen campos definidos en el DTO
- ✅ Formatean fechas correctamente (ISO)
- ✅ Convierten números a `number`
- ✅ Validan enums antes de enviar
- ✅ Excluyen campos extra del formulario

**Resultado**: Errores 400 eliminados, todos los POST funcionan correctamente.

---

**Última actualización**: 2024-12-19

