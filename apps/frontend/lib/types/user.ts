/**
 * Tipos TypeScript para la entidad User del frontend
 * Basado en la entidad User del backend
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string; // Alias para fullName
  isActive?: boolean;
  role: {
    id: string;
    name: string;
    permissions?: string[];
  };
  roleId?: string;
  organizationId?: string | null;
  organization?: {
    id: string;
    name: string;
  } | null;
  assignments?: Array<{
    workId?: string;
    obraId?: string;
    [key: string]: unknown;
  }>;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  is_active?: boolean;
  role_id: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  is_active?: boolean;
  role_id?: string;
}

