"use client";

import { useState, useEffect } from "react";
import { useCashboxStore, CashMovement } from "@/store/cashboxStore";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useWorks } from "@/hooks/api/works";
import { useRubrics } from "@/hooks/api/rubrics";
import { expenseApi } from "@/hooks/api/expenses";
import { CreateExpenseData, UpdateExpenseData } from "@/lib/types/expense";
import { Currency } from "@/lib/types/work";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { normalizeId } from "@/lib/normalizeId";

interface MovementFormProps {
  cashboxId: string;
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: CashMovement | null;
}

export function MovementForm({ cashboxId, onSuccess, onCancel, initialData }: MovementFormProps) {
  const [movementType, setMovementType] = useState<"ingreso" | "egreso">(
    initialData?.type === "ingreso" || initialData?.type === "income" ? "ingreso" : "egreso"
  );
  const [documentType, setDocumentType] = useState<"factura" | "comprobante" | null>(
    initialData?.typeDocument || null
  );
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [supplierId, setSupplierId] = useState(normalizeId(initialData?.supplierId));
  const [workId, setWorkId] = useState(normalizeId(initialData?.workId));
  const [rubricId, setRubricId] = useState(initialData?.category || "");
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(initialData?.notes || initialData?.description || "");
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || "");
  const [responsible, setResponsible] = useState(initialData?.responsible || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createMovement, updateMovement } = useCashboxStore();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { works, isLoading: worksLoading } = useWorks();
  const { rubrics, isLoading: rubricsLoading } = useRubrics();
  const toast = useToast();

  // Actualizar estados cuando cambia initialData (para edición)
  useEffect(() => {
    if (initialData) {
      // Determinar tipo de movimiento
      const isIncome = initialData.type === "ingreso" || initialData.type === "income" || initialData.type === "refill";
      setMovementType(isIncome ? "ingreso" : "egreso");
      
      // Extraer datos del movimiento base
      setAmount(initialData.amount?.toString() || "");
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      setNotes(initialData.notes || initialData.description || "");
      
      // Si es un egreso y tiene expense relacionado, extraer datos de ahí
      if (!isIncome) {
        const expense = (initialData as any).expense;
        
        if (expense) {
          // Mapear document_type a typeDocument
          // El backend usa: invoice_a, invoice_b, invoice_c, receipt, val
          // El frontend usa: factura, comprobante
          let docType: "factura" | "comprobante" | null = null;
          if (expense.document_type) {
            if (expense.document_type === "invoice_a" || expense.document_type === "invoice_b" || expense.document_type === "invoice_c") {
              docType = "factura";
            } else if (expense.document_type === "receipt" || expense.document_type === "val") {
              docType = "comprobante";
            }
          }
          setDocumentType(docType);
          
          // Extraer datos del expense
          setSupplierId(normalizeId(expense.supplier_id || expense.supplierId || expense.supplier?.id));
          setWorkId(normalizeId(expense.work_id || expense.workId || expense.work?.id));
          setInvoiceNumber(expense.document_number || expense.documentNumber || "");
          setRubricId(normalizeId(expense.rubric_id || expense.rubric?.id || ""));
        } else {
          // Si no hay expense, usar datos directos del movimiento como fallback
          setDocumentType(initialData.typeDocument || null);
          setSupplierId(normalizeId(initialData.supplierId));
          setWorkId(normalizeId(initialData.workId));
          setInvoiceNumber(initialData.invoiceNumber || "");
          setRubricId(normalizeId(initialData.category || ""));
        }
      } else {
        // Si es ingreso, resetear campos de egreso
        setDocumentType(null);
        setSupplierId("");
        setWorkId("");
        setInvoiceNumber("");
        setRubricId("");
      }
      
      // Si es un ingreso, extraer el responsable de la descripción o del income
      if (isIncome) {
        const income = (initialData as any).income;
        let responsibleValue = "";
        
        // Intentar extraer de la descripción del movimiento (formato: "Responsable: [nombre] | [notas]")
        const description = initialData.description || initialData.notes || "";
        const responsibleMatch = description.match(/Responsable:\s*([^|]+)/);
        if (responsibleMatch) {
          responsibleValue = responsibleMatch[1].trim();
        }
        
        // Si no está en la descripción, intentar del income (aunque no tiene ese campo normalmente)
        if (!responsibleValue && income) {
          responsibleValue = income.responsible || income.delivered_by || income.deliveredBy || "";
        }
        
        // Si tampoco está en income, usar el campo directo (fallback)
        if (!responsibleValue) {
          responsibleValue = initialData.responsible || "";
        }
        
        setResponsible(responsibleValue);
        
        // Extraer las notas sin el responsable si está presente
        if (responsibleMatch) {
          const notesWithoutResponsible = description.replace(/Responsable:\s*[^|]+\s*\|\s*/, "").replace(/Responsable:\s*[^|]+/, "").trim();
          if (notesWithoutResponsible) {
            setNotes(notesWithoutResponsible);
          }
        } else if (description && !responsibleMatch) {
          setNotes(description);
        }
      } else {
        setResponsible("");
      }
    } else {
      // Resetear formulario cuando no hay initialData (nuevo movimiento)
      setMovementType("egreso");
      setDocumentType(null);
      setAmount("");
      setSupplierId("");
      setWorkId("");
      setRubricId("");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setInvoiceNumber("");
      setResponsible("");
    }
    setErrors({});
  }, [initialData]);

  // Resetear documentType cuando cambia movementType (solo si no hay initialData)
  useEffect(() => {
    if (movementType === "ingreso" && !initialData) {
      setDocumentType(null);
      setInvoiceNumber("");
      setSupplierId("");
    }
  }, [movementType, initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "El monto debe ser mayor a 0";
    }

    if (!date) {
      newErrors.date = "La fecha es requerida";
    }

    // Validaciones para Egreso con Factura
    if (movementType === "egreso" && documentType === "factura") {
      if (!invoiceNumber || invoiceNumber.trim() === "") {
        newErrors.invoiceNumber = "El número de factura es obligatorio";
      }
      if (!supplierId || supplierId.trim() === "") {
        newErrors.supplierId = "El proveedor es obligatorio para facturas";
      }
      if (!workId || workId.trim() === "") {
        newErrors.workId = "La obra es obligatoria";
      }
      if (!rubricId || rubricId.trim() === "") {
        newErrors.rubricId = "La rúbrica es obligatoria";
      }
    }

    // Validaciones para Egreso con Comprobante
    if (movementType === "egreso" && documentType === "comprobante") {
      if (!workId || workId.trim() === "") {
        newErrors.workId = "La obra es obligatoria";
      }
      if (!rubricId || rubricId.trim() === "") {
        newErrors.rubricId = "La rúbrica es obligatoria";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);
    try {
      let expenseId: string | undefined = undefined;

      // Si es un egreso con datos de factura/comprobante, crear o actualizar el Expense
      // El backend requiere work_id siempre, así que solo creamos expense si tenemos workId y rubricId
      if (movementType === "egreso" && documentType && workId && rubricId) {
        // Mapear documentType del frontend al enum del backend
        let backendDocumentType: "invoice_a" | "invoice_b" | "invoice_c" | "receipt" | "val";
        if (documentType === "factura") {
          // Por defecto usar invoice_a, pero podríamos permitir seleccionar el tipo
          backendDocumentType = "invoice_a";
        } else {
          backendDocumentType = "receipt";
        }

        const expensePayload: CreateExpenseData = {
          work_id: normalizeId(workId),
          rubric_id: normalizeId(rubricId),
          amount: parseFloat(amount),
          currency: Currency.ARS,
          purchase_date: new Date(date).toISOString().split("T")[0],
          document_type: backendDocumentType,
          observations: notes.trim() || undefined,
        };

        // Agregar supplier_id si está presente (requerido para facturas, opcional para comprobantes)
        if (supplierId && supplierId.trim() !== "") {
          expensePayload.supplier_id = normalizeId(supplierId);
        }

        // Agregar document_number si es factura
        if (documentType === "factura" && invoiceNumber && invoiceNumber.trim() !== "") {
          expensePayload.document_number = invoiceNumber.trim();
        }

        if (initialData?.id) {
          // Si estamos editando y ya tiene un expense, actualizarlo
          const existingExpense = (initialData as any).expense;
          if (existingExpense?.id) {
            // Para actualizar, no incluir work_id ni currency (no se pueden actualizar)
            const updatePayload: UpdateExpenseData = {
              rubric_id: normalizeId(rubricId),
              amount: parseFloat(amount),
              purchase_date: new Date(date).toISOString().split("T")[0],
              document_type: backendDocumentType,
              observations: notes.trim() || undefined,
            };

            // Agregar supplier_id si está presente
            if (supplierId && supplierId.trim() !== "") {
              updatePayload.supplier_id = normalizeId(supplierId);
            }

            // Agregar document_number si es factura
            if (documentType === "factura" && invoiceNumber && invoiceNumber.trim() !== "") {
              updatePayload.document_number = invoiceNumber.trim();
            }

            await expenseApi.update(existingExpense.id, updatePayload);
            expenseId = existingExpense.id;
          } else {
            // Si no tiene expense, crear uno nuevo
            const newExpense = await expenseApi.create(expensePayload);
            expenseId = (newExpense as any)?.id || (newExpense as any)?.data?.id;
          }
        } else {
          // Crear nuevo expense
          const newExpense = await expenseApi.create(expensePayload);
          expenseId = (newExpense as any)?.id || (newExpense as any)?.data?.id;
        }
      }

      // Construir payload exacto según CreateCashMovementDto del backend
      const payload: any = {
        cashbox_id: cashboxId, // required, UUID
        type: movementType === "ingreso" ? "income" : "expense", // required, CashMovementType enum
        amount: parseFloat(amount), // required, number
        currency: "ARS", // required, "ARS" | "USD"
        date: new Date(date).toISOString(), // required, ISO8601
      };

      // Campos opcionales
      // Para refuerzos (ingresos), incluir el responsable en la descripción si está presente
      if (movementType === "ingreso") {
        let descriptionParts: string[] = [];
        if (responsible && responsible.trim()) {
          descriptionParts.push(`Responsable: ${responsible.trim()}`);
        }
        if (notes.trim()) {
          descriptionParts.push(notes.trim());
        }
        if (descriptionParts.length > 0) {
          payload.description = descriptionParts.join(" | ");
        }
      } else {
        // Para egresos, solo usar las notas
        if (notes.trim()) payload.description = notes.trim();
      }

      // Asociar expense_id si se creó/actualizó un expense
      if (expenseId) {
        payload.expense_id = expenseId;
      }

      if (initialData?.id) {
        await updateMovement(cashboxId, initialData.id, payload);
        toast.success("Movimiento actualizado");
        onSuccess();
      } else {
        const isRefill = movementType === "ingreso";
        await createMovement(cashboxId, payload);
        
        if (isRefill) {
          toast.success("Refuerzo registrado. El saldo de la caja se ha actualizado automáticamente.");
        } else {
          toast.success("Movimiento registrado");
        }
        
        // Pasar información sobre si fue un refuerzo al callback
        onSuccess();
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al guardar movimiento:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al guardar el movimiento";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData?.id ? "Editar Movimiento" : "Nuevo Movimiento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {/* Tipo de Movimiento */}
          <FormField label="Tipo de movimiento" required>
            <Select
              value={movementType}
              onChange={(e) => setMovementType(e.target.value as "ingreso" | "egreso")}
              required
            >
              <option value="ingreso">Ingreso (Refuerzo)</option>
              <option value="egreso">Egreso</option>
            </Select>
          </FormField>

          {/* Tipo de Comprobante (solo para Egreso) */}
          {movementType === "egreso" && (
            <FormField label="Tipo de comprobante" required>
              <Select
                value={documentType || ""}
                onChange={(e) => setDocumentType(e.target.value as "factura" | "comprobante" | null)}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="factura">Factura (compra en blanco)</option>
                <option value="comprobante">Comprobante / Ticket (compra informal)</option>
              </Select>
            </FormField>
          )}

          {/* Monto */}
          <FormField label="Monto" required error={errors.amount}>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </FormField>

          {/* Fecha */}
          <FormField label="Fecha" required error={errors.date}>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </FormField>

          {/* Número de Factura (solo para Factura) */}
          {movementType === "egreso" && documentType === "factura" && (
            <FormField label="Número de factura" required error={errors.invoiceNumber}>
              <Input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ej: 0001-00001234"
                required
              />
            </FormField>
          )}

          {/* Proveedor (obligatorio para Factura, opcional para Comprobante) */}
          {movementType === "egreso" && documentType && (
            <FormField
              label="Proveedor"
              required={documentType === "factura"}
              error={errors.supplierId}
            >
              <Select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                disabled={suppliersLoading}
                required={documentType === "factura"}
              >
                <option value="">Seleccionar proveedor{documentType === "comprobante" ? " (opcional)" : ""}</option>
                {suppliers?.map((supplier: any) => (
                  <option key={supplier.id} value={normalizeId(supplier.id)}>
                    {supplier.name || supplier.nombre || `Proveedor ${supplier.id.slice(0, 8)}`}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          {/* Obra (obligatoria para Factura y Comprobante) */}
          {movementType === "egreso" && documentType && (
            <FormField label="Obra" required error={errors.workId}>
              <Select
                value={workId}
                onChange={(e) => setWorkId(e.target.value)}
                disabled={worksLoading}
                required
              >
                <option value="">Seleccionar obra</option>
                {works?.map((work: any) => (
                  <option key={work.id} value={normalizeId(work.id)}>
                    {work.name || work.nombre || work.title || `Obra ${work.id.slice(0, 8)}`}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          {/* Responsable (solo para Ingreso/Refuerzo) */}
          {movementType === "ingreso" && (
            <FormField label="Responsable (opcional)">
              <Input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Nombre del responsable del refuerzo"
              />
            </FormField>
          )}

          {/* Categoría/Rúbrica (solo para Egreso) */}
          {movementType === "egreso" && documentType && (
            <FormField label="Rúbrica/Categoría" required>
              <Select
                value={rubricId}
                onChange={(e) => setRubricId(e.target.value)}
                disabled={rubricsLoading}
                required
              >
                <option value="">Seleccionar rúbrica</option>
                {rubrics?.map((rubric: any) => (
                  <option key={rubric.id} value={normalizeId(rubric.id)}>
                    {rubric.name || rubric.code || `Rúbrica ${rubric.id.slice(0, 8)}`}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          {/* Observaciones/Notas */}
          <FormField label={movementType === "ingreso" ? "Observaciones (opcional)" : "Notas"}>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={
                movementType === "ingreso"
                  ? "Observaciones sobre el refuerzo..."
                  : "Descripción o notas adicionales del movimiento..."
              }
            />
          </FormField>

          {/* Botones */}
          <div style={{ display: "flex", gap: "var(--space-sm)", paddingTop: "var(--space-md)" }}>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              {isSubmitting ? "Guardando..." : initialData?.id ? "Actualizar" : "Crear Movimiento"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
