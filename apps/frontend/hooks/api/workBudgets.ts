import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useWorkBudgets(workId?: string) {
  const { token } = useAuthStore();
  
  const endpoint = workId ? `/work-budgets?workId=${workId}` : "/work-budgets";
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `work-budgets${workId ? `-${workId}` : ""}` : null,
    () => {
      return apiClient.get(endpoint);
    }
  );

  return {
    budgets: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useWorkBudget(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useWorkBudget] id no está definido");
    }
    return { budget: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `work-budgets/${id}` : null,
    () => {
      return apiClient.get(`/work-budgets/${id}`);
    }
  );

  return {
    budget: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const workBudgetApi = {
  create: (data: unknown) => {
    return apiClient.post("/work-budgets", data);
  },
  update: (id: string, data: unknown) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [workBudgetApi.update] id no está definido");
      }
      throw new Error("ID de presupuesto no está definido");
    }
    return apiClient.put(`/work-budgets/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [workBudgetApi.delete] id no está definido");
      }
      throw new Error("ID de presupuesto no está definido");
    }
    return apiClient.delete(`/work-budgets/${id}`);
  },
};

