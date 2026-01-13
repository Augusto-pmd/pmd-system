import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useSupplierDocuments(supplierId?: string) {
  const { token } = useAuthStore();
  
  const endpoint = supplierId ? `/supplier-documents?supplierId=${supplierId}` : "/supplier-documents";
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `supplier-documents${supplierId ? `-${supplierId}` : ""}` : null,
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

export function useSupplierDocument(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useSupplierDocument] id no está definido");
    }
    return { document: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `supplier-documents/${id}` : null,
    () => {
      return apiClient.get(`/supplier-documents/${id}`);
    }
  );

  return {
    document: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const supplierDocumentApi = {
  create: (data: unknown) => {
    return apiClient.post("/supplier-documents", data);
  },
  update: (id: string, data: unknown) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [supplierDocumentApi.update] id no está definido");
      }
      throw new Error("ID de documento no está definido");
    }
    return apiClient.put(`/supplier-documents/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [supplierDocumentApi.delete] id no está definido");
      }
      throw new Error("ID de documento no está definido");
    }
    return apiClient.delete(`/supplier-documents/${id}`);
  },
};

