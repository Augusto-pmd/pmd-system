import { apiClient } from "@/lib/api";
import { User } from "@/lib/types/user";

export const workUsersApi = {
  assignUser: (workId: string, userId: string, role?: string) => {
    return apiClient.post(`/works/${workId}/users`, {
      user_id: userId,
      role: role || null,
    });
  },

  unassignUser: (workId: string, userId: string) => {
    return apiClient.delete(`/works/${workId}/users/${userId}`);
  },

  getAssignedUsers: async (workId: string): Promise<User[]> => {
    const response = await apiClient.get(`/works/${workId}/users`);
    return ((response as any)?.data || response || []) as User[];
  },
};

