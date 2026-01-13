import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useMe() {
  const { user, isAuthenticated, loadMe } = useAuthStore();

  useEffect(() => {
    // No bloquear render del login - solo intentar loadMe si hay token
    const token = useAuthStore.getState().token;
    if (!isAuthenticated && !user && token) {
      (async () => {
        try {
          await loadMe();
        } catch (error) {
          // Silently fail si no está autenticado o hay error
          // No bloquear el render del login
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ [useMe] Error al cargar perfil (no bloquea render):", error);
          }
        }
      })();
    }
  }, [isAuthenticated, user, loadMe]);

  return { user, isAuthenticated };
}

