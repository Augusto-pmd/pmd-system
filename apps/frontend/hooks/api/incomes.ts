import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Income, CreateIncomeData, UpdateIncomeData } from "@/lib/types/income";

export function useIncomes() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/incomes");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "incomes" : null,
    fetcher
  );

  return {
    incomes: ((data as any)?.data || data || []) as Income[],
    error,
    isLoading,
    mutate,
  };
}

export function useIncome(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useIncome] id no está definido");
    }
    return { income: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `incomes/${id}` : null,
    () => {
      return apiClient.get(`/incomes/${id}`);
    }
  );

  return {
    income: ((data as any)?.data || data) as Income | null,
    error,
    isLoading,
    mutate,
  };
}

export const incomeApi = {
  create: (data: CreateIncomeData) => {
    return apiClient.post("/incomes", data);
  },
  update: (id: string, data: UpdateIncomeData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [incomeApi.update] id no está definido");
      }
      throw new Error("ID de ingreso no está definido");
    }
    return apiClient.patch(`/incomes/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [incomeApi.delete] id no está definido");
      }
      throw new Error("ID de ingreso no está definido");
    }
    return apiClient.delete(`/incomes/${id}`);
  },
};
