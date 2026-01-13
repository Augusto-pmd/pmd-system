/**
 * ExchangeRate interface matching backend ExchangeRate entity
 * Based on pmd-backend/src/exchange-rates/exchange-rates.entity.ts
 */

export interface ExchangeRate {
  id: string;
  date: string | Date;
  rate_ars_to_usd: number;
  rate_usd_to_ars: number;
  created_by_id: string;
  created_by?: {
    id: string;
    fullName?: string;
    name?: string;
    email?: string;
  };
  created_at: string | Date;
}

export interface CreateExchangeRateData {
  date: string; // YYYY-MM-DD
  rate_ars_to_usd: number;
  rate_usd_to_ars: number;
}

export interface UpdateExchangeRateData extends Partial<CreateExchangeRateData> {}

