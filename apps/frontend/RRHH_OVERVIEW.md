# Módulo de Recursos Humanos (RRHH) - Documentación

## Resumen

El módulo de Recursos Humanos (`/rrhh`) es una sección completa del sistema PMD que permite gestionar empleados, obreros, seguros de accidentes personales y asignaciones a obras. Está diseñado para mantener un control integral del personal de la empresa.

## Estructura del Módulo

### Página Principal

**Ruta:** `/rrhh`  
**Archivo:** `app/(authenticated)/rrhh/page.tsx`

La página principal muestra un listado de todos los empleados registrados en el sistema con información clave:
- Nombre completo
- Área de trabajo
- Puesto
- Estado (Activo/Inactivo)
- Estado del seguro (con indicadores visuales)

### Componentes

#### 1. `EmployeeCard.tsx`

**Ubicación:** `components/rrhh/EmployeeCard.tsx`

Componente que representa cada empleado en el listado principal.

**Características:**
- Avatar con inicial del nombre
- Badges informativos:
  - Área de trabajo
  - Estado del empleado (Activo/Inactivo)
  - Estado del seguro (Vigente/Por vencer/Vencido)
- Botón "Ver ficha" para acceder al detalle completo

**Diseño:**
- Card con borde izquierdo azul PMD
- Hover effect con sombra aumentada
- Layout responsive

#### 2. `EmployeesList.tsx`

**Ubicación:** `components/rrhh/EmployeesList.tsx`

Componente que renderiza el grid responsivo de empleados.

**Características:**
- Grid adaptativo:
  - 1 columna en móvil
  - 2 columnas en tablet
  - 3 columnas en desktop
- Estado vacío con mensaje descriptivo

### Página de Detalle del Empleado

**Ruta:** `/rrhh/[id]`  
**Archivo:** `app/(authenticated)/rrhh/[id]/page.tsx`

La página de detalle muestra información completa del empleado organizada en secciones:

#### A) Información Personal
- Nombre completo
- DNI
- Teléfono
- Email
- Dirección

#### B) Información Laboral
- Área de trabajo
- Puesto
- Fecha de ingreso
- Estado (Activo/Inactivo)

#### C) Seguro de Accidentes Personales
- Compañía aseguradora
- Número de póliza
- Fecha de vencimiento
- Estado visual con colores:
  - **Verde:** Vigente
  - **Amarillo:** Vence en menos de 15 días
  - **Rojo:** Vencido

#### D) Asignaciones a Obras
- Tabla con asignaciones del empleado a diferentes obras
- Columnas:
  - Obra
  - Fecha inicio
  - Fecha fin
  - Rol en la obra
  - Estado
- Botón "Asignar a una obra" (placeholder)

#### E) Documentación del Empleado
- Sección placeholder para documentos
- Botón "Subir documento" (sin lógica aún)

#### F) Acciones
- "Volver a Recursos Humanos"
- "Editar datos" (placeholder)
- "Dar de baja" (placeholder)

## Utilidades

### `utils/seguro.ts`

Archivo con funciones utilitarias para el cálculo del estado de seguros.

#### `calcularEstadoSeguro(fechaVencimiento)`

Calcula el estado de un seguro basado en su fecha de vencimiento.

**Retorna:**
```typescript
{
  estado: "vigente" | "por-vencer" | "vencido",
  color: "green" | "yellow" | "red",
  texto: string,
  diasRestantes?: number
}
```

**Lógica:**
- **Vencido:** Si la fecha ya pasó
- **Por vencer:** Si faltan 15 días o menos
- **Vigente:** Si faltan más de 15 días

#### `getBadgeColorSeguro(estado)`

Convierte el estado del seguro al variant de Badge correspondiente.

## Hooks API

### `hooks/api/employees.ts`

Hooks para interactuar con la API de empleados.

#### `useEmployees()`
Obtiene el listado completo de empleados.

#### `useEmployee(id)`
Obtiene la información de un empleado específico.

#### `useEmployeeAssignments(id)`
Obtiene las asignaciones a obras de un empleado.

#### `employeeApi`
Objeto con métodos para CRUD de empleados:
- `create(data)`
- `update(id, data)`
- `delete(id)`
- `assignToWork(employeeId, workId, data)`

## Áreas de Trabajo

El sistema reconoce las siguientes áreas (con traducción automática):

- **Arquitectura** (Architecture)
- **Obras** (Works)
- **Logística** (Logistics)
- **Pañol** (Almacén)
- **Mantenimiento** (Maintenance)
- **Administración** (Administration)

## Estados del Seguro

### Vigente (Verde)
- El seguro está activo y no vence en los próximos 15 días
- Badge verde con texto "Vigente"

