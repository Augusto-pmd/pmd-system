"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAlertsStore } from "@/store/alertsStore";
import { useWorkDocuments } from "@/hooks/api/workDocuments";
import { LoadingState } from "@/components/ui/LoadingState";
import { AlertsList } from "@/components/alerts/AlertsList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AlertForm } from "@/app/(authenticated)/alerts/components/AlertForm";
import { useToast } from "@/components/ui/Toast";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

function DocumentAlertsContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const { alerts, isLoading, error, fetchAlerts, createAlert } = useAlertsStore();
  const { documents } = useWorkDocuments();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Safely extract documentId from params
  const documentId = typeof params?.id === "string" ? params.id : null;

  useEffect(() => {
    if (organizationId) {
      fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // Guard check after all hooks
  if (!documentId) {
    return null;
  }

  const document = documents?.find((d: any) => d.id === documentId);
  const documentName = document ? (document.name || document.nombre || documentId) : documentId;

  // Filtrar alertas de este documento
  const documentAlerts = alerts.filter((alert) => (alert as any).documentId === documentId);

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createAlert({ ...data, documentId, type: "documentacion" });
      await fetchAlerts();
      toast.success("Alerta creada correctamente");
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al crear alerta:", err);
      }
      const errorMessage = err instanceof Error ? err.message : "Error al crear la alerta";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingState message="Cargando alertas del documento…" />
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
        Error al cargar las alertas: {error}
      </div>
    );
  }

  return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        <div>
          <BotonVolver />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
            <div>
              <h1 style={{ font: "var(--font-title)", color: "var(--apple-text-primary)", marginBottom: "var(--space-xs)" }}>
                Alertas - {documentName}
              </h1>
              <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
                Alertas asociadas a este documento
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus style={{ width: "16px", height: "16px", marginRight: "8px" }} />
              Nueva Alerta
            </Button>
          </div>
        </div>

        <AlertsList
          alerts={documentAlerts}
          onRefresh={fetchAlerts}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nueva Alerta para este Documento"
          size="lg"
        >
          <AlertForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
            defaultDocumentId={documentId}
          />
        </Modal>
      </div>
  );
}

export default function DocumentAlertsPage() {
  return (
    <ProtectedRoute>
      <DocumentAlertsContent />
    </ProtectedRoute>
  );
}

