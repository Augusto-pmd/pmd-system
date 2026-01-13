import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useRubrics() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "rubrics" : null,
    () => {
      return apiClient.get("/rubrics");
    }
  );

  return {
    rubrics: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useRubric(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useRubric] id no está definido");
    }
    return { rubric: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `rubrics/${id}` : null,
    () => {
      return apiClient.get(`/rubrics/${id}`);
    }
  );

  return {
    rubric: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const rubricApi = {
  create: (data: unknown) => {
    return apiClient.post("/rubrics", data);
  },
  update: (id: string, data: unknown) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rubricApi.update] id no está definido");
      }
      throw new Error("ID de rubro no está definido");
    }
    return apiClient.patch(`/rubrics/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rubricApi.delete] id no está definido");
      }
      throw new Error("ID de rubro no está definido");
    }
    return apiClient.delete(`/rubrics/${id}`);
  },
};

