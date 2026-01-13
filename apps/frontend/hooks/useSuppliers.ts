import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierDocument {
  id: string;
  supplierId: string;
  name: string;
  type?: string;
  url?: string;
  createdAt?: string;
}

export function useSuppliers() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token ? "suppliers" : null,
    () => {
      return apiClient.get("/suppliers");
    }
  );

  const createSupplier = async (supplierData: Partial<Supplier>) => {
    const newSupplier = await apiClient.post<Supplier>("/suppliers", supplierData);
    await revalidate();
    return newSupplier;
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    const updatedSupplier = await apiClient.patch<Supplier>(`/suppliers/${id}`, supplierData);
    await revalidate();
    return updatedSupplier;
  };

  const deleteSupplier = async (id: string) => {
    await apiClient.delete(`/suppliers/${id}`);
    await revalidate();
  };

  return {
    suppliers: ((data as any)?.data || data || []) as Supplier[],
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    revalidate,
  };
}

export function useSupplier(id: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading } = useSWR(
    token && id ? `suppliers/${id}` : null,
    () => {
      return apiClient.get(`/suppliers/${id}`);
    }
  );

  return {
    supplier: ((data as any)?.data || data || null) as Supplier | null,
    isLoading,
    error,
  };
}

export function useSupplierDocuments(supplierId: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token && supplierId ? `supplier-documents?supplierId=${supplierId}` : null,
    () => {
      return apiClient.get(`/supplier-documents?supplierId=${supplierId}`);
    }
  );

  const uploadDocument = async (documentData: Partial<SupplierDocument>) => {
    const newDoc = await apiClient.post<SupplierDocument>("/supplier-documents", documentData);
    await revalidate();
    return newDoc;
  };

  const deleteDocument = async (id: string) => {
    await apiClient.delete(`/supplier-documents/${id}`);
    await revalidate();
  };

  return {
    documents: ((data as any)?.data || data || []) as SupplierDocument[],
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    revalidate,
  };
}

