import { create } from "zustand";
import { apiClient } from "@/lib/api";

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
  user?: string;
  userName?: string;
  userId?: string;
  entity?: string;
  entityId?: string;
  details?: string;
  timestamp?: string;
  before?: unknown;
  after?: unknown;
}

interface AuditState {
  logs: AuditLog[];
  isLoading: boolean;
  error: string | null;

  fetchLogs: (params?: { startDate?: string; endDate?: string; module?: string; user?: string }) => Promise<void>;
  createAuditEntry: (payload: Partial<AuditLog>) => Promise<void>;
  clearAuditEntry: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,

  async fetchLogs(params) {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.module) queryParams.append("module", params.module);
    if (params?.user) queryParams.append("user", params.user);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/audit?${queryString}` : "/audit";

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      set({ logs: (data as any)?.data || data || [], isLoading: false });
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [auditStore] Error al obtener logs de auditoría:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar logs de auditoría";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async createAuditEntry(payload) {
    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [auditStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios según DTO
    if (!payload.action || payload.action.trim() === "") {
      throw new Error("La acción es obligatoria");
    }
    if (!payload.module || payload.module.trim() === "") {
      throw new Error("El módulo es obligatorio");
    }
    if (!payload.user || payload.user.trim() === "") {
      throw new Error("El usuario es obligatorio");
    }

    try {
      // Construir payload SOLO con campos válidos del DTO del backend
      // El backend espera: user_id (no user), entity_id (no entityId), entity_type (no entity)
      // previous_value (no before), new_value (no after)
      // NO acepta: timestamp, userId, userName, details, etc.
      const auditPayload: {
        action: string;
        module: string;
        user_id?: string;
        entity_id?: string;
        entity_type?: string;
        previous_value?: Record<string, any>;
        new_value?: Record<string, any>;
        ip_address?: string;
        user_agent?: string;
        criticality?: string;
      } = {
        action: payload.action.trim(),
        module: payload.module.trim(),
      };

      // Mapear user/userId a user_id
      if (payload.user_id) {
        auditPayload.user_id = payload.user_id;
      } else if (payload.user) {
        auditPayload.user_id = payload.user;
      } else if (payload.userId) {
        auditPayload.user_id = payload.userId;
      }

      // Mapear entityId a entity_id (solo si es un UUID válido)
      // El backend requiere que entity_id sea un UUID válido si se proporciona
      const entityIdValue = payload.entity_id || payload.entityId;
      if (entityIdValue) {
        // Validar que sea un UUID válido usando regex
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(String(entityIdValue))) {
          auditPayload.entity_id = String(entityIdValue);
        }
        // Si no es un UUID válido, no lo incluimos (es opcional)
      }

      // Mapear entity a entity_type
      if (payload.entity_type) {
        auditPayload.entity_type = payload.entity_type;
      } else if (payload.entity && typeof payload.entity === 'string') {
        auditPayload.entity_type = payload.entity;
      }

      // Mapear before a previous_value
      if (payload.previous_value !== undefined && payload.previous_value !== null) {
        auditPayload.previous_value = payload.previous_value;
      } else if (payload.before !== undefined && payload.before !== null) {
        auditPayload.previous_value = payload.before as Record<string, any>;
      }

      // Mapear after a new_value
      if (payload.new_value !== undefined && payload.new_value !== null) {
        auditPayload.new_value = payload.new_value;
      } else if (payload.after !== undefined && payload.after !== null) {
        auditPayload.new_value = payload.after as Record<string, any>;
      }

      // Campos opcionales que pueden venir directamente
      if (payload.ip_address) auditPayload.ip_address = payload.ip_address;
      if (payload.user_agent) auditPayload.user_agent = payload.user_agent;
      if (payload.criticality) auditPayload.criticality = payload.criticality;

      // NO incluir: user, userId, userName, timestamp, details, etc.
      // Solo se envían los campos definidos en CreateAuditLogDto

      await apiClient.post("/audit", auditPayload);
      await get().fetchLogs();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [auditStore] Error al crear entrada de auditoría:", error);
      }
      throw error;
    }
  },

  async clearAuditEntry(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [auditStore] id no está definido");
      }
      throw new Error("ID de entrada no está definido");
    }

    try {
      await apiClient.delete(`/audit/${id}`);
      await get().fetchLogs();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [auditStore] Error al eliminar entrada de auditoría:", error);
      }
      throw error;
    }
  },

  async clearAll() {
    try {
      await apiClient.delete("/audit");
      await get().fetchLogs();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [auditStore] Error al limpiar todos los registros:", error);
      }
      throw error;
    }
  },
}));

