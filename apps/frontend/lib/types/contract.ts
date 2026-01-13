/**
 * Tipos TypeScript para la entidad Contract del frontend
 * Basado en la entidad Contract del backend
 */

import { Currency } from "./work";

export enum ContractStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ACTIVE = 'active',
  LOW_BALANCE = 'low_balance',
  NO_BALANCE = 'no_balance',
  PAUSED = 'paused',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

export interface Contract {
  id: string;
  work_id: string;
  supplier_id: string;
  rubric_id: string;
  amount_total: number;
  amount_executed: number;
  currency: Currency;
  file_url?: string;
  payment_terms?: string;
  is_blocked: boolean;
  status?: ContractStatus;
  observations?: string;
  validity_date?: string;
  scope?: string;
  specifications?: string;
  closed_by_id?: string;
  closed_at?: string;
  closed_by?: {
    id: string;
    name: string;
    email: string;
  };
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContractData {
  work_id: string;
  supplier_id: string;
  rubric_id: string;
  amount_total: number;
  amount_executed?: number;
  currency: Currency;
  file_url?: string;
  payment_terms?: string;
  status?: ContractStatus;
  observations?: string;
  validity_date?: string;
  scope?: string;
  specifications?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateContractData {
  supplier_id?: string;
  rubric_id?: string;
  amount_total?: number;
  amount_executed?: number;
  currency?: Currency;
  file_url?: string;
  payment_terms?: string;
  status?: ContractStatus;
  observations?: string;
  validity_date?: string;
  scope?: string;
  specifications?: string;
  is_blocked?: boolean;
  start_date?: string;
  end_date?: string;
}

