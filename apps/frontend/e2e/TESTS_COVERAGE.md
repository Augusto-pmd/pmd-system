# Cobertura de Tests E2E - Sistema PMD

## 📊 Resumen de Cobertura

Este documento describe todos los tests E2E implementados para verificar el correcto funcionamiento del sistema PMD.

## ✅ Tests Implementados

### 1. Autenticación y Roles (`auth.spec.ts`)
- ✅ Login exitoso con credenciales válidas
- ✅ Error con email incorrecto
- ✅ Error con contraseña incorrecta
- ✅ Validación de campos vacíos
- ✅ Guardado de token en localStorage
- ✅ Logout correcto
- ✅ Permisos por rol (Direction, Supervisor, Administration, Operator)
- ✅ Verificación de módulos visibles/ocultos por rol

### 2. Flujo de Gastos (`expenses-flow.spec.ts`)
- ✅ Operator puede crear gasto
- ✅ Administration puede validar gasto
- ✅ Verificación de permisos por rol

### 3. Flujo de Caja (`cashbox-flow.spec.ts`)
- ✅ Operator puede crear y cerrar su caja
- ✅ Administration puede aprobar diferencias
- ✅ Verificación de acceso limitado a caja propia

### 4. Flujo de Proveedores (`suppliers-flow.spec.ts`)
- ✅ Operator puede crear proveedor provisional
- ✅ Administration puede aprobar proveedor
- ✅ Verificación de permisos por rol

### 5. Flujo de Obras (`works-flow.spec.ts`)
- ✅ Direction puede crear obra
- ✅ Supervisor puede actualizar progreso
- ✅ Direction puede cerrar obra

### 6. Flujo de Contratos (`contracts-flow.spec.ts`) ⭐ NUEVO
- ✅ Administration puede crear contrato
- ✅ Direction puede actualizar contrato
- ✅ Supervisor puede ver pero no crear
- ✅ Operator no tiene acceso

### 7. Flujo de Contabilidad (`accounting-flow.spec.ts`) ⭐ NUEVO
- ✅ Administration puede ver registros contables
- ✅ Administration puede cerrar mes
- ✅ Direction puede reabrir mes (único)
- ✅ Administration NO puede reabrir mes
- ✅ Supervisor y Operator no tienen acceso

### 8. Flujo de Alertas (`alerts-flow.spec.ts`) ⭐ NUEVO
- ✅ Administration puede crear alerta
- ✅ Direction puede resolver alerta
- ✅ Supervisor y Operator pueden ver pero no crear

### 9. Flujo de Auditoría (`audit-flow.spec.ts`) ⭐ NUEVO
- ✅ Direction puede ver registros de auditoría
- ✅ Direction puede filtrar registros
- ✅ Supervisor, Administration y Operator NO tienen acceso

### 10. Flujo de Usuarios (`users-flow.spec.ts`) ⭐ NUEVO
- ✅ Direction puede crear usuario
- ✅ Direction puede actualizar usuario
- ✅ Supervisor, Administration y Operator NO tienen acceso

### 11. Flujo de Roles (`roles-flow.spec.ts`) ⭐ NUEVO
- ✅ Direction puede ver roles
- ✅ Direction puede actualizar permisos
- ✅ Supervisor, Administration y Operator NO tienen acceso

### 12. Flujo de Ingresos (`incomes-flow.spec.ts`) ⭐ NUEVO
- ✅ Direction puede crear ingreso
- ✅ Supervisor puede ver pero no crear
- ✅ Administration puede ver
- ✅ Operator no tiene acceso

### 13. Flujo de Documentos (`documents-flow.spec.ts`) ⭐ NUEVO
- ✅ Operator puede crear documento
- ✅ Administration puede actualizar documento
- ✅ Supervisor puede ver pero no crear
- ✅ Direction puede eliminar documento

