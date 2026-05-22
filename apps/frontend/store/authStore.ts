"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser, normalizeUser } from "@/lib/normalizeUser";
import { login as loginService, refresh as refreshService, loadMe as loadMeService } from "@/lib/services/authService";

// Re-export AuthUser for convenience
export type { AuthUser };

// UserRole type
export type UserRole = "admin" | "operator" | "auditor" | "administrator";

// Helper function to normalize user with role and organization
// NO sobrescribe permissions si ya existen - solo preserva lo que viene del backend
function normalizeUserWithDefaults(user: any): AuthUser | null {
  const normalized = normalizeUser(user);
  if (!normalized) {
    return null;
  }

  // Normalize role - NO sobrescribir permissions si ya existen
  if (!normalized.role || typeof normalized.role.name !== "string") {
    normalized.role = {
      id: normalized.role?.id || "1",
      name: "ADMINISTRATION",
      permissions: normalized.role?.permissions || [], // Preservar permissions existentes o array vacío
    };
  } else {
    // Asegurar que permissions siempre esté presente como array (pero NO sobrescribir si ya existe)
    if (!normalized.role.permissions || !Array.isArray(normalized.role.permissions)) {
      normalized.role.permissions = []; // Solo inicializar si no existe, no inferir
    }
    // Si permissions ya existe y es array válido, se preserva tal cual
  }

  // Normalize organization
  if (!normalized.organization) {
    normalized.organization = {
      id: normalized.organizationId || "1",
      name: "PMD Arquitectura",
    };
  }

  return normalized;
}

