# Módulo de Configuración / Perfil de Usuario - Documentación

## Resumen

El módulo de Configuración (`/settings`) es una sección premium del sistema PMD que permite a los usuarios gestionar su perfil, ver su información personal y realizar acciones relacionadas con su cuenta.

## Estructura del Módulo

### Página Principal

**Ruta:** `/settings`  
**Archivo:** `app/(authenticated)/settings/page.tsx`

La página principal está organizada en tres secciones principales:

1. **Datos del Usuario** - Información completa del perfil
2. **Opciones de Cuenta** - Acciones disponibles para el usuario
3. **Actividad Reciente** - Historial de acciones (placeholder)

### Componentes

#### 1. `UserAvatar.tsx`

**Ubicación:** `components/settings/UserAvatar.tsx`

Componente reutilizable para mostrar el avatar del usuario con la inicial de su nombre.

**Props:**
- `name?: string` - Nombre del usuario para extraer la inicial
- `size?: "sm" | "md" | "lg" | "xl"` - Tamaño del avatar (por defecto: "lg")
- `className?: string` - Clases CSS adicionales

**Características:**
- Gradiente azul PMD elegante
- Borde blanco para destacar
- Sombra suave
- Responsive y adaptable

#### 2. `UserInfoSection.tsx`

**Ubicación:** `components/settings/UserInfoSection.tsx`

Sección que muestra toda la información del usuario de forma elegante.

**Muestra:**
- Avatar grande con inicial
- Nombre completo
- Badge de rol con color según tipo
- Email
- Rol traducido al español
- ID de usuario (si existe)
- Fecha de creación (si está disponible)

**Características:**
- Diseño responsive (centrado en móvil, alineado a la izquierda en desktop)
- Grid de 2 columnas para información
- Traducción completa al español
- Badges de rol con colores diferenciados

#### 3. `UserActionsSection.tsx`

**Ubicación:** `components/settings/UserActionsSection.tsx`

Sección con todas las acciones disponibles para el usuario.

**Acciones:**
- **Editar perfil** - Placeholder (próximamente)
- **Cambiar contraseña** - Placeholder (próximamente)
- **Cerrar sesión** - Funcional (limpia cookies y redirige a login)
- **Volver al Dashboard** - Navegación al dashboard

**Características:**
- Botones con estilo PMD premium
- Separación visual entre acciones principales y secundarias
- Manejo completo de logout con limpieza de cookies

#### 4. `RecentActivitySection.tsx`

**Ubicación:** `components/settings/RecentActivitySection.tsx`

Sección placeholder para mostrar actividad reciente del usuario.

**Estado actual:**
- Muestra mensaje de "No hay actividad reciente"
- Listo para conectar con logs de auditoría en el futuro

**Expansión futura:**
- Conectar con `useAuditLogs` filtrando por usuario actual
- Mostrar últimas 5-10 acciones
- Enlaces a detalles de cada acción

## Funcionalidades Implementadas

### ✅ Cerrar Sesión

La funcionalidad de cerrar sesión está completamente implementada:

1. Llama a `authStore.logout()` que:
   - Limpia localStorage (`pmd-auth-storage`, `user`, `token`)
   - Limpia cookies (`token`, `refreshToken`)
   - Resetea el estado del store

2. Redirige a `/login` usando `router.push("/login")`

### ⏳ Placeholders (Próximamente)

- **Editar perfil:** Formulario para modificar nombre, email, etc.
- **Cambiar contraseña:** Formulario para cambiar la contraseña actual
- **Actividad reciente:** Integración con logs de auditoría

## Localización

Todo el módulo está completamente en español:

- Títulos y subtítulos
- Labels y descripciones
- Mensajes de error y estados vacíos
- Traducción de roles (Administrador, Operador, Auditor, etc.)
- Formato de fechas en español

## Estilo y Diseño

### Principios de Diseño PMD

