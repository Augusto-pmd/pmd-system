"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TableContainer } from "@/components/ui/TableContainer";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell, TableEmpty } from "@/components/ui/Table";
import { EntryForm } from "@/app/(authenticated)/accounting/components/EntryForm";
import { useAccountingStore, AccountingEntry } from "@/store/accountingStore";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { Edit, Trash2, Eye, Lock } from "lucide-react";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useRubrics } from "@/hooks/api/rubrics";
import { useAuthStore } from "@/store/authStore";
import { useCan } from "@/lib/acl";

interface AccountingTableProps {
  entries: AccountingEntry[];
  onRefresh: () => void;
}

export function AccountingTable({ entries, onRefresh }: AccountingTableProps) {
  const router = useRouter();
  const { works } = useWorks();
  const { suppliers } = useSuppliers();
  const { rubrics } = useRubrics();
  const { updateEntry, deleteEntry } = useAccountingStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AccountingEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const user = useAuthStore.getState().user;
  const isDirection = user?.role?.name === "DIRECTION" || user?.role?.name === "direction";
  
  // Verificar permisos
  const canUpdate = useCan("accounting.update");
  const canDelete = useCan("accounting.delete");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
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

  const getWorkName = (entry: AccountingEntry) => {
    // Primero intentar obtener de la relación cargada desde el backend
    if ((entry as any).work?.nombre) return (entry as any).work.nombre;
    if ((entry as any).work?.name) return (entry as any).work.name;
    if ((entry as any).work?.title) return (entry as any).work.title;
    
    // Si no hay relación, buscar por ID
    const workId = entry.workId || entry.obraId || (entry as any).work_id;
    if (!workId) return "-";
    const work = works?.find((w: any) => w.id === workId);
    if (!work) return "-";
    return work.nombre || work.name || work.title || "-";
  };

  const getSupplierName = (entry: AccountingEntry) => {
    // Primero intentar obtener de la relación cargada desde el backend
    if ((entry as any).supplier?.nombre) return (entry as any).supplier.nombre;
    if ((entry as any).supplier?.name) return (entry as any).supplier.name;
    
    // Si no hay relación, buscar por ID
    const supplierId = entry.supplierId || entry.proveedorId || (entry as any).supplier_id;
    if (!supplierId) return "-";
    const supplier = suppliers?.find((s: any) => s.id === supplierId);
    if (!supplier) return "-";
    return supplier.nombre || supplier.name || "-";
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

  const isMonthClosed = (entry: AccountingEntry): boolean => {
    const status = entry.month_status?.toLowerCase();
    return status === "closed" || status === "cerrado";
  };

  const canEditEntry = (entry: AccountingEntry): boolean => {
    // Direction can always edit, even closed months
    if (isDirection) return true;
    // Other users cannot edit entries from closed months
    return !isMonthClosed(entry);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedEntry) return;
    setIsSubmitting(true);
    try {
      await updateEntry(selectedEntry.id, data);
      await onRefresh();
      toast.success("Movimiento actualizado correctamente");
      setIsEditModalOpen(false);
      setSelectedEntry(null);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al actualizar movimiento:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    setIsSubmitting(true);
    try {
      await deleteEntry(selectedEntry.id);
      await onRefresh();
      toast.success("Movimiento eliminado correctamente");
      setIsDeleteModalOpen(false);
      setSelectedEntry(null);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al eliminar movimiento:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Obra</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead align="right">Monto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableEmpty message="No hay movimientos registrados" />
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date || entry.fecha || (entry as any).date)}</TableCell>
                  <TableCell>{getWorkName(entry)}</TableCell>
                  <TableCell>{getSupplierName(entry)}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeVariant(entry.type || entry.tipo || (entry as any).accounting_type || "")}>
                      {getTypeLabel(entry.type || entry.tipo || (entry as any).accounting_type || "")}
                    </Badge>
                  </TableCell>
                  <TableCell align="right" style={{ fontWeight: 500 }}>
                    {formatCurrency(entry.amount || entry.monto || (entry as any).amount || 0)}
                  </TableCell>
                  <TableCell>{getCategory(entry)}</TableCell>
                  <TableCell style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.notes || entry.notas || entry.description || entry.descripcion || (entry as any).description || "-"}
                  </TableCell>
                  <TableCell align="right">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                      <Button
                        variant="icon"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          router.push(`/accounting/${entry.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canUpdate && (
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => {
                            if (canEditEntry(entry)) {
                              setSelectedEntry(entry);
                              setIsEditModalOpen(true);
                            } else {
                              toast.error("No se puede editar un registro de un mes cerrado. Solo Dirección puede editar meses cerrados.");
                            }
                          }}
                          disabled={!canEditEntry(entry)}
                          title={!canEditEntry(entry) ? "No se puede editar un registro de un mes cerrado" : "Editar movimiento"}
                          style={!canEditEntry(entry) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                        >
                          {!canEditEntry(entry) ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Edit className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="icon"
                          size="sm"
                          onClick={() => {
                            setSelectedEntry(entry);
                            setIsDeleteModalOpen(true);
                          }}
                          style={{ color: "#FF3B30" }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEntry(null);
        }}
        title="Editar Movimiento"
        size="lg"
      >
        {selectedEntry && (
          <EntryForm
            initialData={selectedEntry}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedEntry(null);
            }}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEntry(null);
        }}
        title="Confirmar Eliminación"
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <p style={{ font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
            ¿Estás seguro de que deseas eliminar este movimiento contable?
          </p>
          {selectedEntry && (
            <div style={{ 
              backgroundColor: "var(--apple-surface)", 
              border: "1px solid var(--apple-border)", 
              borderRadius: "var(--radius-md)",
              padding: "var(--space-md)"
            }}>
              <p style={{ fontSize: "13px", color: "var(--apple-text-primary)", margin: "0 0 4px 0" }}>
                <strong>Fecha:</strong> {formatDate(selectedEntry.date || selectedEntry.fecha)}
              </p>
              <p style={{ fontSize: "13px", color: "var(--apple-text-primary)", margin: "0 0 4px 0" }}>
                <strong>Tipo:</strong> {getTypeLabel(selectedEntry.type || selectedEntry.tipo || "")}
              </p>
              <p style={{ fontSize: "13px", color: "var(--apple-text-primary)", margin: 0 }}>
                <strong>Monto:</strong> {formatCurrency(selectedEntry.amount || selectedEntry.monto || 0)}
              </p>
            </div>
          )}
          <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedEntry(null);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isSubmitting}
              style={{ color: "#FF3B30", borderColor: "#FF3B30" }}
            >
              {isSubmitting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
