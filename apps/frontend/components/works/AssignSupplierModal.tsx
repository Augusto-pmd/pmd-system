"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useRubrics } from "@/hooks/api/rubrics";
import { Supplier } from "@/lib/types/supplier";

interface AssignSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (supplierId: string, rubricId: string, amountTotal: number, currency: string) => Promise<void>;
  workId: string;
  isLoading?: boolean;
}

export function AssignSupplierModal({
  isOpen,
  onClose,
  onAssign,
  workId,
  isLoading = false,
}: AssignSupplierModalProps) {
  const { suppliers } = useSuppliers();
  const { rubrics } = useRubrics();
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedRubricId, setSelectedRubricId] = useState("");
  const [amountTotal, setAmountTotal] = useState("");
  const [currency, setCurrency] = useState("ARS");

  // Filtrar solo proveedores aprobados
  const approvedSuppliers = (suppliers || []).filter(
    (supplier: Supplier) => supplier.status === "approved" || supplier.status === "aprobado"
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedSupplierId("");
      setSelectedRubricId("");
      setAmountTotal("");
      setCurrency("ARS");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !selectedRubricId || !amountTotal) return;

    const amount = parseFloat(amountTotal);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    await onAssign(selectedSupplierId, selectedRubricId, amount, currency);
    setSelectedSupplierId("");
    setSelectedRubricId("");
    setAmountTotal("");
    setCurrency("ARS");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Proveedor">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Proveedor"
          value={selectedSupplierId}
          onChange={(e) => setSelectedSupplierId(e.target.value)}
          required
          disabled={isLoading}
        >
          <option value="">Seleccionar proveedor</option>
          {approvedSuppliers.map((supplier: Supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name || supplier.nombre || supplier.email}
            </option>
          ))}
        </Select>

        <Select
          label="Rúbrica"
          value={selectedRubricId}
          onChange={(e) => setSelectedRubricId(e.target.value)}
          required
          disabled={isLoading}
        >
          <option value="">Seleccionar rúbrica</option>
          {rubrics?.map((rubric: any) => (
            <option key={rubric.id} value={rubric.id}>
              {rubric.name || rubric.nombre} {rubric.code && `(${rubric.code})`}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Monto Total"
            type="number"
            step="0.01"
            min="0"
            value={amountTotal}
            onChange={(e) => setAmountTotal(e.target.value)}
            required
            disabled={isLoading}
          />

          <Select
            label="Moneda"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="ARS">ARS (Pesos Argentinos)</option>
            <option value="USD">USD (Dólares)</option>
          </Select>
        </div>

        {approvedSuppliers.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay proveedores aprobados disponibles para asignar
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              isLoading ||
              !selectedSupplierId ||
              !selectedRubricId ||
              !amountTotal ||
              approvedSuppliers.length === 0
            }
          >
            {isLoading ? "Asignando..." : "Asignar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

