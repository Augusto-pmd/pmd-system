"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Verificar autenticación desde localStorage (client-side)
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const hasAuth = storedToken || (token && isAuthenticated);

    if (hasAuth) {
      // Usuario autenticado → redirigir a dashboard
      router.replace("/dashboard");
    } else {
      // Usuario NO autenticado → redirigir a login
      router.replace("/login");
    }
  }, [router, token, isAuthenticated]);

  // No renderizar nada - solo redirección
  return null;
}
