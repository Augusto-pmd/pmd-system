/**
 * Tipos TypeScript para la entidad Role del frontend
 * Basado en la entidad Role del backend
 */

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  AUDITOR = 'auditor',
  ADMINISTRATION = 'administration',
  DIRECTION = 'direction',
  SUPERVISOR = 'supervisor',
}

export interface Role {
  id: string;
  name: UserRole | string;
  description?: string;
  permissions?: string[] | Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleData {
  name: UserRole;
  description?: string;
  permissions?: Record<string, unknown>;
}

export interface UpdateRoleData {
  name?: UserRole;
  description?: string;
  permissions?: Record<string, unknown> | string[];
}

