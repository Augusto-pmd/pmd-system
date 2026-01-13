import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface Cashbox {
  id: string;
  name: string;
  balance: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CashMovement {
  id: string;
  cashboxId: string;
  type: "income" | "expense";
  amount: number;
  description?: string;
  date: string;
  createdAt?: string;
}

export function useCashboxes() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token ? "cashboxes" : null,
    () => {
      return apiClient.get("/cashboxes");
    }
  );

  const createCashbox = async (cashboxData: Partial<Cashbox>) => {
    const newCashbox = await apiClient.post<Cashbox>("/cashboxes", cashboxData);
    await revalidate();
    return newCashbox;
  };

  const updateCashbox = async (id: string, cashboxData: Partial<Cashbox>) => {
    const updatedCashbox = await apiClient.patch<Cashbox>(`/cashboxes/${id}`, cashboxData);
    await revalidate();
    return updatedCashbox;
  };

  const deleteCashbox = async (id: string) => {
    await apiClient.delete(`/cashboxes/${id}`);
    await revalidate();
  };

  return {
    cashboxes: ((data as any)?.data || data || []) as Cashbox[],
    isLoading,
    error,
    createCashbox,
    updateCashbox,
    deleteCashbox,
    revalidate,
  };
}

export function useCashbox(id: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading } = useSWR(
    token && id ? `cashboxes/${id}` : null,
    () => {
      return apiClient.get(`/cashboxes/${id}`);
    }
  );

  return {
    cashbox: ((data as any)?.data || data || null) as Cashbox | null,
    isLoading,
    error,
  };
}

export function useCashMovements(cashboxId: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token && cashboxId ? `cash-movements?cashboxId=${cashboxId}` : null,
    () => {
      return apiClient.get(`/cash-movements?cashboxId=${cashboxId}`);
    }
  );

  const createMovement = async (movementData: Partial<CashMovement>) => {
    const newMovement = await apiClient.post<CashMovement>("/cash-movements", movementData);
    await revalidate();
    return newMovement;
  };

  const deleteMovement = async (id: string) => {
    await apiClient.delete(`/cash-movements/${id}`);
    await revalidate();
  };

  return {
    movements: ((data as any)?.data || data || []) as CashMovement[],
    isLoading,
    error,
    createMovement,
    deleteMovement,
    revalidate,
  };
}

