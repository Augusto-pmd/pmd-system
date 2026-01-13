import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { CreateScheduleData, UpdateScheduleData, Schedule } from "@/lib/types/schedule";

export function useSchedule(params?: { startDate?: string; endDate?: string; workId?: string }) {
  const { token } = useAuthStore();
  
  const queryString = params
    ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
    : "";
  
  const { data, error, isLoading, mutate } = useSWR(
    token ? `schedule${queryString}` : null,
    () => {
      return apiClient.get<Schedule[]>(`/schedule${queryString}`);
    }
  );

  return {
    schedule: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useScheduleByWork(workId: string | null) {
  const { token } = useAuthStore();
  
  if (!workId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useScheduleByWork] workId no está definido");
    }
    return { schedules: [], error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && workId ? `schedule/work/${workId}` : null,
    () => {
      return apiClient.get<Schedule[]>(`/schedule/work/${workId}`);
    }
  );

  return {
    schedules: (data as any)?.data || data || [],
    error,
    isLoading,
    mutate,
  };
}

export function useScheduleItem(id: string | null) {
  const { token } = useAuthStore();
  
  if (!id) {
    if (process.env.NODE_ENV === "development") {
      console.warn("❗ [useScheduleItem] id no está definido");
    }
    return { item: null, error: null, isLoading: false, mutate: async () => {} };
  }
  
  const { data, error, isLoading, mutate } = useSWR(
    token && id ? `schedule/${id}` : null,
    () => {
      return apiClient.get(`/schedule/${id}`);
    }
  );

  return {
    item: (data as any)?.data || data,
    error,
    isLoading,
    mutate,
  };
}

export const scheduleApi = {
  create: (data: CreateScheduleData) => {
    return apiClient.post<Schedule>("/schedule", data);
  },
  update: (id: string, data: UpdateScheduleData) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [scheduleApi.update] id no está definido");
      }
      throw new Error("ID de item de cronograma no está definido");
    }
    return apiClient.patch<Schedule>(`/schedule/${id}`, data);
  },
  delete: (id: string) => {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [scheduleApi.delete] id no está definido");
      }
      throw new Error("ID de item de cronograma no está definido");
    }
    return apiClient.delete(`/schedule/${id}`);
  },
  generateGantt: (workId: string) => {
    if (!workId) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [scheduleApi.generateGantt] workId no está definido");
      }
      throw new Error("ID de obra no está definido");
    }
    return apiClient.post<Schedule[]>(`/schedule/generate/${workId}`);
  },
  regenerateGantt: (workId: string) => {
    if (!workId) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [scheduleApi.regenerateGantt] workId no está definido");
      }
      throw new Error("ID de obra no está definido");
    }
    return apiClient.post<Schedule[]>(`/schedule/regenerate/${workId}`);
  },
};

