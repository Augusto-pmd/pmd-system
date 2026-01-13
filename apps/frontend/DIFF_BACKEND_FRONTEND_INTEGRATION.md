# 📋 DIFF COMPLETO - Integración Frontend-Backend PMD

## 🎯 OBJETIVO
Integrar el frontend del Sistema PMD con el backend real, conectando las páginas `/works`, `/accounting` y `/audit` con endpoints REST del backend NestJS.

---

## 📦 PARTE 1: BACKEND (NestJS) - REQUERIMIENTOS

### 🔧 Módulos a Crear/Completar

#### 1. ProjectsModule (o WorksModule)
**Ubicación:** `src/projects/projects.module.ts`

**Entidad TypeORM:**
```typescript
// src/projects/entities/project.entity.ts
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['pending', 'active', 'completed', 'cancelled'] })
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Endpoints REST:**
```
GET    /api/projects          → Listar todos los proyectos
GET    /api/projects/:id      → Obtener un proyecto por ID
POST   /api/projects          → Crear un nuevo proyecto
PUT    /api/projects/:id      → Actualizar un proyecto
DELETE /api/projects/:id      → Eliminar un proyecto
```

**DTOs:**
```typescript
// src/projects/dto/create-project.dto.ts
export class CreateProjectDto {
  name: string;
  description?: string;
  status?: string;
  budget?: number;
  startDate?: Date;
  endDate?: Date;
}

// src/projects/dto/update-project.dto.ts
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
```

---

#### 2. AuditModule
**Ubicación:** `src/audit/audit.module.ts`

**Entidad TypeORM:**
```typescript
// src/audit/entities/audit-log.entity.ts
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // 'create', 'update', 'delete', 'login', etc.

  @Column()
  entity: string; // 'project', 'user', 'transaction', etc.

  @Column({ type: 'uuid', nullable: true })
  entityId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ type: 'jsonb', nullable: true })
  details: any;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

**Endpoints REST:**
```
GET  /api/audit/logs                    → Listar todos los logs
GET  /api/audit/logs?startDate=...&endDate=...  → Filtrar por fecha
POST /api/audit/logs                    → Crear un nuevo log (usado internamente)
```

**DTOs:**
```typescript
// src/audit/dto/create-audit-log.dto.ts
export class CreateAuditLogDto {
  action: string;
  entity: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  details?: any;
}
```

---

#### 3. AccountingModule
**Ubicación:** `src/accounting/accounting.module.ts`

**Entidad TypeORM:**
```typescript
// src/accounting/entities/transaction.entity.ts
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // 'income', 'expense', 'asset', 'liability'

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'uuid', nullable: true })
  projectId: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Endpoints REST:**
```
GET  /api/accounting/transactions       → Listar todas las transacciones
GET  /api/accounting                    → Obtener resumen (totalAssets, totalLiabilities, netWorth)
POST /api/accounting/transactions       → Crear una nueva transacción
GET  /api/accounting/transactions/:id   → Obtener una transacción por ID
PUT  /api/accounting/transactions/:id  → Actualizar una transacción
DELETE /api/accounting/transactions/:id → Eliminar una transacción
```

**DTOs:**
```typescript
// src/accounting/dto/create-transaction.dto.ts
export class CreateTransactionDto {
  type: string;
  description: string;
  amount: number;
  date: Date;
  category?: string;
  projectId?: string;
}

// src/accounting/dto/update-transaction.dto.ts
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
```

---

## 🎨 PARTE 2: FRONTEND (Next.js) - CAMBIOS

### ✅ Estado Actual Detectado

**Hooks existentes:**
- ✅ `hooks/api/works.ts` - Ya existe, usa `/works`
- ✅ `hooks/api/audit.ts` - Ya existe, usa `/audit`
- ✅ `hooks/api/accounting.ts` - Ya existe, usa `/accounting`

**Páginas existentes:**
- ✅ `app/works/page.tsx` - Ya existe, usa `useWorks` y `workApi`
- ✅ `app/accounting/page.tsx` - Ya existe, usa `useAccounting`
- ✅ `app/audit/page.tsx` - Ya existe, usa `useAuditLogs`

**API Client:**
- ✅ `lib/api.ts` - Ya existe, configurado con `NEXT_PUBLIC_API_URL`

---

### 📝 CAMBIOS NECESARIOS EN FRONTEND

#### 1. Actualizar `hooks/api/works.ts`

**ANTES:**
```typescript
const API_BASE = "/works";
```

**DESPUÉS:**
```typescript
const API_BASE = "/projects"; // Cambiar a /projects para coincidir con backend
```

**Cambio completo:**
```typescript
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "/projects"; // ← CAMBIO: /works → /projects

