"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useExchangeRate } from "@/hooks/api/exchange-rates";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ExchangeRateForm } from "@/components/exchange-rates/ExchangeRateForm";
import { exchangeRatesApi } from "@/hooks/api/exchange-rates";
import { useAuthStore } from "@/store/authStore";
import { DollarSign, Calendar, User, Edit } from "lucide-react";

function ExchangeRateDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";
  
  const rateId = typeof params?.id === "string" ? params.id : null;
  const { exchangeRate, isLoading, error, mutate } = useExchangeRate(rateId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const user = useAuthStore.getState().user;
  const isAdministration = user?.role?.name === "ADMINISTRATION" || user?.role?.name === "administration";

  useEffect(() => {
    if (isEdit) {
      setIsEditModalOpen(true);
    }
  }, [isEdit]);

  if (!rateId) {
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Cargando tipo de cambio…" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar el tipo de cambio: {error}
      </div>
    );
  }

  if (!exchangeRate) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        Tipo de cambio no encontrado
      </div>
    );
  }

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await exchangeRatesApi.update(rateId, data);
      toast.success("Tipo de cambio actualizado correctamente");
      setIsEditModalOpen(false);
      await mutate();
      router.replace(`/exchange-rates/${rateId}`);
    } catch (err: any) {
      console.error("Error al actualizar tipo de cambio:", err);
      const errorMessage = err?.response?.data?.message || "Error al actualizar el tipo de cambio";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string | Date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(num);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <BotonVolver backTo="/exchange-rates" />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Detalle de Tipo de Cambio</h1>
              <p className="text-gray-600">Información completa del tipo de cambio</p>
            </div>
            {isAdministration && !isEditModalOpen && (
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(exchangeRate.date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tasa ARS a USD</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatNumber(exchangeRate.rate_ars_to_usd)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tasa USD a ARS</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatNumber(exchangeRate.rate_usd_to_ars)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Auditoría</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Creado por</p>
                    <p className="text-base font-medium text-gray-900">
                      {exchangeRate.created_by?.fullName || 
                       exchangeRate.created_by?.name || 
                       exchangeRate.created_by?.email || 
                       "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de creación</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDateTime(exchangeRate.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            router.replace(`/exchange-rates/${rateId}`);
          }}
          title="Editar Tipo de Cambio"
          size="md"
        >
          <ExchangeRateForm
            initialData={exchangeRate}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              router.replace(`/exchange-rates/${rateId}`);
            }}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </>
  );
}

export default function ExchangeRateDetailPage() {
  return (
    <ProtectedRoute>
      <ExchangeRateDetailContent />
    </ProtectedRoute>
  );
}

