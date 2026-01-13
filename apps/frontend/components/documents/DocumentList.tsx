"use client";

import { DocumentCard } from "./DocumentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Document } from "@/lib/types/document";

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12">
        <EmptyState
          icon="📁"
          title="No hay archivos registrados"
          description="Los archivos y documentos aparecerán aquí cuando se suban al sistema."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((document) => (
        <DocumentCard key={document.id} document={document} />
      ))}
    </div>
  );
}

