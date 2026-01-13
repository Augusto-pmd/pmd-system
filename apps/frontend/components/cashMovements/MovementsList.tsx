"use client";

import { MovementCard } from "./MovementCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CashMovement } from "@/lib/types/cashbox";

interface MovementsListProps {
  movements: CashMovement[];
}

export function MovementsList({ movements }: MovementsListProps) {
  if (movements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12">
        <EmptyState
          icon="💰"
          title="No hay movimientos registrados"
          description="Aún no se han registrado movimientos de caja en el sistema."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {movements.map((movement) => (
        <MovementCard key={movement.id} movement={movement} />
      ))}
    </div>
  );
}

