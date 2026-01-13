import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export function useRoles() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token ? "roles" : null,
    () => {
      return apiClient.get("/roles");
    }
  );

  const createRole = async (roleData: Partial<Role>) => {
    const newRole = await apiClient.post<Role>("/roles", roleData);
    await revalidate();
    return newRole;
  };

  const updateRole = async (id: string, roleData: Partial<Role>) => {
    const updatedRole = await apiClient.patch<Role>(`/roles/${id}`, roleData);
    await revalidate();
    return updatedRole;
  };

  const deleteRole = async (id: string) => {
    await apiClient.delete(`/roles/${id}`);
    await revalidate();
  };

  return {
    roles: ((data as any)?.data || data || []) as Role[],
    isLoading,
    error,
    createRole,
    updateRole,
    deleteRole,
    revalidate,
  };
}

