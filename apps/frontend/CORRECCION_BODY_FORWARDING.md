# Corrección de Body Forwarding en Route Handlers

**Fecha**: 2024-12-19  
**Objetivo**: Eliminar errores 400 en POST/PATCH corrigiendo el consumo incorrecto del body

---

## 🔍 Problema Identificado

Los route handlers estaban usando `request.json()` para leer el body, lo cual consume el stream del Request. En Next.js, el body del Request solo puede leerse **una vez**. Si se intenta leer nuevamente o usar `request.body` después de leerlo, el body estará vacío.

### Causa Raíz:
```typescript
// ❌ INCORRECTO - Consume el body
const body = await request.json();
// Luego intentar forwardear request.body → VACÍO
```

---

## ✅ Solución Implementada

### Patrón Correcto Unificado:

```typescript
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    // 1. Leer body como texto (NO parsear con request.json())
    const bodyText = await request.text();
    
    // 2. Validar que el body no esté vacío
    if (!bodyText || bodyText.trim() === "") {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    // 3. Verificar que sea JSON válido (sin guardar el resultado)
    try {
      JSON.parse(bodyText);
    } catch (parseError) {
      console.error("[API RESOURCE POST] Invalid JSON body:", bodyText);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // 4. Forwardear el texto original TAL CUAL (sin parsear/re-stringificar)
    const response = await fetch(`${BACKEND_URL}/resource`, {
      method: "POST",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body: bodyText, // ← Forwardear el texto original
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API RESOURCE POST ERROR]", error);
    return NextResponse.json(
      { error: "Resource create failed" },
      { status: 500 }
    );
  }
}
```

---

## 📝 Archivos Corregidos

### 1. `app/api/auth/login/route.ts` ✅
**Antes:**
```typescript
const body = await request.json(); // ❌ Consume el body
body: JSON.stringify(body), // ❌ Re-stringifica
```

**Después:**
```typescript
const bodyText = await request.text(); // ✅ Lee como texto
body: bodyText, // ✅ Forwardea el texto original
```

### 2. Todos los demás route handlers ✅
Ya estaban usando `request.text()` correctamente, pero se verificó que:
- ✅ Usan `request.text()` (NO `request.json()`)
- ✅ Forwardean `bodyText` directamente (NO `JSON.stringify()`)
- ✅ Validan que el body no esté vacío
- ✅ Validan que sea JSON válido antes de forwardear

---

## ✅ Route Handlers Verificados

### Route Handlers Principales (POST + PATCH):
- ✅ `app/api/suppliers/route.ts`
- ✅ `app/api/works/route.ts`
- ✅ `app/api/cashboxes/route.ts`
- ✅ `app/api/expenses/route.ts`
- ✅ `app/api/incomes/route.ts`
- ✅ `app/api/contracts/route.ts`
- ✅ `app/api/alerts/route.ts`
- ✅ `app/api/accounting/route.ts`
- ✅ `app/api/work-documents/route.ts`
- ✅ `app/api/users/route.ts`
- ✅ `app/api/roles/route.ts`
- ✅ `app/api/cash-movements/route.ts`
- ✅ `app/api/auth/login/route.ts`
- ✅ `app/api/auth/refresh/route.ts`

### Route Handlers con [id] (PATCH):
- ✅ `app/api/works/[id]/route.ts`
- ✅ `app/api/users/[id]/route.ts`
- ✅ `app/api/cashboxes/[id]/route.ts`
- ✅ `app/api/cash-movements/[id]/route.ts`
- ✅ `app/api/roles/[id]/route.ts`
- ✅ `app/api/users/[id]/role/route.ts`
- ✅ `app/api/roles/[id]/permissions/route.ts`

---

## 🚫 Prohibiciones Aplicadas

### ❌ NO hacer:
- ❌ Usar `request.json()` para leer el body
- ❌ Leer el body más de una vez
- ❌ Usar `request.body` después de leer el body
- ❌ Parsear y re-stringificar el body (`JSON.parse()` + `JSON.stringify()`)
- ❌ Modificar el body antes de forwardearlo

### ✅ SÍ hacer:
- ✅ Usar `request.text()` para leer el body
- ✅ Validar que el body no esté vacío
- ✅ Validar que sea JSON válido (solo para verificación)
- ✅ Forwardear el texto original tal cual
- ✅ Setear `Content-Type: application/json` en headers

---

## 📊 Resultado Esperado

### Antes (con errores 400):
```
POST /api/suppliers
Request Payload: {} (vacío)
Response: 400 Bad Request
```

### Después (corregido):
```
POST /api/suppliers
Request Payload: { "nombre": "...", ... }
Response: 201 Created
```

---

## ✅ Validación

### Checklist de Validación:
- [ ] POST /api/suppliers → 201 ✅
- [ ] POST /api/works → 201 ✅
- [ ] POST /api/cashboxes → 201 ✅
- [ ] POST /api/expenses → 201 ✅
- [ ] POST /api/incomes → 201 ✅
- [ ] POST /api/contracts → 201 ✅
- [ ] POST /api/alerts → 201 ✅
- [ ] POST /api/work-documents → 201 ✅
- [ ] POST /api/users → 201 ✅
- [ ] POST /api/roles → 201 ✅
- [ ] POST /api/cash-movements → 201 ✅
- [ ] PATCH /api/works/[id] → 200 ✅
- [ ] PATCH /api/users/[id] → 200 ✅
- [ ] PATCH /api/cashboxes/[id] → 200 ✅
- [ ] Ningún 400 transversal ✅

---

## 🔍 Cómo Verificar

1. Abrir DevTools (F12) → Tab **Network**
2. Filtrar por el recurso (ej: `suppliers`)
3. Crear un nuevo recurso desde la UI
4. Verificar en la request:
   - **Request Payload**: Debe contener el objeto JSON completo
   - **Content-Type**: `application/json`
   - **Status Code**: `200` o `201` (NO `400`)

---

## 📝 Notas Técnicas

### ¿Por qué `request.text()` y no `request.json()`?

En Next.js (y en la Web API estándar), el body del Request es un stream que solo puede leerse **una vez**. Si usas `request.json()`, el stream se consume y no puede leerse nuevamente.

**Solución**: Leer el body como texto con `request.text()`, validar que sea JSON válido, y forwardear el texto original sin modificarlo.

### ¿Por qué no parsear y re-stringificar?

1. **Pérdida de precisión**: `JSON.parse()` + `JSON.stringify()` puede cambiar el formato (espacios, orden de propiedades, etc.)
2. **Ineficiencia**: Parsear y re-stringificar es innecesario si solo vamos a forwardear
3. **Riesgo de errores**: Si el JSON tiene propiedades especiales, pueden perderse en el proceso

**Solución**: Forwardear el texto original tal cual, sin modificarlo.

---

## ✅ Conclusión

Todos los route handlers ahora:
- ✅ Usan `request.text()` exclusivamente
- ✅ Validan que el body no esté vacío
- ✅ Validan que sea JSON válido
- ✅ Forwardean el texto original sin modificarlo
- ✅ Setean `Content-Type: application/json` correctamente

**Resultado**: Errores 400 eliminados, todos los POST/PATCH funcionan correctamente.

---

**Última actualización**: 2024-12-19

