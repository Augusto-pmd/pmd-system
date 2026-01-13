# Estructura del Proyecto PMD Frontend

## Resumen
- **Total de archivos versionados**: 114
- **Estado Git**: Limpio (todos los archivos están versionados)
- **Última actualización**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Archivos Ignorados (Correctamente)
Los siguientes archivos están en `.gitignore` y NO deben versionarse:
- `.env.local` - Variables de entorno locales
- `.next/` - Build de Next.js
- `next-env.d.ts` - Tipos generados por Next.js
- `node_modules/` - Dependencias
- `tsconfig.tsbuildinfo` - Cache de TypeScript

## Estructura de Carpetas y Archivos

### 📁 app/
- `layout.tsx` - Layout raíz
- `page.tsx` - Página principal
- `globals.css` - Estilos globales
- `login/page.tsx` - Página de login
- `unauthorized/page.tsx` - Página de no autorizado
- `(authenticated)/` - Rutas protegidas:
  - `accounting/page.tsx`
  - `admin/roles/page.tsx`
  - `admin/users/page.tsx`
  - `alerts/page.tsx`
  - `audit/page.tsx`
  - `cash/page.tsx`
  - `cashbox/page.tsx`
  - `contracts/page.tsx`
  - `dashboard/page.tsx`
  - `dashboard/administration/page.tsx`
  - `dashboard/management/page.tsx`
  - `dashboard/operator/page.tsx`
  - `dashboard/supervisor/page.tsx`
  - `expenses/page.tsx`
  - `incomes/page.tsx`
  - `suppliers/page.tsx`
  - `works/page.tsx`

### 📁 components/
- `auth/`
  - `LoginForm.tsx`
  - `ProtectedRoute.tsx`
- `forms/`
  - `ExpenseForm.tsx`
  - `IncomeForm.tsx`
  - `RoleForm.tsx`
  - `SupplierForm.tsx`
  - `UserForm.tsx`
  - `WorkForm.tsx`
- `layout/`
  - `MainLayout.tsx`
  - `Sidebar.tsx`
  - `Topbar.tsx`
- `providers/`
  - `SWRProvider.tsx`
- `ui/`
  - `Badge.tsx`
  - `Button.tsx`
  - `Card.tsx`
  - `EmptyState.tsx`
  - `Input.tsx`
  - `Loading.tsx`
  - `LoadingState.tsx`
  - `Modal.tsx`
  - `Table.tsx`
- `DebugErrorBoundary.tsx`

### 📁 hooks/
- `api/`
  - `accounting.ts`
  - `alerts.ts`
  - `audit.ts`
  - `cashboxes.ts`
  - `contracts.ts`
  - `dashboard.ts`
  - `expenses.ts`
  - `incomes.ts`
  - `roles.ts`
  - `suppliers.ts`
  - `users.ts`
  - `works.ts`
- `useAccounting.ts`
- `useAlerts.ts`
- `useAudit.ts`
- `useAuth.ts`
- `useCashboxes.ts`
- `useContracts.ts`
- `useExpenses.ts`
- `useIncomes.ts`
- `useMe.ts`
- `useRoles.ts`
- `useSuppliers.ts`
- `useSWR.ts`
- `useSWRConfig.ts`
- `useUsers.ts`
- `useWorks.ts`

### 📁 lib/
- `api.ts`
- `api-client.ts`
- `normalizeUser.ts`
- `swr-config.ts`
- `types.ts`
- `utils.ts`

### 📁 store/
- `authStore.ts`

### 📁 tests/
- `test-login.js`

### 📁 Archivos de Configuración
- `.eslintrc.json`
- `.gitignore`
- `.prettierrc`
- `middleware.ts`
- `next.config.js`
- `package.json`
- `package-lock.json`
- `postcss.config.js`
- `tailwind.config.ts`
- `tsconfig.json`
- `vercel.json`

### 📁 Documentación
- `README.md`
- `AUDIT_REPORT_ROUTING.md`
- `CAPTURE_REACT_ERROR.md`
- `DEPLOYMENT_GUIDE.md`
- `DIFF_*.md` (varios archivos de documentación)
- `GIT_SYNC_STATUS.md`
- `GITHUB_STATUS.md`
- `INSTRUCCIONES_CAPTURA_ERROR.md`
- `PRODUCTION_CONFIG.md`
- `VERCEL_DEPLOY.md`

### 📁 Scripts
- `capture-error-script.js`
- `deploy-render.js`
- `push-to-github.bat`
- `start-system.bat`
- `test-react-error.js`

## Verificación
✅ Todos los archivos importantes están versionados en Git
✅ No hay archivos faltantes que deban agregarse
✅ Los archivos ignorados están correctamente configurados en `.gitignore`

