"use client";

import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCashbox } from "@/hooks/api/cashboxes";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";

function CashboxDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  
  // Safely extract cashboxId from params
  const cashboxId = typeof params?.id === "string" ? params.id : null;
  
  const { cashbox, isLoading, error } = useCashbox(cashboxId || "");

  // Guard check after all hooks
  if (!cashboxId) {
    return null;
  }

  if (isLoading) {
    return (
      <LoadingState message="Cargando caja…" />
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar la caja: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/cashboxes")}>Volver a Cajas</Button>
        </div>
      </>
    );
  }

  if (!cashbox) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Caja no encontrada
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/cashboxes")}>Volver a Cajas</Button>
        </div>
      </>
    );
  }

  const getCashboxName = () => {
    return (cashbox as any).nombre || (cashbox as any).name || `Caja ${cashbox.id.slice(0, 8)}`;
  };

  const getCashboxStatus = () => {
    return (cashbox as any).estado || (cashbox as any).status || (cashbox as any).state || "abierta";
  };

  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "abierta" || statusLower === "open" || statusLower === "opened") {
      return "success";
    }
    if (statusLower === "cerrada" || statusLower === "closed") {
      return "default";
    }
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "open" || statusLower === "opened") return "Abierta";
    if (statusLower === "closed") return "Cerrada";
    return status;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === null || amount === undefined) return "No especificado";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Función para renderizar un campo si existe
  const renderField = (label: string, value: any, formatter?: (val: any) => string) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
        <p className="text-gray-900">{formatter ? formatter(value) : String(value)}</p>
      </div>
    );
  };

  const status = getCashboxStatus();

  return (
    <div className="space-y-6">
        <div>
          <BotonVolver />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle de la caja</h1>
            <p className="text-gray-600">Información completa de la caja seleccionada</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/cashboxes")}>
            Volver a Cajas
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{getCashboxName()}</CardTitle>
              <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("ID de la caja", cashbox.id)}
              {renderField("Estado", getStatusLabel(status))}
              {renderField(
                "Fecha de apertura",
                (cashbox as any).fechaApertura || (cashbox as any).openingDate || (cashbox as any).openDate,
                formatDate
              )}
              {renderField(
                "Fecha de cierre",
                (cashbox as any).fechaCierre || (cashbox as any).closingDate || (cashbox as any).closeDate,
                formatDate
              )}
              {renderField("Saldo", cashbox.balance || (cashbox as any).saldo, formatCurrency)}
              {renderField("Monto inicial", (cashbox as any).initialAmount || (cashbox as any).montoInicial, formatCurrency)}
              {renderField("Monto final", (cashbox as any).finalAmount || (cashbox as any).montoFinal, formatCurrency)}
              {renderField("Diferencia", (cashbox as any).difference || (cashbox as any).diferencia, formatCurrency)}
            </div>

            {/* Mostrar campos adicionales si existen */}
            {Object.keys(cashbox).some(
              (key) =>
                ![
                  "id",
                  "nombre",
                  "name",
                  "estado",
                  "status",
                  "state",
                  "fechaApertura",
                  "openingDate",
                  "openDate",
                  "fechaCierre",
                  "closingDate",
                  "closeDate",
                  "balance",
                  "saldo",
                  "initialAmount",
                  "montoInicial",
                  "finalAmount",
                  "montoFinal",
                  "difference",
                  "diferencia",
                  "createdAt",
                  "updatedAt",
                ].includes(key) &&
                (cashbox as any)[key] !== null &&
                (cashbox as any)[key] !== undefined &&
                (cashbox as any)[key] !== ""
            ) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Información adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(cashbox)
                    .filter(
                      (key) =>
                        ![
                          "id",
                          "nombre",
                          "name",
                          "estado",
                          "status",
                          "state",
                          "fechaApertura",
                          "openingDate",
                          "openDate",
                          "fechaCierre",
                          "closingDate",
                          "closeDate",
                          "balance",
                          "saldo",
                          "initialAmount",
                          "montoInicial",
                          "finalAmount",
                          "montoFinal",
                          "difference",
                          "diferencia",
                          "createdAt",
                          "updatedAt",
                        ].includes(key) &&
                        (cashbox as any)[key] !== null &&
                        (cashbox as any)[key] !== undefined &&
                        (cashbox as any)[key] !== ""
                    )
                    .map((key) => (
                      <div key={key}>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h3>
                        <p className="text-gray-900">
                          {typeof (cashbox as any)[key] === "object"
                            ? JSON.stringify((cashbox as any)[key])
                            : String((cashbox as any)[key])}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {cashbox.createdAt && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Fecha de creación</h3>
                <p className="text-gray-900">{formatDate(cashbox.createdAt)}</p>
              </div>
            )}

            {((cashbox as any).updatedAt || cashbox.updated_at) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Última actualización</h3>
                <p className="text-gray-900">{formatDate((cashbox as any).updatedAt || cashbox.updated_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}

export default function CashboxDetailPage() {
  return (
    <ProtectedRoute>
      <CashboxDetailContent />
    </ProtectedRoute>
  );
}

