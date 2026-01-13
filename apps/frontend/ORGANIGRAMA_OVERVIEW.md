# Módulo de Organigrama PMD - Documentación

## Resumen

El módulo de Organigrama (`/organigrama`) es una visualización premium de la estructura organizacional de PMD. Muestra el personal agrupado por áreas con jerarquías visuales mediante cards conectadas, permitiendo una comprensión clara de la estructura interna de la empresa.

## Estructura del Módulo

### Página Principal

**Ruta:** `/organigrama`  
**Archivo:** `app/(authenticated)/organigrama/page.tsx`

La página principal muestra el organigrama completo del personal, agrupado por áreas y organizado jerárquicamente.

**Características:**
- Título: "Organigrama PMD"
- Subtítulo: "Estructura del personal y áreas internas"
- Grid responsivo de áreas
- Integración con módulo RRHH (usa mismo endpoint)

### Componentes

#### 1. `Organigrama.tsx`

**Ubicación:** `components/organigrama/Organigrama.tsx`

Componente principal que orquesta la visualización completa.

**Responsabilidades:**
- Recibe el array de empleados
- Agrupa empleados por área
- Ordena áreas según prioridad visual
- Renderiza grid responsivo con `AreaNode`

**Orden de Áreas (Prioridad):**
1. Dirección
2. Arquitectura
3. Obras
4. Logística
5. Pañol
6. Mantenimiento
7. Administración
8. Recursos Humanos
9. Sin área

**Grid Responsivo:**
- Móvil: 1 columna
- Tablet: 2 columnas
- Desktop: 3 columnas

#### 2. `AreaNode.tsx`

**Ubicación:** `components/organigrama/AreaNode.tsx`

Componente que representa cada área del organigrama.

**Características:**
- Card con título del área
- Contador de empleados
- Clasificación automática por jerarquía:
  - **Jefes/Líderes:** Contiene palabras clave (jefe, líder, encargado, director, gerente, coordinador)
  - **Intermedios:** Roles que no son jefes ni base
  - **Base:** Obreros, operarios, técnicos, ayudantes
- Renderiza empleados en orden jerárquico
- Líneas de conexión visual entre niveles

**Estructura Visual:**
```
┌─────────────────────┐
│   Área: Obras       │
│   5 empleados       │
├─────────────────────┤
│  ┌───────────────┐  │
│  │ Jefe de Obra  │  │
│  └───────┬───────┘  │
│          │          │
│  ┌───────┴───────┐  │
│  │ Capataz       │  │
│  └───────┬───────┘  │
│          │          │
│  ┌───────┴───────┐  │
│  │ Obrero        │  │
│  └───────────────┘  │
└─────────────────────┘
```

#### 3. `EmployeeNode.tsx`

**Ubicación:** `components/organigrama/EmployeeNode.tsx`

Componente que representa cada empleado en el organigrama.

**Características:**
- Card elegante con avatar circular
- Nombre completo
- Puesto
- Badge del estado del seguro:
  - Verde: Vigente
  - Amarillo: Por vencer
  - Rojo: Vencido
- Hover effect con sombra aumentada
- Clickable: navega a `/rrhh/[id]`
- Líneas de conexión verticales (si no es primero/último)

**Diseño:**
- Borde izquierdo azul PMD (`border-l-4 border-l-pmd-darkBlue`)
- Padding generoso (`p-4`)
- Transiciones suaves
- Cursor pointer

## Jerarquías

### Clasificación Automática

El sistema clasifica automáticamente los empleados según su puesto:

#### Jefes / Líderes
Palabras clave detectadas:
- jefe
- líder / lider
- encargado
- director
- gerente
- coordinador

**Posición:** Arriba en el área

#### Roles Intermedios
Cualquier puesto que no sea jefe ni base.

**Posición:** Medio en el área

#### Base / Obreros
Palabras clave detectadas:
- obrero
- operario
- técnico / tecnico
- ayudante

**Posición:** Abajo en el área

## Áreas Reconocidas

El sistema reconoce y traduce automáticamente las siguientes áreas:

- **Dirección** (Direction)
- **Arquitectura** (Architecture)
- **Obras** (Works)
- **Logística** (Logistics)
- **Pañol** (Almacén)
- **Mantenimiento** (Maintenance)
- **Administración** (Administration)
- **Recursos Humanos** (RRHH)

## Estados del Seguro

Cada empleado muestra un badge con el estado de su seguro:

- **Verde (Vigente):** Más de 15 días hasta el vencimiento
- **Amarillo (Por vencer):** 15 días o menos hasta el vencimiento
- **Rojo (Vencido):** Ya venció

El cálculo se realiza automáticamente usando `calcularEstadoSeguro()` de `utils/seguro.ts`.

## Diseño Visual

### Principios de Diseño

