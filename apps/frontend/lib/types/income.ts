/**
 * Tipos TypeScript para la entidad Income del frontend
 * Basado en la entidad Income del backend
 */

import { Currency } from "./work";

export enum IncomeType {
  ADVANCE = 'advance',
  CERTIFICATION = 'certification',
  FINAL_PAYMENT = 'final_payment',
  ADJUSTMENT = 'adjustment',
  REIMBURSEMENT = 'reimbursement',
  OTHER = 'other',
}

export enum PaymentMethod {
  TRANSFER = 'transfer',
  CHECK = 'check',
  CASH = 'cash',
  PAYMENT_LINK = 'payment_link',
}

export interface Income {
  id: string;
  work_id: string;
  type: IncomeType;
  amount: number;
  currency: Currency;
  date: string;
  file_url?: string;
  document_number?: string;
  payment_method?: PaymentMethod;
  is_validated: boolean;
  validated_by_id?: string;
  validated_at?: string;
  observations?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncomeData {
  work_id: string;
  type: IncomeType;
  amount: number;
  currency: Currency;
  date: string;
  file_url?: string;
  document_number?: string;
  payment_method?: PaymentMethod;
  is_validated?: boolean;
  observations?: string;
}

export interface UpdateIncomeData extends Partial<Omit<CreateIncomeData, 'work_id' | 'currency'>> {
  type?: IncomeType;
  amount?: number;
  date?: string;
  file_url?: string;
  document_number?: string;
  payment_method?: PaymentMethod;
  is_validated?: boolean;
  observations?: string;
}

