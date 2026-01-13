import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

export function useAuditLogs() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading } = useSWR(
    token ? "audit" : null,
    () => {
      return apiClient.get("/audit");
    }
  );

  return {
    logs: ((data as any)?.data || data || []) as AuditLog[],
    isLoading,
    error,
  };
}

