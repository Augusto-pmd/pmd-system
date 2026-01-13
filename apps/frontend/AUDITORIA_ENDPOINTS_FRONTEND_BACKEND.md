# Auditoría de Endpoints: Frontend vs Backend PMD

## Objetivo
Alinear el frontend con los endpoints reales del backend PMD, identificando y corrigiendo discrepancias en paths y métodos HTTP.

---

## 1. ENDPOINTS DEL FRONTEND (Route Handlers)

### Route Handlers Existentes en `app/api/`

| Recurso | Archivo | Métodos Implementados | Path Forward |
|---------|---------|------------------------|--------------|
| users | `app/api/users/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/users` |
| works | `app/api/works/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/works` |
| expenses | `app/api/expenses/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/expenses` |
| incomes | `app/api/incomes/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/incomes` |
| contracts | `app/api/contracts/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/contracts` |
| suppliers | `app/api/suppliers/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/suppliers` |
| alerts | `app/api/alerts/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/alerts` |
| accounting | `app/api/accounting/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/accounting` |
| cashboxes | `app/api/cashboxes/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/cashboxes` |
| documents | `app/api/documents/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/documents` |
| work-documents | `app/api/work-documents/route.ts` | GET, POST, PATCH, DELETE | `${BACKEND_URL}/work-documents` |
| auth/login | `app/api/auth/login/route.ts` | POST | `${BACKEND_URL}/auth/login` |

### Route Handlers FALTANTES

| Recurso | Usado en Frontend | Estado | Acción Requerida |
|---------|-------------------|--------|------------------|
| **roles** | `hooks/api/roles.ts` | ❌ NO EXISTE | Crear `app/api/roles/route.ts` |
| **cash-movements** | `hooks/api/cashboxes.ts` | ❌ NO EXISTE | Crear `app/api/cash-movements/route.ts` |
| **users/me** | `lib/services/authService.ts` | ❌ NO EXISTE | Crear `app/api/users/me/route.ts` |
| **auth/refresh** | `lib/services/authService.ts` | ❌ NO EXISTE | Crear `app/api/auth/refresh/route.ts` |

---

## 2. ENDPOINTS USADOS EN HOOKS Y SERVICIOS

### Hooks API (`hooks/api/`)

| Hook | Endpoint Usado | Método HTTP | Route Handler Existe? |
|------|----------------|-------------|----------------------|
| `roles.ts` | `/roles` | GET | ❌ NO |
| `roles.ts` | `/roles/:id` | GET | ❌ NO |
| `roles.ts` | `/roles/:id/permissions` | GET | ❌ NO |
| `roles.ts` | `/roles` | POST | ❌ NO |
| `roles.ts` | `/roles/:id` | PUT | ❌ NO |
| `roles.ts` | `/roles/:id` | DELETE | ❌ NO |
| `roles.ts` | `/roles/:id/permissions` | PATCH | ❌ NO |
| `works.ts` | `/works` | GET | ✅ SÍ |
| `works.ts` | `/works/:id` | GET | ❌ NO (falta [id]) |
| `works.ts` | `/works` | POST | ✅ SÍ |
| `works.ts` | `/works/:id` | PUT | ⚠️ PARCIAL (route usa PATCH) |
| `works.ts` | `/works/:id` | DELETE | ⚠️ PARCIAL (route usa DELETE sin [id]) |
| `cashboxes.ts` | `/cashboxes` | GET | ✅ SÍ |
| `cashboxes.ts` | `/cashboxes/:id` | GET | ❌ NO (falta [id]) |
| `cashboxes.ts` | `/cashboxes` | POST | ✅ SÍ |
| `cashboxes.ts` | `/cashboxes/:id` | PUT | ⚠️ PARCIAL (route usa PATCH) |
| `cashboxes.ts` | `/cashboxes/:id` | DELETE | ⚠️ PARCIAL (route usa DELETE sin [id]) |
| `cashboxes.ts` | `/cash-movements` | GET | ❌ NO |
| `cashboxes.ts` | `/cash-movements/:id` | GET | ❌ NO |
| `cashboxes.ts` | `/cash-movements` | POST | ❌ NO |
| `cashboxes.ts` | `/cash-movements/:id` | PUT | ❌ NO |
| `cashboxes.ts` | `/cash-movements/:id` | DELETE | ❌ NO |
| `users.ts` | `/users` | GET | ✅ SÍ |
| `users.ts` | `/users/:id` | GET | ❌ NO (falta [id]) |
| `users.ts` | `/users/:id/role` | GET | ❌ NO |
| `users.ts` | `/users` | POST | ✅ SÍ |
| `users.ts` | `/users/:id` | PUT | ⚠️ PARCIAL (route usa PATCH) |
| `users.ts` | `/users/:id` | DELETE | ⚠️ PARCIAL (route usa DELETE sin [id]) |
| `users.ts` | `/users/:id/role` | PATCH | ❌ NO |

