import { useAuthStore, UserRole } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const refreshSession = useAuthStore((s) => s.refreshSession);
  const router = useRouter();

  const requireRole = useCallback((allowedRoles: UserRole[]) => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }
    const userRoleName = user.role?.name?.toLowerCase() as UserRole | undefined;
    if (!userRoleName || !allowedRoles.includes(userRoleName)) {
      router.push("/unauthorized");
      return;
    }
  }, [isAuthenticated, user, router]);

  return { user, isAuthenticated, logout, refreshSession, requireRole };
}
