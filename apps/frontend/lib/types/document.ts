/**
 * Tipos TypeScript para Document/WorkDocument del frontend
 * Basado en la entidad WorkDocument del backend
 */

export enum WorkDocumentType {
  CONTRACT = 'contract',
  PLAN = 'plan',
  PERMIT = 'permit',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  OTHER = 'other',
}

export enum WorkDocumentStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Document {
  id: string;
  work_id?: string;
  file_url: string;
  type: WorkDocumentType | string;
  status: WorkDocumentStatus | string;
  version?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  // Campos adicionales para compatibilidad
  name?: string;
  nombre?: string;
  fileName?: string;
  mimeType?: string;
  uploadDate?: string;
  fecha?: string;
  uploadedBy?: string;
  usuario?: string;
  userId?: string;
  description?: string;
  descripcion?: string;
  url?: string;
}

export interface CreateDocumentData {
  work_id: string;
  file_url: string;
  type: WorkDocumentType;
  status?: WorkDocumentStatus;
  version?: string;
  notes?: string;
}

export interface UpdateDocumentData {
  type?: WorkDocumentType;
  status?: WorkDocumentStatus;
  version?: string;
  notes?: string;
}