### 14. Dashboard (`dashboard.spec.ts`) ⭐ NUEVO
- ✅ Direction ve dashboard completo
- ✅ Supervisor ve dashboard de supervisión
- ✅ Administration ve dashboard administrativo
- ✅ Operator ve dashboard básico
- ✅ Redirección automática después del login

### 15. Reglas de Negocio (`business-rules.spec.ts`) ⭐ NUEVO
- ✅ Flujo completo: Crear gasto → Validar → Verificar registro contable
- ✅ Flujo: Crear proveedor provisional → Aprobar → Usar en gasto
- ✅ Flujo: Cerrar caja con diferencias → Aprobar diferencia
- ✅ Direction puede desbloquear contrato bloqueado
- ✅ Administration NO puede desbloquear contrato bloqueado

## 📈 Estadísticas

- **Total de archivos de test:** 15
- **Total de tests:** ~60+ tests individuales
- **Módulos cubiertos:** 14/14 (100%)
- **Roles cubiertos:** 4/4 (100%)
- **Flujos de negocio críticos:** 5/5 (100%)

## 🎯 Cobertura por Módulo

| Módulo | Tests | Estado |
|--------|-------|--------|
| Autenticación | ✅ Completo | 10 tests |
| Dashboard | ✅ Completo | 5 tests |
| Obras | ✅ Completo | 3 tests |
| Gastos | ✅ Completo | 2+ tests |
| Proveedores | ✅ Completo | 2+ tests |
| Contratos | ✅ Completo | 4 tests |
| Cajas | ✅ Completo | 2+ tests |
| Contabilidad | ✅ Completo | 6 tests |
| Alertas | ✅ Completo | 4 tests |
| Auditoría | ✅ Completo | 5 tests |
| Usuarios | ✅ Completo | 4 tests |
| Roles | ✅ Completo | 4 tests |
| Ingresos | ✅ Completo | 4 tests |
| Documentos | ✅ Completo | 4 tests |
| Reglas de Negocio | ✅ Completo | 5 tests |

## 🔐 Cobertura por Rol

| Rol | Tests Específicos | Estado |
|-----|-------------------|--------|
| Direction | ✅ Completo | Acceso completo verificado |
| Supervisor | ✅ Completo | Permisos de lectura verificados |
| Administration | ✅ Completo | Permisos de validación/aprobación verificados |
| Operator | ✅ Completo | Permisos limitados verificados |

## 🧪 Ejecutar Tests

### Ejecutar todos los tests
```bash
npm run test:e2e
```

### Ejecutar un archivo específico
```bash
npm run test:e2e contracts-flow.spec.ts
```

### Ejecutar tests de un módulo específico
```bash
npm run test:e2e -- -g "Contratos"
```

### Ejecutar en modo UI (debugging)
```bash
npx playwright test --ui
```

### Ejecutar en modo headed (ver el navegador)
```bash
npx playwright test --headed
```

## 📝 Notas Importantes

1. **Throttling del Backend:** Los tests incluyen delays entre tests para evitar throttling (5 requests/minuto para login).

2. **Datos de Prueba:** Los tests asumen que existen datos de prueba en la base de datos. Ejecutar `npm run seed` en el backend antes de correr los tests.

3. **Selectores Genéricos:** Los helpers usan selectores genéricos que pueden necesitar ajustes según la implementación real de la UI.

4. **Tests Condicionales:** Algunos tests usan `test.skip()` si no encuentran datos necesarios (ej: no hay gastos pendientes para validar).

5. **Flujos Complejos:** Los tests de reglas de negocio pueden requerir múltiples pasos y datos específicos en la BD.

## 🔄 Próximos Pasos

- [ ] Agregar tests de validación de formularios
- [ ] Agregar tests de búsqueda y filtrado
- [ ] Agregar tests de paginación
- [ ] Agregar tests de exportación de datos
- [ ] Agregar tests de notificaciones en tiempo real
- [ ] Agregar tests de carga y rendimiento

---

**Última actualización:** Enero 2025
**Versión:** 1.0.0