export function useWorks() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? API_BASE : null,
    () => apiClient.get(API_BASE)
  );

  return {
    works: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useWork(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    work: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const workApi = {
  create: (data: any) => apiClient.post(API_BASE, data),
  update: (id: string, data: any) => apiClient.put(`${API_BASE}/${id}`, data),
  delete: (id: string) => apiClient.delete(`${API_BASE}/${id}`),
};
```

---

#### 2. Actualizar `hooks/api/audit.ts`

**ANTES:**
```typescript
const API_BASE = "/audit";
```

**DESPUÉS:**
```typescript
const API_BASE = "/audit/logs"; // Cambiar a /audit/logs para coincidir con backend
```

**Cambio completo:**
```typescript
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "/audit/logs"; // ← CAMBIO: /audit → /audit/logs

export function useAuditLogs(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";
  const { data, error, isLoading, mutate } = useSWR(
    token ? `${API_BASE}${queryString}` : null,
    () => apiClient.get(`${API_BASE}${queryString}`)
  );

  return {
    logs: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

// ← NUEVO: Agregar función para crear logs (usado internamente)
export const auditApi = {
  create: (data: any) => apiClient.post(API_BASE, data),
};
```

---

#### 3. Actualizar `hooks/api/accounting.ts`

**ANTES:**
```typescript
const API_BASE = "/accounting";
```

**DESPUÉS:**
```typescript
// Mantener /accounting para resumen, agregar /accounting/transactions para CRUD
```

**Cambio completo:**
```typescript
import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const API_BASE = "/accounting";
const TRANSACTIONS_BASE = "/accounting/transactions"; // ← NUEVO

// Hook existente para resumen (sin cambios)
export function useAccounting() {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token ? API_BASE : null,
    () => apiClient.get(API_BASE)
  );

  return {
    accounting: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

// ← NUEVO: Hook para listar transacciones
export function useTransactions(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  const queryString = params
    ? `?${new URLSearchParams(params as any).toString()}`
    : "";
  const { data, error, isLoading, mutate } = useSWR(
    token ? `${TRANSACTIONS_BASE}${queryString}` : null,
    () => apiClient.get(`${TRANSACTIONS_BASE}${queryString}`)
  );

  return {
    transactions: data?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

// Hook existente (sin cambios)
export function useAccountingReport(id: string | null) {
  const { token } = useAuthStore();
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `${API_BASE}/${id}` : null,
    () => apiClient.get(`${API_BASE}/${id}`)
  );

  return {
    report: data?.data || data,
    error,
    isLoading,
    mutate,
  };
}

// Actualizar API para incluir transacciones
export const accountingApi = {
  create: (data: any) => apiClient.post(TRANSACTIONS_BASE, data), // ← CAMBIO
  update: (id: string, data: any) => apiClient.put(`${TRANSACTIONS_BASE}/${id}`, data), // ← CAMBIO
  delete: (id: string) => apiClient.delete(`${TRANSACTIONS_BASE}/${id}`), // ← CAMBIO
  generateReport: (params: any) => apiClient.post(`${API_BASE}/reports`, params),
};
```

---

#### 4. Actualizar `app/accounting/page.tsx`

**CAMBIOS:**
- Agregar visualización de transacciones
- Agregar funcionalidad para crear transacciones
- Mantener el resumen existente (totalAssets, totalLiabilities, netWorth)

**ANTES (líneas 9-10):**
```typescript
function AccountingContent() {
  const { accounting, isLoading, error } = useAccounting();
```

**DESPUÉS:**
```typescript
function AccountingContent() {
  const { accounting, isLoading, error } = useAccounting();
  const { transactions, isLoading: transactionsLoading, mutate: mutateTransactions } = useTransactions(); // ← NUEVO
  const [isModalOpen, setIsModalOpen] = useState(false); // ← NUEVO
  const [isSubmitting, setIsSubmitting] = useState(false); // ← NUEVO
```

**AGREGAR después de la línea 75 (antes del cierre del Card):**
```typescript
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-pmd-darkBlue">Transactions</h2>
              <Button onClick={() => setIsModalOpen(true)}>+ New Transaction</Button>
            </div>
            {transactionsLoading ? (
              <LoadingState message="Loading transactions..." />
            ) : transactions?.length === 0 ? (
              <EmptyState
                title="No transactions found"
                description="Create your first transaction to get started"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions?.map((transaction: any) => (
                      <tr key={transaction.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {transaction.date ? new Date(transaction.date).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant={transaction.type === "income" ? "success" : "error"}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{transaction.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${transaction.amount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{transaction.category || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
```

**AGREGAR imports necesarios (línea 1-8):**
```typescript
"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAccounting, useTransactions, accountingApi } from "@/hooks/api/accounting"; // ← CAMBIO
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button"; // ← NUEVO
import { Badge } from "@/components/ui/Badge"; // ← NUEVO
import { useState } from "react"; // ← NUEVO
```

---

#### 5. Verificar `app/works/page.tsx`

**ESTADO:** ✅ Ya está correctamente configurado
- Usa `useWorks()` y `workApi`
- Tiene CRUD completo
- Solo necesita que el backend responda en `/api/projects`

**CAMBIOS MÍNIMOS:** Ninguno necesario, solo actualizar el hook para usar `/projects`

---

#### 6. Verificar `app/audit/page.tsx`

**ESTADO:** ✅ Ya está correctamente configurado
- Usa `useAuditLogs()` con filtros de fecha
- Solo necesita que el backend responda en `/api/audit/logs`

**CAMBIOS MÍNIMOS:** Solo actualizar el hook para usar `/audit/logs`

---

## 🔒 REGLA DE SEGURIDAD PMD - CUMPLIMIENTO

### ✅ No romper rutas
- ✅ No se modifican rutas existentes
- ✅ Solo se actualizan endpoints de API
- ✅ Las páginas mantienen sus rutas `/works`, `/accounting`, `/audit`

### ✅ No sobrescribir login
- ✅ No se toca `app/login/page.tsx`
- ✅ No se toca `app/auth/login/page.tsx`
- ✅ No se modifica autenticación

### ✅ No modificar layout
- ✅ No se toca `app/layout.tsx`
- ✅ No se toca `components/layout/MainLayout.tsx`
- ✅ No se toca `components/layout/Sidebar.tsx`

---

## 📊 RESUMEN DE CAMBIOS

### Backend (NestJS) - REQUERIMIENTOS
- ✅ Crear `ProjectsModule` con entidad `Project` y CRUD
- ✅ Crear `AuditModule` con entidad `AuditLog` y endpoints
- ✅ Crear `AccountingModule` con entidad `Transaction` y CRUD
- ✅ Exponer endpoints REST según especificación

### Frontend (Next.js) - CAMBIOS
- ✅ **hooks/api/works.ts** - Cambiar `/works` → `/projects`
- ✅ **hooks/api/audit.ts** - Cambiar `/audit` → `/audit/logs`
- ✅ **hooks/api/accounting.ts** - Agregar `useTransactions()` y actualizar `accountingApi`
- ✅ **app/accounting/page.tsx** - Agregar visualización y creación de transacciones
- ✅ **app/works/page.tsx** - Sin cambios (ya está correcto)
- ✅ **app/audit/page.tsx** - Sin cambios (ya está correcto)

### Archivos que NO se tocan
- ✅ `app/layout.tsx`
- ✅ `components/layout/MainLayout.tsx`
- ✅ `components/layout/Sidebar.tsx`
- ✅ `app/login/page.tsx`
- ✅ `app/auth/login/page.tsx`
- ✅ `lib/api.ts` (ya está correcto)
- ✅ Cualquier otra ruta o página

---

## 🧪 VALIDACIÓN POST-CAMBIOS

Después de aplicar los cambios:

1. **Backend:**
   - Verificar que los endpoints respondan correctamente
   - Probar CRUD de Projects, AuditLogs, Transactions
   - Verificar que las respuestas coincidan con el formato esperado por el frontend

2. **Frontend:**
   - Ejecutar `npm run build` para validar
   - Verificar que no haya errores de TypeScript
   - Probar que las páginas carguen datos del backend

---

## ⚠️ NOTAS IMPORTANTES

1. **Endpoints del Backend:**
   - Asegurar que el backend use el prefijo `/api` global
   - Los endpoints deben ser: `/api/projects`, `/api/audit/logs`, `/api/accounting/transactions`

2. **Formato de Respuesta:**
   - El backend debe devolver: `{ data: [...] }` o directamente el array
   - El frontend maneja ambos formatos con `data?.data || data || []`

3. **Autenticación:**
   - Los hooks usan `useAuthStore().token` para autenticación
   - El `apiClient` ya está configurado para enviar el token en headers

4. **Variables de Entorno:**
   - Asegurar que `NEXT_PUBLIC_API_URL` esté configurada correctamente
   - Ejemplo: `NEXT_PUBLIC_API_URL=http://localhost:3000/api` (o la URL del backend)

---

## ✅ LISTO PARA APLICAR

Este DIFF está completo y listo para ser aplicado. Los cambios son mínimos y seguros, siguiendo la Regla de Seguridad PMD.

