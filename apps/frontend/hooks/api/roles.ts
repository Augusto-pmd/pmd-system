import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Role, CreateRoleData, UpdateRoleData } from "@/lib/types/role";

export function useRoles() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "roles" : null,
    () => {
      return apiClient.get("/roles");
    }
  );

  return {
    roles: ((data as any)?.data || data || []) as Role[],
    error,
    isLoading,
    mutate,
  };
}

export function useRole(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useRole] id no está definido");
    }
    return { role: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `roles/${id}` : null,
    () => {
      return apiClient.get(`/roles/${id}`);
    }
  );

  return {
    role: ((data as any)?.data || data) as Role | null,
    error,
    isLoading,
    mutate,
  };
}

export function useRolePermissions(roleId: string | null) {
  const { token } = useAuthStore();
  
  if (!roleId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useRolePermissions] roleId no está definido");
    }
    return { permissions: [], error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && roleId ? `roles/${roleId}/permissions` : null,
    () => {
      return apiClient.get(`/roles/${roleId}/permissions`);
    }
  );

  return {
    permissions: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export const roleApi = {
  create: (data: CreateRoleData) => {
    return apiClient.post("/roles", data);
  },
  update: (id: string, data: UpdateRoleData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [roleApi.update] id no está definido");
      }
      throw new Error("ID de rol no está definido");
    }
    return apiClient.patch(`/roles/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [roleApi.delete] id no está definido");
      }
      throw new Error("ID de rol no está definido");
    }
    return apiClient.delete(`/roles/${id}`);
  },
  updatePermissions: (id: string, permissions: string[]) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [roleApi.updatePermissions] id no está definido");
      }
      throw new Error("ID de rol no está definido");
    }
    return apiClient.patch(`/roles/${id}/permissions`, { permissions });
  },
};

