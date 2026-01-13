"use client";

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import { normalizeUser } from "@/lib/normalizeUser";
import { useOfflineStore } from "@/store/offlineStore";
import { sanitizeInput } from "@/lib/sanitize";
import { getBackendUrl } from "@/lib/env";

// Helper para obtener header de Authorization
export function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token") || useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Base URL para todas las llamadas API
// Usar getBackendUrl() que tiene fallback a localhost:3001
const getBaseURL = (): string => {
  try {
    const backendUrl = getBackendUrl();
    // Asegurarse de que termine con /api
    if (backendUrl) {
      return backendUrl.endsWith('/api') ? backendUrl : `${backendUrl}/api`;
    }
  } catch (error) {
    console.warn('Error al obtener backend URL:', error);
  }
  // Fallback a localhost:3001/api si getBackendUrl() falla
  return "http://localhost:3001/api";
};

const baseURL = getBaseURL();

// Log para debugging (solo en desarrollo)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🔗 [API] Base URL configurada:", baseURL);
}

const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: false,
});

// Request interceptor - Add auth token, CSRF token and handle offline mode
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token de Zustand o localStorage
    const token = useAuthStore.getState().token || 
                  (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing methods
    if (config.headers) {
      const method = config.method?.toUpperCase();
      const isStateChanging = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
      
      // Skip CSRF for auth endpoints (login, register, csrf-token)
      const skipCsrf = config.url?.includes("/auth/login") || 
                       config.url?.includes("/auth/register") ||
                       config.url?.includes("/auth/csrf-token");
      
      if (isStateChanging && !skipCsrf && typeof window !== "undefined") {
        const csrfToken = localStorage.getItem("csrf_token");
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken;
        }
      }
    }

    // Sanitize request data for state-changing methods
    if (config.data && typeof config.data === 'object') {
      const method = config.method?.toUpperCase();
      const isStateChanging = method === "POST" || method === "PUT" || method === "PATCH";
      
      if (isStateChanging) {
        // Skip sanitization for FormData (file uploads)
        if (!(config.data instanceof FormData)) {
          config.data = sanitizeInput(config.data);
        }
      }
    }
    
    // Si es FormData, dejar que axios maneje el Content-Type automáticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Check if offline and intercept POST/PATCH/PUT requests
    if (typeof window !== "undefined" && !navigator.onLine) {
      const method = config.method?.toUpperCase();
      const isMutation = method === "POST" || method === "PATCH" || method === "PUT";
      
      if (isMutation && config.url) {
        const user = useAuthStore.getState().user;
        if (user) {
          // Determine item type from URL
          const url = config.url;
          let itemType = "unknown";
          
          if (url.includes("/expenses")) itemType = "expense";
          else if (url.includes("/incomes")) itemType = "income";
          else if (url.includes("/works")) itemType = "work";
          else if (url.includes("/contracts")) itemType = "contract";
          else if (url.includes("/suppliers")) itemType = "supplier";
          else if (url.includes("/cash-movements")) itemType = "cash_movement";
          
          // Save to offline store
          useOfflineStore.getState().addItem({
            item_type: itemType,
            data: {
              action: method?.toLowerCase() || "create",
              entity: itemType,
              payload: config.data,
              url: config.url,
            },
            user_id: user.id,
          });

          // Return a rejected promise to prevent the actual API call
          return Promise.reject({
            isOffline: true,
            message: "Request saved offline. Will sync when connection is restored.",
            config,
          } as any);
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Handle offline errors
    if (error.isOffline) {
      return Promise.reject({
        ...error,
        response: {
          status: 0,
          data: {
            message: error.message || "Request saved offline. Will sync when connection is restored.",
          },
        },
      });
    }

    const original = error.config;

    // Skip interceptor for login/auth endpoints to prevent refresh loops
    if (original?.url?.includes("/auth/login") || original?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    // Handle CSRF token errors (403 Forbidden)
    const errorData = error.response?.data;
    const errorMessage = typeof errorData?.message === 'string' 
      ? errorData.message 
      : typeof errorData?.message === 'object' && errorData?.message?.message
      ? errorData.message.message
      : '';
    const isCsrfError = error.response?.status === 403 && (
      errorMessage.includes("CSRF") || 
      errorMessage.includes("csrf") ||
      errorMessage.includes("Invalid CSRF token")
    );
    if (isCsrfError) {
      // Try to refresh CSRF token and retry
      if (!original?._csrfRetry) {
        original._csrfRetry = true;
        
        try {
          // Fetch new CSRF token
          const csrfResponse = await api.get("/auth/csrf-token");
          const newCsrfToken = (csrfResponse as any)?.data?.csrfToken || (csrfResponse as any)?.csrfToken;
          
          if (newCsrfToken && typeof window !== "undefined") {
            localStorage.setItem("csrf_token", newCsrfToken);
            original.headers["X-CSRF-Token"] = newCsrfToken;
            return api(original);
          }
        } catch (csrfError) {
          console.error("Failed to refresh CSRF token:", csrfError);
        }
      }
    }

    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;

      const refreshed = await useAuthStore.getState().refresh();

      if (refreshed) {
        original.headers["Authorization"] =
          `Bearer ${localStorage.getItem("access_token")}`;
        return api(original);
      }

      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const apiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => {
    return api.get<T>(url, config).then((res) => res.data);
  },
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return api.post<T>(url, data, config).then((res) => res.data);
  },
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return api.put<T>(url, data, config).then((res) => res.data);
  },
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => {
    return api.patch<T>(url, data, config).then((res) => res.data);
  },
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => {
    return api.delete<T>(url, config).then((res) => res.data);
  },
};

// Wrapper universal para fetch con Authorization Bearer token
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Obtener token de Zustand o localStorage
  const token = useAuthStore.getState().token || 
                (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  
  // Agregar Authorization Bearer solo si hay token
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: "omit",
  });
}

export default api;
