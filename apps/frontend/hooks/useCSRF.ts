"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const token = useAuthStore((state) => state.token);

  const fetchCsrfToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/auth/csrf-token");
      const token = (response as any)?.data?.csrfToken || (response as any)?.csrfToken;
      if (token) {
        setCsrfToken(token);
        // Store in localStorage for persistence
        localStorage.setItem("csrf_token", token);
      }
    } catch (err: any) {
      setError(err);
      console.error("Failed to fetch CSRF token:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Try to get token from localStorage first
    const storedToken = localStorage.getItem("csrf_token");
    if (storedToken) {
      setCsrfToken(storedToken);
      setIsLoading(false);
    }

    // Fetch new token if user is authenticated
    if (token) {
      fetchCsrfToken();
    }
  }, [token, fetchCsrfToken]);

  const refreshToken = useCallback(async () => {
    await fetchCsrfToken();
  }, [fetchCsrfToken]);

  return {
    csrfToken,
    isLoading,
    error,
    refreshToken,
  };
}

