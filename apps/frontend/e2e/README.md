# Pruebas E2E del Frontend - Playwright

## Instalación Rápida

```bash
cd pmd-frontend
npm install
npx playwright install
```

## Ejecutar Pruebas

```bash
# Asegúrate de que el servidor de desarrollo esté corriendo
npm run dev  # En otra terminal

# Ejecutar pruebas
npm run test:e2e
```

## Estructura

- `helpers/` - Utilidades reutilizables para pruebas
  - `auth.ts` - Helpers de autenticación
  - `navigation.ts` - Helpers de navegación
  - `forms.ts` - Helpers para formularios
  - `wait.ts` - Helpers para esperar condiciones

- `*.spec.ts` - Archivos de pruebas E2E
  - `auth.spec.ts` - Pruebas de autenticación y roles
  - `expenses-flow.spec.ts` - Flujo de gastos (crear, validar)
  - `cashbox-flow.spec.ts` - Flujo de caja (crear, cerrar, aprobar diferencias)
  - `suppliers-flow.spec.ts` - Flujo de proveedores (crear, aprobar)
  - `works-flow.spec.ts` - Flujo de obras (crear, actualizar, cerrar)
  - `contracts-flow.spec.ts` - Flujo de contratos (crear, actualizar, desbloquear)
  - `accounting-flow.spec.ts` - Flujo de contabilidad (ver, cerrar mes, reabrir mes)
  - `alerts-flow.spec.ts` - Flujo de alertas (crear, resolver)
  - `audit-flow.spec.ts` - Flujo de auditoría (solo Direction)
  - `users-flow.spec.ts` - Flujo de usuarios (solo Direction)
  - `roles-flow.spec.ts` - Flujo de roles (solo Direction)
  - `incomes-flow.spec.ts` - Flujo de ingresos
  - `documents-flow.spec.ts` - Flujo de documentos
  - `dashboard.spec.ts` - Tests del dashboard por rol
  - `business-rules.spec.ts` - Tests de reglas de negocio complejas

## Notas

Los selectores en los helpers son genéricos. Puede que necesites ajustarlos según tu implementación real de la UI.

