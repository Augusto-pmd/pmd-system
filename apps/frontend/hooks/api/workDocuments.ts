import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useWorkDocuments(workId?: string) {
  const { token } = useAuthStore();
  
  const endpoint = workId ? `/work-documents?workId=${workId}` : "/work-documents";
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `work-documents${workId ? `-${workId}` : ""}` : null,
    () => {
      return apiClient.get(endpoint);
    }
  );

  return {
    documents: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useWorkDocument(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useWorkDocument] id no está definido");
    }
    return { document: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `work-documents/${id}` : null,
    () => {
      return apiClient.get(`/work-documents/${id}`);
    }
  );

  return {
    document: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const workDocumentApi = {
  create: (data: unknown) => {
    return apiClient.post("/work-documents", data);
  },
  update: (id: string, data: unknown) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [workDocumentApi.update] id no está definido");
      }
      throw new Error("ID de documento no está definido");
    }
    return apiClient.put(`/work-documents/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [workDocumentApi.delete] id no está definido");
      }
      throw new Error("ID de documento no está definido");
    }
    return apiClient.delete(`/work-documents/${id}`);
  },
};

