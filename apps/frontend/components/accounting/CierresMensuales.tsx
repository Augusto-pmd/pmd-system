"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { accountingApi } from "@/hooks/api/accounting";
import { useSWRConfig } from "swr";
import { Lock, Unlock, AlertCircle } from "lucide-react";

interface CierreMensual {
  month: number;
  year: number;
  status?: string;
  estado?: string;
  total?: number;
}

interface CierresMensualesProps {
  cierres?: CierreMensual[];
}

export function CierresMensuales({ cierres = [] }: CierresMensualesProps) {
  const router = useRouter();
  const user = useAuthStore.getState().user;
  const toast = useToast();
  const { mutate: globalMutate } = useSWRConfig();
  const [isClosing, setIsClosing] = useState<string | null>(null);
  const [isReopening, setIsReopening] = useState<string | null>(null);
  const [showCloseModal, setShowCloseModal] = useState<{ month: number; year: number } | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);

  const canCloseMonth = user?.role?.name === "ADMINISTRATION" || user?.role?.name === "DIRECTION";
  const canReopenMonth = user?.role?.name === "DIRECTION";

  const getMonthName = (month: number) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[month - 1] || `Mes ${month}`;
  };

  const getStatusVariant = (status: string | undefined) => {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    if (statusLower === "cerrado" || statusLower === "closed" || statusLower === "completado") {
      return "success";
    }
    if (statusLower === "abierto" || statusLower === "open" || statusLower === "pendiente") {
      return "warning";
    }
    return "default";
  };

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return "Sin estado";
    const statusLower = status.toLowerCase();
    if (statusLower === "closed") return "Cerrado";
    if (statusLower === "open") return "Abierto";
    return status;
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return "No disponible";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Generar últimos 12 meses si no hay cierres
  const generateRecentMonths = (): CierreMensual[] => {
    const months: CierreMensual[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        status: "abierto",
      });
    }
    return months;
  };

  const mesesToShow = cierres.length > 0 ? cierres : generateRecentMonths();

  const handleCloseMonth = async (month: number, year: number) => {
    const key = `${year}-${month}`;
    setIsClosing(key);
    setCloseError(null);
    try {
      await accountingApi.closeMonth(month, year);
      toast.success(`Mes ${getMonthName(month)} ${year} cerrado correctamente`);
      setShowCloseModal(null);
      globalMutate("accounting");
      globalMutate(`accounting/month/${month}/${year}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al cerrar el mes";
      setCloseError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsClosing(null);
    }
  };

  const handleReopenMonth = async (month: number, year: number) => {
    const key = `${year}-${month}`;
    if (!confirm(`¿Estás seguro de que deseas reabrir el mes ${getMonthName(month)} ${year}?`)) {
      return;
    }
    setIsReopening(key);
    try {
      await accountingApi.reopenMonth(month, year);
      toast.success(`Mes ${getMonthName(month)} ${year} reabierto correctamente`);
      globalMutate("accounting");
      globalMutate(`accounting/month/${month}/${year}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al reabrir el mes";
      toast.error(errorMessage);
    } finally {
      setIsReopening(null);
    }
  };

  const isMonthClosed = (status?: string) => {
    if (!status) return false;
    const statusLower = status.toLowerCase();
    return statusLower === "cerrado" || statusLower === "closed";
  };

  if (mesesToShow.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-6">
        <p className="text-gray-600 text-center">No hay cierres mensuales disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-pmd p-6">
      <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Cierres Mensuales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mesesToShow.map((cierre, index) => (
          <div
            key={`${cierre.year}-${cierre.month}-${index}`}
            onClick={() => router.push(`/accounting/mes/${cierre.month}/${cierre.year}`)}
            className="cursor-pointer"
          >
            <Card className="border-l-4 border-pmd-gold hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-pmd-darkBlue">
                    {getMonthName(cierre.month)} {cierre.year}
                  </h3>
                  <Badge variant={getStatusVariant(cierre.status || cierre.estado)}>
                    {getStatusLabel(cierre.status || cierre.estado)}
                  </Badge>
                </div>
                {cierre.total !== undefined && (
                  <p className="text-sm text-gray-600 mb-2">Total: {formatCurrency(cierre.total)}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/accounting/mes/${cierre.month}/${cierre.year}`);
                    }}
                  >
                    Ver detalle
                  </Button>
                  {!isMonthClosed(cierre.status || cierre.estado) && canCloseMonth && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCloseModal({ month: cierre.month, year: cierre.year });
                      }}
                      disabled={isClosing === `${cierre.year}-${cierre.month}`}
                    >
                      <Lock className="h-3 w-3" />
                    </Button>
                  )}
                  {isMonthClosed(cierre.status || cierre.estado) && canReopenMonth && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReopenMonth(cierre.month, cierre.year);
                      }}
                      disabled={isReopening === `${cierre.year}-${cierre.month}`}
                    >
                      <Unlock className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showCloseModal !== null}
        onClose={() => {
          setShowCloseModal(null);
          setCloseError(null);
        }}
        title={`Cerrar mes ${showCloseModal ? getMonthName(showCloseModal.month) : ""} ${showCloseModal?.year}`}
      >
        <div className="space-y-4">
          {closeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">No se puede cerrar el mes</p>
                  <p className="text-sm text-red-700">{closeError}</p>
                </div>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-700">
            ¿Estás seguro de que deseas cerrar el mes {showCloseModal ? getMonthName(showCloseModal.month) : ""} {showCloseModal?.year}?
          </p>
          <p className="text-xs text-gray-500">
            Al cerrar el mes, se bloqueará la edición de todos los registros contables de ese período.
            Solo Dirección podrá reabrir el mes.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowCloseModal(null);
                setCloseError(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (showCloseModal) {
                  handleCloseMonth(showCloseModal.month, showCloseModal.year);
                }
              }}
              disabled={isClosing !== null}
            >
              {isClosing ? "Cerrando..." : "Cerrar Mes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

