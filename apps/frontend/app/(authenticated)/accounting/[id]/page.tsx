"use client";

import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAccountingStore, AccountingEntry } from "@/store/accountingStore";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useRubrics } from "@/hooks/api/rubrics";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { EntryForm } from "@/app/(authenticated)/accounting/components/EntryForm";
import { useToast } from "@/components/ui/Toast";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Edit, Trash2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useCan } from "@/lib/acl";

function AccountingEntryDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  const { entries, isLoading, fetchEntries, updateEntry, deleteEntry } = useAccountingStore();
  const { works } = useWorks();
  const { suppliers } = useSuppliers();
  const { rubrics } = useRubrics();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  // Verificar permisos
  const canUpdate = useCan("accounting.update");
  const canDelete = useCan("accounting.delete");

  // Safely extract id from params
  const id = typeof params?.id === "string" ? params.id : null;

  const entry = id ? entries.find((e) => e.id === id) : undefined;

  useEffect(() => {
    if (id && !entry && !isLoading) {
      fetchEntries();
    }
  }, [id, entry, isLoading, fetchEntries]);

  // Guard check after all hooks
  if (!id) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          ID de movimiento inválido
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/accounting")}>Volver a Contabilidad</Button>
        </div>
      </>
    );
  }

  const formatCurrency = (amount: number) => {
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
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getWorkName = (entry: AccountingEntry) => {
    // Primero intentar obtener de la relación cargada desde el backend
    if ((entry as any).work?.nombre) return (entry as any).work.nombre;
    if ((entry as any).work?.name) return (entry as any).work.name;
    if ((entry as any).work?.title) return (entry as any).work.title;
    
    // Si no hay relación, buscar por ID
    const workId = entry.workId || entry.obraId || (entry as any).work_id;
    if (!workId) return "No asignada";
    const work = works?.find((w: any) => w.id === workId);
    if (!work) return "Obra no encontrada";
    return work.nombre || work.name || work.title || "Sin nombre";
  };

  const getSupplierName = (entry: AccountingEntry) => {
    // Primero intentar obtener de la relación cargada desde el backend
    if ((entry as any).supplier?.nombre) return (entry as any).supplier.nombre;
    if ((entry as any).supplier?.name) return (entry as any).supplier.name;
    
    // Si no hay relación, buscar por ID
    const supplierId = entry.supplierId || entry.proveedorId || (entry as any).supplier_id;
    if (!supplierId) return "No asignado";
    const supplier = suppliers?.find((s: any) => s.id === supplierId);
    if (!supplier) return "Proveedor no encontrado";
    return supplier.nombre || supplier.name || "Sin nombre";
  };

  const getCategory = (entry: AccountingEntry) => {
    // Intentar obtener de la relación expense -> rubric cargada desde el backend
    if ((entry as any).expense?.rubric?.name) return (entry as any).expense.rubric.name;
    if ((entry as any).expense?.rubric?.nombre) return (entry as any).expense.rubric.nombre;
    
    // Si hay expense con rubric_id pero no la relación cargada, buscar la rúbrica
    if ((entry as any).expense?.rubric_id) {
      const rubricId = (entry as any).expense.rubric_id;
      const rubric = rubrics?.find((r: any) => r.id === rubricId);
      if (rubric?.name) return rubric.name;
    }
    
    // Si no hay relación, usar el campo directo (aunque el backend no lo guarda)
    return entry.category || entry.categoria || "-";
  };

  const getTypeLabel = (type: string) => {
    const typeLower = type?.toLowerCase() || "";
    if (typeLower === "ingreso" || typeLower === "income" || typeLower === "fiscal") return "Ingreso";
    if (typeLower === "egreso" || typeLower === "expense" || typeLower === "cash") return "Egreso";
    return type || "-";
  };

  const getTypeVariant = (type: string) => {
    const typeLower = type?.toLowerCase() || "";
    if (typeLower === "ingreso" || typeLower === "income" || typeLower === "fiscal") return "success";
    if (typeLower === "egreso" || typeLower === "expense" || typeLower === "cash") return "error";
    return "default";
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updateEntry(id, data);
      await fetchEntries();
      toast.success("Movimiento actualizado correctamente");
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al actualizar movimiento:", err);
      }
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar el movimiento";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await deleteEntry(id);
      toast.success("Movimiento eliminado correctamente");
      setIsDeleteModalOpen(false);
      setTimeout(() => {
        router.push("/accounting");
      }, 1500);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al eliminar movimiento:", err);
      }
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar el movimiento";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState message="Cargando movimiento contable…" />
    );
  }

  if (!entry) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Movimiento contable no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/accounting")}>Volver a Contabilidad</Button>
        </div>
      </>
    );
  }

  const renderField = (label: string, value: any, formatter?: (val: any) => string, defaultValue: string = "-") => {
    const displayValue = value !== null && value !== undefined && value !== "" 
      ? (formatter ? formatter(value) : String(value))
      : defaultValue;
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
        <p className="text-gray-900">{displayValue}</p>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <BotonVolver />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle del Movimiento Contable</h1>
            <p className="text-gray-600">Información completa del movimiento seleccionado</p>
          </div>
          <div className="flex gap-2">
            {canUpdate && (
              <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/accounting")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Información del Movimiento</CardTitle>
              <Badge variant={getTypeVariant(entry.type || entry.tipo || (entry as any).accounting_type || "")}>
                {getTypeLabel(entry.type || entry.tipo || (entry as any).accounting_type || "")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("Fecha", entry.date || entry.fecha || (entry as any).date, formatDate, "No especificada")}
              {renderField("Monto", entry.amount || entry.monto || (entry as any).amount, formatCurrency, "$ 0,00")}
              {renderField("Categoría", getCategory(entry), undefined, "-")}
              {renderField("Obra", getWorkName(entry), undefined, "No asignada")}
              {renderField("Proveedor", getSupplierName(entry), undefined, "No asignado")}
              {renderField("Fecha de creación", entry.createdAt || (entry as any).created_at, formatDate, "-")}
              {renderField("Última actualización", entry.updatedAt || (entry as any).updated_at, formatDate, "-")}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Notas / Descripción</h3>
              <p className="text-gray-900">
                {entry.notes || entry.notas || entry.description || entry.descripcion || (entry as any).description || "-"}
              </p>
            </div>

            {entry.id && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">ID del Movimiento</h3>
                <p className="text-gray-600 font-mono text-sm">{entry.id}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vínculos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(entry.workId || entry.obraId || (entry as any).work_id) ? (
            <Card>
              <CardHeader>
                <CardTitle>Obra Relacionada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 mb-4">{getWorkName(entry)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/works/${entry.workId || entry.obraId || (entry as any).work_id}`)}
                >
                  Ver Obra
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {(entry.supplierId || entry.proveedorId || (entry as any).supplier_id) ? (
            <Card>
              <CardHeader>
                <CardTitle>Proveedor Relacionado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 mb-4">{getSupplierName(entry)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/suppliers/${entry.supplierId || entry.proveedorId || (entry as any).supplier_id}`)}
                >
                  Ver Proveedor
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-4">
          {canUpdate && (
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Movimiento
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Movimiento
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Movimiento"
        size="lg"
      >
        <EntryForm
          initialData={entry}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar este movimiento contable?
          </p>
          <div className="bg-gray-50 p-4 rounded-pmd">
            <p className="text-sm text-gray-600">
              <strong>Fecha:</strong> {formatDate(entry.date || entry.fecha)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Tipo:</strong> {getTypeLabel(entry.type || entry.tipo || "")}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Monto:</strong> {formatCurrency(entry.amount || entry.monto || 0)}
            </p>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default function AccountingEntryDetailPage() {
  return (
    <ProtectedRoute>
      <AccountingEntryDetailContent />
    </ProtectedRoute>
  );
}
