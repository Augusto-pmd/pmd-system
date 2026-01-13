"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useExchangeRates } from "@/hooks/api/exchange-rates";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { ExchangeRateForm } from "@/components/exchange-rates/ExchangeRateForm";
import { ExchangeRateChart } from "@/components/exchange-rates/ExchangeRateChart";
import { exchangeRatesApi } from "@/hooks/api/exchange-rates";
import { useAuthStore } from "@/store/authStore";
import { Plus, Edit, Trash2, Eye, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";

function ExchangeRatesContent() {
  const { exchangeRates, isLoading, error, mutate } = useExchangeRates();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const user = useAuthStore.getState().user;
  const isAdministration = user?.role?.name === "ADMINISTRATION" || user?.role?.name === "administration";

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <LoadingState message="Cargando tipos de cambio…" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar los tipos de cambio: {error}
      </div>
    );
  }

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await exchangeRatesApi.create(data);
      toast.success("Tipo de cambio creado correctamente");
      setIsCreateModalOpen(false);
      await mutate();
    } catch (err: any) {
      console.error("Error al crear tipo de cambio:", err);
      const errorMessage = err?.response?.data?.message || "Error al crear el tipo de cambio";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este tipo de cambio?")) {
      return;
    }

    try {
      await exchangeRatesApi.delete(id);
      toast.success("Tipo de cambio eliminado correctamente");
      await mutate();
    } catch (err: any) {
      console.error("Error al eliminar tipo de cambio:", err);
      const errorMessage = err?.response?.data?.message || "Error al eliminar el tipo de cambio";
      toast.error(errorMessage);
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
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Tipos de Cambio</h1>
              <p className="text-gray-600">Gestión de tipos de cambio ARS/USD</p>
            </div>
            {isAdministration && (
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Tipo de Cambio
              </Button>
            )}
          </div>
        </div>

        {/* Gráfico de evolución */}
        {exchangeRates && exchangeRates.length >= 2 && (
          <ExchangeRateChart height={350} />
        )}

        {exchangeRates && exchangeRates.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>ARS → USD</TableHead>
                    <TableHead>USD → ARS</TableHead>
                    <TableHead>Creado por</TableHead>
                    <TableHead>Fecha de creación</TableHead>
                    {isAdministration && <TableHead align="right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exchangeRates.map((rate: any) => (
                    <TableRow key={rate.id}>
                      <TableCell>
                        <div className="font-medium">{formatDate(rate.date)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{formatNumber(rate.rate_ars_to_usd)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>{formatNumber(rate.rate_usd_to_ars)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rate.created_by?.fullName || rate.created_by?.name || rate.created_by?.email || "-"}
                      </TableCell>
                      <TableCell>
                        {formatDate(rate.created_at)}
                      </TableCell>
                      {isAdministration && (
                        <TableCell align="right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="icon"
                              size="sm"
                              onClick={() => router.push(`/exchange-rates/${rate.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="icon"
                              size="sm"
                              onClick={() => router.push(`/exchange-rates/${rate.id}?edit=true`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="icon"
                              size="sm"
                              onClick={() => handleDelete(rate.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No hay tipos de cambio registrados</p>
              {isAdministration && (
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Tipo de Cambio
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nuevo Tipo de Cambio"
          size="md"
        >
          <ExchangeRateForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </>
  );
}

export default function ExchangeRatesPage() {
  return (
    <ProtectedRoute>
      <ExchangeRatesContent />
    </ProtectedRoute>
  );
}