### Por Vencer (Amarillo)
- El seguro vence en 15 días o menos
- Badge amarillo con texto "Vence en X días"
- Requiere atención inmediata

### Vencido (Rojo)
- El seguro ya venció
- Badge rojo con texto "Vencido"
- Requiere acción urgente

## Estructura de Asignaciones

Las asignaciones a obras incluyen:

- **Obra:** Referencia a la obra asignada
- **Fecha inicio:** Cuando comenzó la asignación
- **Fecha fin:** Cuando termina (puede ser null si está activa)
- **Rol:** Rol del empleado en la obra
- **Estado:** Estado de la asignación (Activa/Finalizada)

## Integración con el Sistema

### Dashboard

El módulo está integrado en el Dashboard principal con:
- Título: "Recursos Humanos"
- Descripción: "Empleados, obreros y seguros"
- Ruta: `/rrhh`
- Icono: 👥

### Navegación

- Botón "Volver" (`BotonVolver`) en ambas páginas
- Navegación fluida entre listado y detalle
- Botones de acción contextuales

## Localización

Todo el módulo está completamente en español:

- Títulos y subtítulos
- Labels y descripciones
- Estados y badges
- Mensajes de error y carga
- Traducción de áreas y estados
- Formato de fechas en español

## Estilo y Diseño

### Principios de Diseño PMD

- **Colores:** Azul PMD con acentos según estado
- **Tipografía:** Jerarquía clara y legible
- **Espaciado:** Padding generoso (`p-6`, `p-8`)
- **Sombras:** Suaves y sutiles (`shadow-pmd`, `hover:shadow-lg`)
- **Bordes:** Redondeados (`rounded-lg`, `rounded-pmd`)
- **Responsive:** Grid adaptativo según dispositivo

### Componentes UI Utilizados

- `Card` - Contenedores principales
- `Badge` - Indicadores de estado
- `Button` - Acciones del usuario
- `EmptyState` - Estados vacíos
- `UserAvatar` - Avatar del empleado
- `BotonVolver` - Navegación hacia atrás

## Funcionalidades Implementadas

### ✅ Completadas

- Listado de empleados con información clave
- Ficha completa del empleado
- Cálculo automático del estado de seguros
- Visualización de asignaciones a obras
- Integración con Dashboard
- Navegación completa

### ⏳ Placeholders (Próximamente)

- **Editar datos:** Formulario para modificar información del empleado
- **Dar de baja:** Proceso de baja del empleado
- **Asignar a obra:** Formulario para asignar empleado a una obra
- **Subir documento:** Funcionalidad de carga de documentos
- **Alertas automáticas:** Integración con módulo de alertas para seguros vencidos

## Ideas para Futuras Expansiones

### 1. Capacitaciones

- Registro de capacitaciones recibidas
- Certificaciones y licencias
- Calendario de capacitaciones programadas
- Recordatorios de vencimientos

### 2. Vacaciones y Licencias

- Gestión de días de vacaciones
- Solicitudes de licencias
- Calendario de ausencias
- Balance de días disponibles

### 3. Organigrama

- Visualización jerárquica de la organización
- Relaciones entre empleados y áreas
- Estructura de reportes

### 4. Evaluaciones de Desempeño

- Registro de evaluaciones periódicas
- Objetivos y metas
- Historial de desempeño

### 5. Nómina y Liquidaciones

- Integración con sistema de nómina
- Historial de liquidaciones
- Conceptos y descuentos

### 6. Alertas Automáticas

- Notificaciones de seguros por vencer
- Recordatorios de vencimientos de documentos
- Alertas de asignaciones próximas a finalizar

### 7. Reportes

- Reporte de personal por área
- Estado de seguros
- Asignaciones activas
- Historial de empleados

## Estructura de Archivos

```
app/(authenticated)/rrhh/
  ├── page.tsx
  └── [id]/
      └── page.tsx

components/rrhh/
  ├── EmployeeCard.tsx
  └── EmployeesList.tsx

hooks/api/
  └── employees.ts

utils/
  └── seguro.ts
```

## Notas Técnicas

- El módulo no modifica layouts ni middleware
- Usa componentes UI existentes para mantener consistencia
- Manejo de errores implementado en todos los componentes
- TypeScript con tipos seguros para todas las props
- Responsive design para móvil y desktop
- Cálculo de estado de seguro en tiempo real

## Conclusión

El módulo de Recursos Humanos está diseñado para ser expandible y mantenible. La estructura modular permite agregar nuevas funcionalidades sin afectar las existentes. Todos los componentes están preparados para futuras integraciones con el backend y mejoras en la funcionalidad.

