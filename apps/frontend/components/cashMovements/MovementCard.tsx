"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CashMovement } from "@/lib/types/cashbox";

interface MovementCardProps {
  movement: CashMovement;
}

export function MovementCard({ movement }: MovementCardProps) {
  const router = useRouter();

  const getMovementType = () => {
    if (typeof movement.type === "string") {
      return movement.type;
    }
    return "expense";
  };

  const getTypeVariant = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower === "ingreso" || typeLower === "income") return "success";
    if (typeLower === "egreso" || typeLower === "expense") return "error";
    return "default";
  };

  const getTypeLabel = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower === "income") return "Ingreso";
    if (typeLower === "expense") return "Egreso";
    return type;
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount == null) return "$0.00";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getCashboxName = () => {
    return movement.cashboxId ? `Caja ${movement.cashboxId.slice(0, 8)}` : "Sin caja";
  };

  const type = getMovementType();
  const isIncome = type.toLowerCase() === "ingreso" || type.toLowerCase() === "income" || type.toLowerCase() === "refill";
  const amount = movement.amount || 0;

  return (
    <Card
      className={`border-l-4 hover:bg-white/15 transition-all ${
        isIncome ? "border-green-500/60" : "border-red-500/60"
      }`}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={getTypeVariant(type)}>{getTypeLabel(type)}</Badge>
            <span
              className={`text-xl font-bold ${
                isIncome ? "text-green-600" : "text-red-600"
              }`}
            >
              {isIncome ? "+" : "-"} {formatCurrency(Math.abs(amount))}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Concepto:</p>
              <p className="text-sm font-medium text-gray-900">
                {movement.description || "Sin concepto"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Fecha:</span>
              <span className="text-sm text-gray-900 font-medium">
                {formatDate(movement.date)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Caja:</span>
              <span className="text-sm text-gray-900 font-medium">{getCashboxName()}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/cash-movements/${movement.id}`)}
            >
              Ver movimiento
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

