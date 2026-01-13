import { create } from "zustand";
import { apiClient } from "@/lib/api";

export interface Document {
  id: string;
  workId?: string;
  type: string;
  name: string;
  version?: string;
  uploadedAt: string;
  uploadedBy?: string;
  status?: "aprobado" | "en revisión" | "pendiente" | "rechazado";
  url?: string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DocumentPayload extends Partial<Document> {
  file?: File;
  notes?: string;
}

interface DocumentsState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  fetchDocuments: (workId?: string) => Promise<void>;
  createDocument: (payload: DocumentPayload) => Promise<void>;
  updateDocument: (id: string, payload: DocumentPayload) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useDocumentsStore = create<DocumentsState>((set, get) => ({
  documents: [],
  isLoading: false,
  error: null,

  async fetchDocuments(workId) {
    // Construir URL con query string de forma segura
    let url = "/work-documents";
    if (workId && workId.trim()) {
      url = `${url}?work_id=${encodeURIComponent(workId)}`;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(url);
      const rawDocuments = (data as any)?.data || data || [];
      
      // Mapear tipos del backend al frontend
      const typeMapReverse: Record<string, string> = {
        "plan": "Planos",
        "contract": "Contrato",
        "permit": "Permisos",
        "invoice": "Otro",
        "receipt": "Otro",
        "other": "Otro",
      };

      // Mapear estados del backend al frontend
      const statusMapReverse: Record<string, string> = {
        "pending": "pendiente",
        "approved": "aprobado",
        "rejected": "rechazado",
        "draft": "pendiente",
      };

      // Normalizar documentos del backend al formato del frontend
      const normalizedDocuments = rawDocuments.map((doc: any) => {
        // Usar el campo name del backend si existe, sino extraerlo del file_url
        let documentName = doc.name;
        if (!documentName && doc.file_url) {
          // Si es una URL temporal con formato temp://documentName|fileName o temp://documentName
          if (doc.file_url.startsWith("temp://")) {
            const tempContent = doc.file_url.replace("temp://", "");
            if (tempContent.includes("|")) {
              // Formato: documentName|fileName
              documentName = tempContent.split("|")[0];
            } else {
              // Formato: documentName
              documentName = tempContent || typeMapReverse[doc.type] || doc.type || "Documento";
            }
          } else {
            // Intentar extraer nombre del archivo desde la URL real
            const urlParts = doc.file_url.split("/");
            const fileName = urlParts[urlParts.length - 1];
            if (fileName && fileName !== "no-file") {
              // Remover extensión para el nombre
              documentName = fileName.split(".")[0] || fileName;
            } else {
              // Si no hay nombre válido, usar el tipo como nombre
              documentName = typeMapReverse[doc.type] || doc.type || "Documento";
            }
          }
        }
        
        // Si aún no hay nombre, usar un valor por defecto
        if (!documentName) {
          documentName = "Documento sin nombre";
        }

        // Extraer workId - puede venir de work_id o de la relación work
        let workId = doc.work_id || doc.workId;
        if (!workId && doc.work) {
          workId = typeof doc.work === 'string' ? doc.work : doc.work.id;
        }

        // Extraer uploadedBy - puede venir de created_by_id o de la relación created_by
        let uploadedBy = doc.uploaded_by || doc.uploadedBy || doc.created_by_id;
        if (!uploadedBy && doc.created_by) {
          uploadedBy = typeof doc.created_by === 'string' ? doc.created_by : doc.created_by.id;
        }

        return {
          id: doc.id,
          workId: workId,
          type: typeMapReverse[doc.type] || doc.type || "Otro",
          name: documentName,
          version: doc.version || "",
          uploadedAt: doc.created_at || doc.createdAt || doc.uploadedAt || "",
          uploadedBy: uploadedBy || "",
          status: statusMapReverse[doc.status] || doc.status || "pendiente",
          url: doc.file_url || doc.fileUrl || doc.url,
          fileUrl: doc.file_url || doc.fileUrl || doc.url,
          notes: doc.notes || "",
          createdAt: doc.created_at || doc.createdAt,
          updatedAt: doc.updated_at || doc.updatedAt,
        };
      });

      set({ documents: normalizedDocuments, isLoading: false });
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [documentsStore] Error al obtener documentos:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar documentos";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async createDocument(payload) {
    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [documentsStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios
    if (!payload.name || payload.name.trim() === "") {
      throw new Error("El nombre del documento es obligatorio");
    }
    if (!payload.type || payload.type.trim() === "") {
      throw new Error("El tipo de documento es obligatorio");
    }
    if (!payload.workId || payload.workId.trim() === "") {
      throw new Error("La obra es obligatoria");
    }

    try {
      // Mapear tipos de documento del frontend al backend
      const typeMap: Record<string, string> = {
        "Planos": "plan",
        "Memoria descriptiva": "other",
        "Memoria técnica": "other",
        "Contrato": "contract",
        "Permisos": "permit",
        "Legales": "other",
        "Especificaciones": "other",
        "Presupuesto": "other",
        "Otro": "other",
      };

      // Mapear estados del frontend al backend
      const statusMap: Record<string, string> = {
        "pendiente": "pending",
        "en revisión": "pending",
        "aprobado": "approved",
        "rechazado": "rejected",
      };

      const backendType = typeMap[payload.type] || "other";
      const backendStatus = payload.status ? (statusMap[payload.status.toLowerCase()] || "draft") : "draft";

      // Si hay un archivo, subirlo primero
      let fileUrl: string | undefined;
      let suggestedName: string | undefined;
      if (payload.file && payload.file instanceof File) {
        try {
          const formData = new FormData();
          formData.append("file", payload.file);
          formData.append("work_id", payload.workId);
          // Incluir el nombre del documento si se proporciona
          if (payload.name) {
            formData.append("name", payload.name);
          }
          
          // Usar fetch directamente a la ruta proxy de Next.js (no apiClient porque duplica /api)
          const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
          const csrfToken = typeof window !== "undefined" ? localStorage.getItem("csrf_token") : null;
          
          const headers: HeadersInit = {};
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
          if (csrfToken) {
            headers["X-CSRF-Token"] = csrfToken;
          }
          
          const uploadResponse = await fetch("/api/work-documents/upload", {
            method: "POST",
            headers,
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Error al subir el archivo: ${errorText}`);
          }
          
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData?.file_url || uploadData?.data?.file_url;
          suggestedName = uploadData?.suggested_name || uploadData?.data?.suggested_name;
        } catch (uploadError) {
          if (process.env.NODE_ENV === "development") {
            console.error("🔴 [documentsStore] Error al subir archivo:", uploadError);
          }
          throw new Error("Error al subir el archivo. Por favor, intente nuevamente.");
        }
      }

      // Preparar payload para el backend
      const backendPayload: any = {
        work_id: payload.workId, // Cambiar workId a work_id
        type: backendType,
        status: backendStatus,
      };

      // Incluir name si se proporciona, o usar el sugerido del archivo
      if (payload.name) {
        backendPayload.name = payload.name;
      } else if (suggestedName) {
        backendPayload.name = suggestedName;
      }

      // Incluir created_by_id si se proporciona uploadedBy
      if (payload.uploadedBy) {
        backendPayload.created_by_id = payload.uploadedBy;
      }

      if (payload.version) backendPayload.version = payload.version;
      if (payload.notes) backendPayload.notes = payload.notes;

      // Usar la URL del archivo subido o una URL temporal con el nombre del documento
      if (fileUrl) {
        backendPayload.file_url = fileUrl;
      } else {
        // Si no hay archivo, usar el nombre del documento como URL temporal
        // Formato: temp://documentName
        const docName = payload.name || "Documento sin nombre";
        backendPayload.file_url = `temp://${docName.substring(0, 480)}`;
      }

      await apiClient.post("/work-documents", backendPayload);
      await get().fetchDocuments(payload.workId);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [documentsStore] Error al crear documento:", error);
      }
      throw error;
    }
  },

  async updateDocument(id, payload) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [documentsStore] id no está definido");
      }
      throw new Error("ID de documento no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [documentsStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    try {
      // Mapear tipos de documento del frontend al backend
      const typeMap: Record<string, string> = {
        "Planos": "plan",
        "Memoria descriptiva": "other",
        "Memoria técnica": "other",
        "Contrato": "contract",
        "Permisos": "permit",
        "Legales": "other",
        "Especificaciones": "other",
        "Presupuesto": "other",
        "Otro": "other",
      };

      // Mapear estados del frontend al backend
      const statusMap: Record<string, string> = {
        "pendiente": "pending",
        "en revisión": "pending",
        "aprobado": "approved",
        "rechazado": "rejected",
      };

      // Preparar payload para el backend
      const backendPayload: any = {};

      if (payload.type) {
        backendPayload.type = typeMap[payload.type] || "other";
      }
      if (payload.status) {
        backendPayload.status = statusMap[payload.status.toLowerCase()] || "draft";
      }
      if (payload.name !== undefined) backendPayload.name = payload.name || null;
      if (payload.uploadedBy) {
        backendPayload.created_by_id = payload.uploadedBy;
      }
      if (payload.version !== undefined) backendPayload.version = payload.version || null;
      if (payload.notes !== undefined) backendPayload.notes = payload.notes || null;

      // Obtener documento actual
      const currentDocument = get().documents.find((d) => d.id === id);

      // Si hay un archivo nuevo, subirlo primero
      if (payload.file && payload.file instanceof File) {
        try {
          const workId = payload.workId || currentDocument?.workId;
          
          if (!workId) {
            throw new Error("No se pudo determinar la obra del documento");
          }

          const formData = new FormData();
          formData.append("file", payload.file);
          formData.append("work_id", workId);
          // Incluir el nombre del documento si se proporciona
          if (payload.name) {
            formData.append("name", payload.name);
          }
          
          // Usar fetch directamente a la ruta proxy de Next.js (no apiClient porque duplica /api)
          const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
          const csrfToken = typeof window !== "undefined" ? localStorage.getItem("csrf_token") : null;
          
          const headers: HeadersInit = {};
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
          if (csrfToken) {
            headers["X-CSRF-Token"] = csrfToken;
          }
          
          const uploadResponse = await fetch("/api/work-documents/upload", {
            method: "POST",
            headers,
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Error al subir el archivo: ${errorText}`);
          }
          
          const uploadData = await uploadResponse.json();
          const fileUrl = uploadData?.file_url || uploadData?.data?.file_url;
          if (fileUrl) {
            backendPayload.file_url = fileUrl;
          }
          
          // Si no se proporcionó name pero el servidor sugirió uno, usarlo
          if (!payload.name && uploadData?.suggested_name) {
            backendPayload.name = uploadData.suggested_name;
          }
        } catch (uploadError) {
          if (process.env.NODE_ENV === "development") {
            console.error("🔴 [documentsStore] Error al subir archivo:", uploadError);
          }
          throw new Error("Error al subir el archivo. Por favor, intente nuevamente.");
        }
      }

      await apiClient.patch(`/work-documents/${id}`, backendPayload);
      
      // Refrescar lista (con workId si está disponible)
      await get().fetchDocuments(payload.workId);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [documentsStore] Error al actualizar documento:", error);
      }
      throw error;
    }
  },

  async deleteDocument(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [documentsStore] id no está definido");
      }
      throw new Error("ID de documento no está definido");
    }

    try {
      // Obtener workId del documento antes de eliminarlo para refrescar correctamente
      const document = get().documents.find((d) => d.id === id);
      const workId = document?.workId;

      await apiClient.delete(`/work-documents/${id}`);
      await get().fetchDocuments(workId);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [documentsStore] Error al eliminar documento:", error);
      }
      throw error;
    }
  },
}));

