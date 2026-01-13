"use client";

/**
 * AuthContext - React Context wrapper around Zustand store
 * DELEGA COMPLETAMENTE al store - NO duplica lógica
 * El store es la ÚNICA fuente de verdad
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, AuthUser } from "@/store/authStore";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<AuthUser | null>;
  loadMe: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // ✅ FUENTE DE VERDAD ÚNICA: Leer del store
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  
  // ✅ DELEGAR COMPLETAMENTE al store - NO duplicar lógica
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const refreshStore = useAuthStore((state) => state.refresh);
  const loadMeStore = useAuthStore((state) => state.loadMe);

  // Initialize: Store handles rehydration via persist middleware
  useEffect(() => {
    // Store will automatically rehydrate from localStorage
    // Ensure loading always ends, even if normalization fails
    try {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    } catch {
      // If anything fails, ensure loading is set to false
      setLoading(false);
    }
  }, []);

  // ✅ Ejecutar loadMe al montar si hay token pero no user
  useEffect(() => {
    if (loading) return; // Esperar a que termine la inicialización
    
    const token = useAuthStore.getState().token || (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
    if (token && !user) {
      // Ejecutar loadMe para obtener user con permisos
      (async () => {
        try {
          await loadMeStore();
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ [AuthProvider] Error al cargar perfil:", error);
          }
        }
      })();
    }
  }, [user, loading, loadMeStore]);

  // ✅ DELEGAR: Login function - delega al store
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await loginStore(email, password);
      setLoading(false);
      if (result) {
        router.push("/dashboard");
        return true;
      }
      return false;
    } catch (e: unknown) {
      setLoading(false);
      // Re-throw error with code for explicit handling in LoginForm
      throw e;
    }
  };

  // ✅ DELEGAR: Logout function - delega al store
  const logout = () => {
    logoutStore();
  };

  // ✅ DELEGAR: Refresh function - delega al store
  const refresh = async () => {
    return refreshStore();
  };

  // ✅ DELEGAR: LoadMe function - delega al store
  const loadMe = async () => {
    return loadMeStore();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refresh,
    loadMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

