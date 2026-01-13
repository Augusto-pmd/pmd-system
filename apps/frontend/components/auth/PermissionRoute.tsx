"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useCan } from "@/lib/acl";
import { Permission } from "@/lib/acl";
import { LoadingState } from "@/components/ui/LoadingState";

interface PermissionRouteProps {
  children: React.ReactNode;
  permission: Permission;
  redirectTo?: string;
}

/**
 * Componente que protege rutas basándose en permisos específicos
 * Redirige a /unauthorized si el usuario no tiene el permiso requerido
 */
export function PermissionRoute({
  children,
  permission,
  redirectTo = "/unauthorized",
}: PermissionRouteProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const hasPermission = useCan(permission);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Solo redirigir si el usuario está cargado y no tiene permiso
    if (user && !hasPermission && !isRedirecting) {
      setIsRedirecting(true);
      // Usar setTimeout para evitar problemas de hidratación
      const timer = setTimeout(() => {
        router.replace(redirectTo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user, hasPermission, router, redirectTo, isRedirecting]);

  // Mostrar loading mientras se carga el usuario
  if (!user) {
    return <LoadingState message="Verificando permisos…" />;
  }

  // Si no tiene permiso, mostrar loading mientras redirige
  if (!hasPermission || isRedirecting) {
    return <LoadingState message="Redirigiendo…" />;
  }

  return <>{children}</>;
}

