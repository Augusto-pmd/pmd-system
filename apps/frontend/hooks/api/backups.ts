import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Backup, CreateBackupData, CleanupBackupsData } from "@/lib/types/backup";

export function useBackups() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/backups");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "backups" : null,
    fetcher
  );
  
  return {
    backups: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useBackup(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    return { backup: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `backups/${id}` : null,
    () => {
      return apiClient.get(`/backups/${id}`);
    }
  );
  
  return {
    backup: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export function useBackupLogs() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "backups/logs" : null,
    () => {
      return apiClient.get("/backups/logs");
    }
  );
  
  return {
    logs: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useBackupStatus() {
  const { token } = useAuthStore();
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "backups/status" : null,
    () => {
      return apiClient.get("/backups/status");
    }
  );
  
  return {
    status: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const backupsApi = {
  create: (data: CreateBackupData) => {
    return apiClient.post<Backup>("/backups", data);
  },
  delete: (id: string) => {
    return apiClient.delete(`/backups/${id}`);
  },
  download: async (id: string) => {
    // Download as blob
    const token = localStorage.getItem("access_token");
    const baseURL = "/api"; // Same as apiClient baseURL
    const response = await fetch(`${baseURL}/backups/${id}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to download backup");
    return response.blob();
  },
  cleanup: (data: CleanupBackupsData) => {
    return apiClient.post<{ deleted: number }>("/backups/cleanup", data);
  },
  getLogs: () => {
    return apiClient.get<Backup[]>("/backups/logs");
  },
  getStatus: () => {
    return apiClient.get("/backups/status");
  },
};

