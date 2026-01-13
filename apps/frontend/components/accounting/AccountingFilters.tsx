"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";
import { Filter, X } from "lucide-react";
import { normalizeId } from "@/lib/normalizeId";

interface AccountingFiltersProps {
  filters: {
    workId?: string;
    supplierId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
}

export function AccountingFilters({
  filters,
  onFiltersChange,
  onReset,
}: AccountingFiltersProps) {
  const { works } = useWorks();
  const { suppliers } = useSuppliers();
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters = 
    filters.workId || 
    filters.supplierId || 
    filters.type || 
    filters.startDate || 
    filters.endDate || 
    filters.category;

  return (
    <div className="bg-white rounded-lg shadow-pmd p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-pmd-darkBlue hover:text-pmd-gold transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filtros {hasActiveFilters && `(${Object.values(filters).filter(Boolean).length})`}
        </button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onReset();
              setIsExpanded(false);
            }}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Obra</label>
            <select
              value={filters.workId || ""}
              onChange={(e) => onFiltersChange({ ...filters, workId: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
            >
              <option value="">Todas las obras</option>
              {works?.map((work: any) => {
                const nombre = work.nombre || work.name || work.title || "Sin nombre";
                return (
                  <option key={work.id} value={normalizeId(work.id)}>
                    {nombre}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
            <select
              value={filters.supplierId || ""}
              onChange={(e) => onFiltersChange({ ...filters, supplierId: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
            >
              <option value="">Todos los proveedores</option>
              {suppliers?.map((sup: any) => {
                const nombre = sup.nombre || sup.name || "Sin nombre";
                return (
                  <option key={sup.id} value={normalizeId(sup.id)}>
                    {nombre}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filters.type || ""}
              onChange={(e) => onFiltersChange({ ...filters, type: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
            >
              <option value="">Todos los tipos</option>
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha desde</label>
            <Input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha hasta</label>
            <Input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value || undefined })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={filters.category || ""}
              onChange={(e) => onFiltersChange({ ...filters, category: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
            >
              <option value="">Todas las categorías</option>
              <option value="materiales">Materiales</option>
              <option value="mano-de-obra">Mano de obra</option>
              <option value="honorarios">Honorarios</option>
              <option value="impuestos">Impuestos</option>
              <option value="servicios">Servicios</option>
              <option value="alquileres">Alquileres</option>
              <option value="combustible">Combustible</option>
              <option value="otros">Otros</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

