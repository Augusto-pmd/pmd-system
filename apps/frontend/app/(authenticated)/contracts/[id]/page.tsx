"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useContract, contractApi } from "@/hooks/api/contracts";
import { useExpenses } from "@/hooks/api/expenses";
import { useAlertsStore } from "@/store/alertsStore";
import { useAuthStore } from "@/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Modal } from "@/components/ui/Modal";
import { ContractForm } from "@/components/forms/ContractForm";
import { useToast } from "@/components/ui/Toast";
import { FileCheck, DollarSign, AlertCircle, Building2, Truck, Calendar, FileText, Unlock, Edit } from "lucide-react";
import { ContractStatus } from "@/lib/types/contract";

function ContractDetailContent() {
  const params = useParams();
  const router = useRouter();
  const contractId = typeof params?.id === "string" ? params.id : null;
  const { contract, isLoading, error, mutate } = useContract(contractId);
  const { expenses } = useExpenses();
  const { alerts, fetchAlerts } = useAlertsStore();
  const user = useAuthStore.getState().user;
  const toast = useToast();
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Verificar si el usuario es Direction
  const isDirection = user?.role?.name === "DIRECTION";
  const isAdministration = user?.role?.name === "ADMINISTRATION" || isDirection;

  useEffect(() => {
    if (contractId) {
      fetchAlerts();
    }
  }, [contractId, fetchAlerts]);

  if (!contractId) {
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Cargando contrato..." />;
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al cargar el contrato: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/contracts")}>Volver a Contratos</Button>
        </div>
      </>
    );
  }

  if (!contract) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Contrato no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/contracts")}>Volver a Contratos</Button>
        </div>
      </>
    );
  }

  // Filtrar gastos relacionados con este contrato
  const contractExpenses = expenses?.filter(
    (exp: any) => exp.contract_id === contractId
  ) || [];

  // Filtrar alertas relacionadas con este contrato
  const contractAlerts = alerts.filter(
    (alert) => alert.contract_id === contractId
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: contract.currency || "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Función para renderizar un campo si existe (patrón del sistema)
  const renderField = (label: string, value: any, formatter?: (val: any) => string, icon?: React.ReactNode) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3">
        {icon || <div className="h-5 w-5 mt-0.5" />}
        <div className="flex-1">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-base font-medium text-gray-900">{formatter ? formatter(value) : String(value)}</p>
        </div>
      </div>
    );
  };

  const amountTotal = (contract as any).amount_total || 0;
  const amountExecuted = (contract as any).amount_executed || 0;
  const availableBalance = amountTotal - amountExecuted;

  // Función para desbloquear contrato (solo Direction)
  const handleUnblock = async () => {
    if (!contractId || !isDirection) return;
    
    if (!confirm("¿Estás seguro de desbloquear este contrato?")) {
      return;
    }

    setIsUnblocking(true);
    try {
      await contractApi.update(contractId, { is_blocked: false });
      await mutate();
      toast.success("Contrato desbloqueado correctamente");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al desbloquear el contrato";
      toast.error(errorMessage);
    } finally {
      setIsUnblocking(false);
    }
  };

  // Función para actualizar contrato
  const handleUpdate = async (data: any) => {
    if (!contractId) return;

    setIsSubmitting(true);
    try {
      await contractApi.update(contractId, data);
      await mutate();
      toast.success("Contrato actualizado correctamente");
      setIsEditModalOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar el contrato";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <BotonVolver backTo="/contracts" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle del contrato</h1>
          <p className="text-gray-600">Información completa del contrato seleccionado</p>
        </div>
        <div className="flex gap-2">
          {isAdministration && (
            <Button
              variant="primary"
              onClick={() => setIsEditModalOpen(true)}
              disabled={contract.is_blocked && !isDirection}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push("/contracts")}>
            Volver a Contratos
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {(contract as any).contract_number || (contract as any).number || `Contrato ${contractId.slice(0, 8)}`}
            </CardTitle>
            <ContractStatusBadge 
              status={contract.status} 
              isBlocked={contract.is_blocked}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mensaje informativo cuando el contrato está bloqueado */}
          {(contract as any).is_blocked && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    Contrato Bloqueado
                  </p>
                  <p className="text-sm text-red-700 mb-3">
                    Este contrato ha sido bloqueado automáticamente porque su saldo disponible es cero o negativo. 
                    No se pueden imputar más gastos hasta que sea desbloqueado.
                  </p>
                  {isDirection && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUnblock}
                      disabled={isUnblocking}
                      style={{ borderColor: "rgba(255, 59, 48, 1)", color: "rgba(255, 59, 48, 1)" }}
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      {isUnblocking ? "Desbloqueando..." : "Desbloquear Contrato"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField(
              "Número de contrato",
              (contract as any).contract_number || (contract as any).number || `Contrato ${contractId.slice(0, 8)}`,
              undefined,
              <FileCheck className="h-5 w-5 text-gray-400" />
            )}
            {renderField(
              "Proveedor",
              (contract as any).supplier?.name || (contract as any).supplierName || (contract as any).supplier_id,
              undefined,
              <Truck className="h-5 w-5 text-gray-400" />
            )}
            {renderField(
              "Obra",
              (contract as any).work?.name || (contract as any).workName || (contract as any).work_id,
              undefined,
              <Building2 className="h-5 w-5 text-gray-400" />
            )}
            {renderField("Monto total", amountTotal, formatCurrency, <DollarSign className="h-5 w-5 text-gray-400" />)}
            {renderField("Monto ejecutado", amountExecuted, formatCurrency)}
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Saldo disponible</p>
                <p
                  className={`text-lg font-semibold ${
                    availableBalance < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(availableBalance)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Actualizado automáticamente al validar/rechazar gastos
                </p>
              </div>
            </div>
            {renderField("Moneda", (contract as any).currency || contract.currency)}
            {renderField(
              "Fecha de inicio",
              (contract as any).start_date,
              formatDate,
              <Calendar className="h-5 w-5 text-gray-400" />
            )}
            {renderField(
              "Fecha de fin",
              (contract as any).end_date,
              formatDate,
              <Calendar className="h-5 w-5 text-gray-400" />
            )}
            {renderField(
              "Términos de pago",
              (contract as any).payment_terms || (contract as any).paymentTerms,
              undefined,
              <FileText className="h-5 w-5 text-gray-400" />
            )}
            {renderField("Observaciones", contract.observations)}
            {renderField(
              "Fecha de Validez",
              contract.validity_date,
              formatDate,
              <Calendar className="h-5 w-5 text-gray-400" />
            )}
            {renderField("Alcance", contract.scope)}
            {renderField("Especificaciones", contract.specifications)}
            {contract.closed_at && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Cerrado por</p>
                  <p className="text-base font-medium text-gray-900">
                    {contract.closed_by?.name || contract.closed_by?.email || "Usuario desconocido"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(contract.closed_at)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mostrar ID del contrato */}
          {contract.id && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">ID del contrato</h3>
              <p className="text-gray-600 font-mono text-sm">{contract.id}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gastos asociados */}
      {contractExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Gastos Asociados</CardTitle>
              <Badge variant="info">{contractExpenses.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contractExpenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">
                          {expense.description || "Sin descripción"}
                        </p>
                        <Badge
                          variant={
                            expense.state === "validated"
                              ? "success"
                              : expense.state === "observed"
                              ? "warning"
                              : expense.state === "annulled"
                              ? "error"
                              : "default"
                          }
                        >
                          {expense.state === "validated"
                            ? "Validado"
                            : expense.state === "observed"
                            ? "Observado"
                            : expense.state === "annulled"
                            ? "Anulado"
                            : "Pendiente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(expense.amount || 0)} •{" "}
                        {expense.purchase_date || expense.date
                          ? formatDate(expense.purchase_date || expense.date)
                          : "Sin fecha"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/expenses/${expense.id}`)}
                    >
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas relacionadas */}
      {contractAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Alertas</CardTitle>
              <Badge variant="info">{contractAlerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contractAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.severity === "critical"
                      ? "bg-red-50 border-red-200"
                      : alert.severity === "warning"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle
                      className={`h-4 w-4 ${
                        alert.severity === "critical"
                          ? "text-red-600"
                          : alert.severity === "warning"
                          ? "text-yellow-600"
                          : "text-blue-600"
                      }`}
                    />
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "error"
                          : alert.severity === "warning"
                          ? "warning"
                          : "info"
                      }
                    >
                      {alert.severity === "critical"
                        ? "Crítico"
                        : alert.severity === "warning"
                        ? "Advertencia"
                        : "Info"}
                    </Badge>
                    {!alert.read && (
                      <Badge variant="info" className="text-[10px]">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{alert.title}</h4>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                  {alert.createdAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(alert.createdAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Contrato"
        size="lg"
      >
        <ContractForm
          initialData={contract}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
}

export default function ContractDetailPage() {
  return (
    <ProtectedRoute>
      <ContractDetailContent />
    </ProtectedRoute>
  );
}

