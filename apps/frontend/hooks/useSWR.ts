import useSWR, { SWRConfiguration } from "swr";
import api from "@/lib/api";

export function useSWRData<T = any>(
  key: string | null,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    key,
    (url: string) => api.get(url).then((res) => res.data),
    config
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

