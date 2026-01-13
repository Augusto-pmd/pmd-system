"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, UserRole } from "@/store/authStore";
import { Loading } from "@/components/ui/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {

  // --- HOOKS SIEMPRE PRIMERO - TODOS LOS HOOKS DEBEN IR ANTES DE CUALQUIER RETURN ---
  const storeState = useAuthStore.getState();
  // Check both Zustand store and localStorage for token
  const token = storeState.token || (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  const { user, isAuthenticated } = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  }));

  const router = useRouter();
  
  // role ahora es SIEMPRE un objeto { id, name } o null, extraer el nombre
  const userRoleName = user?.role?.name?.toLowerCase() as UserRole | null;

  // --- useEffect: Si hay token pero no user, llamar a loadMe() ---
  useEffect(() => {
    // Verificar tanto el token del store como el de localStorage (para cuando recargas la página)
    const localToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const hasToken = token || localToken;
    
    if (hasToken && !user) {
      let isMounted = true;
      const loadUser = async () => {
        try {
          const loadedUser = await storeState.loadMe();
          if (!isMounted) return;
          
          // Si loadMe falla, intentar refresh primero antes de redirigir
          if (!loadedUser) {
            if (process.env.NODE_ENV === "development") {
              console.warn("⚠️ ProtectedRoute: loadMe() no devolvió usuario, intentando refresh...");
            }
            const refreshed = await storeState.refresh();
            if (!refreshed && isMounted && !storeState.user) {
              if (process.env.NODE_ENV === "development") {
                console.warn("⚠️ ProtectedRoute: Refresh también falló, redirigiendo a login");
              }
              setTimeout(() => {
                if (isMounted && !storeState.user) {
                  router.replace(redirectTo);
                }
              }, 1000);
            }
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("🔴 ProtectedRoute: Error en loadMe():", error);
          }
          if (isMounted) {
            // Si hay error, intentar refresh antes de redirigir
            try {
              await storeState.refresh();
            } catch {
              // Si refresh también falla, redirigir después de un tiempo
              setTimeout(() => {
                if (isMounted && !storeState.user) {
                  router.replace(redirectTo);
                }
              }, 2000);
            }
          }
        }
      };
      
      loadUser();
      
      return () => {
        isMounted = false;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // --- useEffect: Manejar redirecciones (solo en cliente) ---
  useEffect(() => {
    // Solo ejecutar en cliente
    if (typeof window === "undefined") return;
    
    // Check localStorage for access_token if Zustand doesn't have it
    const localToken = localStorage.getItem("access_token");
    const hasToken = token || localToken;
    
    // Si no hay token → redirect a login
    if (!hasToken) {
      router.replace(redirectTo);
      return;
    }

    // Si hay token pero no hay user, esperar a que loadMe() termine antes de redirigir
    // Esto previene redirecciones prematuras al recargar la página
    if (hasToken && !user && !isAuthenticated) {
      // El otro useEffect ya está manejando loadMe(), no redirigir aquí
      return;
    }

    // Si no está autenticado Y no hay token en localStorage → redirect a login
    // Solo redirigir si realmente no hay token (no si solo falta el user pero hay token)
    if (!isAuthenticated && !hasToken) {
      router.replace(redirectTo);
      return;
    }

    // Si el usuario es admin/administrator, tiene acceso total (ignorar allowedRoles)
    const isAdmin = userRoleName === "admin" || userRoleName === "administrator";
    
    // Si hay allowedRoles y el usuario no es admin y no tiene un rol permitido → redirect a unauthorized
    if (!isAdmin && allowedRoles && userRoleName && !allowedRoles.includes(userRoleName)) {
      router.replace("/unauthorized");
      return;
    }
  }, [token, isAuthenticated, user, userRoleName, allowedRoles, router, redirectTo]);

  // --- useEffect: Timeout para evitar loading infinito ---
  useEffect(() => {
    if (!user && token) {
      const timeout = setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          console.warn("⚠️ [ProtectedRoute] Timeout esperando user (10s), redirigiendo a login");
          router.replace(redirectTo);
        }
      }, 10000); // 10 segundos máximo
      
      return () => clearTimeout(timeout);
    }
  }, [user, token, router, redirectTo]);

  // --- GUARDS DESPUÉS DE TODOS LOS HOOKS ---
  // Verificar si hay token en localStorage (para cuando recargas la página)
  const localToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const hasToken = token || localToken;
  
  // --- Guard: Si no hay token → mostrar loading (en servidor también para evitar hydration mismatch) ---
  // La redirección se maneja en el useEffect, no aquí durante el render
  if (!hasToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // --- Guard: Si hay token pero no user → mostrar loading mientras carga (NO redirigir inmediatamente) ---
  if (hasToken && !user && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // --- Guard: Si no está autenticado Y no hay token → mostrar loading/redirect ---
  // Solo redirigir si realmente no hay token
  // La redirección se maneja en el useEffect, no aquí durante el render
  if (!isAuthenticated && !hasToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // --- Guard: Si hay token pero no user → mostrar loading mientras carga ---
  if (!user && token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // Verificar organizationId (pero no bloquear indefinidamente)
  if (user && !user.organizationId) {
    console.warn("⚠️ [ProtectedRoute] user.organizationId no está presente, pero continuando");
    // No bloquear, solo advertir - el backend puede manejar esto
  }

  // Verificar que user existe antes de acceder a sus propiedades
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  // role ahora es SIEMPRE un objeto { id, name }
  const roleName = user.role?.name?.toLowerCase();

  // Si el usuario es admin/administration, tiene acceso total (ignorar allowedRoles)
  const isAdmin = roleName === "admin" || roleName === "administration" || roleName === "administrator";

  // Si no hay role pero hay user, permitir paso (el backend puede devolver role como null)
  // Solo bloquear si hay allowedRoles específicos Y el usuario no es admin
  if (!isAdmin && allowedRoles && allowedRoles.length > 0 && !roleName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
