import { create } from "zustand";
import { apiClient } from "@/lib/api";

export interface Alert {
  id: string;
  type: string; // AlertType enum del backend
  title: string; // Máximo 255 caracteres, required
  message: string; // required, string
  severity?: "info" | "warning" | "critical"; // optional
  user_id?: string;
  work_id?: string;
  supplier_id?: string;
  expense_id?: string;
  contract_id?: string;
  cashbox_id?: string;
  document_id?: string;
  metadata?: object;
  read: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Campos legacy para compatibilidad
  category?: string;
  description?: string;
  workId?: string;
  supplierId?: string;
}

interface AlertsState {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;

  fetchAlerts: () => Promise<void>;
  createAlert: (payload: Partial<Alert>) => Promise<void>;
  updateAlert: (id: string, payload: Partial<Alert>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  isLoading: false,
  error: null,

  async fetchAlerts() {
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get("/alerts");
      const rawAlerts = (data as any)?.data || data || [];
      // Normalizar datos del backend: convertir is_read a read
      const normalizedAlerts = rawAlerts.map((alert: any) => ({
        ...alert,
        read: alert.is_read !== undefined ? alert.is_read : alert.read || false,
      }));
      set({ alerts: normalizedAlerts, isLoading: false });
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [alertsStore] Error al obtener alertas:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar alertas";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async markAsRead(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertsStore] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }

    try {
      await apiClient.patch(`/alerts/${id}/mark-read`, { is_read: true });
      await get().fetchAlerts();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [alertsStore] Error al marcar alerta como leída:", error);
      }
      throw error;
    }
  },

  async createAlert(payload) {
    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertsStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios según CreateAlertDto del backend
    if (!payload.title || payload.title.trim() === "") {
      throw new Error("El título es obligatorio");
    }
    if (payload.title.length > 255) {
      throw new Error("El título no puede exceder 255 caracteres");
    }
    if (!payload.message || payload.message.trim() === "") {
      throw new Error("El mensaje es obligatorio");
    }
    if (!payload.type || payload.type.trim() === "") {
      throw new Error("El tipo es obligatorio");
    }

    try {
      // Construir payload exacto según CreateAlertDto del backend
      const alertPayload: {
        type: string;
        title: string;
        message: string;
        severity?: "info" | "warning" | "critical";
        user_id?: string;
        work_id?: string;
        supplier_id?: string;
        expense_id?: string;
        contract_id?: string;
        cashbox_id?: string;
        document_id?: string;
        metadata?: object;
      } = {
        type: payload.type, // AlertType enum - required
        title: payload.title.trim(), // required, max 255
        message: payload.message.trim(), // required, string
      };

      // Campos opcionales
      if (payload.severity) alertPayload.severity = payload.severity;
      if (payload.user_id) alertPayload.user_id = payload.user_id;
      if (payload.work_id) alertPayload.work_id = payload.work_id;
      if (payload.supplier_id) alertPayload.supplier_id = payload.supplier_id;
      if (payload.expense_id) alertPayload.expense_id = payload.expense_id;
      if (payload.contract_id) alertPayload.contract_id = payload.contract_id;
      if (payload.cashbox_id) alertPayload.cashbox_id = payload.cashbox_id;
      if (payload.document_id) alertPayload.document_id = payload.document_id;
      if (payload.metadata) alertPayload.metadata = payload.metadata;

      await apiClient.post("/alerts", alertPayload);
      await get().fetchAlerts();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [alertsStore] Error al crear alerta:", error);
      }
      throw error;
    }
  },

  async updateAlert(id, payload) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertsStore] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertsStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    try {
      await apiClient.put(`/alerts/${id}`, payload);
      await get().fetchAlerts();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [alertsStore] Error al actualizar alerta:", error);
      }
      throw error;
    }
  },

  async deleteAlert(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertsStore] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }

    try {
      await apiClient.delete(`/alerts/${id}`);
      await get().fetchAlerts();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [alertsStore] Error al eliminar alerta:", error);
      }
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      // Marcar todas como leídas individualmente o usar endpoint si existe
      const unreadAlerts = get().alerts.filter(a => !a.read);
      await Promise.all(unreadAlerts.map(alert => apiClient.patch(`/alerts/${alert.id}/mark-read`, { is_read: true })));
      await get().fetchAlerts();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [alertsStore] Error al marcar todas las alertas como leídas:", error);
      }
      throw error;
    }
  },
}));

