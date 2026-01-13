import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Contract, CreateContractData, UpdateContractData } from "@/lib/types/contract";

export function useContracts() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/contracts");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "contracts" : null,
    fetcher
  );

  return {
    contracts: ((data as any)?.data || data || []) as Contract[],
    error,
    isLoading,
    mutate,
  };
}

export function useContract(id: string | null) {
  const { token } = useAuthStore();
  
  const fetcher = async () => {
    if (!id) {
      return null;
    }
    return apiClient.get(`/contracts/${id}`);
  };
  
  // Siempre llamar useSWR, pero con key null si no hay id o token
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `contracts/${id}` : null,
    fetcher
  );

  // Si no hay id, retornar valores por defecto
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useContract] id no está definido");
    }
    return { contract: null, error: null, isLoading: false, mutate: async () => {} };
  }

  return {
    contract: ((data as any)?.data || data) as Contract | null,
    error,
    isLoading,
    mutate,
  };
}

export const contractApi = {
  create: (data: CreateContractData) => {
    return apiClient.post("/contracts", data);
  },
  update: (id: string, data: UpdateContractData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [contractApi.update] id no está definido");
      }
      throw new Error("ID de contrato no está definido");
    }
    // Usar PATCH en lugar de PUT para actualizaciones parciales (el backend usa @Patch)
    return apiClient.patch(`/contracts/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [contractApi.delete] id no está definido");
      }
      throw new Error("ID de contrato no está definido");
    }
    return apiClient.delete(`/contracts/${id}`);
  },
};
