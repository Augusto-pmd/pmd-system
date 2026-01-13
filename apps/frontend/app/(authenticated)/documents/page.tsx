"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useDocumentsStore } from "@/store/documentsStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { DocumentsList } from "@/components/documents/DocumentsList";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DocumentForm } from "./components/DocumentForm";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { Input } from "@/components/ui/Input";
import { Plus, Search, Filter, X, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { normalizeId } from "@/lib/normalizeId";
import { useCan } from "@/lib/acl";

function DocumentsContent() {
  const { documents, isLoading, error, fetchDocuments, createDocument } = useDocumentsStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  const { works } = useWorks();
  const { users } = useUsers();

  // Verificar permisos
  const canCreate = useCan("documents.create");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [workFilter, setWorkFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (organizationId) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createDocument(data);
      await fetchDocuments();
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

  // Obtener tipos únicos de documentos
  const documentTypes = Array.from(
    new Set(documents.map((doc) => doc.type).filter(Boolean))
  ) as string[];

  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Cargando documentos…" />;
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
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Documentación</h1>
              <p className="text-gray-600">Gestión de documentos por obra PMD</p>
            </div>
            {canCreate && (
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Subir Documento
              </Button>
            )}
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por nombre o tipo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            {(searchQuery || typeFilter !== "all" || workFilter !== "all" || statusFilter !== "all" || userFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setWorkFilter("all");
                  setStatusFilter("all");
                  setUserFilter("all");
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Obra</label>
                <select
                  value={workFilter}
                  onChange={(e) => setWorkFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  {works.map((work: any) => {
                    const workName = work.name || work.title || work.nombre || work.id;
                    return (
                      <option key={work.id} value={work.id}>
                        {workName}
                      </option>
                    );
                  })}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  {users.map((user: any) => {
                    const userName = user.fullName || user.name || user.nombre || user.id;
                    return (
                      <option key={user.id} value={normalizeId(user.id)}>
                        {userName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}
        </div>

        <DocumentsList
          documents={(documents || []) as any}
          onRefresh={fetchDocuments}
          searchQuery={searchQuery}
          typeFilter={typeFilter}
          workFilter={workFilter}
          statusFilter={statusFilter}
          userFilter={userFilter}
        />

        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Subir Documento"
          size="lg"
        >
          <DocumentForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </>
  );
}

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <DocumentsContent />
    </ProtectedRoute>
  );
}
