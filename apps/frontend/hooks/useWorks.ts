import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface Work {
  id: string;
  title: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkBudget {
  id: string;
  workId: string;
  category?: string;
  amount: number;
  description?: string;
  createdAt?: string;
}

export function useWorks() {
  const { token } = useAuthStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  const endpoint = organizationId ? `works` : null;
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token && endpoint ? endpoint : null,
    () => {
      return apiClient.get("/works");
    }
  );

  const createWork = async (workData: Partial<Work>) => {
    if (!organizationId) throw new Error("No hay organización seleccionada");
    const newWork = await apiClient.post<Work>("/works", workData);
    await revalidate();
    return newWork;
  };

  const updateWork = async (id: string, workData: Partial<Work>) => {
    if (!organizationId) throw new Error("No hay organización seleccionada");
    const updatedWork = await apiClient.patch<Work>(`/works/${id}`, workData);
    await revalidate();
    return updatedWork;
  };

  const deleteWork = async (id: string) => {
    if (!organizationId) throw new Error("No hay organización seleccionada");
    await apiClient.delete(`/works/${id}`);
    await revalidate();
  };

  return {
    works: ((data as any)?.data || data || []) as Work[],
    isLoading,
    error,
    createWork,
    updateWork,
    deleteWork,
    revalidate,
  };
}

export function useWork(id: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading } = useSWR(
    token && id ? `works/${id}` : null,
    () => {
      return apiClient.get(`/works/${id}`);
    }
  );

  return {
    work: ((data as any)?.data || data || null) as Work | null,
    isLoading,
    error,
  };
}

export function useWorkBudgets(workId: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token && workId ? `work-budgets?workId=${workId}` : null,
    () => {
      return apiClient.get(`/work-budgets?workId=${workId}`);
    }
  );

  const createBudget = async (budgetData: Partial<WorkBudget>) => {
    const newBudget = await apiClient.post<WorkBudget>("/work-budgets", budgetData);
    await revalidate();
    return newBudget;
  };

  const updateBudget = async (id: string, budgetData: Partial<WorkBudget>) => {
    const updatedBudget = await apiClient.patch<WorkBudget>(`/work-budgets/${id}`, budgetData);
    await revalidate();
    return updatedBudget;
  };

  const deleteBudget = async (id: string) => {
    await apiClient.delete(`/work-budgets/${id}`);
    await revalidate();
  };

  return {
    budgets: ((data as any)?.data || data || []) as WorkBudget[],
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    revalidate,
  };
}

