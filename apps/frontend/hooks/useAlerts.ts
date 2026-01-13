import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface Alert {
  id: string;
  title: string;
  message: string;
  type?: string;
  status?: "read" | "unread";
  userId?: string;
  createdAt?: string;
}

export function useAlerts() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token ? "alerts" : null,
    () => {
      return apiClient.get("/alerts");
    }
  );

  const markAsRead = async (id: string) => {
    await apiClient.patch(`/alerts/${id}/mark-read`, { is_read: true });
    await revalidate();
  };

  const deleteAlert = async (id: string) => {
    await apiClient.delete(`/alerts/${id}`);
    await revalidate();
  };

  return {
    alerts: ((data as any)?.data || data || []) as Alert[],
    isLoading,
    error,
    markAsRead,
    deleteAlert,
    revalidate,
  };
}

