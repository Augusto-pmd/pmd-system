import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Cashbox, CashMovement, CreateCashboxData, UpdateCashboxData, CreateCashMovementData, UpdateCashMovementData } from "@/lib/types/cashbox";

export function useCashboxes() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "cashboxes" : null,
    () => {
      return apiClient.get("/cashboxes");
    }
  );

  return {
    cashboxes: ((data as any)?.data || data || []) as Cashbox[],
    error,
    isLoading,
    mutate,
  };
}

export function useCashbox(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useCashbox] id no está definido");
    }
    return { cashbox: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `cashboxes/${id}` : null,
    () => {
      return apiClient.get(`/cashboxes/${id}`);
    }
  );

  return {
    cashbox: ((data as any)?.data || data) as Cashbox | null,
    error,
    isLoading,
    mutate,
  };
}

export const cashboxApi = {
  create: (data: CreateCashboxData) => {
    return apiClient.post("/cashboxes", data);
  },
  update: (id: string, data: UpdateCashboxData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.update] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    return apiClient.patch(`/cashboxes/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.delete] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    return apiClient.delete(`/cashboxes/${id}`);
  },
  refill: (id: string, data: { amount: number; currency: string; delivered_by?: string; description?: string }) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.refill] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    return apiClient.post(`/cashboxes/${id}/refill`, data);
  },
  close: (id: string, data: { closing_balance_ars: number; closing_balance_usd?: number; closing_date?: string }) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.close] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    if (!data.closing_balance_ars && data.closing_balance_ars !== 0) {
      throw new Error("El saldo de cierre ARS es obligatorio");
    }
    return apiClient.post(`/cashboxes/${id}/close`, data);
  },
  open: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.open] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    return apiClient.post(`/cashboxes/${id}/open`, {});
  },
  requestExplanation: (id: string, data: { message: string }) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.requestExplanation] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    return apiClient.post(`/cashboxes/${id}/request-explanation`, data);
  },
  rejectDifference: (id: string, data?: { reason?: string }) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.rejectDifference] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    return apiClient.post(`/cashboxes/${id}/reject-difference`, data || {});
  },
  manualAdjustment: (id: string, data: { amount: number; currency: string; reason?: string }) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.manualAdjustment] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    return apiClient.post(`/cashboxes/${id}/manual-adjustment`, data);
  },
  getHistory: (id: string, filters?: {
    page?: number;
    limit?: number;
    type?: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxApi.getHistory] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.currency) params.append('currency', filters.currency);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString();
    return apiClient.get(`/cashboxes/${id}/history${queryString ? `?${queryString}` : ''}`);
  },
};

export function useCashMovements(cashboxId?: string) {
  const { token } = useAuthStore();
  
  let endpoint: string;
  if (cashboxId && cashboxId.trim()) {
    endpoint = `/cash-movements?cashboxId=${encodeURIComponent(cashboxId)}`;
  } else {
    endpoint = "/cash-movements";
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && endpoint ? endpoint : null,
    () => {
      return apiClient.get(endpoint);
    }
  );

  return {
    movements: ((data as any)?.data || data || []) as CashMovement[],
    error,
    isLoading,
    mutate,
  };
}

export function useCashMovement(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useCashMovement] id no está definido");
    }
    return { movement: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `cash-movements/${id}` : null,
    () => {
      return apiClient.get(`/cash-movements/${id}`);
    }
  );

  return {
    movement: ((data as any)?.data || data) as CashMovement | null,
    error,
    isLoading,
    mutate,
  };
}

export const cashMovementApi = {
  create: (data: CreateCashMovementData) => {
    return apiClient.post("/cash-movements", data);
  },
  get: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashMovementApi.get] id no está definido");
      }
      throw new Error("ID de movimiento no está definido");
    }
    return apiClient.get(`/cash-movements/${id}`);
  },
  update: (id: string, data: UpdateCashMovementData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashMovementApi.update] id no está definido");
      }
      throw new Error("ID de movimiento no está definido");
    }
    return apiClient.patch(`/cash-movements/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashMovementApi.delete] id no está definido");
      }
      throw new Error("ID de movimiento no está definido");
    }
    return apiClient.delete(`/cash-movements/${id}`);
  },
};
