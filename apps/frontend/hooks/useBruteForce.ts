"use client";

// STUB: hook desactivado. El endpoint /auth/brute-force-status no existe
// en el backend y el setState dentro del catch generaba loop infinito.
export function useBruteForce() {
  const noop = () => Promise.resolve();
  return {
    status: {
      isBlocked: false,
      remainingTime: 0,
      remainingMinutes: 0,
      attemptCount: 0,
      remainingAttempts: 5,
      maxAttempts: 5,
      blockDuration: 0,
      retryAfter: null,
    },
    isLoading: false,
    error: null,
    refresh: noop,
    refreshStatus: noop,
    fetchStatus: noop,
  };
}
