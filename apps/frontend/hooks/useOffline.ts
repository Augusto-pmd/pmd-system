"use client";

import { useState, useEffect } from "react";

/**
 * Hook para detectar si la aplicación está en modo offline
 * Monitorea el estado de conexión del navegador
 */
export function useOffline(): boolean {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    // Listeners para cambios en el estado de conexión
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Agregar listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOffline;
}

