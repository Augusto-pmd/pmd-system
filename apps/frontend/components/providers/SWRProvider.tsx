"use client";

import { SWRConfig } from "swr";
import { swrConfig } from "@/lib/swr-config";
import { useEffect } from "react";
import { normalizeUser } from "@/lib/normalizeUser";

export function SWRProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem("pmd-auth-storage");
      if (cache) {
        try {
          const parsed = JSON.parse(cache);
          const rawUser = parsed.state?.user;
          if (rawUser) {
            const normalized = normalizeUser(rawUser);
            parsed.state.user = normalized;
            localStorage.setItem("pmd-auth-storage", JSON.stringify(parsed));
          }
        } catch {
          // si falla, limpiamos el storage corrupto
          localStorage.removeItem("pmd-auth-storage");
        }
      }
    }
  }, []);

  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}

