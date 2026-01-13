"use client";

import { CashboxCard } from "./CashboxCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Cashbox } from "@/lib/types/cashbox";

interface CashboxesListProps {
  cashboxes: Cashbox[];
}

export function CashboxesList({ cashboxes }: CashboxesListProps) {
  if (cashboxes.length === 0) {
    return (
      <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-12 text-center">
        <p className="text-gray-600 text-lg">No hay cajas registradas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cashboxes.map((cashbox) => (
        <CashboxCard key={cashbox.id} cashbox={cashbox} />
      ))}
    </div>
  );
}

