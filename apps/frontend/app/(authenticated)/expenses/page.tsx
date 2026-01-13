"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useExpenses, expenseApi } from "@/hooks/api/expenses";
import { useContracts } from "@/hooks/api/contracts";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useWorks } from "@/hooks/api/works";
import { useRubrics } from "@/hooks/api/rubrics";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSWRConfig } from "swr";
import { useToast } from "@/components/ui/Toast";
import { Expense, CreateExpenseData } from "@/lib/types/expense";
import { refreshPatterns } from "@/lib/refreshData";
import { getOperationErrorMessage } from "@/lib/errorMessages";
import { useCan } from "@/lib/acl";

function ExpensesContent() {
  const router = useRouter();
  const { expenses, isLoading, error, mutate } = useExpenses();
  const { contracts } = useContracts();
  const { suppliers } = useSuppliers();
  const { works } = useWorks();
  const { rubrics } = useRubrics();
  const { mutate: globalMutate } = useSWRConfig();
  const user = useAuthStore.getState().user;
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [validatingExpenseId, setValidatingExpenseId] = useState<string | null>(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validateState, setValidateState] = useState<"validated" | "observed" | "annulled">("validated");
  const [validateObservations, setValidateObservations] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingExpenseId, setRejectingExpenseId] = useState<string | null>(null);
  const [duplicateExpenseInfo, setDuplicateExpenseInfo] = useState<{ expenseId: string; message: string } | null>(null);
  const [forceValidate, setForceValidate] = useState(false);

  // Verificar permisos
  const canCreate = useCan("expenses.create");
  const canUpdate = useCan("expenses.update");
  const canDelete = useCan("expenses.delete");
  const canValidate = useCan("expenses.validate");
  const isDirection = user?.role?.name === "DIRECTION";

  const totalExpenses = expenses?.reduce((sum: number, exp: Expense) => {
    const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(String(exp.amount || 0)) || 0;
    return sum + amount;
  }, 0) || 0;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthExpenses =
    expenses?.filter((exp: Expense) => {
      const expDate = new Date(exp.date || exp.purchase_date);
      return expDate.getMonth() === thisMonth && expDate.getFullYear() === thisYear;
    }).reduce((sum: number, exp: Expense) => {
      const amount = typeof exp.amount === 'number' ? exp.amount : parseFloat(String(exp.amount || 0)) || 0;
      return sum + amount;
    }, 0) || 0;

  const handleCreate = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const expense = expenses?.find((e) => e.id === id);
    const hasAccountingRecord = expense?.state === "validated";
    const confirmationMessage = hasAccountingRecord
      ? "⚠️ Este gasto está validado y tiene un registro contable asociado. ¿Estás seguro de que deseas eliminarlo? Esta acción no se puede deshacer."
      : "¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.";
    
    if (!confirm(confirmationMessage)) return;
    setDeleteLoading(id);
    try {
      await expenseApi.delete(id);
      mutate();
      globalMutate("/expenses");
      toast.success("Gasto eliminado correctamente");
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage("delete", error);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleValidateClick = (expense: Expense, state: "validated" | "observed" | "annulled") => {
    setEditingExpense(expense);
    setValidateState(state);
    setValidateObservations("");
    setDuplicateExpenseInfo(null);
    setForceValidate(false);
    setShowValidateModal(true);
  };

  const handleValidate = async () => {
    if (!editingExpense) return;
    
    setValidatingExpenseId(editingExpense.id);
    try {
      await expenseApi.validate(editingExpense.id, validateState, validateObservations || undefined);
      
      // Refrescar datos relacionados automáticamente
      mutate(); // Refrescar gastos
      globalMutate("/expenses"); // Refrescar gastos globalmente
      
      // Si se validó el gasto, refrescar múltiples módulos relacionados
      if (validateState === "validated") {
        await refreshPatterns.afterExpenseValidation(globalMutate);
        
        // Verificar si se asignó un contrato automáticamente
        try {
          const updatedExpense = await expenseApi.getOne(editingExpense.id);
          const hasAutoAssignedContract = updatedExpense?.contract_id && !editingExpense.contract_id;
          
          if (hasAutoAssignedContract) {
            toast.success(
              "Gasto validado correctamente. Se asignó automáticamente un contrato al gasto. Se han actualizado: contrato, obra, contabilidad, alertas y dashboard.",
              7000
            );
          } else {
            toast.success(
              "Gasto validado correctamente. Se han actualizado automáticamente: contrato, obra, contabilidad, alertas y dashboard.",
              6000
            );
          }
        } catch {
          // Si falla obtener el gasto actualizado, mostrar mensaje genérico
          toast.success(
            "Gasto validado correctamente. Se han actualizado automáticamente: contrato, obra, contabilidad, alertas y dashboard.",
            6000
          );
        }
      } else if (validateState === "observed" || validateState === "annulled") {
        // Si se observa o anula, también refrescar contratos y obras (puede haber revertido saldo)
        globalMutate("/contracts");
        globalMutate("/works");
        globalMutate("/alerts"); // Refrescar alertas (puede haber generado alertas de gasto observado/anulado)
        
        const hasContract = editingExpense.contract_id;
        if (hasContract) {
          toast.success(
            `${validateState === "observed" ? "Gasto observado" : "Gasto anulado"}. Se ha revertido automáticamente el saldo del contrato y se han actualizado los totales de la obra.`,
            6000
          );
        } else {
          toast.success(
            validateState === "observed"
              ? "Gasto observado correctamente. Se han actualizado los totales de la obra."
              : "Gasto anulado correctamente. Se han actualizado los totales de la obra.",
            5000
          );
        }
      }
      
      setShowValidateModal(false);
      setEditingExpense(null);
      setValidateObservations("");
      setDuplicateExpenseInfo(null);
      setForceValidate(false);
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage("validate", error);
      
      // Detectar error de factura duplicada
      const isDuplicateError = errorMessage.toLowerCase().includes("duplicate invoice") || 
                               errorMessage.toLowerCase().includes("factura duplicada") ||
                               errorMessage.toLowerCase().includes("duplicate invoice detected");
      
      // Detectar error de saldo insuficiente del contrato
      const isInsufficientBalanceError = errorMessage.toLowerCase().includes("insufficient balance") ||
                                        errorMessage.toLowerCase().includes("saldo insuficiente") ||
                                        errorMessage.toLowerCase().includes("contract has insufficient balance");
      
      if (isDuplicateError && validateState === "validated") {
        // Si es Direction, permitir validar de todas formas
        if (isDirection && !forceValidate) {
          setDuplicateExpenseInfo({
            expenseId: editingExpense.id,
            message: errorMessage,
          });
          toast.warning("Se detectó una factura duplicada. Como Dirección, puedes validar de todas formas si lo deseas.");
          return; // No cerrar el modal, mostrar opción de forzar validación
        } else if (!isDirection) {
          // Para no-Direction, bloquear completamente
          setDuplicateExpenseInfo({
            expenseId: editingExpense.id,
            message: errorMessage,
          });
          toast.error("No se puede validar: se detectó una factura duplicada. Solo Dirección puede validar gastos con facturas duplicadas.");
          return;
        }
      }
      
      if (isInsufficientBalanceError && validateState === "validated") {
        // Mostrar mensaje específico para error de saldo insuficiente
        toast.error(
          "No se puede validar: el contrato asignado automáticamente no tiene saldo suficiente. Se ha generado una alerta crítica. Por favor, revisa el contrato o ajusta el monto del gasto.",
          8000
        );
        // Refrescar alertas para mostrar la nueva alerta generada
        globalMutate("/alerts");
        return;
      }
      
      toast.error(errorMessage);
    } finally {
      setValidatingExpenseId(null);
    }
  };

  const getContractName = (contractId?: string) => {
    if (!contractId) return "-";
    const contract = contracts?.find((c) => c.id === contractId);
    return (contract as any)?.contract_number || (contract as any)?.number || `Contrato ${contractId.slice(0, 8)}`;
  };

  const getExpenseDescription = (expense: Expense): string => {
    const parts: string[] = [];
    
    // Obtener nombre del proveedor (prioridad: relación del backend > hook)
    let supplierName: string | null = null;
    if ((expense as any).supplier) {
      supplierName = (expense as any).supplier.name || (expense as any).supplier.nombre || null;
    }
    if (!supplierName && expense.supplier_id) {
      const supplier = suppliers?.find((s: any) => s.id === expense.supplier_id);
      supplierName = supplier?.name || supplier?.nombre || null;
    }
    if (supplierName) {
      parts.push(supplierName);
    }
    
    // Agregar número de documento si existe
    if (expense.document_number) {
      parts.push(`Doc: ${expense.document_number}`);
    }
    
    // Si hay observaciones, agregarlas al final
    if (expense.observations) {
      parts.push(expense.observations);
    }
    
    return parts.length > 0 ? parts.join(" - ") : "-";
  };

  const getExpenseCategory = (expense: Expense): string => {
    // Prioridad: relación del backend > category field > hook
    if ((expense as any).rubric) {
      return (expense as any).rubric.name || (expense as any).rubric.nombre || "-";
    }
    
    if (expense.category) {
      return expense.category;
    }
    
    if (expense.rubric_id) {
      const rubric = rubrics?.find((r: any) => r.id === expense.rubric_id);
      if (rubric) {
        return rubric.name || rubric.nombre || "-";
      }
    }
    
    return "-";
  };

  const getStateBadgeVariant = (state?: string) => {
    if (!state) return "default";
    const stateLower = state.toLowerCase();
    if (stateLower === "validated") return "success";
    if (stateLower === "observed") return "warning";
    if (stateLower === "annulled") return "error";
    if (stateLower === "rejected") return "error";
    return "default";
  };

  const getStateLabel = (state?: string) => {
    if (!state) return "Pendiente";
    const stateLower = state.toLowerCase();
    if (stateLower === "validated") return "Validado";
    if (stateLower === "observed") return "Observado";
    if (stateLower === "annulled") return "Anulado";
    if (stateLower === "rejected") return "Rechazado";
    return state;
  };

  const handleRejectClick = (expense: Expense) => {
    setEditingExpense(expense);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!editingExpense || !rejectReason.trim()) return;
    
    setRejectingExpenseId(editingExpense.id);
    try {
      await expenseApi.reject(editingExpense.id, rejectReason);
      
      mutate();
      globalMutate("/expenses");
      globalMutate("/alerts");
      
      toast.success("Gasto rechazado correctamente. Se ha generado una alerta.");
      
      setShowRejectModal(false);
      setEditingExpense(null);
      setRejectReason("");
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage("reject", error);
      toast.error(errorMessage);
    } finally {
      setRejectingExpenseId(null);
    }
  };

  const handleSubmit = async (data: CreateExpenseData) => {
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        await expenseApi.update(editingExpense.id, data);
      } else {
        await expenseApi.create(data);
      }
      mutate();
      globalMutate("/expenses");
      setIsModalOpen(false);
      setEditingExpense(null);
      toast.success(editingExpense ? "Gasto actualizado correctamente" : "Gasto creado correctamente");
    } catch (error: unknown) {
      // Manejar errores específicos del backend
      const errorMessage = getOperationErrorMessage(editingExpense ? "update" : "create", error);
      
      // Verificar si el error es por proveedor bloqueado
      if (errorMessage.toLowerCase().includes("blocked") || 
          errorMessage.toLowerCase().includes("bloqueado") ||
          errorMessage.toLowerCase().includes("art") ||
          errorMessage.toLowerCase().includes("vencida")) {
        toast.error(
          "No se puede crear el gasto: El proveedor está bloqueado debido a ART vencida. Por favor, contacta a Dirección para desbloquear el proveedor.",
          6000
        );
      } 
      // Verificar si el error es por obra cerrada
      else if (errorMessage.toLowerCase().includes("closed") || 
               errorMessage.toLowerCase().includes("cerrada") ||
               errorMessage.toLowerCase().includes("finished") ||
               errorMessage.toLowerCase().includes("finalizada")) {
        toast.error(
          "No se puede crear el gasto: La obra está cerrada. Solo Dirección puede crear gastos en obras cerradas. Contacta a Dirección para más información.",
          6000
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading expenses..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error loading expenses: {error.message || "Unknown error"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Gastos</h1>
            <p className="text-gray-600">Rastrea y gestiona todos los gastos</p>
          </div>
          {canCreate && (
            <Button onClick={handleCreate}>+ Crear Gasto</Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total de gastos</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">${(Number(totalExpenses) || 0).toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Este mes</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">${(Number(thisMonthExpenses) || 0).toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Promedio por mes</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">
                  ${expenses?.length ? (Number(totalExpenses) / expenses.length || 0).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Listado de gastos</h2>
            {expenses?.length === 0 ? (
              <EmptyState
                title="No se encontraron gastos"
                description="Crea tu primer gasto para comenzar"
                action={<Button onClick={handleCreate}>Crear gasto</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descripción</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">VAL</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contrato</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses?.map((expense: Expense) => {
                      const expenseState = expense.state || expense.estado || "pending";
                      const isPending = expenseState.toLowerCase() === "pending";
                      const isRejected = expenseState.toLowerCase() === "rejected";
                      const canReject = canValidate && (isPending || expenseState.toLowerCase() === "observed");
                      
                      return (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {expense.date || expense.purchase_date
                              ? new Date(expense.date || expense.purchase_date).toLocaleDateString("es-ES")
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getExpenseDescription(expense)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{getExpenseCategory(expense)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                            ${(Number(expense.amount) || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {expense.document_number ? (
                              <Badge variant="info" className="font-mono">
                                {expense.document_number}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2 items-center">
                              <Badge variant={getStateBadgeVariant(expenseState)}>
                                {getStateLabel(expenseState)}
                              </Badge>
                              {expense.is_post_closure && (
                                <Badge variant="warning" className="text-xs">
                                  Post-cierre
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {expense.contract_id ? (
                              <span
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                onClick={() => router.push(`/contracts/${expense.contract_id}`)}
                                title="Ver contrato"
                              >
                                {getContractName(expense.contract_id)}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/expenses/${expense.id}`)}
                              >
                                Ver
                              </Button>
                              {canValidate && isPending && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => handleValidateClick(expense, "validated")}
                                    disabled={validatingExpenseId === expense.id}
                                  >
                                    Validar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleValidateClick(expense, "observed")}
                                    disabled={validatingExpenseId === expense.id}
                                  >
                                    Observar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectClick(expense)}
                                    disabled={rejectingExpenseId === expense.id}
                                    style={{ color: "rgba(255, 59, 48, 1)" }}
                                  >
                                    Rechazar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleValidateClick(expense, "annulled")}
                                    disabled={validatingExpenseId === expense.id}
                                    style={{ color: "rgba(255, 59, 48, 1)" }}
                                  >
                                    Anular
                                  </Button>
                                </>
                              )}
                              {canReject && !isPending && !isRejected && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectClick(expense)}
                                  disabled={rejectingExpenseId === expense.id}
                                  style={{ color: "rgba(255, 59, 48, 1)" }}
                                >
                                  Rechazar
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
            setEditingExpense(null);
          }}
          title={editingExpense ? "Editar Gasto" : "Crear Gasto"}
        >
          <ExpenseForm
            initialData={editingExpense}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingExpense(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>

        {/* Modal de validación */}
        <Modal
          isOpen={showValidateModal}
          onClose={() => {
            setShowValidateModal(false);
            setEditingExpense(null);
            setValidateObservations("");
            setDuplicateExpenseInfo(null);
            setForceValidate(false);
          }}
          title={
            validateState === "validated"
              ? "Validar Gasto"
              : validateState === "observed"
              ? "Observar Gasto"
              : "Anular Gasto"
          }
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {validateState === "validated"
                  ? "¿Estás seguro de validar este gasto?"
                  : validateState === "observed"
                  ? "Ingresa las observaciones para este gasto:"
                  : "¿Estás seguro de anular este gasto?"}
              </p>
              {editingExpense && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm font-medium">{editingExpense.description || "Sin descripción"}</p>
                  <p className="text-sm text-gray-600">
                    Monto: ${Number(editingExpense.amount || 0).toFixed(2)}
                  </p>
                  {editingExpense.document_number && (
                    <p className="text-sm text-gray-600">
                      Factura: {editingExpense.document_number}
                    </p>
                  )}
                  {editingExpense.contract_id && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-semibold text-yellow-800">
                        ⚠️ Este gasto está asociado a un contrato
                      </p>
                      <p className="text-sm text-yellow-700">
                        Contrato: {getContractName(editingExpense.contract_id)}
                      </p>
                      {validateState === "annulled" && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Al anular este gasto, se revertirá automáticamente el saldo del contrato.
                        </p>
                      )}
                    </div>
                  )}
                  {editingExpense.state === "validated" && validateState === "annulled" && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-semibold text-red-800">
                        ⚠️ Este gasto está validado y tiene un registro contable asociado
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Al anular este gasto, se eliminará el registro contable asociado.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Alerta de factura duplicada */}
              {duplicateExpenseInfo && duplicateExpenseInfo.expenseId === editingExpense?.id && validateState === "validated" && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 mb-1">
                        ⚠️ Factura Duplicada Detectada
                      </p>
                      <p className="text-sm text-red-700 mb-2">
                        {duplicateExpenseInfo.message}
                      </p>
                      {isDirection && !forceValidate && (
                        <div className="mt-3">
                          <p className="text-xs text-red-600 mb-2">
                            Como Dirección, puedes validar este gasto de todas formas si estás seguro de que no es un error.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setForceValidate(true)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Validar de todas formas
                          </Button>
                        </div>
                      )}
                      {!isDirection && (
                        <p className="text-xs text-red-600">
                          Solo Dirección puede validar gastos con facturas duplicadas. Contacta a Dirección para más información.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(validateState === "observed" || validateState === "annulled") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones {validateState === "observed" ? "(opcional)" : ""}
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={validateObservations}
                  onChange={(e) => setValidateObservations(e.target.value)}
                  placeholder="Ingresa las observaciones..."
                />
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowValidateModal(false);
                  setEditingExpense(null);
                  setValidateObservations("");
                  setDuplicateExpenseInfo(null);
                  setForceValidate(false);
                }}
                disabled={validatingExpenseId === editingExpense?.id}
              >
                Cancelar
              </Button>
              <Button
                variant={validateState === "annulled" ? "danger" : "primary"}
                onClick={handleValidate}
                loading={validatingExpenseId === editingExpense?.id}
                disabled={
                  validatingExpenseId === editingExpense?.id ||
                  !!(duplicateExpenseInfo && duplicateExpenseInfo.expenseId === editingExpense?.id && validateState === "validated" && !isDirection && !(forceValidate ?? false))
                }
              >
                {validateState === "validated"
                  ? forceValidate && duplicateExpenseInfo ? "Validar de todas formas" : "Validar"
                  : validateState === "observed"
                  ? "Observar"
                  : "Anular"}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de rechazo */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setEditingExpense(null);
            setRejectReason("");
          }}
          title="Rechazar Gasto"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Ingresa el motivo del rechazo (obligatorio):
              </p>
              {editingExpense && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm font-medium">{editingExpense.description || "Sin descripción"}</p>
                  <p className="text-sm text-gray-600">
                    Monto: ${Number(editingExpense.amount || 0).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ingresa el motivo del rechazo..."
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setEditingExpense(null);
                  setRejectReason("");
                }}
                disabled={rejectingExpenseId === editingExpense?.id}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                loading={rejectingExpenseId === editingExpense?.id}
                disabled={rejectingExpenseId === editingExpense?.id || !rejectReason.trim()}
              >
                Rechazar
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <ExpensesContent />
    </ProtectedRoute>
  );
}