- **Colores:** Azul PMD (`pmd-darkBlue`, `pmd-mediumBlue`) con gradientes elegantes
- **Tipografía:** Jerarquía clara con tamaños diferenciados
- **Espaciado:** Padding generoso (`p-6`, `p-8`)
- **Sombras:** Suaves y sutiles (`shadow-pmd`, `shadow-lg`)
- **Bordes:** Redondeados (`rounded-lg`, `rounded-pmd`)
- **Responsive:** Grid adaptativo (1 columna móvil, 2 columnas desktop)

### Componentes UI Utilizados

- `Card` - Contenedores principales
- `Badge` - Indicadores de rol
- `Button` - Acciones del usuario
- `EmptyState` - Estados vacíos
- `BotonVolver` - Navegación hacia atrás

## Cómo Expandir el Módulo

### 1. Agregar Edición de Perfil

```typescript
// Crear componente EditProfileForm.tsx
// Agregar modal o página /settings/edit
// Conectar con API endpoint PUT /users/{id}
```

### 2. Agregar Cambio de Contraseña

```typescript
// Crear componente ChangePasswordForm.tsx
// Agregar modal o página /settings/change-password
// Conectar con API endpoint POST /auth/change-password
```

### 3. Conectar Actividad Reciente

```typescript
// En RecentActivitySection.tsx
import { useAuditLogs } from "@/hooks/api/audit";
import { useAuthStore } from "@/store/authStore";

const { user } = useAuthStore();
const { logs } = useAuditLogs();
const userActivities = logs.filter(log => log.userId === user?.id);
```

### 4. Agregar Preferencias

```typescript
// Crear componente PreferencesSection.tsx
// Agregar opciones como:
// - Tema (claro/oscuro)
// - Idioma
// - Notificaciones
// - Configuración de dashboard
```

### 5. Agregar Seguridad

```typescript
// Crear componente SecuritySection.tsx
// Agregar:
// - Sesiones activas
// - Historial de inicios de sesión
// - Autenticación de dos factores (2FA)
```

## Estructura de Archivos

```
app/(authenticated)/settings/
  └── page.tsx

components/settings/
  ├── UserAvatar.tsx
  ├── UserInfoSection.tsx
  ├── UserActionsSection.tsx
  ├── RecentActivitySection.tsx
  ├── UserProfileCard.tsx (legacy, puede eliminarse)
  └── SettingsActions.tsx (legacy, puede eliminarse)

hooks/api/
  └── (no requiere hooks adicionales, usa authStore)

store/
  └── authStore.ts (ya existente)
```

## Integración con el Sistema

### Autenticación

El módulo utiliza `useAuthStore` para:
- Obtener información del usuario actual
- Realizar logout
- Verificar estado de autenticación

### Protección de Rutas

La página está protegida con `ProtectedRoute`, que:
- Verifica autenticación
- Redirige a login si no está autenticado
- Valida permisos si es necesario

### Navegación

- Botón "Volver" usando `BotonVolver` (navegación hacia atrás)
- Botón "Volver al Dashboard" (navegación directa)

## Mejoras Futuras Sugeridas

1. **Subida de Avatar:** Permitir al usuario subir una imagen de perfil
2. **Notificaciones:** Configuración de preferencias de notificaciones
3. **Exportar Datos:** Permitir descargar todos los datos del usuario
4. **Eliminar Cuenta:** Opción para eliminar la cuenta (con confirmación)
5. **Historial Completo:** Página dedicada con historial completo de actividad
6. **Configuración Avanzada:** Opciones avanzadas para administradores

## Notas Técnicas

- El módulo no modifica layouts ni middleware
- Usa componentes UI existentes para mantener consistencia
- Manejo de errores implementado en todos los componentes
- TypeScript con tipos seguros para todas las props
- Responsive design para móvil y desktop

## Conclusión

El módulo de Configuración está diseñado para ser expandible y mantenible. La estructura modular permite agregar nuevas funcionalidades sin afectar las existentes. Todos los componentes están preparados para futuras integraciones con el backend.

