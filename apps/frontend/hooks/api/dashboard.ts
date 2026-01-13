import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useDashboardStats() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "dashboard" : null,
    () => {
      return apiClient.get("/dashboard");
    }
  );

  return {
    stats: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}
