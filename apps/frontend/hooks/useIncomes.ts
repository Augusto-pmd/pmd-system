import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface Income {
  id: string;
  description: string;
  amount: number;
  source?: string;
  date: string;
  workId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useIncomes() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token ? "incomes" : null,
    () => {
      return apiClient.get("/incomes");
    }
  );

  const createIncome = async (incomeData: Partial<Income>) => {
    const newIncome = await apiClient.post<Income>("/incomes", incomeData);
    await revalidate();
    return newIncome;
  };

  const updateIncome = async (id: string, incomeData: Partial<Income>) => {
    const updatedIncome = await apiClient.patch<Income>(`/incomes/${id}`, incomeData);
    await revalidate();
    return updatedIncome;
  };

  const deleteIncome = async (id: string) => {
    await apiClient.delete(`/incomes/${id}`);
    await revalidate();
  };

  return {
    incomes: ((data as any)?.data || data || []) as Income[],
    isLoading,
    error,
    createIncome,
    updateIncome,
    deleteIncome,
    revalidate,
  };
}

export function useIncome(id: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading } = useSWR(
    token && id ? `incomes/${id}` : null,
    () => {
      return apiClient.get(`/incomes/${id}`);
    }
  );

  return {
    income: ((data as any)?.data || data || null) as Income | null,
    isLoading,
    error,
  };
}

