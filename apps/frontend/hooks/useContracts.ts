import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface Contract {
  id: string;
  supplierId?: string;
  workId?: string;
  contractNumber?: string;
  startDate?: string;
  endDate?: string;
  value?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useContracts() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token ? "contracts" : null,
    () => {
      return apiClient.get("/contracts");
    }
  );

  const createContract = async (contractData: Partial<Contract>) => {
    const newContract = await apiClient.post<Contract>("/contracts", contractData);
    await revalidate();
    return newContract;
  };

  const updateContract = async (id: string, contractData: Partial<Contract>) => {
    const updatedContract = await apiClient.patch<Contract>(`/contracts/${id}`, contractData);
    await revalidate();
    return updatedContract;
  };

  const deleteContract = async (id: string) => {
    await apiClient.delete(`/contracts/${id}`);
    await revalidate();
  };

  return {
    contracts: ((data as any)?.data || data || []) as Contract[],
    isLoading,
    error,
    createContract,
    updateContract,
    deleteContract,
    revalidate,
  };
}

export function useContract(id: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading } = useSWR(
    token && id ? `contracts/${id}` : null,
    () => {
      return apiClient.get(`/contracts/${id}`);
    }
  );

  return {
    contract: ((data as any)?.data || data || null) as Contract | null,
    isLoading,
    error,
  };
}

