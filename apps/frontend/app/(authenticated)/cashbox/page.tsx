"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashboxStore } from "@/store/cashboxStore";
import { useWorks } from "@/hooks/api/works";
import { useAuthStore } from "@/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { CashboxForm } from "./components/CashboxForm";
import { useToast } from "@/components/ui/Toast";
import { useCan } from "@/lib/acl";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { CashboxStatus } from "@/lib/types/cashbox";

// Helper function to extract error message from axios error
function getErrorMessage(error: any, defaultMessage: string): string {
  if (error?.response?.data?.message) {
    const msg = error.response.data.message;
    // If message is an object with nested message, extract it
    if (typeof msg === 'object' && msg !== null && 'message' in msg) {
      return msg.message as string;
    } else if (typeof msg === 'string') {
      return msg;
    }
  }
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }
  return defaultMessage;
}

function CashboxContent() {
  const router = useRouter();
  const { cashboxes, isLoading, error, fetchCashboxes, closeCashbox, openCashbox } = useCashboxStore();
  const { works } = useWorks();
  const user = useAuthStore.getState().user;
  const [showForm, setShowForm] = useState(false);
  const [editingCashbox, setEditingCashbox] = useState<any>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [cashboxToClose, setCashboxToClose] = useState<string | null>(null);
  const [cashboxToCloseData, setCashboxToCloseData] = useState<any>(null);
  const [closingBalanceArs, setClosingBalanceArs] = useState("");
  const [closingBalanceUsd, setClosingBalanceUsd] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const toast = useToast();
  const organizationId = (user as any)?.organizationId || (user as any)?.organization?.id;
  
  // ✅ CRÍTICO: Todos los hooks deben llamarse ANTES de cualquier return condicional
  // Mover useCan antes de los early returns para cumplir con las reglas de hooks de React
  const canCreateCashbox = useCan("cashboxes.create");
  const canCloseCashbox = useCan("cashboxes.close");
  const canUpdateCashbox = useCan("cashboxes.update");
  const canManageCashboxes = useCan("cashboxes.manage");
  
  // Para cerrar cajas, se necesita cashboxes.close
  // Para abrir cajas cerradas, se necesita cashboxes.update o cashboxes.manage
  const canOpenCashbox = canUpdateCashbox || canManageCashboxes;

  useEffect(() => {
    if (organizationId) {
      fetchCashboxes();
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

  if (isLoading && cashboxes.length === 0) {
    return <LoadingState message="Cargando cajas..." />;
  }

  const handleCloseCashboxClick = (id: string) => {
    const cashbox = cashboxes.find((c) => c.id === id);
    setCashboxToClose(id);
    setCashboxToCloseData(cashbox);
    setClosingBalanceArs("");
    setClosingBalanceUsd("");
    setShowCloseModal(true);
  };

  const handleOpenCashboxClick = async (id: string) => {
    setIsOpening(true);
    try {
      await openCashbox(id);
      toast.success("Caja abierta correctamente");
      fetchCashboxes();
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Error al abrir la caja"));
    } finally {
      setIsOpening(false);
    }
  };

  const handleConfirmClose = async () => {
    if (!cashboxToClose) return;
    
    // Validar que se haya ingresado el saldo de cierre ARS
    if (!closingBalanceArs || parseFloat(closingBalanceArs) < 0) {
      toast.error("El saldo de cierre ARS es obligatorio y debe ser mayor o igual a 0");
      return;
    }
    
    setIsClosing(true);
    try {
      await closeCashbox(cashboxToClose, {
        closing_balance_ars: parseFloat(closingBalanceArs),
        closing_balance_usd: closingBalanceUsd ? parseFloat(closingBalanceUsd) : undefined,
      });
      toast.success("Caja cerrada correctamente");
      setShowCloseModal(false);
      setCashboxToClose(null);
      setCashboxToCloseData(null);
      setClosingBalanceArs("");
      setClosingBalanceUsd("");
      fetchCashboxes();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al cerrar la caja";
      toast.error(errorMessage);
    } finally {
      setIsClosing(false);
    }
  };

  const getWorkName = (workId?: string) => {
    if (!workId) return "Sin obra asignada";
    const work = works?.find((w: any) => w.id === workId);
    return work?.title || work?.name || work?.nombre || `Obra ${workId.slice(0, 8)}`;
  };

  const calculateTotalMovements = (cashbox: any) => {
    // Calcular el total sumando los movimientos de la caja
    if (cashbox.movements && Array.isArray(cashbox.movements) && cashbox.movements.length > 0) {
      return cashbox.movements.reduce((total: number, movement: any) => {
        const amount = Number(movement.amount || 0);
        // Los ingresos suman, los egresos restan
        const isIncome = movement.type === "income" || movement.type === "ingreso" || movement.type === "refill";
        return isIncome ? total + amount : total - amount;
      }, Number(cashbox.opening_balance_ars || 0));
    }
    // Si no hay movimientos, retornar el saldo inicial
    return Number(cashbox.opening_balance_ars || 0);
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

  // Obtener el rol del usuario para mostrar mensajes específicos
  const getUserRole = (): string | null => {
    if (!user) return null;
    if (user.role?.name) return user.role.name.toUpperCase();
    return null;
  };

  const isOperator = getUserRole() === "OPERATOR";
  const isDirection = getUserRole() === "DIRECTION";
  const isAdministration = getUserRole() === "ADMINISTRATION";
  const isSupervisor = getUserRole() === "SUPERVISOR";

  // Determinar el mensaje apropiado cuando no hay cajas
  const getEmptyStateMessage = () => {
    if (isOperator && !canCreateCashbox) {
      return {
        title: "No tienes cajas asignadas",
        description: "Como operador, solo puedes ver las cajas que te han sido asignadas. Si necesitas una caja, contacta con un supervisor o administrador.",
        showAction: false,
      };
    }
    return {
      title: "No hay cajas registradas",
      description: "Crea tu primera caja para comenzar a gestionar el flujo de efectivo",
      showAction: true,
    };
  };

  const emptyStateMessage = getEmptyStateMessage();

  return (
    <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Cajas</h1>
              <p className="text-gray-600">Gestión de flujo de efectivo y cajas del sistema PMD</p>
            </div>
            {/* Mostrar botón de crear caja si el usuario tiene el permiso cashboxes.create */}
            {canCreateCashbox && (
              <Button
                variant="primary"
                onClick={() => {
                  setEditingCashbox(null);
                  setShowForm(true);
                }}
              >
                Abrir nueva caja
              </Button>
            )}
          </div>
        </div>

        {showForm && (
          <CashboxForm
            onSuccess={() => {
              setShowForm(false);
              setEditingCashbox(null);
              fetchCashboxes();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingCashbox(null);
            }}
          />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!showForm && (
          <>
            {cashboxes.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <EmptyState
                    title={emptyStateMessage.title}
                    description={emptyStateMessage.description}
                    action={
                      canCreateCashbox ? (
                        <Button variant="primary" onClick={() => setShowForm(true)}>
                          Crear primera caja
                        </Button>
                      ) : undefined
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Nombre de caja
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Fecha de apertura
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Fecha de cierre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Saldo Actual
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cashboxes.map((cashbox) => {
                        // Verificar si la caja está cerrada usando el campo status del backend
                        // El backend usa CashboxStatus.OPEN o CashboxStatus.CLOSED
                        const cashboxStatus = cashbox.status?.toLowerCase();
                        const isClosed = 
                          cashboxStatus === "closed" || 
                          cashboxStatus === CashboxStatus.CLOSED ||
                          cashbox.isClosed || 
                          cashbox.closedAt ||
                          (cashbox as any).closing_date;
                        return (
                          <tr key={cashbox.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {`Caja ${cashbox.id.slice(0, 8)}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(cashbox.opening_date || cashbox.createdAt || cashbox.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={isClosed ? "default" : "success"}
                                className={isClosed ? "bg-[rgba(255,149,0,0.12)] text-[rgba(255,149,0,1)]" : ""}
                              >
                                {isClosed ? "Cerrada" : "Abierta"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {(cashbox as any).closing_date || cashbox.closedAt || (cashbox as any).closed_at 
                                  ? formatDate((cashbox as any).closing_date || cashbox.closedAt || (cashbox as any).closed_at) 
                                  : "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">
                                ${calculateTotalMovements(cashbox).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/cashbox/${cashbox.id}`)}
                                >
                                  Ver
                                </Button>
                                {!isClosed && canCloseCashbox && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCloseCashboxClick(cashbox.id)}
                                  >
                                    Cerrar
                                  </Button>
                                )}
                                {isClosed && canOpenCashbox && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenCashboxClick(cashbox.id)}
                                    disabled={isOpening}
                                  >
                                    {isOpening ? "Abriendo..." : "Abrir"}
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
              </div>
            )}
          </>
        )}

        {showCloseModal && cashboxToCloseData && (
          <Modal
            isOpen={showCloseModal}
            onClose={() => {
              setShowCloseModal(false);
              setCashboxToClose(null);
              setCashboxToCloseData(null);
              setClosingBalanceArs("");
              setClosingBalanceUsd("");
            }}
            title="Cerrar Caja"
            subtitle="Ingrese el saldo real contado físicamente en la caja"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <div style={{ font: "var(--font-caption)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-sm)" }}>
                Una vez cerrada, no se podrán agregar más movimientos a esta caja.
              </div>
              
              <FormField 
                label="Saldo de Cierre Real (ARS) *" 
                required
                error={!closingBalanceArs || parseFloat(closingBalanceArs) < 0 ? "Debe ingresar el saldo real de cierre (mayor o igual a 0)" : undefined}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={closingBalanceArs}
                  onChange={(e) => setClosingBalanceArs(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <div style={{ font: "var(--font-caption)", color: "var(--apple-text-secondary)", marginTop: "var(--space-xs)" }}>
                  Saldo actual calculado: ${calculateTotalMovements(cashboxToCloseData).toFixed(2)}
                </div>
              </FormField>
              
              {(cashboxToCloseData.opening_balance_usd && Number(cashboxToCloseData.opening_balance_usd) > 0) && (
                <FormField 
                  label="Saldo de Cierre Real (USD)" 
                  required={false}
                >
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={closingBalanceUsd}
                    onChange={(e) => setClosingBalanceUsd(e.target.value)}
                    placeholder="0.00"
                  />
                </FormField>
              )}

              <div style={{ display: "flex", gap: "var(--space-sm)", paddingTop: "var(--space-md)" }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCloseModal(false);
                    setCashboxToClose(null);
                    setCashboxToCloseData(null);
                    setClosingBalanceArs("");
                    setClosingBalanceUsd("");
                  }}
                  disabled={isClosing}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirmClose}
                  loading={isClosing}
                  disabled={!closingBalanceArs || parseFloat(closingBalanceArs) < 0}
                >
                  {isClosing ? "Cerrando..." : "Cerrar Caja"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
  );
}

export default function CashboxPage() {
  return (
    <ProtectedRoute>
      <CashboxContent />
    </ProtectedRoute>
  );
}
