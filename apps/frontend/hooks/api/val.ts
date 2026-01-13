import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useVals() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "val" : null,
    () => {
      return apiClient.get("/val");
    }
  );

  return {
    vals: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useVal(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useVal] id no está definido");
    }
    return { val: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `val/${id}` : null,
    () => {
      return apiClient.get(`/val/${id}`);
    }
  );

  return {
    val: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const valApi = {
  create: (data: unknown) => {
    return apiClient.post("/val", data);
  },
  update: (id: string, data: unknown) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [valApi.update] id no está definido");
      }
      throw new Error("ID de val no está definido");
    }
    return apiClient.put(`/val/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [valApi.delete] id no está definido");
      }
      throw new Error("ID de val no está definido");
    }
    return apiClient.delete(`/val/${id}`);
  },
};

