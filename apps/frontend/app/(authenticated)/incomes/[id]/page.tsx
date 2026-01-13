"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useIncome } from "@/hooks/api/incomes";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Receipt, DollarSign, Calendar, FileText, CreditCard } from "lucide-react";
import { IncomeType, PaymentMethod } from "@/lib/types/income";

function IncomeDetailContent() {
  const params = useParams();
  const router = useRouter();
  const incomeId = typeof params?.id === "string" ? params.id : null;
  const { income, isLoading, error, mutate } = useIncome(incomeId);

  if (!incomeId) {
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Cargando ingreso..." />;
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al cargar el ingreso: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/incomes")}>Volver a Ingresos</Button>
        </div>
      </>
    );
  }

  if (!income) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          Ingreso no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/incomes")}>Volver a Ingresos</Button>
        </div>
      </>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: income.currency || "ARS",
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

  const getTypeLabel = (type: IncomeType | string) => {
    const typeMap: Record<string, string> = {
      [IncomeType.ADVANCE]: "Anticipo",
      [IncomeType.CERTIFICATION]: "Certificación",
      [IncomeType.FINAL_PAYMENT]: "Pago Final",
      [IncomeType.ADJUSTMENT]: "Ajuste",
      [IncomeType.REIMBURSEMENT]: "Reembolso",
      [IncomeType.OTHER]: "Otro",
    };
    return typeMap[type] || type;
  };

  const getPaymentMethodLabel = (method: PaymentMethod | string | undefined) => {
    if (!method) return "No especificado";
    const methodMap: Record<string, string> = {
      [PaymentMethod.TRANSFER]: "Transferencia",
      [PaymentMethod.CHECK]: "Cheque",
      [PaymentMethod.CASH]: "Efectivo",
      [PaymentMethod.PAYMENT_LINK]: "Link de pago",
    };
    return methodMap[method] || method;
  };

  // Función para renderizar un campo si existe
  const renderField = (label: string, value: any, formatter?: (val: any) => string, icon?: React.ReactNode) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div className="flex items-start gap-3">
        {icon || <div className="h-5 w-5 mt-0.5" />}
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-base font-medium text-gray-900">{formatter ? formatter(value) : String(value)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <BotonVolver backTo="/incomes" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle del ingreso</h1>
          <p className="text-gray-600">Información completa del ingreso seleccionado</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/incomes")}>
          Volver a Ingresos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Ingreso #{incomeId.slice(0, 8)}</CardTitle>
            <Badge variant={income.is_validated ? "success" : "warning"}>
              {income.is_validated ? "Validado" : "Pendiente"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField("Tipo de ingreso", income.type, getTypeLabel, <Receipt className="h-5 w-5 text-gray-400" />)}
            {renderField("Monto", income.amount, formatCurrency, <DollarSign className="h-5 w-5 text-gray-400" />)}
            {renderField("Fecha", income.date, formatDate, <Calendar className="h-5 w-5 text-gray-400" />)}
            {renderField("Moneda", income.currency)}
            {renderField("Método de pago", income.payment_method, getPaymentMethodLabel, <CreditCard className="h-5 w-5 text-gray-400" />)}
            {renderField("Número de documento", income.document_number)}
            {renderField("URL del archivo", income.file_url, undefined, <FileText className="h-5 w-5 text-gray-400" />)}
            {renderField("Observaciones", income.observations)}
            {renderField("Fecha de creación", income.created_at || income.createdAt, formatDate)}
            {renderField("Última actualización", income.updated_at || income.updatedAt, formatDate)}
          </div>

          {/* Información de validación */}
          {income.is_validated && (
            <div className="pt-4 border-t border-gray-200">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Receipt className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Ingreso Validado
                    </p>
                    <p className="text-sm text-green-700">
                      Este ingreso ha sido validado y está incluido en los cálculos de la obra.
                    </p>
                    {income.validated_at && (
                      <p className="text-xs text-green-600 mt-2">
                        Validado el: {formatDate(income.validated_at)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function IncomeDetailPage() {
  return (
    <ProtectedRoute>
      <IncomeDetailContent />
    </ProtectedRoute>
  );
}

