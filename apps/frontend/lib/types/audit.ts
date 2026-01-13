/**
 * Tipos TypeScript para AuditLog del frontend
 * Basado en la entidad AuditLog del backend
 */

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  module: string;
  entity_id?: string;
  entity_type?: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  criticality?: string;
  created_at: string;
  // Campos adicionales para compatibilidad
  userId?: string;
  userName?: string;
  usuario?: string;
  accion?: string;
  entityType?: string;
  modulo?: string;
  timestamp?: string;
  fecha?: string;
  createdAt?: string;
  details?: string;
  descripcion?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
}

export interface CreateAuditLogData {
  user_id?: string;
  action: string;
  module: string;
  entity_id?: string;
  entity_type?: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  criticality?: string;
}

