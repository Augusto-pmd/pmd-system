"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionRoute } from "@/components/auth/PermissionRoute";
import { useContracts, contractApi } from "@/hooks/api/contracts";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ContractStatusBadge } from "@/components/contracts/ContractStatusBadge";
import { useSWRConfig } from "swr";
import { useToast } from "@/components/ui/Toast";
import { refreshPatterns } from "@/lib/refreshData";
import { getOperationErrorMessage } from "@/lib/errorMessages";
import { ContractStatus } from "@/lib/types/contract";
import { Modal } from "@/components/ui/Modal";
import { ContractForm } from "@/components/forms/ContractForm";
import { useCan } from "@/lib/acl";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

function ContractsContent() {
  const router = useRouter();
  const { contracts, isLoading, error, mutate } = useContracts();
  const { mutate: globalMutate } = useSWRConfig();
  const user = useAuthStore.getState().user;
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | ContractStatus | string>("all");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  
  // Verificar permisos
  const canCreate = useCan("contracts.create");
  const canDelete = useCan("contracts.delete");

  const filteredContracts = contracts?.filter((contract: any) => {
    if (filter === "all") return true;
    const contractStatus = contract.status?.toLowerCase() || "";
    return contractStatus === filter.toLowerCase();
  });

  const handleDeleteClick = (id: string) => {
    setContractToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;
    setDeleteLoading(contractToDelete);
    setShowDeleteModal(false);
    try {
      await contractApi.delete(contractToDelete);
      mutate();
      await refreshPatterns.afterContractUpdate(globalMutate);
      toast.success("Contrato eliminado correctamente. Dashboard actualizado.");
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage("delete", error);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
      setContractToDelete(null);
    }
  };

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await contractApi.create(data);
      await mutate();
      await refreshPatterns.afterContractUpdate(globalMutate);
      toast.success("Contrato creado correctamente");
      setIsCreateModalOpen(false);
    } catch (error: unknown) {
      const errorMessage = getOperationErrorMessage("create", error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading contracts..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error loading contracts: {error.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Contratos</h1>
            <p className="text-gray-600">Gestión de contratos y acuerdos</p>
          </div>
          {canCreate && (
            <Button onClick={() => setIsCreateModalOpen(true)}>+ Nuevo contrato</Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6 flex gap-2 flex-wrap">
            {([
              { value: "all", label: "Todos" },
              { value: ContractStatus.PENDING, label: "Pendiente" },
              { value: ContractStatus.APPROVED, label: "Aprobado" },
              { value: ContractStatus.ACTIVE, label: "Activo" },
              { value: ContractStatus.LOW_BALANCE, label: "Saldo Bajo" },
              { value: ContractStatus.NO_BALANCE, label: "Sin Saldo" },
              { value: ContractStatus.PAUSED, label: "Pausado" },
              { value: ContractStatus.FINISHED, label: "Finalizado" },
              { value: ContractStatus.CANCELLED, label: "Cancelado" },
            ]).map((f) => {
              const count = f.value === "all" 
                ? contracts?.length || 0
                : contracts?.filter((c: any) => (c.status?.toLowerCase() || "") === f.value.toLowerCase()).length || 0;
              
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-pmd font-medium transition-colors flex items-center gap-2 ${
                    filter === f.value
                      ? "bg-pmd-darkBlue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                  {count > 0 && (
                    <Badge variant={filter === f.value ? "default" : "info"} className="text-[11px] px-[6px] py-[2px]">
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Listado de contratos</h2>
            {filteredContracts?.length === 0 ? (
              <EmptyState
                title="No se encontraron contratos"
                description="Los contratos aparecerán aquí una vez creados"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Número de contrato</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Proveedor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha de inicio</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha de fin</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredContracts?.map((contract: any) => {
                      // Extraer datos del contrato con soporte para diferentes formatos
                      const contractNumber = contract.contractNumber || contract.contract_number || contract.number || contract.id;
                      const supplierName = contract.supplier?.name || contract.supplier?.nombre || contract.supplierName || contract.supplier_id || "-";
                      const startDate = contract.start_date || contract.startDate;
                      const endDate = contract.end_date || contract.endDate;
                      const amountTotal = Number(contract.amount_total || contract.value || 0);
                      
                      return (
                        <tr key={contract.id}>
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                            {contractNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {supplierName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {startDate ? new Date(startDate).toLocaleDateString("es-AR") : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {endDate ? new Date(endDate).toLocaleDateString("es-AR") : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ${amountTotal.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <ContractStatusBadge 
                              status={contract.status} 
                              isBlocked={contract.is_blocked}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/contracts/${contract.id}`)}
                              >
                                Ver contrato
                              </Button>
                              {canDelete && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteClick(contract.id)}
                                  disabled={deleteLoading === contract.id}
                                >
                                  {deleteLoading === contract.id ? "Eliminando..." : "Eliminar contrato"}
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

        {/* Modal para crear nuevo contrato */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nuevo contrato"
          size="lg"
        >
          <ContractForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>

        {/* Modal de confirmación para eliminar contrato */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setContractToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Eliminar contrato"
          description="¿Estás seguro de que deseas eliminar este contrato? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
          isLoading={deleteLoading !== null}
        />
      </div>
  );
}

export default function ContractsPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute permission="contracts.read">
        <ContractsContent />
      </PermissionRoute>
    </ProtectedRoute>
  );
}
