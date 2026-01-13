"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAlertsStore } from "@/store/alertsStore";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { Check, Trash2, Bell, Building2, User, Calendar, Tag, AlertTriangle, UserPlus, CheckCircle, Clock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { AlertActions } from "@/components/alerts/AlertActions";
import { useAlert } from "@/hooks/api/alerts";
import { useCan } from "@/lib/acl";

function AlertDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  const { alerts, fetchAlerts, markAsRead, deleteAlert } = useAlertsStore();
  const { works } = useWorks();
  const { users } = useUsers();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  // Verificar permisos
  const canDeleteAlert = useCan("alerts.delete");
  const canManageAlerts = useCan("alerts.manage");
  const canDelete = canDeleteAlert || canManageAlerts;

  // Safely extract alertId from params
  const alertId = typeof params?.id === "string" ? params.id : null;
  const { alert: alertFromApi, isLoading, mutate } = useAlert(alertId);

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard check after all hooks
  if (!alertId) {
    return null;
  }

  // Use API alert if available, otherwise fallback to store
  const alert = alertFromApi || alerts.find((a) => a.id === alertId);

  if (!alert) {
    return (
      <LoadingState message="Cargando alerta…" />
    );
  }

  const getWorkName = (workId?: string) => {
    if (!workId) return "-";
    const work = works.find((w: any) => w.id === workId);
    if (!work) return workId;
    return work.name || work.title || work.nombre || workId;
  };

  const getUserName = (userId?: string) => {
    if (!userId) return "-";
    const user = users.find((u: any) => u.id === userId);
    if (!user) return userId;
    return user.fullName || user.name || (user as any).nombre || userId;
  };

  const getSeverityVariant = (severity: "info" | "warning" | "critical") => {
    if (severity === "critical") return "error";
    if (severity === "warning") return "warning";
    return "info";
  };

  const getSeverityLabel = (severity: "info" | "warning" | "critical") => {
    const labels: Record<string, string> = {
      critical: "Crítico",
      warning: "Advertencia",
      info: "Info",
    };
    return labels[severity] || severity;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      work: "Obra",
      supplier: "Proveedor",
      document: "Documento",
      accounting: "Contable",
      cashbox: "Caja",
      user: "Usuario",
      general: "General",
    };
    return labels[type] || type;
  };

  const handleMarkAsRead = async () => {
    setIsSubmitting(true);
    try {
      await markAsRead(alertId);
      await fetchAlerts();
      toast.success("Alerta marcada como leída");
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al marcar alerta:", err);
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
      await deleteAlert(alertId);
      toast.success("Alerta eliminada correctamente");
      router.push("/alerts");
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al eliminar alerta:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <BotonVolver backTo="/alerts" />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {alert.title || "Detalle de Alerta"}
              </h1>
              <p className="text-gray-600">Información completa de la alerta</p>
            </div>
            <div className="flex gap-2">
              <AlertActions alert={alert as any} onActionComplete={() => { mutate(); fetchAlerts(); }} />
              {!alert.read && (
                <Button
                  variant="outline"
                  onClick={handleMarkAsRead}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Marcar como leída
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Principal */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Bell className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Mensaje</p>
                    <p className="text-base font-medium text-gray-900">{alert.message || alert.title || "Sin mensaje"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="text-base font-medium text-gray-900">{getTypeLabel(alert.type || alert.category || "general")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Severidad</p>
                    <Badge variant={getSeverityVariant(alert.severity || "info")}>
                      {getSeverityLabel(alert.severity || "info")}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Estado de Lectura</p>
                    <Badge variant={alert.read ? "default" : "info"}>
                      {alert.read ? "Leída" : "No leída"}
                    </Badge>
                  </div>
                </div>

                {(alert as any).status && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Estado de Alerta</p>
                      <Badge variant={
                        (alert as any).status === "resolved" ? "success" :
                        (alert as any).status === "in_review" ? "info" :
                        "warning"
                      }>
                        {(alert as any).status === "open" ? "Abierta" :
                         (alert as any).status === "in_review" ? "En Revisión" :
                         (alert as any).status === "resolved" ? "Resuelta" :
                         (alert as any).status}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Relaciones */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Relaciones</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Obra asociada</p>
                    <p className="text-base font-medium text-gray-900">
                      {(alert as any).work_id || (alert as any).workId ? getWorkName((alert as any).work_id || (alert as any).workId) : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Usuario involucrado</p>
                    <p className="text-base font-medium text-gray-900">
                      {(alert as any).user_id || (alert as any).userId ? getUserName((alert as any).user_id || (alert as any).userId) : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Creación</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date((alert as any).date || alert.createdAt || new Date()).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historial de Asignaciones y Resoluciones */}
        {((alert as any).assigned_to || (alert as any).resolved_by) && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial</h2>
              <div className="space-y-4">
                {(alert as any).assigned_to && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Asignada a</p>
                      <p className="text-base text-blue-700">
                        {(alert as any).assigned_to.name || (alert as any).assigned_to.id}
                      </p>
                      {(alert as any).status === "in_review" && (
                        <p className="text-xs text-blue-600 mt-1">Estado: En Revisión</p>
                      )}
                    </div>
                  </div>
                )}

                {(alert as any).resolved_by && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Resuelta por</p>
                      <p className="text-base text-green-700">
                        {(alert as any).resolved_by.name || (alert as any).resolved_by.id}
                      </p>
                      {(alert as any).resolved_at && (
                        <p className="text-xs text-green-600 mt-1">
                          Fecha: {new Date((alert as any).resolved_at).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                      {(alert as any).metadata?.resolution_notes && (
                        <div className="mt-2 p-2 bg-white rounded border border-green-200">
                          <p className="text-xs text-gray-600 font-medium mb-1">Notas de Resolución:</p>
                          <p className="text-sm text-gray-700">{(alert as any).metadata.resolution_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirmar Eliminación"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar esta alerta?
            </p>
            <p className="text-sm text-gray-500 font-medium">{alert.message || alert.title || "Sin mensaje"}</p>
            <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default function AlertDetailPage() {
  return (
    <ProtectedRoute>
      <AlertDetailContent />
    </ProtectedRoute>
  );
}

