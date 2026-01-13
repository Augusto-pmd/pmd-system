"use client";

import { useCurrentExchangeRate } from "@/hooks/api/exchange-rates";
import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export function CurrentRate() {
  const { currentRate, isLoading } = useCurrentExchangeRate();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentRate) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">No hay tipo de cambio disponible</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (date: string | Date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Tipo de Cambio Actual</p>
            <p className="text-sm font-medium text-gray-900">
              1 USD = {formatNumber(currentRate.rate_usd_to_ars)} ARS
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(currentRate.date)}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
}

