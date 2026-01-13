import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useAccounting() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "accounting" : null,
    () => {
      return apiClient.get("/accounting");
    }
  );

  return {
    accounting: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingReport(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useAccountingReport] id no está definido");
    }
    return { report: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `accounting/${id}` : null,
    () => {
      return apiClient.get(`/accounting/${id}`);
    }
  );

  return {
    report: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingSummary() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "accounting/summary" : null,
    () => {
      return apiClient.get("/accounting/summary");
    }
  );

  return {
    summary: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingTransactions(params?: { startDate?: string; endDate?: string }) {
  const { token } = useAuthStore();
  
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  
  const transactionsUrl = `/accounting/transactions${queryString}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && transactionsUrl ? transactionsUrl : null,
    () => {
      return apiClient.get(transactionsUrl);
    }
  );

  return {
    transactions: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingMonth(month: number | null, year: number | null) {
  const { token } = useAuthStore();
  
  if (!month || !year) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useAccountingMonth] month o year no está definido");
    }
    return { monthData: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const monthUrl = `/accounting/month/${month}/${year}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    token && monthUrl ? monthUrl : null,
    () => {
      return apiClient.get(monthUrl);
    }
  );

  return {
    monthData: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingPurchasesBook(params?: { month?: number; year?: number; workId?: string; supplierId?: string }) {
  const { token } = useAuthStore();
  
  if (!params?.month || !params?.year) {
    return { purchasesBook: [], error: null, isLoading: false, mutate: async () => {} };
  }
  
  const queryParams: Record<string, string> = {
    month: params.month.toString(),
    year: params.year.toString(),
  };
  if (params.workId) queryParams.workId = params.workId;
  if (params.supplierId) queryParams.supplierId = params.supplierId;
  
  const queryString = `?${new URLSearchParams(queryParams).toString()}`;
  const cacheKey = `accounting/purchases-book${queryString}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? cacheKey : null,
    () => {
      return apiClient.get(`/accounting/purchases-book${queryString}`);
    }
  );

  return {
    purchasesBook: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingWithholdings(params?: { month?: number; year?: number; workId?: string; supplierId?: string }) {
  const { token } = useAuthStore();
  
  if (!params?.month || !params?.year) {
    return { withholdings: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const queryParams: Record<string, string> = {
    month: params.month.toString(),
    year: params.year.toString(),
  };
  if (params.workId) queryParams.workId = params.workId;
  if (params.supplierId) queryParams.supplierId = params.supplierId;
  
  const queryString = `?${new URLSearchParams(queryParams).toString()}`;
  const cacheKey = `accounting/withholdings${queryString}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? cacheKey : null,
    () => {
      return apiClient.get(`/accounting/withholdings${queryString}`);
    }
  );

  return {
    withholdings: (data as any)?.data || data || null,
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingPerceptions(params?: { month?: number; year?: number; workId?: string; supplierId?: string }) {
  const { token } = useAuthStore();
  
  if (!params?.month || !params?.year) {
    return { perceptions: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const queryParams: Record<string, string> = {
    month: params.month.toString(),
    year: params.year.toString(),
  };
  if (params.workId) queryParams.workId = params.workId;
  if (params.supplierId) queryParams.supplierId = params.supplierId;
  
  const queryString = `?${new URLSearchParams(queryParams).toString()}`;
  const cacheKey = `accounting/perceptions${queryString}`;
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? cacheKey : null,
    () => {
      return apiClient.get(`/accounting/perceptions${queryString}`);
    }
  );

  return {
    perceptions: (data as any)?.data || data || null,
    error,
    isLoading,
    mutate,
  };
}

export function useAccountingRecordByExpense(expenseId: string | null) {
  const { token } = useAuthStore();
  
  const fetcher = async () => {
    if (!expenseId) {
      return null;
    }
    return apiClient.get(`/accounting?expense_id=${expenseId}`);
  };
  
  // Siempre llamar useSWR, pero con key null si no hay expenseId o token
  const { data, error, isLoading, mutate } = useSWR(
    token && expenseId ? `accounting/expense/${expenseId}` : null,
    fetcher
  );

  // Si no hay expenseId, retornar valores por defecto
  if (!expenseId) {
    return { record: null, error: null, isLoading: false, mutate: async () => {} };
  }

  // El backend devuelve una lista, tomamos el primer registro si existe
  const records = (data as any)?.data || data || [];
  const record = Array.isArray(records) && records.length > 0 ? records[0] : null;

  return {
    record,
    error,
    isLoading,
    mutate,
  };
}

export const accountingApi = {
  getMonth: (month: number, year: number) => {
    return apiClient.get(`/accounting/month/${month}/${year}`);
  },
  getPurchasesBook: (params: { month: number; year: number; workId?: string; supplierId?: string }) => {
    const queryParams: Record<string, string> = {
      month: params.month.toString(),
      year: params.year.toString(),
    };
    if (params.workId) queryParams.workId = params.workId;
    if (params.supplierId) queryParams.supplierId = params.supplierId;
    const queryString = `?${new URLSearchParams(queryParams).toString()}`;
    return apiClient.get(`/accounting/purchases-book${queryString}`);
  },
  getWithholdings: (params: { month: number; year: number; workId?: string; supplierId?: string }) => {
    const queryParams: Record<string, string> = {
      month: params.month.toString(),
      year: params.year.toString(),
    };
    if (params.workId) queryParams.workId = params.workId;
    if (params.supplierId) queryParams.supplierId = params.supplierId;
    const queryString = `?${new URLSearchParams(queryParams).toString()}`;
    return apiClient.get(`/accounting/withholdings${queryString}`);
  },
  getPerceptions: (params: { month: number; year: number; workId?: string; supplierId?: string }) => {
    const queryParams: Record<string, string> = {
      month: params.month.toString(),
      year: params.year.toString(),
    };
    if (params.workId) queryParams.workId = params.workId;
    if (params.supplierId) queryParams.supplierId = params.supplierId;
    const queryString = `?${new URLSearchParams(queryParams).toString()}`;
    return apiClient.get(`/accounting/perceptions${queryString}`);
  },
  closeMonth: (month: number, year: number) => {
    return apiClient.post("/accounting/close-month", {
      month,
      year,
      status: "closed",
    });
  },
  reopenMonth: (month: number, year: number) => {
    return apiClient.post(`/accounting/reopen-month/${month}/${year}`);
  },
};
