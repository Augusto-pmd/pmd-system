/**
 * Work interface matching backend Work entity
 * Based on pmd-backend/src/works/works.entity.ts
 */

export type WorkStatus = 
  | "pending" 
  | "planned" 
  | "active" 
  | "paused" 
  | "completed" 
  | "finished"
  | "administratively_closed"
  | "archived";
export enum Currency {
  ARS = 'ARS',
  USD = 'USD',
}

export enum WorkType {
  HOUSE = 'house',
  LOCAL = 'local',
  EXPANSION = 'expansion',
  RENOVATION = 'renovation',
  OTHER = 'other',
}

export interface Work {
  id: string;
  name: string;
  nombre?: string; // Alias for name (used in frontend)
  title?: string; // Alias for name (used in frontend)
  description?: string | null;
  descripcion?: string | null; // Alias for description
  client: string;
  cliente?: string | null; // Alias for client
  address?: string;
  status: WorkStatus;
  estado?: WorkStatus; // Alias for status (used in frontend)
  start_date: string | Date;
  startDate?: string | Date; // Alias for start_date
  fechaInicio?: string | Date; // Alias for start_date
  estimatedStartDate?: string | Date; // Alias for start_date
  end_date?: string | Date | null;
  endDate?: string | Date | null; // Alias for end_date
  supervisor_id?: string | null;
  supervisorId?: string | null; // Alias for supervisor_id
  organization_id?: string | null;
  organizationId?: string | null; // Alias for organization_id
  currency: Currency;
  work_type?: WorkType;
  allow_post_closure_expenses?: boolean;
  post_closure_enabled_at?: string | Date | null;
  post_closure_enabled_by_id?: string | null;
  total_budget?: number;
  total_expenses?: number;
  total_incomes?: number;
  physical_progress?: number;
  economic_progress?: number;
  financial_progress?: number;
  isActive?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CreateWorkData {
  name: string;
  client: string;
  address?: string;
  start_date: string;
  end_date?: string;
  status?: WorkStatus;
  currency: Currency;
  work_type?: WorkType;
  supervisor_id?: string;
  total_budget?: number;
}

export interface UpdateWorkData extends Partial<Omit<CreateWorkData, 'currency'>> {
  estado?: WorkStatus;
  status?: WorkStatus;
  isActive?: boolean;
}

