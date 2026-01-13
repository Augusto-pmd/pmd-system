"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionRoute } from "@/components/auth/PermissionRoute";
import { useAccounting } from "@/hooks/api/accounting";
import { useAccountingStore } from "@/store/accountingStore";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useAuthStore } from "@/store/authStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { ResumenFinanciero } from "@/components/accounting/ResumenFinanciero";
import { CierresMensuales } from "@/components/accounting/CierresMensuales";
import { AccountingTable } from "@/components/accounting/AccountingTable";
import { AccountingFilters } from "@/components/accounting/AccountingFilters";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EntryForm } from "@/app/(authenticated)/accounting/components/EntryForm";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Plus, Info, FileText } from "lucide-react";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { useCan } from "@/lib/acl";

function AccountingContent() {
  const router = useRouter();
  const user = useAuthStore.getState().user;
  const { accounting, isLoading: summaryLoading, error: summaryError, mutate: mutateAccounting } = useAccounting();
  const { entries, isLoading, error, fetchEntries, createEntry } = useAccountingStore();
  const { works, isLoading: worksLoading } = useWorks();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { mutate: globalMutate } = useSWRConfig();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<{
    workId?: string;
    supplierId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  }>({});
  const toast = useToast();
  const canCreate = useCan("accounting.create");
  
  // Escuchar cambios en gastos validados para refrescar registros contables
  useEffect(() => {
    const handleStorageChange = () => {
      // Refrescar cuando se valida un gasto (se actualiza localStorage o SWR cache)
      fetchEntries(filters);
      mutateAccounting();
    };
    
    // Escuchar eventos de validación de gastos
    window.addEventListener('expense-validated', handleStorageChange);
    
    return () => {
      window.removeEventListener('expense-validated', handleStorageChange);
    };
  }, [filters, fetchEntries, mutateAccounting]);

  const organizationId = user?.organizationId;

  useEffect(() => {
    // organizationId should always be present now (with DEFAULT_ORG_ID fallback)
    fetchEntries(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // If organizationId is still missing (shouldn't happen), show friendly error
  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createEntry(data);
      toast.success("Movimiento creado correctamente");
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al crear movimiento:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  if (isLoading || summaryLoading || worksLoading || suppliersLoading) {
    return <LoadingState message="Cargando datos de contabilidad…" />;
  }

  if (error || summaryError) {
    const errorMessage = 
      (typeof error === 'string' ? error : (error as any)?.message) ||
      (typeof summaryError === 'string' ? summaryError : (summaryError as any)?.message) ||
      "Error desconocido";
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar los datos de contabilidad: {errorMessage}
      </div>
    );
  }

  // Calcular totales desde los entries del store
  // El backend usa accounting_type: 'fiscal' para ingresos y 'cash' para egresos
  // También puede venir como type: 'ingreso'/'egreso' o 'income'/'expense'
  const calcularIngresos = () => {
    if (!entries || entries.length === 0) return 0;
    return entries
      .filter((e: any) => {
        const type = e.accounting_type || e.type || e.tipo || "";
        const typeLower = type.toLowerCase();
        return typeLower === "fiscal" || typeLower === "ingreso" || typeLower === "income";
      })
      .reduce((sum: number, e: any) => {
        // Convertir amount a número de forma segura
        const rawAmount = e.amount ?? e.monto ?? 0;
        const amount = typeof rawAmount === "string" ? parseFloat(rawAmount) : Number(rawAmount);
        
        // Validar que amount sea un número válido
        if (isNaN(amount) || !isFinite(amount)) {
          return sum;
        }
        
        // Si la moneda es USD, convertir a ARS (asumiendo tasa 1:1 por ahora)
        const currency = e.currency || e.moneda || "ARS";
        return sum + (currency === "USD" ? amount * 1 : amount); // TODO: usar tasa de cambio real
      }, 0);
  };

  const calcularEgresos = () => {
    if (!entries || entries.length === 0) return 0;
    return entries
      .filter((e: any) => {
        const type = e.accounting_type || e.type || e.tipo || "";
        const typeLower = type.toLowerCase();
        return typeLower === "cash" || typeLower === "egreso" || typeLower === "expense";
      })
      .reduce((sum: number, e: any) => {
        // Convertir amount a número de forma segura
        const rawAmount = e.amount ?? e.monto ?? 0;
        const amount = typeof rawAmount === "string" ? parseFloat(rawAmount) : Number(rawAmount);
        
        // Validar que amount sea un número válido
        if (isNaN(amount) || !isFinite(amount)) {
          return sum;
        }
        
        const currency = e.currency || e.moneda || "ARS";
        return sum + (currency === "USD" ? amount * 1 : amount); // TODO: usar tasa de cambio real
      }, 0);
  };

  const ingresos = calcularIngresos();
  const egresos = calcularEgresos();
  const saldo = ingresos - egresos;

  // Extraer cierres del objeto accounting si existe
  const accountingData = accounting && typeof accounting === "object" && !Array.isArray(accounting)
    ? accounting
    : {};
  const cierres = accountingData.cierres || accountingData.monthlyClosures || [];

  return (
    <>
      <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Contabilidad</h1>
              <p className="text-gray-600">Resumen financiero y movimientos contables del sistema PMD</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/accounting/reports")}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Reportes
              </Button>
              {canCreate && (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Movimiento
                </Button>
              )}
            </div>
          </div>
        </div>

        <ResumenFinanciero
          ingresos={ingresos}
          egresos={egresos}
          saldo={saldo}
        />

        <CierresMensuales cierres={Array.isArray(cierres) ? cierres : []} />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Movimientos Contables</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-700">
                Los registros se crean automáticamente al validar gastos
              </p>
            </div>
          </div>
          <AccountingFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
          />
          <AccountingTable entries={entries} onRefresh={() => fetchEntries(filters)} />
        </div>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Movimiento Contable"
        size="lg"
      >
        <EntryForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </>
  );
}

export default function AccountingPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute permission="accounting.read">
        <AccountingContent />
      </PermissionRoute>
    </ProtectedRoute>
  );
}
