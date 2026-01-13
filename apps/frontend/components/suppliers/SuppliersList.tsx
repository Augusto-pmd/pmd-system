"use client";

import { SupplierCard } from "./SupplierCard";
import { Supplier } from "@/lib/types/supplier";

interface SuppliersListProps {
  suppliers: Supplier[];
  onRefresh?: () => void;
}

export function SuppliersList({ suppliers, onRefresh }: SuppliersListProps) {
  if (suppliers.length === 0) {
    return (
      <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-12 text-center">
        <p className="text-gray-600 text-lg">No hay proveedores registrados</p>
        <p className="text-gray-500 text-sm mt-2">
          Haz clic en &quot;Nuevo Proveedor&quot; para agregar uno
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers.map((supplier) => (
        <SupplierCard key={supplier.id} supplier={supplier} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

