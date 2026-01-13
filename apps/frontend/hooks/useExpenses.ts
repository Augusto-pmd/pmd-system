import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category?: string;
  date: string;
  workId?: string;
  supplierId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useExpenses() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token ? "expenses" : null,
    () => {
      return apiClient.get("/expenses");
    }
  );

  const createExpense = async (expenseData: Partial<Expense>) => {
    const newExpense = await apiClient.post<Expense>("/expenses", expenseData);
    await revalidate();
    return newExpense;
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    const updatedExpense = await apiClient.patch<Expense>(`/expenses/${id}`, expenseData);
    await revalidate();
    return updatedExpense;
  };

  const deleteExpense = async (id: string) => {
    await apiClient.delete(`/expenses/${id}`);
    await revalidate();
  };

  return {
    expenses: ((data as any)?.data || data || []) as Expense[],
    isLoading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    revalidate,
  };
}

export function useExpense(id: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading } = useSWR(
    token && id ? `expenses/${id}` : null,
    () => {
      return apiClient.get(`/expenses/${id}`);
    }
  );

  return {
    expense: ((data as any)?.data || data || null) as Expense | null,
    isLoading,
    error,
  };
}