### Servicios (`lib/services/`)

| Servicio | Endpoint Usado | Método HTTP | Route Handler Existe? |
|----------|----------------|-------------|----------------------|
| `authService.ts` | `/api/auth/login` | POST | ✅ SÍ |
| `authService.ts` | `/api/auth/refresh` | POST | ❌ NO |
| `authService.ts` | `/api/users/me` | GET | ❌ NO |

---

## 3. PROBLEMAS IDENTIFICADOS

### ❌ 404 - Path Incorrecto o Faltante

| Endpoint Frontend | Método | Problema | Corrección Requerida |
|-------------------|--------|----------|---------------------|
| `/api/roles` | GET, POST | Route handler no existe | Crear `app/api/roles/route.ts` |
| `/api/roles/:id` | GET, PUT, DELETE | Route handler no existe | Crear `app/api/roles/[id]/route.ts` |
| `/api/roles/:id/permissions` | GET, PATCH | Route handler no existe | Crear `app/api/roles/[id]/permissions/route.ts` |
| `/api/cash-movements` | GET, POST | Route handler no existe | Crear `app/api/cash-movements/route.ts` |
| `/api/cash-movements/:id` | GET, PUT, DELETE | Route handler no existe | Crear `app/api/cash-movements/[id]/route.ts` |
| `/api/users/me` | GET | Route handler no existe | Crear `app/api/users/me/route.ts` |
| `/api/users/:id` | GET, PUT, DELETE | Route handler no existe | Crear `app/api/users/[id]/route.ts` |
| `/api/users/:id/role` | GET, PATCH | Route handler no existe | Crear `app/api/users/[id]/role/route.ts` |
| `/api/works/:id` | GET, PUT, DELETE | Route handler no existe | Crear `app/api/works/[id]/route.ts` |
| `/api/cashboxes/:id` | GET, PUT, DELETE | Route handler no existe | Crear `app/api/cashboxes/[id]/route.ts` |
| `/api/auth/refresh` | POST | Route handler no existe | Crear `app/api/auth/refresh/route.ts` |

### ⚠️ 405 - Método HTTP Incorrecto

| Endpoint Frontend | Método Frontend | Método Route Handler | Problema | Corrección |
|-------------------|-----------------|---------------------|----------|------------|
| `/api/works/:id` | PUT | PATCH | Hook usa PUT, route usa PATCH | Cambiar route handler a PUT o cambiar hook a PATCH |
| `/api/users/:id` | PUT | PATCH | Hook usa PUT, route usa PATCH | Cambiar route handler a PUT o cambiar hook a PATCH |
| `/api/cashboxes/:id` | PUT | PATCH | Hook usa PUT, route usa PATCH | Cambiar route handler a PUT o cambiar hook a PATCH |

### ⚠️ 403 - Permiso Requerido (No es problema de path/método)

Estos endpoints requieren permisos específicos en el backend. El frontend está correcto, pero el usuario debe tener los permisos adecuados.

---

## 4. CORRECCIONES PROPUESTAS (SOLO FRONTEND)

### 4.1 Crear Route Handlers Faltantes

#### A. `app/api/roles/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/roles`, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : [];
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES GET ERROR]", error);
    return NextResponse.json({ error: "Roles fetch failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(`${BACKEND_URL}/roles`, {
      method: "POST",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES POST ERROR]", error);
    return NextResponse.json({ error: "Role create failed" }, { status: 500 });
  }
}
```

#### B. `app/api/roles/[id]/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/roles/${params.id}`, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES GET BY ID ERROR]", error);
    return NextResponse.json({ error: "Role fetch failed" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(`${BACKEND_URL}/roles/${params.id}`, {
      method: "PUT",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES PUT ERROR]", error);
    return NextResponse.json({ error: "Role update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/roles/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES DELETE ERROR]", error);
    return NextResponse.json({ error: "Role delete failed" }, { status: 500 });
  }
}
```

