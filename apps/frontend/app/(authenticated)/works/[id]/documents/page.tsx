"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDocumentsStore, Document } from "@/store/documentsStore";
import { useWorks } from "@/hooks/api/works";
import { useContracts } from "@/hooks/api/contracts";
import { ContractStatus } from "@/lib/types/contract";
import { LoadingState } from "@/components/ui/LoadingState";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DocumentForm } from "@/app/(authenticated)/documents/components/DocumentForm";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { Plus, Filter, X, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

function WorkDocumentsContent() {
  const params = useParams();
  const router = useRouter();
  const workId = typeof params?.id === 'string' ? params.id : null;
  const { documents, isLoading, error, fetchDocuments, createDocument } = useDocumentsStore();
  const { contracts, isLoading: isLoadingContracts } = useContracts();
  const { works } = useWorks();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (organizationId && workId) {
      fetchDocuments(workId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId, workId]);

  if (!workId) return null;

  const work = works.find((w: any) => w.id === workId);
  const workName = work ? (work.name || work.title || work.nombre || workId) : workId;

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createDocument({ ...data, workId });
      await fetchDocuments(workId);
      toast.success("Documento subido correctamente");
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al crear documento:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrar documentos de esta obra y asegurar que tengan work_id
  const workDocuments = documents
    .filter((doc) => doc.workId === workId)
    .map((doc) => ({
      ...doc,
      work_id: doc.workId || (doc as any).work_id, // Asegurar que work_id esté presente
    }));

  // NOTA: Los contratos NO se muestran en esta página de documentos
  // Los contratos tienen su propia sección y no deben aparecer como documentos de la obra
  // Si en el futuro se necesita mostrar contratos aquí, descomentar el código siguiente:
  /*
  // Filtrar contratos de esta obra y convertirlos al formato Document
  // IMPORTANTE: Solo incluir contratos que realmente tengan work_id coincidente
  const workContracts = (contracts || [])
    .filter((contract: any) => {
      if (!contract || !contract.id) return false;
      
      // Normalizar work_id - puede venir en diferentes formatos
      // NO usar fallback a workId de la URL, solo usar el work_id real del contrato
      const contractWorkId = contract.work_id || contract.workId || contract.work?.id;
      
      // Log detallado para debugging
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 [WorkDocuments] Analizando contrato:", {
          contractId: contract.id,
          contractWorkId: contractWorkId,
          workIdFromURL: workId,
          contractWorkIdType: typeof contractWorkId,
          workIdType: typeof workId,
          contract: contract
        });
      }
      
      // Si no hay work_id en el contrato, excluirlo (no debe mostrarse)
      if (!contractWorkId) {
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ [WorkDocuments] Contrato sin work_id encontrado:", contract.id);
        }
        return false;
      }
      
      // Comparar como strings para asegurar coincidencia exacta
      const contractWorkIdStr = String(contractWorkId).toLowerCase().trim();
      const workIdStr = String(workId).toLowerCase().trim();
      const matches = contractWorkIdStr === workIdStr;
      
      if (process.env.NODE_ENV === "development") {
        if (matches) {
          console.log("✅ [WorkDocuments] Contrato COINCIDE con esta obra:", {
            contractId: contract.id,
            contractWorkId: contractWorkId,
            workId: workId,
            contractWorkIdStr,
            workIdStr
          });
        } else {
          console.log("❌ [WorkDocuments] Contrato NO coincide con esta obra:", {
            contractId: contract.id,
            contractWorkId: contractWorkId,
            workId: workId,
            contractWorkIdStr,
            workIdStr
          });
        }
      }
      
      return matches;
    })
    .map((contract: any): Document => {
      // Mapear estado del contrato al formato de documento
      // Manejar tanto valores del enum como strings del backend
      const contractStatus = contract.status?.toLowerCase?.() || contract.status || "";
      let status: "aprobado" | "en revisión" | "pendiente" | "rechazado" = "pendiente";
      
      if (contractStatus === ContractStatus.APPROVED || contractStatus === "approved") {
        status = "aprobado";
      } else if (contractStatus === ContractStatus.PENDING || contractStatus === "pending") {
        status = "pendiente";
      } else if (
        contractStatus === ContractStatus.ACTIVE || contractStatus === "active" ||
        contractStatus === ContractStatus.LOW_BALANCE || contractStatus === "low_balance"
      ) {
        status = "aprobado"; // Contratos activos se consideran aprobados
      }

      // Obtener nombre del contrato desde supplier o usar un nombre por defecto
      const supplierName = contract.supplier?.name || 
                          contract.supplier?.nombre || 
                          contract.supplier?.fullName ||
                          contract.supplier_id ||
                          "Proveedor";
      const contractName = `Contrato - ${supplierName}`;

      // Obtener work_id real del contrato (ya validado en el filter)
      const contractWorkId = contract.work_id || contract.workId || contract.work?.id;
      
      return {
        id: contract.id,
        workId: contractWorkId,
        work_id: contractWorkId, // Agregar también work_id para compatibilidad con DocumentsList
        type: "Contrato",
        name: contractName,
        version: "",
        uploadedAt: contract.created_at || contract.createdAt || contract.updated_at || contract.updatedAt || "",
        uploadedBy: contract.created_by_id || contract.created_by?.id || "",
        status: status,
        url: contract.file_url || contract.fileUrl,
        fileUrl: contract.file_url || contract.fileUrl,
        createdAt: contract.created_at || contract.createdAt,
        updatedAt: contract.updated_at || contract.updatedAt,
      };
    });
  */
  
  // Por ahora, solo mostrar documentos reales (work-documents), no contratos
  const workContracts: Document[] = [];

  // Combinar documentos y contratos (por ahora solo documentos)
  const allDocuments = [...workDocuments, ...workContracts];

  // Debug: Log para verificar que los contratos se están obteniendo
  if (process.env.NODE_ENV === "development") {
    console.log("🔵 [WorkDocuments] ========== RESUMEN ==========");
    console.log("🔵 [WorkDocuments] workId de la URL:", workId);
    console.log("🔵 [WorkDocuments] contracts totales obtenidos:", contracts.length);
    console.log("🔵 [WorkDocuments] workContracts filtrados:", workContracts.length);
    console.log("🔵 [WorkDocuments] workDocuments filtrados:", workDocuments.length);
    console.log("🔵 [WorkDocuments] allDocuments totales:", allDocuments.length);
    console.log("🔵 [WorkDocuments] Todos los contratos obtenidos:", contracts);
    if (workContracts.length > 0) {
      console.log("🔵 [WorkDocuments] Contratos que pasaron el filtro:", workContracts);
    }
    console.log("🔵 [WorkDocuments] =============================");
  }

  // Obtener tipos únicos de documentos (incluyendo "Contrato")
  const documentTypes = Array.from(
    new Set(allDocuments.map((doc) => doc.type).filter(Boolean))
  ) as string[];

  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading || isLoadingContracts) {
    return (
      <LoadingState message="Cargando documentos de la obra…" />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar los documentos: {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <BotonVolver backTo={`/works/${workId}`} />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Documentos - {workName}
              </h1>
              <p className="text-gray-600">Documentación asociada a esta obra</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Subir Documento
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            {(typeFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en revisión">En Revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <DocumentsList
          documents={allDocuments as any}
          onRefresh={() => {
            fetchDocuments(workId);
            // Los contratos se refrescan automáticamente con SWR
          }}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          workFilter={workId}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Subir Documento a esta Obra"
          size="lg"
        >
          <DocumentForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
            defaultWorkId={workId}
          />
        </Modal>
      </div>
    </>
  );
}

export default function WorkDocumentsPage() {
  return (
    <ProtectedRoute>
      <WorkDocumentsContent />
    </ProtectedRoute>
  );
}

