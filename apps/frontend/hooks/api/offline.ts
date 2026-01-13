import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { OfflineItem, CreateOfflineItemData, SyncResult } from "@/lib/types/offline-item";

export function usePendingOfflineItems() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/offline/pending");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "offline/pending" : null,
    fetcher
  );
  
  return {
    items: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useAllOfflineItems() {
  const { token } = useAuthStore();
  
  const fetcher = () => {
    return apiClient.get("/offline");
  };
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? "offline" : null,
    fetcher
  );
  
  return {
    items: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export const offlineApi = {
  create: (data: CreateOfflineItemData) => {
    return apiClient.post<OfflineItem>("/offline", data);
  },
  sync: () => {
    return apiClient.post<SyncResult>("/offline/sync");
  },
  deleteSynced: (id: string) => {
    return apiClient.delete(`/offline/synced/${id}`);
  },
  clearSynced: () => {
    return apiClient.delete("/offline/synced");
  },
};

