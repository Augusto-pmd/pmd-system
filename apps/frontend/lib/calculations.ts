/**
 * Tax calculation utilities for frontend
 * Mirrors backend CalculationsService logic
 */

import { FiscalCondition } from "@/lib/types/supplier";
import { DocumentType } from "@/lib/types/expense";

export interface TaxCalculations {
  vat_perception: number;
  vat_withholding: number;
  iibb_perception: number;
  income_tax_withholding: number;
  is_auto_calculated: boolean;
  calculation_rules?: string[];
}

// Default tax rates (should match backend)
const VAT_PERCEPTION_RATE = 0.10; // 10%
const VAT_WITHHOLDING_RATE = 0.00; // 0%
const IIBB_PERCEPTION_RATE = 0.035; // 3.5%
const INCOME_TAX_WITHHOLDING_RATE = 0.00; // 0%

/**
 * Calculate perceptions and withholdings based on supplier fiscal condition and document type
 */
export function calculateTaxes(
  amount: number,
  fiscalCondition?: FiscalCondition | null,
  documentType?: DocumentType,
): TaxCalculations {
  const calculations: TaxCalculations = {
    vat_perception: 0,
    vat_withholding: 0,
    iibb_perception: 0,
    income_tax_withholding: 0,
    is_auto_calculated: true,
    calculation_rules: [],
  };

  // If no fiscal condition, return zeros
  if (!fiscalCondition) {
    calculations.calculation_rules?.push('No fiscal condition specified - no taxes calculated');
    return calculations;
  }

  // If document type is C, receipt, or VAL, no perceptions/withholdings apply
  if (
    documentType === "invoice_c" ||
    documentType === "receipt" ||
    documentType === "val"
  ) {
    calculations.calculation_rules?.push(
      `Document type ${documentType} does not require perceptions/withholdings`,
    );
    return calculations;
  }

  // Calculate based on fiscal condition
  switch (fiscalCondition) {
    case FiscalCondition.RI: // Responsable Inscripto
      // RI can have VAT perception and IIBB perception
      if (documentType === "invoice_a" || documentType === "invoice_b") {
        calculations.vat_perception = amount * VAT_PERCEPTION_RATE;
        calculations.iibb_perception = amount * IIBB_PERCEPTION_RATE;
        calculations.calculation_rules?.push(
          `RI supplier: VAT perception ${(VAT_PERCEPTION_RATE * 100).toFixed(1)}%, IIBB perception ${(IIBB_PERCEPTION_RATE * 100).toFixed(2)}%`,
        );
      }
      break;

    case FiscalCondition.MONOTRIBUTISTA:
      // Monotributistas generally don't have perceptions/withholdings
      calculations.calculation_rules?.push(
        'Monotributista supplier: No perceptions/withholdings apply',
      );
      break;

    case FiscalCondition.EXEMPT:
      // Exempt suppliers don't have perceptions/withholdings
      calculations.calculation_rules?.push(
        'Exempt supplier: No perceptions/withholdings apply',
      );
      break;

    case FiscalCondition.OTHER:
      // For "Other", apply default rates if document is A or B
      if (documentType === "invoice_a" || documentType === "invoice_b") {
        calculations.vat_perception = amount * VAT_PERCEPTION_RATE;
        calculations.iibb_perception = amount * IIBB_PERCEPTION_RATE;
        calculations.calculation_rules?.push(
          `Other fiscal condition: Applying default rates (VAT ${(VAT_PERCEPTION_RATE * 100).toFixed(1)}%, IIBB ${(IIBB_PERCEPTION_RATE * 100).toFixed(2)}%)`,
        );
      }
      break;

    default:
      calculations.calculation_rules?.push(
        `Unknown fiscal condition: ${fiscalCondition} - No taxes calculated`,
      );
  }

  // Round to 2 decimal places
  calculations.vat_perception = Math.round(calculations.vat_perception * 100) / 100;
  calculations.vat_withholding = Math.round(calculations.vat_withholding * 100) / 100;
  calculations.iibb_perception = Math.round(calculations.iibb_perception * 100) / 100;
  calculations.income_tax_withholding = Math.round(calculations.income_tax_withholding * 100) / 100;

  return calculations;
}

/**
 * Get calculation rules explanation for a given fiscal condition and document type
 */
export function getCalculationRulesExplanation(
  fiscalCondition?: FiscalCondition | null,
  documentType?: DocumentType,
): string {
  if (!fiscalCondition) {
    return 'No fiscal condition specified. No automatic calculations will be applied.';
  }

  if (
    documentType === "invoice_c" ||
    documentType === "receipt" ||
    documentType === "val"
  ) {
    return `Document type ${documentType} does not require perceptions or withholdings.`;
  }

  switch (fiscalCondition) {
    case FiscalCondition.RI:
      if (documentType === "invoice_a" || documentType === "invoice_b") {
        return `Responsable Inscripto (RI): VAT perception ${(VAT_PERCEPTION_RATE * 100).toFixed(1)}% and IIBB perception ${(IIBB_PERCEPTION_RATE * 100).toFixed(2)}% apply to invoices A and B.`;
      }
      return 'Responsable Inscripto (RI): No perceptions/withholdings apply to this document type.';
    case FiscalCondition.MONOTRIBUTISTA:
      return 'Monotributista: No perceptions or withholdings apply.';
    case FiscalCondition.EXEMPT:
      return 'Exempt: No perceptions or withholdings apply.';
    case FiscalCondition.OTHER:
      if (documentType === "invoice_a" || documentType === "invoice_b") {
        return `Other fiscal condition: Default rates apply (VAT ${(VAT_PERCEPTION_RATE * 100).toFixed(1)}%, IIBB ${(IIBB_PERCEPTION_RATE * 100).toFixed(2)}%).`;
      }
      return 'Other fiscal condition: No perceptions/withholdings apply to this document type.';
    default:
      return 'Unknown fiscal condition. No automatic calculations will be applied.';
  }
}

