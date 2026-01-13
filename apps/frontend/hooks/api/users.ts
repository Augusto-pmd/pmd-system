import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { User, CreateUserData, UpdateUserData } from "@/lib/types/user";

export function useUsers() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "users" : null,
    () => {
      return apiClient.get("/users");
    }
  );

  return {
    users: ((data as any)?.data || data || []) as User[],
    error,
    isLoading,
    mutate,
  };
}

export function useUser(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useUser] id no está definido");
    }
    return { user: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `users/${id}` : null,
    () => {
      return apiClient.get(`/users/${id}`);
    }
  );

  return {
    user: ((data as any)?.data || data) as User | null,
    error,
    isLoading,
    mutate,
  };
}

export function useUserRole(userId: string | null) {
  const { token } = useAuthStore();
  
  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useUserRole] userId no está definido");
    }
    return { role: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && userId ? `users/${userId}/role` : null,
    () => {
      return apiClient.get(`/users/${userId}/role`);
    }
  );

  return {
    role: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const userApi = {
  create: (data: CreateUserData) => {
    return apiClient.post("/users", data);
  },
  update: (id: string, data: UpdateUserData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [userApi.update] id no está definido");
      }
      throw new Error("ID de usuario no está definido");
    }
    return apiClient.patch(`/users/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [userApi.delete] id no está definido");
      }
      throw new Error("ID de usuario no está definido");
    }
    return apiClient.delete(`/users/${id}`);
  },
  updateRole: (id: string, roleId: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [userApi.updateRole] id no está definido");
      }
      throw new Error("ID de usuario no está definido");
    }
    if (!roleId) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [userApi.updateRole] roleId no está definido");
      }
      throw new Error("ID de rol no está definido");
    }
    return apiClient.patch(`/users/${id}/role`, { roleId });
  },
};

