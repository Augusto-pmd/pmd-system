/**
 * Authentication Service Layer
 * Handles all authentication API calls
 */

import { apiFetch } from "@/lib/api";
import api from "@/lib/api";

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    role: { id: number; name: string; permissions?: string[] };
    organization: { id: number; name: string } | null;
    [key: string]: unknown;
  };
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  user?: {
    id: number;
    email: string;
    role: { id: number; name: string; permissions?: string[] };
    organization: { id: number; name: string } | null;
    [key: string]: any;
  };
}

export interface UserMeResponse {
  user: {
    id: number;
    email: string;
    role: { id: number; name: string; permissions?: string[] };
    organization: { id: number; name: string } | null;
    [key: string]: unknown;
  };
}

/**
 * Login service
 * Sends POST /api/auth/login and returns a normalized response
 */
export async function login(email: string, password: string): Promise<LoginResponse | null> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Login success is strictly status 200 + accessToken present
    if (response.status !== 200) {
      const errorData = await response.json().catch(() => ({}));
      const errorCode = errorData.code || errorData.error || errorData.errorCode;
      const errorMessage = errorData.message || errorData.error || "Error de autenticación";
      if (errorCode) {
        throw { code: errorCode, message: errorMessage };
      }
      throw { code: "UNKNOWN_ERROR", message: errorMessage || "Error de conexión" };
    }

    const data = await response.json();
    const accessToken = data.accessToken ?? data.access_token;
    if (!accessToken) {
      throw { code: "INVALID_LOGIN_RESPONSE", message: "Token de acceso no encontrado" };
    }

    const normalizedResponse: LoginResponse = {
      access_token: accessToken,
      refresh_token: data.refresh_token ?? data.refreshToken,
      user: data.user || data.data || data,
    };

    return normalizedResponse;
  } catch (error: unknown) {
    // Re-throw error with error code for explicit handling
    if (error && typeof error === "object" && "code" in error && "message" in error) {
      throw error;
    }
    const errorData = (error && typeof error === "object" && "response" in error && typeof error.response === "object" && error.response && "data" in error.response) 
      ? error.response.data 
      : error;
    if (errorData) {
      const errorCode = (errorData as any).code || (errorData as any).error || (errorData as any).errorCode;
      const errorMessage = (errorData as any).message || (errorData as any).error || "Error de autenticación";
      if (errorCode) {
        throw { code: errorCode, message: errorMessage };
      }
    }
    throw { code: "UNKNOWN_ERROR", message: "Error de conexión" };
  }
}

/**
 * Refresh token service
 * Sends POST /auth/refresh and returns new tokens
 */
export async function refresh(refreshToken?: string | null): Promise<RefreshResponse | null> {
  const token = refreshToken || (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null);
  
  if (!token) {
    return null;
  }

  const refreshUrl = "/api/auth/refresh";

  try {
    const response = await apiFetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: token }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const normalizedResponse: RefreshResponse = {
      access_token: data.access_token || data.token,
      refresh_token: data.refresh_token || data.refreshToken || data.access_token || data.token,
      user: data.user || data,
    };

    if (!normalizedResponse.access_token) {
      return null;
    }

    // Store new tokens in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", normalizedResponse.access_token);
      if (normalizedResponse.refresh_token) {
        localStorage.setItem("refresh_token", normalizedResponse.refresh_token);
      }
      if (normalizedResponse.user) {
        localStorage.setItem("user", JSON.stringify(normalizedResponse.user));
      }
    }

    return normalizedResponse;
  } catch (error) {
    return null;
  }
}

/**
 * Load current user
 * Sends GET /users/me with Authorization header
 */
export async function loadMe(): Promise<UserMeResponse | null> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  
  if (!token) {
    return null;
  }

  const meUrl = "/api/users/me";

  try {
    const response = await apiFetch(meUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try refresh first
        const refreshResult = await refresh();
        if (refreshResult) {
          // Retry with new token
          const newToken = refreshResult.access_token;
          const retryResponse = await apiFetch(meUrl, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            const user = retryData.user || retryData;
            if (user && typeof window !== "undefined") {
              localStorage.setItem("user", JSON.stringify(user));
            }
            return { user };
          }
        }
        // Refresh failed, return null
        return null;
      }
      return null;
    }

    const data = await response.json();
    const user = data.user || data;

    if (user && typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return { user };
  } catch (error) {
    return null;
  }
}