#### C. `app/api/roles/[id]/permissions/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/roles/${params.id}/permissions`, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : [];
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES PERMISSIONS GET ERROR]", error);
    return NextResponse.json({ error: "Permissions fetch failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(`${BACKEND_URL}/roles/${params.id}/permissions`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API ROLES PERMISSIONS PATCH ERROR]", error);
    return NextResponse.json({ error: "Permissions update failed" }, { status: 500 });
  }
}
```

#### D. `app/api/cash-movements/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const cashboxId = searchParams.get("cashboxId");
    
    let url = `${BACKEND_URL}/cash-movements`;
    if (cashboxId) {
      url += `?cashboxId=${encodeURIComponent(cashboxId)}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    
    const text = await response.text();
    const data = text ? JSON.parse(text) : [];
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASH-MOVEMENTS GET ERROR]", error);
    return NextResponse.json({ error: "Cash movements fetch failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(`${BACKEND_URL}/cash-movements`, {
      method: "POST",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASH-MOVEMENTS POST ERROR]", error);
    return NextResponse.json({ error: "Cash movement create failed" }, { status: 500 });
  }
}
```

#### E. `app/api/cash-movements/[id]/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/cash-movements/${params.id}`, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASH-MOVEMENTS GET BY ID ERROR]", error);
    return NextResponse.json({ error: "Cash movement fetch failed" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(`${BACKEND_URL}/cash-movements/${params.id}`, {
      method: "PUT",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASH-MOVEMENTS PUT ERROR]", error);
    return NextResponse.json({ error: "Cash movement update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/cash-movements/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASH-MOVEMENTS DELETE ERROR]", error);
    return NextResponse.json({ error: "Cash movement delete failed" }, { status: 500 });
  }
}
```

#### F. `app/api/users/me/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/users/me`, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API USERS ME ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener el usuario", message: errorText },
        { status: response.status }
      );
    }
    
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS ME GET ERROR]", error);
    return NextResponse.json({ error: "User fetch failed" }, { status: 500 });
  }
}
```

#### G. `app/api/users/[id]/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/users/${params.id}`, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS GET BY ID ERROR]", error);
    return NextResponse.json({ error: "User fetch failed" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(`${BACKEND_URL}/users/${params.id}`, {
      method: "PUT",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS PUT ERROR]", error);
    return NextResponse.json({ error: "User update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/users/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS DELETE ERROR]", error);
    return NextResponse.json({ error: "User delete failed" }, { status: 500 });
  }
}
```

#### H. `app/api/users/[id]/role/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/users/${params.id}/role`, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS ROLE GET ERROR]", error);
    return NextResponse.json({ error: "User role fetch failed" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(`${BACKEND_URL}/users/${params.id}/role`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS ROLE PATCH ERROR]", error);
    return NextResponse.json({ error: "User role update failed" }, { status: 500 });
  }
}
```

#### I. `app/api/works/[id]/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/works/${params.id}`, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API WORKS GET BY ID ERROR]", error);
    return NextResponse.json({ error: "Work fetch failed" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(`${BACKEND_URL}/works/${params.id}`, {
      method: "PUT",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API WORKS PUT ERROR]", error);
    return NextResponse.json({ error: "Work update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/works/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API WORKS DELETE ERROR]", error);
    return NextResponse.json({ error: "Work delete failed" }, { status: 500 });
  }
}
```

#### J. `app/api/cashboxes/[id]/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/cashboxes/${params.id}`, {
      method: "GET",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASHBOXES GET BY ID ERROR]", error);
    return NextResponse.json({ error: "Cashbox fetch failed" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    const response = await fetch(`${BACKEND_URL}/cashboxes/${params.id}`, {
      method: "PUT",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASHBOXES PUT ERROR]", error);
    return NextResponse.json({ error: "Cashbox update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/cashboxes/${params.id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader ?? "" },
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASHBOXES DELETE ERROR]", error);
    return NextResponse.json({ error: "Cashbox delete failed" }, { status: 500 });
  }
}
```

#### K. `app/api/auth/refresh/route.ts`
```typescript
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();
    
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });
    
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API AUTH REFRESH ERROR]", error);
    return NextResponse.json({ error: "Token refresh failed" }, { status: 500 });
  }
}
```

### 4.2 Corregir Métodos HTTP en Route Handlers Existentes

#### A. `app/api/works/route.ts`
**Cambio:** Reemplazar `PATCH` por `PUT` para updates (o mantener PATCH y cambiar hooks)

**Opción 1 (Recomendada):** Mantener PATCH en route handler y cambiar hooks a PATCH
**Opción 2:** Cambiar route handler a PUT

#### B. `app/api/users/route.ts`
**Cambio:** Reemplazar `PATCH` por `PUT` para updates (o mantener PATCH y cambiar hooks)

**Opción 1 (Recomendada):** Mantener PATCH en route handler y cambiar hooks a PATCH
**Opción 2:** Cambiar route handler a PUT

#### C. `app/api/cashboxes/route.ts`
**Cambio:** Reemplazar `PATCH` por `PUT` para updates (o mantener PATCH y cambiar hooks)

**Opción 1 (Recomendada):** Mantener PATCH en route handler y cambiar hooks a PATCH
**Opción 2:** Cambiar route handler a PUT

---

## 5. RESUMEN DE CORRECCIONES

### Archivos a Crear (11 archivos nuevos)

1. ✅ `app/api/roles/route.ts`
2. ✅ `app/api/roles/[id]/route.ts`
3. ✅ `app/api/roles/[id]/permissions/route.ts`
4. ✅ `app/api/cash-movements/route.ts`
5. ✅ `app/api/cash-movements/[id]/route.ts`
6. ✅ `app/api/users/me/route.ts`
7. ✅ `app/api/users/[id]/route.ts`
8. ✅ `app/api/users/[id]/role/route.ts`
9. ✅ `app/api/works/[id]/route.ts`
10. ✅ `app/api/cashboxes/[id]/route.ts`
11. ✅ `app/api/auth/refresh/route.ts`

### Archivos a Modificar (3 archivos)

1. ⚠️ `app/api/works/route.ts` - Decidir entre PUT o PATCH
2. ⚠️ `app/api/users/route.ts` - Decidir entre PUT o PATCH
3. ⚠️ `app/api/cashboxes/route.ts` - Decidir entre PUT o PATCH

### Hooks a Modificar (Opcional - si se decide usar PATCH)

1. ⚠️ `hooks/api/works.ts` - Cambiar PUT a PATCH
2. ⚠️ `hooks/api/users.ts` - Cambiar PUT a PATCH
3. ⚠️ `hooks/api/cashboxes.ts` - Cambiar PUT a PATCH

---

## 6. TABLA COMPARATIVA FINAL

| Endpoint Frontend | Método | Route Handler | Estado | Acción |
|-------------------|--------|---------------|--------|--------|
| `/api/roles` | GET, POST | ❌ NO EXISTE | 404 | Crear |
| `/api/roles/:id` | GET, PUT, DELETE | ❌ NO EXISTE | 404 | Crear |
| `/api/roles/:id/permissions` | GET, PATCH | ❌ NO EXISTE | 404 | Crear |
| `/api/cash-movements` | GET, POST | ❌ NO EXISTE | 404 | Crear |
| `/api/cash-movements/:id` | GET, PUT, DELETE | ❌ NO EXISTE | 404 | Crear |
| `/api/users/me` | GET | ❌ NO EXISTE | 404 | Crear |
| `/api/users/:id` | GET, PUT, DELETE | ❌ NO EXISTE | 404 | Crear |
| `/api/users/:id/role` | GET, PATCH | ❌ NO EXISTE | 404 | Crear |
| `/api/works/:id` | GET, PUT, DELETE | ❌ NO EXISTE | 404 | Crear |
| `/api/cashboxes/:id` | GET, PUT, DELETE | ❌ NO EXISTE | 404 | Crear |
| `/api/auth/refresh` | POST | ❌ NO EXISTE | 404 | Crear |
| `/api/works/:id` | PUT | ⚠️ PATCH en route | 405 | Alinear |
| `/api/users/:id` | PUT | ⚠️ PATCH en route | 405 | Alinear |
| `/api/cashboxes/:id` | PUT | ⚠️ PATCH en route | 405 | Alinear |

---

## 7. NOTAS IMPORTANTES

1. **No modificar backend:** Todas las correcciones son solo en el frontend.
2. **No agregar endpoints:** Solo crear route handlers que forwardean a endpoints existentes del backend.
3. **No cambiar guards:** Los permisos se manejan en el backend.
4. **No relajar permisos:** Si hay 403, es porque el usuario no tiene permisos (no es un bug del frontend).

---

## 8. PRÓXIMOS PASOS

1. Crear los 11 route handlers faltantes
2. Decidir si usar PUT o PATCH para updates (recomendado: PATCH)
3. Si se decide PATCH, actualizar hooks para usar PATCH en lugar de PUT
4. Probar cada endpoint después de crear el route handler
5. Verificar que no haya más errores 404 o 405

