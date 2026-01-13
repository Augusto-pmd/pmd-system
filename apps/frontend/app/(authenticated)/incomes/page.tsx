"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionRoute } from "@/components/auth/PermissionRoute";
import { useIncomes, incomeApi } from "@/hooks/api/incomes";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { IncomeForm } from "@/components/forms/IncomeForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useSWRConfig } from "swr";
import { refreshPatterns } from "@/lib/refreshData";
import { useToast } from "@/components/ui/Toast";
import { getOperationErrorMessage, getErrorMessage } from "@/lib/errorMessages";
import { useCan } from "@/lib/acl";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

function IncomesContent() {
  const router = useRouter();
  const { incomes, isLoading, error, mutate } = useIncomes();
  const { mutate: globalMutate } = useSWRConfig();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [incomeToValidate, setIncomeToValidate] = useState<any>(null);
  
  // Verificar permisos para crear/editar/eliminar ingresos
  const canCreateIncome = useCan("incomes.create");
  const canUpdateIncome = useCan("incomes.update");
  const canDeleteIncome = useCan("incomes.delete");

  const totalIncome = incomes?.reduce((sum: number, inc: any) => sum + Number(inc.amount || 0), 0) || 0;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthIncome =
    incomes?.filter((inc: any) => {
      const incDate = new Date(inc.date);
      return incDate.getMonth() === thisMonth && incDate.getFullYear() === thisYear;
    }).reduce((sum: number, inc: any) => sum + Number(inc.amount || 0), 0) || 0;

  const handleCreate = () => {
    setEditingIncome(null);
    setIsModalOpen(true);
  };

  const handleEdit = (income: any) => {
    setEditingIncome(income);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este ingreso?")) return;
    setDeleteLoading(id);
    try {
      await incomeApi.delete(id);
      mutate();
      await refreshPatterns.afterIncomeUpdate(globalMutate);
      toast.success("Ingreso eliminado correctamente. Dashboard actualizado.");
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage("delete", error);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleValidationClick = (income: any) => {
    setIncomeToValidate(income);
    setIsValidationModalOpen(true);
  };

  const handleConfirmValidation = async () => {
    if (!incomeToValidate) return;
    
    const newValidationStatus = !incomeToValidate.is_validated;
    setDeleteLoading(incomeToValidate.id);
    setIsValidationModalOpen(false);
    
    try {
      await incomeApi.update(incomeToValidate.id, { is_validated: newValidationStatus });
      mutate();
      await refreshPatterns.afterIncomeUpdate(globalMutate);
      toast.success(`Ingreso ${newValidationStatus ? "validado" : "invalidado"} correctamente. Dashboard actualizado.`);
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage("update", error);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
      setIncomeToValidate(null);
    }
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingIncome) {
        await incomeApi.update(editingIncome.id, data);
      } else {
        await incomeApi.create(data);
      }
      mutate();
      await refreshPatterns.afterIncomeUpdate(globalMutate);
      toast.success("Ingreso guardado correctamente. Dashboard actualizado.");
      setIsModalOpen(false);
      setEditingIncome(null);
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage(editingIncome ? "update" : "create", error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Cargando ingresos..." />;
  }

  if (error) {
    // Extraer el mensaje de error de forma segura usando la función helper
    const errorMessage = getErrorMessage(error, "Unknown error");
    
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error loading incomes: {errorMessage}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Ingresos</h1>
            <p className="text-gray-600">Rastrea y gestiona todas las fuentes de ingresos</p>
          </div>
          {canCreateIncome && (
            <Button onClick={handleCreate}>+ Agregar Ingreso</Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total de Ingresos</p>
                <p className="text-2xl font-bold text-green-600">${Number(totalIncome).toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Este Mes</p>
                <p className="text-2xl font-bold text-green-600">${Number(thisMonthIncome).toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Promedio por Mes</p>
                <p className="text-2xl font-bold text-green-600">
                  ${incomes?.length ? Number(totalIncome / incomes.length).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Lista de Ingresos</h2>
            {incomes?.length === 0 ? (
              <EmptyState
                title="No se encontraron registros de ingresos"
                description="Crea tu primer registro de ingreso para comenzar"
                action={canCreateIncome ? <Button onClick={handleCreate}>Crear Ingreso</Button> : undefined}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Moneda</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Método de Pago</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Observaciones</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {incomes?.map((income: any) => {
                      const getTypeLabel = (type: string) => {
                        const typeMap: Record<string, string> = {
                          advance: "Anticipo",
                          certification: "Certificación",
                          final_payment: "Pago Final",
                          adjustment: "Ajuste",
                          reimbursement: "Reembolso",
                          other: "Otro",
                        };
                        return typeMap[type] || type;
                      };
                      
                      const getPaymentMethodLabel = (method: string) => {
                        const methodMap: Record<string, string> = {
                          transfer: "Transferencia",
                          check: "Cheque",
                          cash: "Efectivo",
                          payment_link: "Link de pago",
                        };
                        return methodMap[method] || "-";
                      };
                      
                      return (
                        <tr key={income.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {income.date ? new Date(income.date).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getTypeLabel(income.type || "")}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-green-600">
                            ${Number(income.amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{income.currency || "ARS"}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getPaymentMethodLabel(income.payment_method || "")}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {income.observations ? (
                              <span className="truncate block max-w-xs" title={income.observations}>
                                {income.observations}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {income.is_validated ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Validado
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pendiente
                              </span>
                            )}
                          </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/incomes/${income.id}`)}
                            >
                              Ver
                            </Button>
                            {canUpdateIncome && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(income)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant={income.is_validated ? "outline" : "primary"}
                                  onClick={() => handleToggleValidationClick(income)}
                                  disabled={deleteLoading === income.id}
                                  title={income.is_validated ? "Invalidar ingreso" : "Validar ingreso"}
                                >
                                  {deleteLoading === income.id 
                                    ? "..." 
                                    : income.is_validated 
                                    ? "Invalidar" 
                                    : "Validar"}
                                </Button>
                              </>
                            )}
                            {canDeleteIncome && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(income.id)}
                                disabled={deleteLoading === income.id}
                              >
                                {deleteLoading === income.id ? "Eliminando..." : "Eliminar"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingIncome(null);
          }}
          title={editingIncome ? "Editar Ingreso" : "Crear Ingreso"}
        >
          <IncomeForm
            initialData={editingIncome}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingIncome(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>

        <ConfirmationModal
          isOpen={isValidationModalOpen}
          onClose={() => {
            setIsValidationModalOpen(false);
            setIncomeToValidate(null);
          }}
          onConfirm={handleConfirmValidation}
          title={incomeToValidate?.is_validated ? "Invalidar Ingreso" : "Validar Ingreso"}
          description={
            incomeToValidate?.is_validated
              ? "¿Estás seguro de que deseas invalidar este ingreso? Esto actualizará los totales de la obra."
              : "¿Estás seguro de que deseas validar este ingreso? Esto actualizará los totales de la obra."
          }
          confirmText={incomeToValidate?.is_validated ? "Invalidar" : "Validar"}
          cancelText="Cancelar"
          isLoading={deleteLoading === incomeToValidate?.id}
        />
      </div>
    </>
  );
}

export default function IncomesPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute permission="incomes.read">
        <IncomesContent />
      </PermissionRoute>
    </ProtectedRoute>
  );
}
