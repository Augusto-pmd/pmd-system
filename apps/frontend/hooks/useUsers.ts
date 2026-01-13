import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface User {
  id: string;
  email: string;
  name: string;
  fullName?: string; // Alias para name, usado en algunos componentes
  role: { id: string; name: string; permissions?: string[] };
  roleId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useUsers() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token ? "users" : null,
    () => {
      return apiClient.get("/users");
    }
  );

  const createUser = async (userData: Partial<User>) => {
    const newUser = await apiClient.post<User>("/users", userData);
    await revalidate();
    return newUser;
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    const updatedUser = await apiClient.patch<User>(`/users/${id}`, userData);
    await revalidate();
    return updatedUser;
  };

  const deleteUser = async (id: string) => {
    await apiClient.delete(`/users/${id}`);
    await revalidate();
  };

  return {
    users: ((data as any)?.data || data || []) as User[],
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    revalidate,
  };
}

export function useUser(id: string | null) {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate: revalidate } = useSWR(
    token && id ? `users/${id}` : null,
    () => {
      return apiClient.get(`/users/${id}`);
    }
  );

  return {
    user: ((data as any)?.data || data || null) as User | null,
    isLoading,
    error,
    revalidate,
  };
}

