"use client";

import { Card, CardContent } from "@/components/ui/Card";

interface ResumenFinancieroProps {
  ingresos?: number;
  egresos?: number;
  saldo?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  netWorth?: number;
}

export function ResumenFinanciero({
  ingresos,
  egresos,
  saldo,
  totalAssets,
  totalLiabilities,
  netWorth,
}: ResumenFinancieroProps) {
  // Calcular valores
  const totalIngresos = ingresos || totalAssets || 0;
  const totalEgresos = egresos || totalLiabilities || 0;
  const saldoCalculado = saldo !== undefined ? saldo : netWorth !== undefined ? netWorth : totalIngresos - totalEgresos;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-l-4 border-green-500">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Ingresos</h3>
          <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(totalIngresos)}</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-red-500">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total de Egresos</h3>
          <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(totalEgresos)}</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-pmd-gold">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Saldo</h3>
          <p
            className={`text-2xl font-bold ${
              saldoCalculado >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(saldoCalculado)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

