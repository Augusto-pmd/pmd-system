import { SWRConfiguration } from "swr";
import api from "./api";

export const swrConfig: SWRConfiguration = {
  fetcher: async (url: string) => {
    const res = await api.get(url);
    return res.data;
  },
  revalidateOnFocus: false, // No revalidar cuando la ventana recupera el foco
  revalidateOnReconnect: true, // Revalidar cuando se reconecta a internet
  shouldRetryOnError: true,
  errorRetryCount: 3,
  // Configuración para evitar revalidaciones automáticas excesivas
  revalidateIfStale: false, // No revalidar automáticamente datos obsoletos
  dedupingInterval: 5000, // Deduplicar peticiones dentro de 5 segundos
  focusThrottleInterval: 10000, // Throttle de 10 segundos para revalidación en focus
  // No configurar refreshInterval para evitar polling automático
};

