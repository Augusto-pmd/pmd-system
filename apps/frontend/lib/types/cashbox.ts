/**
 * Tipos TypeScript para Cashbox y CashMovement del frontend
 * Basado en las entidades del backend
 */

export enum CashboxStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum CashMovementType {
  INCOME = 'income',
  EXPENSE = 'expense',
  REFILL = 'refill',
  DIFFERENCE = 'difference',
}

export enum Currency {
  ARS = 'ARS',
  USD = 'USD',
}

export interface Cashbox {
  id: string;
  opening_date: string; // ISO8601 string
  user_id: string; // UUID
  createdAt?: string;
  created_at?: string; // Backend field
  closedAt?: string;
  closed_at?: string; // Backend field
  closing_date?: string; // Backend field (snake_case)
  isClosed?: boolean;
  balance?: number; // Campo genérico para compatibilidad
  opening_balance_ars?: number; // Saldo inicial en ARS
  opening_balance_usd?: number; // Saldo inicial en USD
  closing_balance_ars?: number;
  closing_balance_usd?: number;
  difference_ars?: number;
  difference_usd?: number;
  status?: CashboxStatus | string;
  updated_at?: string; // Backend field
}

export interface CreateCashboxData {
  user_id: string; // UUID, required
  opening_date: string; // ISO8601 string, required
  status?: CashboxStatus;
  opening_balance_ars?: number;
  opening_balance_usd?: number;
}

export interface UpdateCashboxData {
  opening_date?: string;
  status?: CashboxStatus;
  opening_balance_ars?: number;
  opening_balance_usd?: number;
}

export interface CashMovement {
  id: string;
  cashboxId: string;
  cashbox_id?: string; // Backend field
  type: CashMovementType | "ingreso" | "egreso" | "income" | "expense";
  amount: number;
  currency?: Currency | "ARS" | "USD"; // Backend field
  category?: string;
  date: string;
  notes?: string;
  description?: string;
  expense_id?: string; // Backend field
  income_id?: string; // Backend field
  supplierId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Nuevos campos
  typeDocument?: "factura" | "comprobante" | null;
  invoiceNumber?: string; // obligatorio si factura
  isIncome?: boolean; // true en refuerzo
  responsible?: string; // responsable del refuerzo
  workId?: string; // obra asociada (para facturas)
  attachmentUrl?: string; // URL del archivo adjunto (comprobantes)
}

export interface CreateCashMovementData {
  cashbox_id: string; // UUID, required
  type: CashMovementType; // required
  amount: number; // required, >= 0
  currency: Currency; // required
  date: string; // ISO8601 string, required
  description?: string; // max 500 chars
  expense_id?: string; // UUID
  income_id?: string; // UUID
}

export interface UpdateCashMovementData {
  type?: CashMovementType;
  amount?: number; // >= 0
  date?: string; // ISO8601 string
  description?: string; // max 500 chars
  expense_id?: string; // UUID
  income_id?: string; // UUID
}

