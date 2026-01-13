"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRubrics, rubricApi } from "@/hooks/api/rubrics";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RubricForm } from "@/components/rubrics/RubricForm";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { Plus, Edit, Trash2 } from "lucide-react";
import { TableContainer } from "@/components/ui/TableContainer";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";

function RubricsContent() {
  const { rubrics, isLoading, error, mutate } = useRubrics();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  const user = authState.user;
  const router = useRouter();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const toast = useToast();

  // Verificar permisos basados en rol (Direction y Administration pueden crear/editar)
  const canCreate = user?.role?.name?.toLowerCase() === "direction" || user?.role?.name?.toLowerCase() === "administration";
  const canUpdate = canCreate;
  const canDelete = user?.role?.name?.toLowerCase() === "direction"; // Solo Direction puede eliminar

  // Verificar acceso usando useEffect para evitar render durante verificación
  useEffect(() => {
    if (user) {
      const hasAccess = user.role?.name?.toLowerCase() === "direction" || user.role?.name?.toLowerCase() === "administration";
      setCanAccess(hasAccess);
      if (!hasAccess) {
        router.replace("/unauthorized");
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (organizationId && canAccess) {
      mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, canAccess]);

  // Mostrar loading mientras se verifica el acceso
  if (canAccess === null) {
    return <LoadingState message="Verificando permisos…" />;
  }

  // Si no tiene acceso, mostrar mensaje (la redirección ya se hizo en useEffect)
  if (canAccess === false) {
    return (
      <div style={{ padding: "var(--space-lg)" }}>
        <div style={{ backgroundColor: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.3)", color: "rgba(255,193,7,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
          <p style={{ fontWeight: 500, marginBottom: "var(--space-xs)" }}>Acceso Restringido</p>
          <p style={{ fontSize: "14px" }}>Solo usuarios con rol Direction o Administration pueden acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Cargando rúbricas…" />;
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
        Error al cargar las rúbricas: {error}
      </div>
    );
  }

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await rubricApi.create(data);
      toast.success("Rúbrica creada correctamente");
      setIsFormModalOpen(false);
      setSelectedRubric(null);
      mutate();
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al crear rúbrica:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedRubric) return;
    setIsSubmitting(true);
    try {
      await rubricApi.update(selectedRubric.id, data);
      toast.success("Rúbrica actualizada correctamente");
      setIsFormModalOpen(false);
      setSelectedRubric(null);
      mutate();
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al actualizar rúbrica:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRubric) return;
    setIsSubmitting(true);
    try {
      await rubricApi.delete(selectedRubric.id);
      toast.success("Rúbrica eliminada correctamente");
      setIsDeleteModalOpen(false);
      setSelectedRubric(null);
      mutate();
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al eliminar rúbrica:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        <div>
          <BotonVolver />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
            <div>
              <h1 style={{ font: "var(--font-title)", color: "var(--apple-text-primary)", marginBottom: "var(--space-xs)" }}>
                Rúbricas
              </h1>
              <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
                Gestión de categorías para contratos y gastos
              </p>
            </div>
            {canCreate && (
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedRubric(null);
                  setIsFormModalOpen(true);
                }}
              >
                <Plus style={{ width: "16px", height: "16px", marginRight: "8px" }} />
                Nueva Rúbrica
              </Button>
            )}
          </div>
        </div>

        {(!rubrics || rubrics.length === 0) ? (
          <div style={{
            backgroundColor: "var(--apple-surface)",
            border: "1px solid var(--apple-border)",
            borderRadius: "var(--radius-xl)",
            padding: "40px 0",
            textAlign: "center"
          }}>
            <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
              No hay rúbricas registradas
            </p>
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead align="right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rubrics.map((rubric: any) => (
                  <TableRow key={rubric.id}>
                    <TableCell>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
                        {rubric.name || "Sin nombre"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rubric.code ? (
                        <Badge variant="info">{rubric.code}</Badge>
                      ) : (
                        <span style={{ fontSize: "12px", color: "var(--apple-text-secondary)" }}>—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
                        {rubric.description || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rubric.is_active !== false ? "success" : "warning"}>
                        {rubric.is_active !== false ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell align="right">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        {canUpdate && (
                          <Button
                            variant="icon"
                            size="sm"
                            onClick={() => {
                              setSelectedRubric(rubric);
                              setIsFormModalOpen(true);
                            }}
                            style={{ color: "var(--apple-blue)" }}
                          >
                            <Edit style={{ width: "16px", height: "16px" }} />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="icon"
                            size="sm"
                            onClick={() => {
                              setSelectedRubric(rubric);
                              setIsDeleteModalOpen(true);
                            }}
                            style={{ color: "#FF3B30" }}
                          >
                            <Trash2 style={{ width: "16px", height: "16px" }} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Modal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedRubric(null);
          }}
          title={selectedRubric ? "Editar Rúbrica" : "Nueva Rúbrica"}
          size="lg"
        >
          <RubricForm
            initialData={selectedRubric}
            onSubmit={selectedRubric ? handleUpdate : handleCreate}
            onCancel={() => {
              setIsFormModalOpen(false);
              setSelectedRubric(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>

        {selectedRubric && (
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedRubric(null);
            }}
            title="Confirmar Eliminación"
            size="md"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <p style={{ font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                ¿Estás seguro de que deseas eliminar esta rúbrica?
              </p>
              <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)", fontWeight: 500 }}>
                {selectedRubric.name}
              </p>
              <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
                Esta acción no se puede deshacer. Si la rúbrica está siendo utilizada en contratos o gastos, la eliminación podría causar problemas.
              </p>
              <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedRubric(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  style={{ color: "#FF3B30", borderColor: "#FF3B30" }}
                >
                  {isSubmitting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}

export default function RubricsPage() {
  return (
    <ProtectedRoute>
      <RubricsContent />
    </ProtectedRoute>
  );
}

