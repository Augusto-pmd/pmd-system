"use client";

import { useState, useEffect } from "react";
import { normalizeId } from "@/lib/normalizeId";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAlertsStore } from "@/store/alertsStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { AlertsList } from "@/components/alerts/AlertsList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { Search, Filter, X, Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { Modal } from "@/components/ui/Modal";
import { AlertForm } from "./components/AlertForm";
import { Plus } from "lucide-react";
import { parseBackendError } from "@/lib/parse-backend-error";
import { useCan } from "@/lib/acl";

function AlertsContent() {
  const { alerts, isLoading, error, fetchAlerts, createAlert } = useAlertsStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  const { works } = useWorks();
  const { users } = useUsers();

  // Verificar permisos
  const canCreate = useCan("alerts.create");

  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "info" | "warning" | "critical">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [workFilter, setWorkFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_review" | "resolved">("all");
  const [assignedToFilter, setAssignedToFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (organizationId) {
      fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);


  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Cargando alertas…" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar las alertas: {error}
      </div>
    );
  }

  // Obtener tipos únicos de alertas del backend
  const alertTypes = Array.from(
    new Set(alerts.map((alert) => alert.type).filter(Boolean))
  ) as string[];

  // Mapeo de tipos de alerta a etiquetas en español
  const alertTypeLabels: Record<string, string> = {
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
  };

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalUnreadCount = alerts.filter((a) => !a.read && a.severity === "critical").length;

  return (
    <>
      <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Alertas</h1>
              <p className="text-gray-600">
                Sistema de alertas y notificaciones PMD
                {unreadCount > 0 && (
                  <span className="ml-2 text-gray-900 font-semibold">
                    ({unreadCount} no leída{unreadCount !== 1 ? "s" : ""}
                    {criticalUnreadCount > 0 && (
                      <span className="ml-1 text-red-600">
                        - {criticalUnreadCount} crítica{criticalUnreadCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    )
                  </span>
                )}
              </p>
            </div>
            {canCreate && (
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Alerta
              </Button>
            )}
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por mensaje o palabra clave..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            {(searchQuery || severityFilter !== "all" || typeFilter !== "all" || workFilter !== "all" || dateFilter) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSeverityFilter("all");
                  setTypeFilter("all");
                  setWorkFilter("all");
                  setDateFilter("");
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severidad</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as "all" | "info" | "warning" | "critical")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="critical">Crítico</option>
                  <option value="warning">Advertencia</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "open" | "in_review" | "resolved")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="open">Abierta</option>
                  <option value="in_review">En Revisión</option>
                  <option value="resolved">Resuelta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Alerta</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos los tipos</option>
                  {alertTypes.map((type) => (
                    <option key={type} value={type}>
                      {alertTypeLabels[type] || type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obra</label>
                <select
                  value={workFilter}
                  onChange={(e) => setWorkFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  {works.map((work: any) => {
                    const workName = work.name || work.title || work.nombre || work.id;
                    return (
                      <option key={work.id} value={normalizeId(work.id)}>
                        {workName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asignado a</label>
                <select
                  value={assignedToFilter}
                  onChange={(e) => setAssignedToFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="unassigned">Sin asignar</option>
                  {users?.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.nombre || u.email || u.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <AlertsList
          alerts={alerts || []}
          onRefresh={fetchAlerts}
          searchQuery={searchQuery}
          severityFilter={severityFilter}
          typeFilter={typeFilter}
          workFilter={workFilter}
          statusFilter={statusFilter}
          assignedToFilter={assignedToFilter}
          dateFilter={dateFilter}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nueva Alerta"
          size="lg"
        >
          <AlertForm
            onSubmit={async (data) => {
              setIsSubmitting(true);
              try {
                await createAlert(data);
                toast.success("Alerta creada correctamente");
                setIsCreateModalOpen(false);
                await fetchAlerts();
              } catch (err: unknown) {
                if (process.env.NODE_ENV === "development") {
                  console.error("Error al crear alerta:", err);
                }
                const errorMessage = parseBackendError(err) || "Error al crear la alerta";
                toast.error(errorMessage);
              } finally {
                setIsSubmitting(false);
              }
            }}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </>
  );
}

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <AlertsContent />
    </ProtectedRoute>
  );
}
