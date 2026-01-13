"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface BruteForceStatus {
  isBlocked: boolean;
  remainingTime: number;
  remainingMinutes: number;
  attemptCount: number;
  remainingAttempts: number;
  maxAttempts: number;
  blockDuration: number;
  retryAfter: string | null;
}

export function useBruteForce() {
  const [status, setStatus] = useState<BruteForceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get("/auth/brute-force-status");
      setStatus(response as any);
    } catch (err: any) {
      setError(err);
      console.error("Failed to fetch brute force status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Refresh status every 10 seconds if blocked
    const interval = setInterval(() => {
      if (status?.isBlocked) {
        fetchStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [status?.isBlocked]);

  return {
    status,
    isLoading,
    error,
    refresh: fetchStatus,
  };
}

