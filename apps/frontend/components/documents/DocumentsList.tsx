"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { DocumentForm } from "@/app/(authenticated)/documents/components/DocumentForm";
import { useDocumentsStore } from "@/store/documentsStore";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { Edit, Trash2, Eye, Download, FileText } from "lucide-react";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { Document } from "@/lib/types/document";
import { Work } from "@/lib/types/work";
import { User } from "@/lib/types/user";
import { useCan } from "@/lib/acl";

interface DocumentsListProps {
  documents: Document[];
  onRefresh?: () => void;
  searchQuery?: string;
  typeFilter?: string;
  workFilter?: string;
  statusFilter?: string;
  userFilter?: string;
}

export function DocumentsList({
  documents,
  onRefresh,
  searchQuery = "",
  typeFilter = "all",
  workFilter = "all",
  statusFilter = "all",
  userFilter = "all",
}: DocumentsListProps) {
  const router = useRouter();
  const { works } = useWorks();
  const { users } = useUsers();
  const { deleteDocument } = useDocumentsStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  // Verificar permisos
  const canUpdateDocument = useCan("documents.update");
  const canDeleteDocument = useCan("documents.delete");
  const canManageDocuments = useCan("documents.manage");
  
  // Para editar, se necesita documents.update o documents.manage
  const canUpdate = canUpdateDocument || canManageDocuments;
  // Para eliminar, se necesita documents.delete o documents.manage
  const canDelete = canDeleteDocument || canManageDocuments;

  // Filtrar documentos
  const filteredDocuments = documents.filter((doc) => {
    // Búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = doc.name?.toLowerCase().includes(query);
      const matchesType = doc.type?.toLowerCase().includes(query);
      if (!matchesName && !matchesType) return false;
    }

    // Filtro de tipo
    if (typeFilter !== "all" && doc.type !== typeFilter) return false;

    // Filtro de obra
    if (workFilter !== "all" && doc.work_id !== workFilter) return false;

    // Filtro de estado
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;

    // Filtro de usuario
    if (userFilter !== "all" && doc.uploadedBy !== userFilter) return false;

    return true;
  });

  const getWorkName = (workId?: string) => {
    if (!workId) return "-";
    const work = works.find((w: Work) => w.id === workId);
    if (!work) return workId;
    return work.name || workId;
  };

  const getUserName = (userId?: string) => {
    if (!userId) return "-";
    const user = users.find((u: User) => u.id === userId);
    if (!user) return userId;
    return user.fullName || user.name || userId;
  };

  const getStatusVariant = (status?: string) => {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    if (statusLower === "aprobado") return "success";
    if (statusLower === "pendiente") return "warning";
    if (statusLower === "en revisión" || statusLower === "en revision") return "info";
    if (statusLower === "rechazado") return "error";
    return "default";
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Sin estado";
    const statusLower = status.toLowerCase();
    if (statusLower === "aprobado") return "Aprobado";
    if (statusLower === "pendiente") return "Pendiente";
    if (statusLower === "en revisión" || statusLower === "en revision") return "En Revisión";
    if (statusLower === "rechazado") return "Rechazado";
    return status;
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;
    setIsSubmitting(true);
    try {
      await deleteDocument(selectedDocument.id);
      await onRefresh?.();
      toast.success("Documento eliminado correctamente");
      setIsDeleteModalOpen(false);
      setSelectedDocument(null);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al eliminar documento:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (filteredDocuments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">
          {documents.length === 0
            ? "No hay documentos registrados"
            : "No se encontraron documentos con los filtros aplicados"}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {documents.length === 0
            ? 'Haz clic en "Subir documento" para agregar uno'
            : "Intenta ajustar los filtros de búsqueda"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-pmd overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Obra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Versión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{doc.type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{getWorkName(doc.work_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{doc.version || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(doc.uploadDate || doc.createdAt || "").toLocaleDateString("es-AR")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusVariant(doc.status)}>
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{getUserName(doc.uploadedBy)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/documents/${doc.id}`)}
                        className="text-pmd-darkBlue hover:text-pmd-mediumBlue"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.url && doc.file_url && !doc.file_url.startsWith("temp://") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              // Si es una URL HTTP/HTTPS, abrir directamente
                              if (doc.file_url?.startsWith("http://") || doc.file_url?.startsWith("https://")) {
                                window.open(doc.file_url, "_blank");
                              } else {
                                // Si es un archivo local, descargar desde el endpoint proxy
                                const response = await fetch(`/api/work-documents/${doc.id}/download`, {
                                  headers: {
                                    Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                                  },
                                });
                                
                                if (response.ok) {
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  // Obtener nombre del archivo del header Content-Disposition
                                  const contentDisposition = response.headers.get("content-disposition");
                                  const fileNameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
                                  a.download = fileNameMatch ? fileNameMatch[1] : (doc.name || "documento");
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                } else {
                                  console.error("Error al descargar archivo:", await response.text());
                                }
                              }
                            } catch (error) {
                              console.error("Error al descargar archivo:", error);
                            }
                          }}
                          className="text-pmd-darkBlue hover:text-pmd-mediumBlue"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsEditModalOpen(true);
                          }}
                          className="text-pmd-darkBlue hover:text-pmd-mediumBlue"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDocument && (
        <>
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedDocument(null);
            }}
            title="Editar Documento"
            size="lg"
          >
            <DocumentForm
              initialData={selectedDocument}
              onSubmit={async (data) => {
                const { updateDocument } = useDocumentsStore.getState();
                setIsSubmitting(true);
                try {
                  await updateDocument(selectedDocument.id, data);
                  await onRefresh?.();
                  toast.success("Documento actualizado correctamente");
                  setIsEditModalOpen(false);
                  setSelectedDocument(null);
                } catch (err: unknown) {
                  if (process.env.NODE_ENV === "development") {
                    console.error("Error al actualizar documento:", err);
                  }
                  const errorMessage = parseBackendError(err);
                  toast.error(errorMessage);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              onCancel={() => {
                setIsEditModalOpen(false);
                setSelectedDocument(null);
              }}
              isLoading={isSubmitting}
            />
          </Modal>

          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedDocument(null);
            }}
            title="Confirmar Eliminación"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar el documento <strong>{selectedDocument.name}</strong>?
              </p>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedDocument(null);
                  }}
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
      )}
    </>
  );
}

