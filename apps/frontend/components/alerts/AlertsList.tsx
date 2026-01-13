"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAlertsStore, Alert } from "@/store/alertsStore";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { 
  Eye, 
  Trash2, 
  Check, 
  CheckCheck, 
  Bell, 
  AlertTriangle, 
  FileX, 
  Wallet, 
  FileText, 
  Receipt, 
  Calendar, 
  AlertCircle,
  XCircle,
  Clock,
  DollarSign
} from "lucide-react";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { useWorkDocuments } from "@/hooks/api/workDocuments";
import { useSuppliers } from "@/hooks/api/suppliers";
import { AlertActions } from "./AlertActions";
import { useCan } from "@/lib/acl";

interface AlertsListProps {
  alerts: Alert[];
  onRefresh?: () => void;
  searchQuery?: string;
  severityFilter?: "all" | "info" | "warning" | "critical";
  typeFilter?: string;
  workFilter?: string;
  statusFilter?: "all" | "open" | "in_review" | "resolved";
  assignedToFilter?: string;
  dateFilter?: string;
}

export function AlertsList({
  alerts,
  onRefresh,
  searchQuery = "",
  severityFilter = "all",
  typeFilter = "all",
  workFilter = "all",
  statusFilter = "all",
  assignedToFilter = "all",
  dateFilter = "",
}: AlertsListProps) {
  const router = useRouter();
  const { works } = useWorks();
  const { users } = useUsers();
  const { documents } = useWorkDocuments();
  const { suppliers } = useSuppliers();
  const { markAsRead, deleteAlert, markAllAsRead } = useAlertsStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  // Verificar permisos
  const canDeleteAlert = useCan("alerts.delete");
  const canManageAlerts = useCan("alerts.manage");
  const canDelete = canDeleteAlert || canManageAlerts;

  // Filtrar alertas
  const filteredAlerts = alerts.filter((alert) => {
    // Búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesDescription = alert.description?.toLowerCase().includes(query);
      const matchesTitle = alert.title?.toLowerCase().includes(query);
      if (!matchesDescription && !matchesTitle) return false;
    }

    // Filtro de severidad
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false;

    // Filtro de tipo (usar type del backend, con fallback a category para compatibilidad)
    if (typeFilter !== "all") {
      const alertType = alert.type || alert.category;
      if (alertType !== typeFilter) return false;
    }

    // Filtro de obra
    if (workFilter !== "all" && alert.workId !== workFilter) return false;

    // Filtro de estado
    if (statusFilter !== "all") {
      const alertStatus = (alert as any).status;
      if (alertStatus !== statusFilter) return false;
    }

    // Filtro de usuario asignado
    if (assignedToFilter !== "all") {
      if (assignedToFilter === "unassigned") {
        // Mostrar solo alertas sin asignar
        if ((alert as any).assigned_to_id || (alert as any).assigned_to) return false;
      } else {
        // Mostrar solo alertas asignadas a un usuario específico
        const assignedToId = (alert as any).assigned_to_id || (alert as any).assigned_to?.id;
        if (assignedToId !== assignedToFilter) return false;
      }
    }

    // Filtro de fecha (usar createdAt si date no existe)
    if (dateFilter) {
      const alertDate = (alert as any).date || alert.createdAt;
      if (alertDate && new Date(alertDate).toISOString().split("T")[0] !== dateFilter) return false;
    }

    return true;
  });

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

  const getDocumentName = (documentId?: string) => {
    if (!documentId) return "-";
    const doc = documents?.find((d: any) => d.id === documentId);
    if (!doc) return documentId;
    return doc.name || doc.nombre || documentId;
  };

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return "-";
    const supplier = suppliers?.find((s: any) => s.id === supplierId);
    if (!supplier) return supplierId;
    return supplier.nombre || supplier.name || supplierId;
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

  const getAlertTypeIcon = (type?: string) => {
    if (!type) return <Bell className="h-4 w-4" />;
    const typeLower = type.toLowerCase();
    if (typeLower.includes("expired") || typeLower.includes("vencida")) return <FileX className="h-4 w-4" />;
    if (typeLower.includes("cashbox") || typeLower.includes("caja")) return <Wallet className="h-4 w-4" />;
    if (typeLower.includes("contract") || typeLower.includes("contrato")) return <FileText className="h-4 w-4" />;
    if (typeLower.includes("expense") || typeLower.includes("gasto")) return <Receipt className="h-4 w-4" />;
    if (typeLower.includes("overdue") || typeLower.includes("vencida")) return <Calendar className="h-4 w-4" />;
    if (typeLower.includes("duplicate") || typeLower.includes("duplicada")) return <AlertCircle className="h-4 w-4" />;
    if (typeLower.includes("validation") || typeLower.includes("validación")) return <Clock className="h-4 w-4" />;
    if (typeLower.includes("income") || typeLower.includes("ingreso")) return <DollarSign className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const getAlertTypeLabel = (type?: string, category?: string) => {
    // Priorizar type del backend sobre category legacy
    const alertType = type || category;
    if (!alertType) return "General";
    
    const labels: Record<string, string> = {
      // Tipos del backend
      expired_documentation: "Documentación Vencida",
      cashbox_difference: "Diferencia de Caja",
      contract_zero_balance: "Contrato Sin Saldo",
      contract_insufficient_balance: "Contrato Saldo Insuficiente",
      duplicate_invoice: "Factura Duplicada",
      overdue_stage: "Etapa Vencida",
      observed_expense: "Gasto Observado",
      missing_validation: "Validación Pendiente",
      pending_income_confirmation: "Confirmación de Ingreso Pendiente",
      annulled_expense: "Gasto Anulado",
      // Categorías legacy
      work: "Obra",
      supplier: "Proveedor",
      document: "Documento",
      accounting: "Contable",
      cashbox: "Caja",
      general: "General",
    };
    return labels[alertType] || alertType;
  };

  const handleMarkAsRead = async (id: string) => {
    setIsSubmitting(true);
    try {
      await markAsRead(id);
      await onRefresh?.();
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

  const handleMarkAllAsRead = async () => {
    setIsSubmitting(true);
    try {
      await markAllAsRead();
      await onRefresh?.();
      toast.success("Todas las alertas marcadas como leídas");
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al marcar todas las alertas:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAlert) return;
    setIsSubmitting(true);
    try {
      await deleteAlert(selectedAlert.id);
      await onRefresh?.();
      toast.success("Alerta eliminada correctamente");
      setIsDeleteModalOpen(false);
      setSelectedAlert(null);
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

  const unreadCount = filteredAlerts.filter((a) => !a.read).length;

  if (filteredAlerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">
          {alerts.length === 0
            ? "No hay alertas registradas"
            : "No se encontraron alertas con los filtros aplicados"}
        </p>
      </div>
    );
  }

  return (
    <>
      {unreadCount > 0 && (
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leídas
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-pmd overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mensaje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className={`hover:bg-gray-50 transition-colors ${!alert.read ? "bg-blue-50/30" : ""}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`${
                        alert.severity === "critical" 
                          ? "text-red-600" 
                          : alert.severity === "warning" 
                          ? "text-yellow-600" 
                          : "text-blue-600"
                      }`}>
                        {getAlertTypeIcon(alert.type || alert.category)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {getAlertTypeLabel(alert.type, alert.category)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 ${
                        alert.severity === "critical" 
                          ? "text-red-600" 
                          : alert.severity === "warning" 
                          ? "text-yellow-600" 
                          : "text-blue-600"
                      }`}>
                        {alert.severity === "critical" ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : alert.severity === "warning" ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          alert.severity === "critical" 
                            ? "text-red-900" 
                            : alert.severity === "warning" 
                            ? "text-yellow-900" 
                            : "text-gray-900"
                        }`}>
                          {alert.title || alert.message || "Sin título"}
                        </div>
                        {(alert.description || alert.message) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {alert.description || alert.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getSeverityVariant(alert.severity || "info")}>
                      {getSeverityLabel(alert.severity || "info")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date((alert as any).date || alert.createdAt || new Date()).toLocaleDateString("es-AR")}
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap w-32">
                    <div className="space-y-1">
                      <Badge variant={alert.read ? "default" : "info"} className="text-xs">
                        {alert.read ? "Leída" : "No leída"}
                      </Badge>
                      {(alert as any).status && (
                        <div className="mt-1">
                          <Badge variant={
                            (alert as any).status === "resolved" ? "success" :
                            (alert as any).status === "in_review" ? "info" :
                            "warning"
                          } className="text-xs">
                            {(alert as any).status === "open" ? "Abierta" :
                             (alert as any).status === "in_review" ? "En Revisión" :
                             (alert as any).status === "resolved" ? "Resuelta" :
                             (alert as any).status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <AlertActions alert={alert as any} onActionComplete={onRefresh || (() => {})} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/alerts/${alert.id}`)}
                        className="text-pmd-darkBlue hover:text-pmd-mediumBlue"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(alert.id)}
                          disabled={isSubmitting}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAlert && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedAlert(null);
          }}
          title="Confirmar Eliminación"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar esta alerta?
            </p>
            <p className="text-sm text-gray-500 font-medium">{selectedAlert.title || selectedAlert.description || "Sin título"}</p>
            <p className="text-sm text-red-600 font-medium">
              ⚠️ Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedAlert(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

