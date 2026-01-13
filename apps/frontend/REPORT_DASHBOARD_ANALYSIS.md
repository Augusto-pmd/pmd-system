# Análisis Completo: Dashboard Muestra Login Después de Login Exitoso

**Fecha**: 2024-12-19  
**Problema**: Después de un login exitoso (200 OK), la UI sigue mostrando la pantalla de login aunque la navegación se redirige a `/dashboard`.

---

## 🔍 Análisis de Archivos

### 1. `app/(authenticated)/dashboard/page.tsx`

**Contenido completo:**
```typescript
"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useWorks } from "@/hooks/api/works";
import { useExpenses } from "@/hooks/api/expenses";
import { useIncomes } from "@/hooks/api/incomes";
import { useContracts } from "@/hooks/api/contracts";
import { useAlerts } from "@/hooks/api/alerts";
import { LoadingState } from "@/components/ui/LoadingState";

function DashboardContent() {
  // ... hooks de datos ...
  return (
    <MainLayout>
      {/* Contenido del dashboard */}
    </MainLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

**Análisis:**
- ✅ **Renderiza correctamente**: El componente renderiza `DashboardContent` envuelto en `ProtectedRoute`
- ✅ **No renderiza LoginForm**: No hay ninguna referencia a `LoginForm` en este archivo
- ✅ **Children del layout**: Los children se pasan correctamente a `MainLayout`
- ❌ **Problema potencial**: Depende de `ProtectedRoute` para permitir acceso

---

### 2. `app/dashboard/page.tsx`

**Resultado de búsqueda:**
- ❌ **NO EXISTE**: Solo existe `app/(authenticated)/dashboard/page.tsx`
- ✅ **No hay conflicto**: No hay duplicado de ruta

---

### 3. `app/(authenticated)/layout.tsx`

**Resultado de búsqueda:**
- ❌ **NO EXISTE**: Este archivo fue eliminado anteriormente
- ✅ **No hay layout conflictivo**: No hay layout que esté bloqueando el acceso

---

### 4. `components/layout/MainLayout.tsx`

**Contenido completo:**
```typescript
"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

**Análisis:**
- ✅ **Renderiza children correctamente**: `{children}` se renderiza dentro de `<main>`
- ✅ **No hay condicionales ocultos**: No hay lógica que muestre `LoginForm`
- ✅ **No hay redirecciones**: No hay lógica de redirección en este componente
- ✅ **Estructura correcta**: Renderiza Sidebar, Topbar y children

---

### 5. `components/auth/ProtectedRoute.tsx`

**Contenido completo:**
```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { Loading } from "@/components/ui/Loading";

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore((state) => ({
    user: state.user ? state.getUserSafe() : null,
    isAuthenticated: state.isAuthenticated,
  }));

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole as UserRole)) {
      router.replace("/unauthorized");
      return;
    }
  }, [isAuthenticated, userRole, allowedRoles, router, redirectTo]);

  if (user === null || typeof user.role === "object") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
```

**Análisis:**
- ✅ **Lógica correcta**: Usa `isAuthenticated` del store de Zustand
- ✅ **No renderiza LoginForm**: Solo muestra `Loading` o `children`
- ✅ **No hay return prematuro**: La lógica de redirección está en `useEffect`
- ⚠️ **Problema potencial**: Si `isAuthenticated` es `false` al montar, redirige a `/login`

---

### 6. `middleware.ts`

**Contenido completo:**
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")
    || req.nextUrl.pathname.startsWith("/works")
    || req.nextUrl.pathname.startsWith("/admin")
    || req.nextUrl.pathname.startsWith("/suppliers")
    || req.nextUrl.pathname.startsWith("/accounting");

  // Si NO hay token y es una ruta privada → mandar al login
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si SÍ hay token y va al login → mandarlo al dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
```

**Análisis:**
- 🔴 **PROBLEMA CRÍTICO**: El middleware busca el token en **cookies** (`req.cookies.get("token")`)
- 🔴 **DESCONEXIÓN**: El store de Zustand guarda el token en **localStorage**, NO en cookies
- 🔴 **CAUSA RAÍZ**: Después del login:
  1. El token se guarda en localStorage (Zustand)
  2. `router.replace("/dashboard")` se ejecuta
  3. El middleware se ejecuta ANTES de que el componente se monte
  4. El middleware NO encuentra el token en cookies (porque está en localStorage)
  5. El middleware redirige a `/login`
  6. El usuario ve la pantalla de login aunque el store tiene el token

---

### 7. `app/login/page.tsx`

**Contenido completo:**
```typescript
"use client";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LoginForm />
    </div>
  );
}
```

**Análisis:**
- ✅ **Solo renderiza LoginForm**: Este archivo solo se usa para la ruta `/login`
- ✅ **No se renderiza en dashboard**: No hay forma de que este componente se renderice en `/dashboard`

---

### 8. `app/layout.tsx` (RootLayout)

**Contenido completo:**
```typescript
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**Análisis:**
- ✅ **Layout simple**: Solo renderiza `{children}` sin lógica adicional
- ✅ **No renderiza LoginForm**: No hay ninguna referencia a `LoginForm`

---

### 9. Búsqueda de `<LoginForm />` fuera de login

**Resultados:**
- ✅ **Solo se usa en `app/login/page.tsx`**: No hay otros usos de `LoginForm` en el proyecto
- ✅ **No hay renderizado condicional**: No hay componentes que rendericen `LoginForm` basado en estado de autenticación

---

### 10. Redirecciones automáticas

**Búsqueda de `router.push|replace|redirect`:**

