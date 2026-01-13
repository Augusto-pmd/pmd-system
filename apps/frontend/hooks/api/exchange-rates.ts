import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { ExchangeRate, CreateExchangeRateData, UpdateExchangeRateData } from "@/lib/types/exchange-rate";

export function useExchangeRates() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/exchange-rates");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "exchange-rates" : null,
    fetcher
  );

  return {
    exchangeRates: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useCurrentExchangeRate() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "exchange-rates/current" : null,
    () => {
      return apiClient.get("/exchange-rates/current");
    }
  );

  return {
    currentRate: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useExchangeRate(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    return { exchangeRate: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `exchange-rates/${id}` : null,
    () => {
      return apiClient.get(`/exchange-rates/${id}`);
    }
  );

  return {
    exchangeRate: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useExchangeRateByDate(date: string | null) {
  const { token } = useAuthStore();
  
  if (!date) {
    return { exchangeRate: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && date ? `exchange-rates?date=${date}` : null,
    () => {
      return apiClient.get(`/exchange-rates?date=${date}`);
    }
  );

  return {
    exchangeRate: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const exchangeRatesApi = {
  create: (data: CreateExchangeRateData) => {
    return apiClient.post<ExchangeRate>("/exchange-rates", data);
  },
  update: (id: string, data: UpdateExchangeRateData) => {
    if (!id) {
      throw new Error("ID de tipo de cambio no está definido");
    }
    return apiClient.patch<ExchangeRate>(`/exchange-rates/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      throw new Error("ID de tipo de cambio no está definido");
    }
    return apiClient.delete(`/exchange-rates/${id}`);
  },
  getCurrent: () => {
    return apiClient.get<ExchangeRate>("/exchange-rates/current");
  },
  getByDate: (date: string) => {
    return apiClient.get<ExchangeRate>(`/exchange-rates?date=${date}`);
  },
};

