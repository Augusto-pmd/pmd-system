"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FormField, InputField, SelectField, TextareaField } from "@/components/ui/FormField";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useRubrics } from "@/hooks/api/rubrics";
import { normalizeId } from "@/lib/normalizeId";

interface EntryFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EntryForm({ initialData, onSubmit, onCancel, isLoading }: EntryFormProps) {
  const { works, isLoading: worksLoading } = useWorks();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { rubrics } = useRubrics();
  
  const [date, setDate] = useState("");
  const [type, setType] = useState<"ingreso" | "egreso" | "income" | "expense">("egreso");
  const [workId, setWorkId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Normalizar datos del backend - buscar en múltiples formatos
      const fecha = initialData.date || initialData.fecha || initialData.date || "";
      setDate(fecha.split("T")[0] || "");
      
      // Obtener workId de múltiples fuentes
      const workIdValue = initialData.workId || initialData.obraId || initialData.work_id || 
                         (initialData.work?.id) || "";
      setWorkId(normalizeId(workIdValue));
      
      // Obtener supplierId de múltiples fuentes
      const supplierIdValue = initialData.supplierId || initialData.proveedorId || initialData.supplier_id || 
                              (initialData.supplier?.id) || "";
      setSupplierId(normalizeId(supplierIdValue));
      
      // Obtener tipo de múltiples fuentes
      const tipo = initialData.type || initialData.tipo || initialData.accounting_type || "egreso";
      // Convertir tipos del backend a formato del formulario
      let tipoFormatted = tipo;
      if (tipo === "ingreso" || tipo === "income" || tipo === "fiscal") {
        tipoFormatted = "ingreso";
      } else if (tipo === "egreso" || tipo === "expense") {
        tipoFormatted = "egreso";
      }
      setType(tipoFormatted as "ingreso" | "egreso");
      
      // Obtener monto de múltiples fuentes
      const montoValue = initialData.amount || initialData.monto || initialData.amount || 0;
      setAmount(montoValue.toString());
      
      // Obtener categoría de múltiples fuentes, incluyendo relación expense -> rubric
      let categoriaValue = initialData.category || initialData.categoria || "";
      // Intentar obtener desde expense.rubric cargado desde el backend
      if (!categoriaValue && (initialData as any).expense?.rubric?.name) {
        categoriaValue = (initialData as any).expense.rubric.name;
      }
      if (!categoriaValue && (initialData as any).expense?.rubric?.nombre) {
        categoriaValue = (initialData as any).expense.rubric.nombre;
      }
      // Si hay expense_id y rubric_id, buscar la rúbrica
      if (!categoriaValue && (initialData as any).expense_id) {
        const expenseId = (initialData as any).expense_id;
        // Si el expense tiene rubric_id, buscar la rúbrica
        if ((initialData as any).expense?.rubric_id) {
          const rubricId = (initialData as any).expense.rubric_id;
          const rubric = rubrics?.find((r: any) => r.id === rubricId);
          if (rubric?.name) {
            categoriaValue = rubric.name;
          }
        }
      }
      setCategory(categoriaValue);
      
      // Obtener notas/descripción de múltiples fuentes
      const notasValue = initialData.notes || initialData.notas || 
                        initialData.description || initialData.descripcion || "";
      setNotes(notasValue);
      
      // Obtener número de factura de múltiples fuentes
      const invoiceValue = initialData.invoiceNumber || initialData.invoice_number || 
                          initialData.document_number || "";
      setInvoiceNumber(invoiceValue);
    } else {
      // Establecer fecha por defecto a hoy
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
    }
  }, [initialData, rubrics]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!date || date.trim() === "") {
      newErrors.date = "La fecha es obligatoria";
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0";
    }
    
    if (!workId || workId.trim() === "") {
      newErrors.workId = "La obra es obligatoria";
    }
    
    // Si es egreso y tiene invoiceNumber, validar que tenga proveedor
    if (type === "egreso" || type === "expense") {
      if (invoiceNumber && invoiceNumber.trim() !== "" && (!supplierId || supplierId.trim() === "")) {
        newErrors.supplierId = "El proveedor es obligatorio cuando hay número de factura";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Extraer mes y año de la fecha
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1; // getMonth() retorna 0-11
    const year = dateObj.getFullYear();

    // Mapear tipo del formulario al accounting_type del backend
    // El backend usa 'fiscal' para ingresos y 'cash' para egresos
    const accountingType = 
      type === "ingreso" || type === "income" 
        ? "fiscal" 
        : type === "egreso" || type === "expense"
        ? "cash"
        : "cash"; // Por defecto cash (egreso)

    // Preparar payload exacto según DTO del backend (snake_case)
    const payload: any = {
      date: date,
      month: month,
      year: year,
      accounting_type: accountingType,
      work_id: workId || undefined,
      amount: parseFloat(amount),
      currency: "ARS", // Por defecto ARS, el backend requiere este campo
      description: notes.trim() || undefined,
    };

    // Agregar proveedor si está seleccionado
    if (supplierId && supplierId.trim() !== "") {
      payload.supplier_id = supplierId;
    }

    // Agregar número de factura si está presente
    if (invoiceNumber && invoiceNumber.trim() !== "") {
      payload.document_number = invoiceNumber.trim();
    }

    // Limpiar campos undefined o vacíos
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    await onSubmit(payload);
  };

  const typeOptions = [
    { value: "egreso", label: "Egreso" },
    { value: "ingreso", label: "Ingreso" },
  ];

  // Usar rúbricas del backend en lugar de categorías hardcodeadas
  const categoryOptions = [
    { value: "", label: "Seleccionar categoría" },
    ...(rubrics?.map((rubric: any) => ({
      value: rubric.name || rubric.nombre || "",
      label: rubric.name || rubric.nombre || `Rubro ${rubric.id.slice(0, 8)}`,
    })) || []),
  ];

  const workOptions = [
    { value: "", label: "Seleccionar obra" },
    ...(works?.map((work: any) => ({
      value: normalizeId(work.id),
      label: work.nombre || work.name || work.title || `Obra ${work.id.slice(0, 8)}`,
    })) || []),
  ];

  const supplierOptions = [
    { value: "", label: "Seleccionar proveedor" },
    ...(suppliers?.map((sup: any) => ({
      value: normalizeId(sup.id),
      label: sup.nombre || sup.name || `Proveedor ${sup.id.slice(0, 8)}`,
    })) || []),
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <InputField
          label="Fecha"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
          required
        />
        <SelectField
          label="Tipo de movimiento"
          value={type}
          onChange={(e) => setType(e.target.value as "ingreso" | "egreso" | "income" | "expense")}
          options={typeOptions}
          required
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <SelectField
          label="Obra"
          value={workId}
          onChange={(e) => setWorkId(e.target.value)}
          options={workOptions}
          error={errors.workId}
          required
          disabled={worksLoading}
        />
        <SelectField
          label="Proveedor"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          options={supplierOptions}
          error={errors.supplierId}
          disabled={suppliersLoading}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <InputField
          label="Monto"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          required
          placeholder="0.00"
        />
        <SelectField
          label="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
        />
      </div>

      {(type === "egreso" || type === "expense") && (
        <InputField
          label="Número de factura (opcional)"
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="Ej: 0001-00001234"
        />
      )}

      <TextareaField
        label="Notas / Descripción"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Notas adicionales sobre el movimiento contable"
      />

      <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Movimiento"}
        </Button>
      </div>
    </form>
  );
}

