import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useAlerts() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/alerts");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "alerts" : null,
    fetcher
  );

  const rawAlerts = (data as any)?.data || data || [];
  // Normalizar datos del backend: convertir is_read a read
  const normalizedAlerts = Array.isArray(rawAlerts) 
    ? rawAlerts.map((alert: any) => ({
        ...alert,
        read: alert.is_read !== undefined ? alert.is_read : alert.read || false,
      }))
    : rawAlerts;

  return {
    alerts: normalizedAlerts,
    error,
    isLoading,
    mutate,
  };
}

export function useAlert(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useAlert] id no está definido");
    }
    return { alert: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `alerts/${id}` : null,
    () => {
      return apiClient.get(`/alerts/${id}`);
    }
  );

  const rawAlert = (data as any)?.data || data;
  // Normalizar datos del backend: convertir is_read a read
  const normalizedAlert = rawAlert ? {
    ...rawAlert,
    read: rawAlert.is_read !== undefined ? rawAlert.is_read : rawAlert.read || false,
  } : null;

  return {
    alert: normalizedAlert,
    error,
    isLoading,
    mutate,
  };
}

export function useUnreadAlerts() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "alerts/unread" : null,
    () => {
      return apiClient.get("/alerts/unread");
    }
  );

  const rawUnreadAlerts = (data as any)?.data || data || [];
  // Normalizar datos del backend: convertir is_read a read
  const normalizedUnreadAlerts = Array.isArray(rawUnreadAlerts)
    ? rawUnreadAlerts.map((alert: any) => ({
        ...alert,
        read: alert.is_read !== undefined ? alert.is_read : alert.read || false,
      }))
    : rawUnreadAlerts;

  return {
    unreadAlerts: normalizedUnreadAlerts,
    unreadCount: Array.isArray(normalizedUnreadAlerts) ? normalizedUnreadAlerts.length : 0,
    error,
    isLoading,
    mutate,
  };
}

import { Alert, AssignAlertData, ResolveAlertData } from "@/lib/types/alert";

export const alertApi = {
  create: (data: unknown) => {
    return apiClient.post<Alert>("/alerts", data);
  },
  update: (id: string, data: unknown) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertApi.update] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }
    return apiClient.patch<Alert>(`/alerts/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertApi.delete] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }
    return apiClient.delete(`/alerts/${id}`);
  },
  markAsRead: (id: string, is_read: boolean = true) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertApi.markAsRead] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }
    return apiClient.patch<Alert>(`/alerts/${id}/mark-read`, { is_read });
  },
  assign: (id: string, data: AssignAlertData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertApi.assign] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }
    return apiClient.post<Alert>(`/alerts/${id}/assign`, data);
  },
  resolve: (id: string, data: ResolveAlertData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [alertApi.resolve] id no está definido");
      }
      throw new Error("ID de alerta no está definido");
    }
    return apiClient.post<Alert>(`/alerts/${id}/resolve`, data);
  },
};
