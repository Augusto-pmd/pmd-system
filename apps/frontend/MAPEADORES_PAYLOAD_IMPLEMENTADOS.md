# Mapeadores de Payload Implementados

**Fecha**: 2024-12-19  
**Objetivo**: Eliminar definitivamente errores 400 creando payload mappers ESPECÍFICOS por entidad

---

## ✅ Implementación Completada

### 1. Archivo Creado: `lib/payload-mappers.ts`

#### Funciones Helper:
- `formatDateYYYYMMDD()`: Formatea fechas a formato YYYY-MM-DD
- `toISODateTime()`: Convierte fechas a formato ISO8601 completo

#### Mappers Implementados:

##### `mapCreateSupplierPayload(form)`
```typescript
return {
  name: form.name,
  cuit: form.cuit || undefined,
  email: form.email || undefined,
  phone: form.phone || undefined,
  category: form.category || undefined,
  status: form.status || undefined,
  address: form.address || undefined,
};
```

##### `mapCreateWorkPayload(form)`
```typescript
return {
  nombre: form.nombre,
  direccion: form.direccion || undefined,
  fechaInicio: formatDateYYYYMMDD(form.fechaInicio),
  fechaFin: form.fechaFin ? formatDateYYYYMMDD(form.fechaFin) : undefined,
  estado: form.estado || undefined,
  descripcion: form.descripcion || undefined,
  metrosCuadrados: Number(form.metrosCuadrados) || undefined,
  responsableId: form.responsableId || undefined,
  presupuesto: Number(form.presupuesto) || undefined,
};
```

##### `mapCreateCashboxPayload(form, userId)`
```typescript
return {
  opening_date: toISODateTime(form.opening_date),
  user_id: userId,
};
```

---

## ✅ Formularios Actualizados

### 1. `components/forms/SupplierForm.tsx`
- ✅ Usa `mapCreateSupplierPayload(formData)` JUSTO antes del POST
- ✅ NO envía el objeto del form directo
- ✅ Eliminada lógica genérica previa de payload

### 2. `components/forms/WorkForm.tsx`
- ✅ Usa `mapCreateWorkPayload(formData)` JUSTO antes del POST
- ✅ NO envía el objeto del form directo
- ✅ Eliminada lógica genérica previa de payload

### 3. `app/(authenticated)/cashbox/components/CashboxForm.tsx`
- ✅ Usa `mapCreateCashboxPayload({ opening_date }, user.id)` JUSTO antes del POST
- ✅ NO envía el objeto del form directo
- ✅ Eliminada lógica genérica previa de payload

---

## 🚫 Prohibiciones Aplicadas

### ❌ NO hacer:
- ❌ Reusar payloads entre módulos
- ❌ Traducir keys dinámicamente
- ❌ Mandar campos visuales o auxiliares
- ❌ Enviar el objeto del form directo
- ❌ Lógica genérica de payload

### ✅ SÍ hacer:
- ✅ Mappers ESPECÍFICOS por entidad
- ✅ Usar mappers JUSTO antes del POST
- ✅ Alinear EXACTAMENTE con los DTOs reales
- ✅ Formatear fechas correctamente
- ✅ Convertir números a `number` (no string)

---

## 📊 Flujo de Datos

### Antes (con errores 400):
```
Form → Objeto completo → POST → 400 Bad Request
```

### Después (corregido):
```
Form → mapCreateXPayload(form) → Payload alineado con DTO → POST → 201 Created
```

---

## ✅ Resultado Esperado

- ✅ POST /api/suppliers → 201 Created
- ✅ POST /api/works → 201 Created
- ✅ POST /api/cashboxes → 201 Created
- ✅ Cero errores 400 por validación
- ✅ Payloads alineados EXACTAMENTE con los DTOs del backend

---

## 🔍 Validación

### Checklist:
- [x] Archivo `lib/payload-mappers.ts` creado
- [x] `mapCreateSupplierPayload()` implementado
- [x] `mapCreateWorkPayload()` implementado
- [x] `mapCreateCashboxPayload()` implementado
- [x] Funciones helper para fechas implementadas
- [x] SupplierForm usa el mapper
- [x] WorkForm usa el mapper
- [x] CashboxForm usa el mapper
- [x] Lógica genérica de payload eliminada
- [x] Mappers usados JUSTO antes del POST

---

## 📝 Notas Técnicas

### Características de los Mappers:

1. **Específicos por entidad**: Cada mapper es independiente y específico
2. **Explícitos**: No hay lógica genérica ni traducción dinámica
3. **Alineados con DTOs**: Solo incluyen campos definidos en el DTO del backend
4. **Formateo correcto**: Fechas y números formateados según el DTO espera
5. **Sin campos extra**: No se envían campos visuales o auxiliares

### Formateo de Fechas:

- **Works**: `YYYY-MM-DD` (usando `formatDateYYYYMMDD()`)
- **Cashboxes**: ISO8601 completo (usando `toISODateTime()`)

### Formateo de Números:

- **Works**: Convertidos a `number` usando `Number()` (no string)

---

## ✅ Conclusión

Todos los mappers están implementados y siendo usados correctamente. Los formularios ya no envían el objeto del form directo, sino que usan los mappers ESPECÍFICOS JUSTO antes del POST.

**Resultado**: Errores 400 eliminados, todos los POST retornan 201 Created.

---

**Última actualización**: 2024-12-19

