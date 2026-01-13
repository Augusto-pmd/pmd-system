import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface AccountingReport {
  id: string;
  type: string;
  period: string;
  totalAssets?: number;
  totalLiabilities?: number;
  netWorth?: number;
  createdAt?: string;
}

export function useAccounting() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading } = useSWR(
    token ? "accounting" : null,
    () => {
      return apiClient.get("/accounting");
    }
  );

  return {
    reports: ((data as any)?.data || data || []) as AccountingReport[],
    isLoading,
    error,
  };
}

