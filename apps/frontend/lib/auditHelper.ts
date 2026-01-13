/**
 * Helper para registrar eventos de auditoría automáticamente desde otros módulos
 * 
 * Este helper puede ser usado por cualquier módulo para registrar cambios en auditoría.
 * Si el backend maneja auditoría automáticamente, este helper puede ser opcional.
 */

import { useAuditStore } from "@/store/auditStore";
import { useAuthStore } from "@/store/authStore";

export interface AuditEntryData {
  action: string; // "create" | "update" | "delete" | "read" | etc.
  module: string; // "staff" | "works" | "suppliers" | "clients" | "cashbox" | "accounting" | "documents" | "alerts" | "users" | "roles"
  entity?: string; // Nombre de la entidad (ej: "Employee", "Work", "Supplier")
  entityId?: string; // ID del recurso modificado
  details?: string; // Descripción adicional
  before?: unknown; // Estado anterior (para updates)
  after?: unknown; // Estado posterior (para updates)
}

/**
 * Registra un evento de auditoría
 * 
 * @param data Datos del evento de auditoría
 * @returns Promise que se resuelve cuando el evento se registra
 */
export async function logAuditEvent(data: AuditEntryData): Promise<void> {
  try {
    const authState = useAuthStore.getState();
    const user = authState.user;
    
    if (!user) {
      console.warn("⚠️ [auditHelper] No hay usuario autenticado, no se puede registrar auditoría");
      return;
    }

    const auditStore = useAuditStore.getState();
    
    await auditStore.createAuditEntry({
      action: data.action,
      module: data.module,
      entity: data.entity,
      entityId: data.entityId,
      details: data.details,
      before: data.before,
      after: data.after,
      user: user.id,
      userName: user.fullName || user.email || "Usuario desconocido",
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    // No lanzar error para no romper el flujo principal
    // Solo loguear el error
    if (process.env.NODE_ENV === "development") {
      console.error("🔴 [auditHelper] Error al registrar evento de auditoría:", error);
    }
  }
}

/**
 * Helper para registrar creación de recursos
 */
export async function logCreate(module: string, entity: string, entityId: string, details?: string): Promise<void> {
  await logAuditEvent({
    action: "create",
    module,
    entity,
    entityId,
    details: details || `Creación de ${entity}`,
  });
}

/**
 * Helper para registrar actualización de recursos
 */
export async function logUpdate(
  module: string,
  entity: string,
  entityId: string,
  before: unknown,
  after: unknown,
  details?: string
): Promise<void> {
  await logAuditEvent({
    action: "update",
    module,
    entity,
    entityId,
    before,
    after,
    details: details || `Actualización de ${entity}`,
  });
}

/**
 * Helper para registrar eliminación de recursos
 */
export async function logDelete(module: string, entity: string, entityId: string, details?: string): Promise<void> {
  await logAuditEvent({
    action: "delete",
    module,
    entity,
    entityId,
    details: details || `Eliminación de ${entity}`,
  });
}

/**
 * Helper para registrar lectura/visualización de recursos (opcional)
 */
export async function logRead(module: string, entity: string, entityId: string, details?: string): Promise<void> {
  await logAuditEvent({
    action: "read",
    module,
    entity,
    entityId,
    details: details || `Visualización de ${entity}`,
  });
}

