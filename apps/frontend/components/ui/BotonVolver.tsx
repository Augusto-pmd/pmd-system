"use client";

import { useRouter, usePathname } from "next/navigation";

interface BotonVolverProps {
  backTo?: string; // Ruta específica a la que volver (ej: "/works")
}

export function BotonVolver({ backTo }: BotonVolverProps = {}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    if (backTo) {
      // Si se especifica ruta, ir ahí
      router.push(backTo);
    } else {
      // Intentar inferir página padre desde pathname
      // Ej: /works/[id] → /works
      const pathParts = pathname?.split("/").filter(Boolean) || [];
      if (pathParts.length > 1) {
        // Hay un [id] o subruta, volver al nivel padre
        const parentPath = "/" + pathParts.slice(0, -1).join("/");
        router.push(parentPath);
      } else {
        // Fallback: ir a dashboard
        router.push("/dashboard");
      }
    }
  };

  return (
    <button
      onClick={handleBack}
      className="cursor-pointer text-sm font-medium hover:text-blue-600 mb-4 transition-colors hover:underline"
    >
      ← Volver
    </button>
  );
}

