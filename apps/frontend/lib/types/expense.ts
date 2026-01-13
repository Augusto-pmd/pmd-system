/**
 * Expense interface matching backend Expense entity
 * Based on pmd-backend/src/expenses/expenses.entity.ts
 */

export type ExpenseState = "pending" | "validated" | "observed" | "annulled" | "rejected";
export type DocumentType = 
  | "invoice_a" 
  | "invoice_b" 
  | "invoice_c" 
  | "receipt"
  | "val";
import { Currency } from "./work";

export interface Expense {
  id: string;
  work_id: string;
  supplier_id?: string | null;
  contract_id?: string | null;
  rubric_id: string;
  amount: number;
  currency: Currency;
  purchase_date: string | Date;
  date?: string | Date; // Alias for purchase_date (used in frontend)
  document_type: DocumentType;
  document_number?: string | null;
  state: ExpenseState;
  estado?: ExpenseState; // Alias for state (used in frontend)
  file_url?: string | null;
  observations?: string | null;
  is_post_closure?: boolean;
  created_by_id: string;
  validated_by_id?: string | null;
  validated_at?: string | Date | null;
  vat_amount?: number | null;
  vat_rate?: number | null;
  vat_perception?: number | null;
  vat_withholding?: number | null;
  iibb_perception?: number | null;
  income_tax_withholding?: number | null;
  created_at?: string | Date;
  updated_at?: string | Date;
  
  // Optional fields for compatibility with frontend
  description?: string; // Alias or computed field
  category?: string; // Alias for rubric name
  workId?: string; // Alias for work_id
  supplierId?: string; // Alias for supplier_id
}

export interface CreateExpenseData {
  work_id: string;
  supplier_id?: string;
  contract_id?: string;
  rubric_id: string;
  amount: number;
  currency: Currency;
  purchase_date: string;
  document_type: DocumentType;
  document_number?: string;
  state?: ExpenseState;
  file_url?: string;
  observations?: string;
  vat_amount?: number;
  vat_rate?: number;
  vat_perception?: number;
  vat_withholding?: number;
  iibb_perception?: number;
  income_tax_withholding?: number;
}

export interface UpdateExpenseData extends Partial<Omit<CreateExpenseData, 'work_id' | 'currency'>> {}

