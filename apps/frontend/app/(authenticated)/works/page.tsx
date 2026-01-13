"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useWorks, workApi } from "@/hooks/api/works";
import { LoadingState } from "@/components/ui/LoadingState";
import { WorksList } from "@/components/works/WorksList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { WorkForm } from "@/components/forms/WorkForm";
import { useToast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";
import { parseBackendError } from "@/lib/parse-backend-error";
import { useCan } from "@/lib/acl";

function WorksContent() {
  const { works, isLoading, error, mutate } = useWorks();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  // Verificar permisos
  const canCreate = useCan("works.create");

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await workApi.create(data);
      await mutate();
      toast.success("Obra creada correctamente");
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al crear obra:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Cargando obras…" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar las obras: {error.message || "Error desconocido"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Obras</h1>
              <p className="text-gray-600">Listado de obras registradas en el sistema PMD</p>
            </div>
            {canCreate && (
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Obra
              </Button>
            )}
          </div>
        </div>

        <WorksList works={works || []} onRefresh={mutate} />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nueva Obra"
          size="lg"
        >
          <WorkForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </>
  );
}

export default function WorksPage() {
  return (
    <ProtectedRoute>
      <WorksContent />
    </ProtectedRoute>
  );
}
