"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { WorkForm } from "@/components/forms/WorkForm";
import { workApi } from "@/hooks/api/works";
import { parseBackendError } from "@/lib/parse-backend-error";
import { useToast } from "@/components/ui/Toast";
import { Edit, Trash2, Eye, Archive, DollarSign, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Work, UpdateWorkData } from "@/lib/types/work";
import { useCan } from "@/lib/acl";

interface WorksListProps {
  works: Work[];
  onRefresh?: () => void;
}

export function WorksList({ works, onRefresh }: WorksListProps) {
  const router = useRouter();
  
  if (works.length === 0) {
    return (
      <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-12 text-center">
        <p className="text-gray-600 text-lg">No hay obras registradas</p>
        <p className="text-gray-500 text-sm mt-2">
          Haz clic en &quot;Nueva Obra&quot; para agregar una
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {works.map((work) => (
        <WorkCard key={work.id} work={work} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

function WorkCard({ work, onRefresh }: { work: Work; onRefresh?: () => void }) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const toast = useToast();
  const user = useAuthStore.getState().user;
  const isDirection = user?.role?.name === "direction" || user?.role?.name === "DIRECTION";
  const isSupervisor = user?.role?.name?.toLowerCase() === "supervisor";
  
  // Verificar permisos
  const canUpdateWork = useCan("works.update");
  const canManageWorks = useCan("works.manage");
  const canDeleteWork = useCan("works.delete");
  
  // Para editar, se necesita works.update o works.manage, pero NO para Supervisor
  const canUpdate = (canUpdateWork || canManageWorks) && !isSupervisor;
  // Para eliminar, se necesita works.delete o works.manage
  const canDelete = canDeleteWork || canManageWorks;

  const getWorkName = (work: Work) => {
    return (work as any).nombre || work.name || (work as any).title || "Sin nombre";
  };

  const getWorkDescription = (work: Work) => {
    return (work as any).descripcion || work.description || "";
  };

  const getWorkStatus = (work: Work) => {
    return (work as any).estado || work.status || "pendiente";
  };

  const getWorkClient = (work: Work) => {
    return (work as any).cliente || work.client || null;
  };

  const getWorkTypeLabel = (work: Work) => {
    const workType = work.work_type;
    if (!workType) return null;
    const typeMap: Record<string, string> = {
      house: "Casa",
      local: "Local",
      expansion: "Ampliación",
      renovation: "Renovación",
      other: "Otro",
    };
    return typeMap[workType] || workType;
  };

  const getStartDate = (work: Work): string | null => {
    const date = (work as any).fechaInicio || work.startDate || (work as any).estimatedStartDate;
    if (!date) return null;
    try {
      if (date instanceof Date) {
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return typeof date === 'string' ? date : null;
    }
  };

  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completada" || statusLower === "completed") return "success";
    if (statusLower === "activa" || statusLower === "active") return "info";
    if (statusLower === "pendiente" || statusLower === "pending") return "warning";
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "completed" || statusLower === "completada" || statusLower === "finalizada") return "Completada";
    if (statusLower === "active" || statusLower === "activa" || statusLower === "en-ejecucion") return "En ejecución";
    if (statusLower === "paused" || statusLower === "pausada") return "Pausada";
    if (statusLower === "planned" || statusLower === "planificada") return "Planificada";
    if (statusLower === "pending") return "Pendiente";
    return status;
  };

  const isWorkClosed = (work: Work) => {
    const status = getWorkStatus(work).toLowerCase();
    return status === "finished" || status === "finalizada" || 
           status === "administratively_closed" || status === "cerrada administrativamente" ||
           status === "archived" || status === "archivada";
  };

  const handleClose = async () => {
    setIsCloseModalOpen(true);
  };

  const confirmClose = async () => {
    setIsCloseModalOpen(false);
    setIsClosing(true);
    try {
      await workApi.close(work.id);
      await onRefresh?.();
      toast.success("Obra cerrada correctamente");
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al cerrar obra:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsClosing(false);
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string = "ARS") => {
    if (amount == null) return "$0.00";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency === "USD" ? "USD" : "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleUpdate = async (data: UpdateWorkData) => {
    setIsSubmitting(true);
    try {
      await workApi.update(work.id, data);
      await onRefresh?.();
      toast.success("Obra actualizada correctamente");
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al actualizar obra:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    setIsSubmitting(true);
    try {
      // Archivar cambiando el estado a "archived"
      await workApi.update(work.id, {
        status: "archived"
      });
      await onRefresh?.();
      toast.success("Obra archivada correctamente");
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al archivar obra:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await workApi.delete(work.id);
      await onRefresh?.();
      toast.success("Obra eliminada correctamente");
      setIsDeleteModalOpen(false);
    } catch (err: unknown) {
      console.error("Error al eliminar obra:", err);
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="border-l-4 border-pmd-gold hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-pmd-darkBlue mb-2">
                {getWorkName(work)}
              </h3>
              {getWorkDescription(work) && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {getWorkDescription(work)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado:</span>
                <div className="flex gap-1">
                  {isWorkClosed(work) && (
                    <Badge variant="error" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Cerrada
                    </Badge>
                  )}
                  <Badge variant={getStatusVariant(getWorkStatus(work))}>
                    {getStatusLabel(getWorkStatus(work))}
                  </Badge>
                </div>
              </div>

              {getWorkClient(work) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Cliente:</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {getWorkClient(work)}
                  </span>
                </div>
              )}

              {getWorkTypeLabel(work) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tipo:</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {getWorkTypeLabel(work)}
                  </span>
                </div>
              )}

              {getStartDate(work) && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Fecha de inicio:</span>
                  <span className="text-sm text-gray-900">
                    {getStartDate(work)}
                  </span>
                </div>
              )}

              {/* Totales económicos */}
              {(work.total_expenses !== undefined || work.total_incomes !== undefined) && (
                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Gastos:</span>
                    <span className="text-xs font-semibold text-red-600">
                      {formatCurrency(work.total_expenses || 0, work.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Ingresos:</span>
                    <span className="text-xs font-semibold text-green-600">
                      {formatCurrency(work.total_incomes || 0, work.currency)}
                    </span>
                  </div>
                  {((work.total_incomes || 0) - (work.total_expenses || 0)) !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Rentabilidad:</span>
                      <span className={`text-xs font-bold ${
                        ((work.total_incomes || 0) - (work.total_expenses || 0)) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        {formatCurrency((work.total_incomes || 0) - (work.total_expenses || 0), work.currency)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-200 flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 flex items-center justify-center gap-1 min-w-[80px]"
                onClick={() => router.push(`/works/${work.id}`)}
              >
                <Eye className="h-4 w-4" />
                Ver
              </Button>
              {isDirection && !isWorkClosed(work) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1 min-w-[80px] text-orange-600 border-orange-300 hover:bg-orange-50"
                  onClick={handleClose}
                  disabled={isClosing}
                >
                  <Lock className="h-4 w-4" />
                  {isClosing ? "Cerrando..." : "Cerrar"}
                </Button>
              )}
              {canUpdate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1 min-w-[80px]"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1 min-w-[80px]"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Archive className="h-4 w-4" />
                  Archivar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Obra"
        size="lg"
      >
        <WorkForm
          initialData={work}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Acción"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Qué acción deseas realizar con la obra <strong>{getWorkName(work)}</strong>?
          </p>
          <p className="text-sm text-red-600 font-medium">
            ⚠️ Esta acción no se puede deshacer.
          </p>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleArchive}
              disabled={isSubmitting}
            >
              <Archive className="h-4 w-4 mr-2" />
              Archivar (marcar como finalizada)
            </Button>
            <Button
              variant="danger"
              className="w-full justify-start"
              onClick={handleDelete}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar permanentemente
            </Button>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={confirmClose}
        title="Confirmar Cierre de Obra"
        description={`¿Estás seguro de que quieres cerrar la obra "${getWorkName(work)}"? Una vez cerrada, no se podrán crear nuevos gastos (excepto para Dirección).`}
        confirmText="Cerrar Obra"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isClosing}
      />
    </>
  );
}

