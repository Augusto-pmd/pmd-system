"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useCSRF } from "@/hooks/useCSRF";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enable automatic sync when connection is restored
  useAutoSync();
  
  // Fetch CSRF token when authenticated
  useCSRF();

  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}