export type AuthStatus = "pending" | "authenticated" | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => void;
  refreshSession: () => Promise<AuthUser | null>;
  refresh: () => Promise<AuthUser | null>;
  loadMe: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      status: "unauthenticated" as AuthStatus,

      // --- LOGIN (versión simplificada anti-falla) ---
      login: async (email: string, password: string): Promise<AuthUser | null> => {
        set((state) => ({ ...state, status: "pending" as AuthStatus }));
        try {
          if (process.env.NODE_ENV !== 'production') console.log('[AUTH] Enviando login a /api/auth/login...');
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (process.env.NODE_ENV !== 'production') console.log('[AUTH] Status:', res.status);

          if (!res.ok) {
            const errText = await res.text().catch(() => '');
            console.error('[AUTH] Login fallo (status ' + res.status + '):', errText);
            set((state) => ({
              ...state,
              user: null, token: null, refreshToken: null,
              isAuthenticated: false,
              status: 'unauthenticated' as AuthStatus,
            }));
            return null;
          }

          const data = await res.json();
          if (process.env.NODE_ENV !== 'production') console.log('[AUTH] Login OK. Tokens recibidos.');

          const access_token = data.access_token || data.accessToken;
          const refresh_token = data.refresh_token || data.refreshToken || access_token;
          const rawUser = data.user || data.data || data;

          // Construir user minimo sin invocar normalizadores
          const rawRole = (rawUser && rawUser.role) || {};
          const permArr = Array.isArray(rawRole.permissions)
            ? rawRole.permissions
            : (rawRole.permissions && typeof rawRole.permissions === 'object'
                ? Object.entries(rawRole.permissions).flatMap(([m, a]) =>
                    Array.isArray(a) ? a.map((x) => m + '.' + x) : [])
                : []);

          const safeUser: any = {
            id: rawUser?.id,
            email: rawUser?.email || email,
            fullName: rawUser?.fullName || '',
            isActive: rawUser?.isActive ?? true,
            role: {
              id: rawRole.id,
              name: rawRole.name || 'direction',
              permissions: permArr,
            },
            roleId: rawRole.id || null,
            organization: rawUser?.organization || null,
            organizationId: rawUser?.organizationId || rawUser?.organization?.id || null,
          };

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('token', access_token);
              localStorage.setItem('refresh_token', refresh_token);
              localStorage.setItem('user', JSON.stringify(safeUser));
            } catch (e) {
              console.warn('[AUTH] localStorage error (ignored):', e);
            }
          }

          set((state) => ({
            ...state,
            user: safeUser,
            token: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            status: 'authenticated' as AuthStatus,
          }));

          if (process.env.NODE_ENV !== 'production') console.log('[AUTH] Login completado. Redirigiendo...');
          return safeUser;
        } catch (err) {
          console.error('[AUTH] Excepcion durante login:', err);
          set((state) => ({
            ...state,
            user: null, token: null, refreshToken: null,
            isAuthenticated: false,
            status: 'unauthenticated' as AuthStatus,
          }));
          return null;
        }
      },

      // --- LOGOUT ---
      logout: () => {
        // Clear localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("pmd-auth-storage");
          localStorage.removeItem("access_token");
          localStorage.removeItem("token"); // También borrar "token" para compatibilidad
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
        }

        // Update Zustand with immutable set
        set((state) => ({
          ...state,
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          status: "unauthenticated" as AuthStatus,
        }));
      },

      // --- REFRESH SESSION ---
      refreshSession: async (): Promise<AuthUser | null> => {
        // Read refresh_token from localStorage
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
        if (!refreshToken) {
          set((state) => ({
            ...state,
            status: "unauthenticated" as AuthStatus,
          }));
          return null;
        }

        // Set status to pending
        set((state) => ({ ...state, status: "pending" as AuthStatus }));

        try {
          // Call refreshService
          const result = await refreshService(refreshToken);
          
          if (!result) {
            set((state) => ({
              ...state,
              status: "unauthenticated" as AuthStatus,
            }));
            return null;
          }

          if (!result.access_token) {
            set((state) => ({
              ...state,
              status: "unauthenticated" as AuthStatus,
            }));
            return null;
          }

          const { user, access_token, refresh_token } = result;

          // Normalize user if present
          let normalizedUser: AuthUser | null = null;
          if (user) {
            normalizedUser = normalizeUserWithDefaults(user);
          }

          // If no user in response, try to get from localStorage or keep current
          if (!normalizedUser) {
            if (typeof window !== "undefined") {
              const storedUser = localStorage.getItem("user");
              if (storedUser) {
                try {
                  normalizedUser = normalizeUserWithDefaults(JSON.parse(storedUser));
                } catch {
                  // If parsing fails, get current user from state
                  normalizedUser = null;
                }
              }
            }
            // If still no user, we'll keep the current user from state
            if (!normalizedUser) {
              // Get current user from state using get()
              normalizedUser = get().user;
            }
          }

          // Store tokens in localStorage - guardar tanto "access_token" como "token" para compatibilidad
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("token", access_token); // También guardar como "token" para compatibilidad
            if (refresh_token) {
              localStorage.setItem("refresh_token", refresh_token);
            }
            if (normalizedUser) {
              localStorage.setItem("user", JSON.stringify(normalizedUser));
            }
          }

          // Update Zustand with immutable set
          set((state) => {
            const finalUser = normalizedUser || state.user;
            
            return {
              ...state,
              user: finalUser, // Keep current user if no new user
              token: access_token,
              refreshToken: refresh_token || refreshToken,
              isAuthenticated: true,
              status: "authenticated" as AuthStatus,
            };
          });

          return normalizedUser || get().user;
        } catch (error) {
          set((state) => ({
            ...state,
            status: "unauthenticated" as AuthStatus,
          }));
          return null;
        }
      },

      // --- REFRESH (alias for refreshSession, for interceptor use) ---
      refresh: async (): Promise<AuthUser | null> => {
        return get().refreshSession();
      },

      // --- LOAD ME ---
      loadMe: async (): Promise<AuthUser | null> => {
        // Set status to pending at start
        set((state) => ({ ...state, status: "pending" as AuthStatus }));
        
        try {
          // Call loadMeService
          const response = await loadMeService();
          
          if (!response) {
            // Try refresh if loadMe fails
            const refreshed = await get().refreshSession();
            return refreshed;
          }

          if (!response.user) {
            // Try refresh if loadMe fails
            const refreshed = await get().refreshSession();
            return refreshed;
          }

          // Normalize user
          const normalizedUser = normalizeUserWithDefaults(response.user);
          if (!normalizedUser) {
            // Try refresh if normalization fails
            const refreshed = await get().refreshSession();
            return refreshed;
          }

          // Validar permisos críticos - solo warnings y errores
          if (process.env.NODE_ENV === "development" && normalizedUser.role?.permissions) {
            const hasUsersRead = normalizedUser.role.permissions.includes("users.read");
            if (normalizedUser.role.name?.toLowerCase() === "supervisor" && hasUsersRead) {
              console.error(`[AUTH_STORE] ❌ ERROR: Supervisor should NOT have 'users.read' permission!`);
            }
          }

          // Store in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(normalizedUser));
          }

          // Update Zustand with immutable set
          set((state) => {
            return {
              ...state,
              user: normalizedUser,
              isAuthenticated: true,
              status: "authenticated" as AuthStatus,
            };
          });

          return normalizedUser;
        } catch (error) {
          // Try refresh on error
          try {
            const refreshed = await get().refreshSession();
            return refreshed;
          } catch {
            // If refresh also fails, clear state and return null
            set((state) => ({
              ...state,
              user: null,
              token: null,
              refreshToken: null,
              isAuthenticated: false,
              status: "unauthenticated" as AuthStatus,
            }));
            return null;
          }
        }
      },

      setUser: (user: AuthUser | null) => {
        const normalizedUser = user ? normalizeUserWithDefaults(user) : null;
        
        if (normalizedUser) {
          // Actualizar localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(normalizedUser));
          }
        } else {
          // Si user es null, limpiar localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
          }
        }

        // Actualizar estado
        set((state) => ({
          ...state,
          user: normalizedUser,
        }));
      },
    }),
    {
      name: "pmd-auth-storage",
      onRehydrateStorage: () => (state) => {
        // Ensure state is never undefined
        if (!state) {
          return;
        }

        // Initialize status if not present
        if (!state.status) {
          state.status = "unauthenticated" as AuthStatus;
        }

        // PRIORIDAD 1: Confiar en el estado que Zustand persist YA hidrató desde "pmd-auth-storage"
        // Normalizar el user existente en el estado (si existe)
        if (state.user) {
          try {
            const normalizedUser = normalizeUserWithDefaults(state.user);
            if (normalizedUser) {
              // 🔍 VERIFICACIÓN: Asegurar que los permisos están normalizados correctamente
              if (normalizedUser.role?.permissions) {
                // Si permissions es un objeto, convertirlo a array
                if (typeof normalizedUser.role.permissions === 'object' && !Array.isArray(normalizedUser.role.permissions)) {
                  const permissionsObj = normalizedUser.role.permissions as Record<string, unknown>;
                  const permissionsArray: string[] = Object.entries(permissionsObj).reduce((acc: string[], [module, actions]) => {
                    if (Array.isArray(actions)) {
                      const modulePermissions = actions.map((action: string) => `${module}.${action}`);
                      acc.push(...modulePermissions);
                    } else if (typeof actions === 'boolean' && actions === true) {
                      acc.push(module);
                    } else if (typeof actions === 'object' && actions !== null) {
                      const nestedPermissions = Object.keys(actions).filter(k => (actions as Record<string, unknown>)[k] === true);
                      nestedPermissions.forEach(action => acc.push(`${module}.${action}`));
                    }
                    return acc;
                  }, []);
                  normalizedUser.role.permissions = permissionsArray;
                }
                // Verificar que permissions es un array válido
                if (!Array.isArray(normalizedUser.role.permissions)) {
                  normalizedUser.role.permissions = [];
                  if (process.env.NODE_ENV === "development") {
                    console.warn(`[AUTH] ⚠️ Permissions no es un array, inicializando como array vacío`);
                  }
                }
              } else {
                // Si no hay permissions, inicializar como array vacío
                normalizedUser.role.permissions = [];
              }
              
              state.user = normalizedUser;
              // If we have user and token, set authenticated
              if (state.token) {
                state.isAuthenticated = true;
                state.status = "authenticated" as AuthStatus;
              } else {
                state.status = "unauthenticated" as AuthStatus;
              }
            } else {
              state.user = null;
              state.isAuthenticated = false;
              state.status = "unauthenticated" as AuthStatus;
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error("[AUTH] Error normalizing user during rehydration:", error);
            }
            state.user = null;
            state.isAuthenticated = false;
            state.status = "unauthenticated" as AuthStatus;
          }
        } else if (typeof window !== "undefined") {
          // PRIORIDAD 2: Fallback - intentar cargar desde keys individuales solo si el estado no tiene user
          // (esto puede pasar si "pmd-auth-storage" no existe o está corrupto)
          const storedToken = localStorage.getItem("access_token");
          const storedRefreshToken = localStorage.getItem("refresh_token");
          const storedUser = localStorage.getItem("user");

          if (storedToken && storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const normalizedUser = normalizeUserWithDefaults(parsedUser);
              if (normalizedUser) {
                // 🔍 VERIFICACIÓN: Asegurar que los permisos están normalizados correctamente
                if (normalizedUser.role?.permissions) {
                  // Si permissions es un objeto, convertirlo a array
                  if (typeof normalizedUser.role.permissions === 'object' && !Array.isArray(normalizedUser.role.permissions)) {
                    const permissionsObj = normalizedUser.role.permissions as Record<string, unknown>;
                    const permissionsArray: string[] = Object.entries(permissionsObj).reduce((acc: string[], [module, actions]) => {
                      if (Array.isArray(actions)) {
                        const modulePermissions = actions.map((action: string) => `${module}.${action}`);
                        acc.push(...modulePermissions);
                      } else if (typeof actions === 'boolean' && actions === true) {
                        acc.push(module);
                      } else if (typeof actions === 'object' && actions !== null) {
                        const nestedPermissions = Object.keys(actions).filter(k => (actions as Record<string, unknown>)[k] === true);
                        nestedPermissions.forEach(action => acc.push(`${module}.${action}`));
                      }
                      return acc;
                    }, []);
                    normalizedUser.role.permissions = permissionsArray;
                  }
                  // Verificar que permissions es un array válido
                  if (!Array.isArray(normalizedUser.role.permissions)) {
                    normalizedUser.role.permissions = [];
                    if (process.env.NODE_ENV === "development") {
                      console.warn(`[AUTH] ⚠️ Permissions no es un array (from localStorage), inicializando como array vacío`);
                    }
                  }
                } else {
                  // Si no hay permissions, inicializar como array vacío
                  normalizedUser.role.permissions = [];
                }
                
                // In onRehydrateStorage, we can mutate state directly (Zustand allows this)
                state.user = normalizedUser;
                state.token = storedToken;
                state.refreshToken = storedRefreshToken;
                state.isAuthenticated = true;
                state.status = "authenticated" as AuthStatus;
              } else {
                state.status = "unauthenticated" as AuthStatus;
              }
            } catch (error) {
              if (process.env.NODE_ENV === "development") {
                console.error("[AUTH] Error parsing user from localStorage:", error);
              }
              // If parsing fails, clear state
              state.user = null;
              state.token = null;
              state.refreshToken = null;
              state.isAuthenticated = false;
              state.status = "unauthenticated" as AuthStatus;
            }
          } else if (!state.token) {
            // No user and no token - definitely unauthenticated
            state.status = "unauthenticated" as AuthStatus;
          }
        } else if (!state.token) {
          // No user and no token - definitely unauthenticated
          state.status = "unauthenticated" as AuthStatus;
        }
      },
    }
  )
);