1. **`components/auth/LoginForm.tsx`**: `router.replace("/dashboard")` después de login exitoso ✅
2. **`components/auth/ProtectedRoute.tsx`**: `router.replace(redirectTo)` si no está autenticado ⚠️
3. **`middleware.ts`**: `NextResponse.redirect("/login")` si no hay token en cookies 🔴
4. **`components/layout/Topbar.tsx`**: `router.push("/login")` en logout ✅
5. **`app/page.tsx`**: `redirect("/dashboard")` ✅

**Análisis:**
- 🔴 **Problema**: El middleware redirige a `/login` porque no encuentra el token en cookies
- ⚠️ **Timing**: El middleware se ejecuta ANTES de que los componentes se monten

---

## 🎯 Problema Identificado

### Causa Raíz

**El problema es una DESCONEXIÓN entre el middleware y el store de Zustand:**

1. **Store de Zustand (localStorage)**:
   - El token se guarda en `localStorage` como parte de `pmd-auth-storage`
   - `ProtectedRoute` lee del store de Zustand correctamente
   - El store funciona bien después del login

2. **Middleware (cookies)**:
   - El middleware busca el token en **cookies** (`req.cookies.get("token")`)
   - El token NO se guarda en cookies después del login
   - El middleware siempre encuentra `token === undefined`
   - El middleware redirige a `/login` antes de que `ProtectedRoute` pueda validar

3. **Flujo del problema**:
   ```
   Usuario hace login
   ↓
   Token se guarda en localStorage (Zustand)
   ↓
   router.replace("/dashboard") se ejecuta
   ↓
   Middleware se ejecuta (ANTES de que el componente se monte)
   ↓
   Middleware busca token en cookies → NO LO ENCUENTRA
   ↓
   Middleware redirige a /login
   ↓
   Usuario ve pantalla de login (aunque el store tiene el token)
   ```

---

## 📊 Comportamiento Actual vs Esperado

### Comportamiento Actual (INCORRECTO):

1. Usuario hace login exitoso
2. Token se guarda en localStorage (Zustand)
3. `router.replace("/dashboard")` se ejecuta
4. Middleware intercepta la request
5. Middleware busca token en cookies → **NO LO ENCUENTRA**
6. Middleware redirige a `/login`
7. Usuario ve pantalla de login
8. `ProtectedRoute` nunca se monta porque el middleware ya redirigió

### Comportamiento Esperado (CORRECTO):

1. Usuario hace login exitoso
2. Token se guarda en localStorage (Zustand) **Y en cookies**
3. `router.replace("/dashboard")` se ejecuta
4. Middleware intercepta la request
5. Middleware busca token en cookies → **LO ENCUENTRA**
6. Middleware permite el acceso
7. `ProtectedRoute` se monta
8. `ProtectedRoute` valida `isAuthenticated` del store → **TRUE**
9. Dashboard se renderiza correctamente

---

## 🔧 FIX Necesario

### Opción 1: Guardar token en cookies después del login (RECOMENDADO)

**Archivo a modificar**: `store/authStore.ts`

**Cambio necesario:**
```typescript
login: (userRaw: any, token: string, refreshToken?: string) => {
  // ... normalización de user ...
  
  // Guardar en localStorage (Zustand persist)
  set({
    user,
    token,
    refreshToken: refreshToken ?? null,
    isAuthenticated: true,
  });
  
  // 🔧 AGREGAR: Guardar también en cookies para el middleware
  if (typeof window !== "undefined") {
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    if (refreshToken) {
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    }
  }
}
```

**También en `logout()`:**
```typescript
logout: () => {
  // ... limpiar localStorage ...
  
  // 🔧 AGREGAR: Limpiar cookies
  if (typeof window !== "undefined") {
    document.cookie = "token=; path=/; max-age=0";
    document.cookie = "refreshToken=; path=/; max-age=0";
  }
}
```

### Opción 2: Modificar middleware para leer de localStorage (NO RECOMENDADO)

**Problema**: El middleware se ejecuta en el servidor, no tiene acceso a `localStorage`.

### Opción 3: Deshabilitar middleware para rutas protegidas (NO RECOMENDADO)

**Problema**: Perderíamos la protección a nivel de servidor.

---

## ✅ Solución Recomendada

**Implementar Opción 1**: Guardar el token en cookies después del login.

**Razones:**
1. ✅ El middleware puede leer cookies en el servidor
2. ✅ Mantiene la protección a nivel de servidor
3. ✅ Sincroniza el estado entre middleware y store
4. ✅ No requiere cambios en el middleware
5. ✅ Compatible con el flujo actual

---

## 📝 Resumen

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Archivo causante** | `middleware.ts` + `store/authStore.ts` | Middleware busca token en cookies, pero el store solo guarda en localStorage |
| **Comportamiento actual** | ❌ Incorrecto | Middleware redirige a `/login` porque no encuentra token en cookies |
| **Comportamiento esperado** | ✅ Correcto | Token debe estar en cookies para que el middleware lo encuentre |
| **Fix necesario** | 🔧 Guardar token en cookies | Modificar `login()` y `logout()` en `authStore.ts` para guardar/limpiar cookies |

---

## 🎯 Conclusión

**El problema NO es que `LoginForm` se esté renderizando en `/dashboard`.**

**El problema es que el middleware está redirigiendo a `/login` antes de que `ProtectedRoute` pueda validar el estado de autenticación.**

**La solución es sincronizar el token entre localStorage (Zustand) y cookies (middleware) guardando el token en ambos lugares después del login.**

