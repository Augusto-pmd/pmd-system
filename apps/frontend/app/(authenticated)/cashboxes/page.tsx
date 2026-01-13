"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashboxes } from "@/hooks/api/cashboxes";
import { LoadingState } from "@/components/ui/LoadingState";
import { CashboxesList } from "@/components/cashboxes/CashboxesList";
import { BotonVolver } from "@/components/ui/BotonVolver";

function CashboxesContent() {
  const { cashboxes, isLoading, error } = useCashboxes();

  if (isLoading) {
    return <LoadingState message="Cargando cajas…" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error al cargar las cajas: {error.message || "Error desconocido"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <BotonVolver />
        <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Cajas</h1>
        <p className="text-gray-600">Gestión y estado de cajas del sistema PMD</p>
      </div>

      <CashboxesList cashboxes={cashboxes || []} />
    </div>
  );
}

export default function CashboxesPage() {
  return (
    <ProtectedRoute>
      <CashboxesContent />
    </ProtectedRoute>
  );
}

