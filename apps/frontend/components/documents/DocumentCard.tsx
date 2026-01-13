"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getBackendUrl } from "@/lib/env";
import { Document } from "@/lib/types/document";

interface DocumentCardProps {
  document: Document;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const router = useRouter();

  const getFileIcon = (type: string | undefined): string => {
    if (!type) return "📄";
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes("pdf")) return "📕";
    if (typeLower.includes("image") || typeLower.includes("jpg") || typeLower.includes("png") || typeLower.includes("gif")) return "🖼️";
    if (typeLower.includes("excel") || typeLower.includes("xls") || typeLower.includes("xlsx")) return "📊";
    if (typeLower.includes("word") || typeLower.includes("doc")) return "📝";
    if (typeLower.includes("zip") || typeLower.includes("rar")) return "📦";
    
    return "📄";
  };

  const getFileTypeLabel = (type: string | undefined): string => {
    if (!type) return "Archivo";
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes("pdf")) return "PDF";
    if (typeLower.includes("image") || typeLower.includes("jpg") || typeLower.includes("png") || typeLower.includes("gif")) return "Imagen";
    if (typeLower.includes("excel") || typeLower.includes("xls") || typeLower.includes("xlsx")) return "Excel";
    if (typeLower.includes("word") || typeLower.includes("doc")) return "Word";
    if (typeLower.includes("zip") || typeLower.includes("rar")) return "Comprimido";
    
    return type.toUpperCase();
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "No especificada";
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

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileUrl = document.url || document.file_url;
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    } else {
      // Si no hay URL, intentar descargar desde la API
      const envApiUrl = getBackendUrl();
      if (!envApiUrl || envApiUrl.includes("undefined") || envApiUrl.includes("null")) {
        if (process.env.NODE_ENV === "development") {
          console.error("🔴 [DocumentCard] NEXT_PUBLIC_API_URL no está definida");
        }
        return;
      }
      // Construir API_URL EXACTAMENTE como se requiere: ${NEXT_PUBLIC_API_URL}/api
      const API_URL = `${envApiUrl}/api`;
      const downloadUrl = `${API_URL}/documents/${document.id}/download`;
      window.open(downloadUrl, "_blank");
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileUrl = document.url || document.file_url;
    const fileType = (document as any).tipo || document.type || (document as any).mimeType || "";
    const isPdf = fileType.toLowerCase().includes("pdf");
    
    if (fileUrl) {
      if (isPdf) {
        window.open(fileUrl, "_blank");
      } else {
        window.open(fileUrl, "_blank");
      }
    } else {
      router.push(`/documents/${document.id}`);
    }
  };

  const fileName = (document as any).nombre || document.name || (document as any).fileName || "Sin nombre";
  const fileType = (document as any).tipo || document.type || (document as any).mimeType || "";
  const uploadDate = (document as any).fecha || (document as any).uploadDate || document.createdAt;
  const uploadedBy = (document as any).usuario || (document as any).uploadedBy || (document as any).userId || "Usuario desconocido";

  return (
    <Card className="hover:bg-white/15 transition-all">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getFileIcon(fileType)}</span>
              <div>
                <h3 className="text-lg font-semibold text-pmd-darkBlue mb-1 line-clamp-2">
                  {fileName}
                </h3>
                <Badge variant="info">{getFileTypeLabel(fileType)}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Fecha de subida:</span>
              <span className="text-sm text-gray-900 font-medium">{formatDate(uploadDate)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Subido por:</span>
              <span className="text-sm text-gray-900 font-medium">{uploadedBy}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleView}
            >
              Ver archivo
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={handleDownload}
            >
              Descargar
            </Button>
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/documents/${document.id}`)}
            >
              Ver detalle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