- **Cards Conectadas:** Líneas verticales delgadas (`#d1d5db`) conectan empleados jerárquicamente
- **Espaciado Generoso:** `gap-6` entre áreas, `space-y-3` entre empleados
- **Sombras Suaves:** `shadow-pmd` en cards, `hover:shadow-lg` en hover
- **Bordes Redondeados:** `rounded-lg`, `rounded-xl`
- **Colores PMD:** Azul PMD para bordes y acentos
- **Tipografía Clara:** Títulos en `text-xl font-bold`, textos en `text-sm`

### Líneas de Conexión

Las líneas verticales se renderizan usando:
- `absolute positioning`
- `border-l` o `w-0.5` para líneas delgadas
- Color gris claro (`#d1d5db` o `bg-gray-300`)
- Altura ajustada (`h-4` o `h-6`)

### Responsive Design

- **Móvil (< 768px):** 1 columna, cards apiladas
- **Tablet (768px - 1024px):** 2 columnas
- **Desktop (> 1024px):** 3 columnas

## Integración con el Sistema

### Dashboard

El módulo está integrado en el Dashboard principal con:
- Título: "Organigrama"
- Descripción: "Estructura completa del personal PMD"
- Ruta: `/organigrama`
- Icono: 🏢

### Módulo RRHH

- Usa el mismo endpoint: `GET /employees`
- Navegación bidireccional:
  - Desde organigrama → Click en empleado → `/rrhh/[id]`
  - Desde RRHH → Botón "Ver organigrama" (futuro)

### Navegación

- Botón "Volver" (`BotonVolver`) en la página principal
- Click en cualquier empleado navega a su ficha completa

## Localización

Todo el módulo está completamente en español:

- Títulos y subtítulos
- Nombres de áreas (traducción automática)
- Estados del seguro
- Mensajes de error y carga
- Contadores de empleados

## Funcionalidades Implementadas

### ✅ Completadas

- Agrupación automática por área
- Clasificación jerárquica (jefes, intermedios, base)
- Visualización con cards conectadas
- Líneas de conexión verticales
- Badges de estado de seguro
- Navegación a ficha del empleado
- Grid responsivo
- Integración con Dashboard

### ⏳ Mejoras Futuras

- **Filtros:** Filtrar por área o estado
- **Búsqueda:** Buscar empleado específico
- **Vista Expandida/Colapsada:** Expandir/colapsar áreas
- **Exportar:** Exportar organigrama como imagen o PDF
- **Vista Horizontal:** Opción de vista horizontal (de izquierda a derecha)
- **Zoom:** Zoom in/out para áreas grandes
- **Tooltips:** Información adicional al hover
- **Drag & Drop:** Reorganizar empleados (solo admin)

## Estructura de Archivos

```
app/(authenticated)/organigrama/
  └── page.tsx

components/organigrama/
  ├── Organigrama.tsx
  ├── AreaNode.tsx
  └── EmployeeNode.tsx

utils/
  └── seguro.ts (ya existente, reutilizado)
```

## Cómo Expandir el Módulo

### 1. Agregar Filtros

```typescript
// En Organigrama.tsx
const [filterArea, setFilterArea] = useState<string | null>(null);
const filteredEmployees = filterArea 
  ? employees.filter(emp => emp.area === filterArea)
  : employees;
```

### 2. Agregar Búsqueda

```typescript
// En Organigrama.tsx
const [searchTerm, setSearchTerm] = useState("");
const filteredEmployees = employees.filter(emp =>
  emp.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### 3. Vista Expandida/Colapsada

```typescript
// En AreaNode.tsx
const [isExpanded, setIsExpanded] = useState(true);
// Agregar botón para expandir/colapsar
```

### 4. Exportar como Imagen

```typescript
// Usar librería como html2canvas
import html2canvas from 'html2canvas';

const exportAsImage = async () => {
  const element = document.getElementById('organigrama');
  const canvas = await html2canvas(element);
  // Descargar imagen
};
```

### 5. Vista Horizontal

```typescript
// Modificar AreaNode.tsx para renderizar horizontalmente
<div className="flex flex-row items-center gap-4">
  {/* Empleados en fila */}
</div>
```

### 6. Agregar Más Niveles Jerárquicos

```typescript
// En AreaNode.tsx, agregar más categorías:
const subJefes: Employee[] = [];
const especialistas: Employee[] = [];
// etc.
```

## Notas Técnicas

- El módulo no modifica layouts ni middleware
- Usa componentes UI existentes para mantener consistencia
- Reutiliza hooks del módulo RRHH (`useEmployees`)
- Manejo de errores implementado
- TypeScript con tipos seguros
- Responsive design completo
- Cálculo de estado de seguro en tiempo real

## Rendimiento

- **Agrupación:** O(n) donde n = número de empleados
- **Clasificación:** O(n) por área
- **Renderizado:** Optimizado con React keys
- **Re-renders:** Minimizados con memoización (futuro)

## Conclusión

El módulo de Organigrama está diseñado para ser visualmente atractivo y funcional. La estructura modular permite agregar nuevas funcionalidades sin afectar las existentes. El diseño de cards conectadas proporciona una visualización clara de la jerarquía organizacional, facilitando la comprensión de la estructura de PMD.

