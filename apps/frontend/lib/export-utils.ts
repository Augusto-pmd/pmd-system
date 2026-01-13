/**
 * Utilities for exporting data to Excel and PDF
 */

import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
// @ts-ignore - jspdf-autotable doesn't have proper TypeScript types
import autoTable from 'jspdf-autotable';

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
  totals?: { label: string; value: number }[];
}

/**
 * Export data to Excel file
 */
export async function exportToExcel(data: ExportData, filename: string = 'reporte'): Promise<void> {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Reporte');

  let currentRow = 1;

  // Add title if provided
  if (data.title) {
    const titleRow = worksheet.getRow(currentRow);
    titleRow.getCell(1).value = data.title;
    titleRow.getCell(1).font = { size: 14, bold: true };
    titleRow.height = 20;
    worksheet.mergeCells(currentRow, 1, currentRow, data.headers.length);
    currentRow++;
    currentRow++; // Empty row
  }

  // Add headers
  const headerRow = worksheet.getRow(currentRow);
  data.headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF428BCA' }, // Blue background
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
  headerRow.height = 20;
  currentRow++;

  // Add rows
  data.rows.forEach((row) => {
    const rowObj = worksheet.getRow(currentRow);
    row.forEach((cellValue, colIndex) => {
      rowObj.getCell(colIndex + 1).value = cellValue;
    });
    // Alternate row colors for better readability
    if (currentRow % 2 === 0) {
      rowObj.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' },
      };
    }
    currentRow++;
  });

  // Add totals if provided
  if (data.totals && data.totals.length > 0) {
    currentRow++; // Empty row
    const lastNumericColIndex = data.headers.length;
    data.totals.forEach((total) => {
      const totalRow = worksheet.getRow(currentRow);
      totalRow.getCell(1).value = total.label;
      totalRow.getCell(1).font = { bold: true };
      totalRow.getCell(lastNumericColIndex).value = total.value;
      totalRow.getCell(lastNumericColIndex).numFmt = '#,##0.00';
      totalRow.getCell(lastNumericColIndex).font = { bold: true };
      currentRow++;
    });
  }

  // Set column widths
  data.headers.forEach((header, index) => {
    let maxWidth = header.length;
    data.rows.forEach((row) => {
      const cellValue = String(row[index] || '');
      if (cellValue.length > maxWidth) {
        maxWidth = cellValue.length;
      }
    });
    worksheet.getColumn(index + 1).width = Math.min(maxWidth + 2, 50); // Max width 50
  });

  // Format currency columns (detect numeric columns from headers)
  const currencyKeywords = ['monto', 'iva', 'percepción', 'retención', 'ganancias', 'iibb'];
  data.headers.forEach((header, colIndex) => {
    const headerValue = String(header).toLowerCase();
    if (currencyKeywords.some(keyword => headerValue.includes(keyword))) {
      const column = worksheet.getColumn(colIndex + 1);
      // Apply number format to all numeric cells in this column
      for (let rowIndex = (data.title ? 3 : 2); rowIndex <= currentRow; rowIndex++) {
        const cell = worksheet.getRow(rowIndex).getCell(colIndex + 1);
        if (cell.value !== null && typeof cell.value === 'number') {
          cell.numFmt = '#,##0.00'; // Number format with thousands separator and 2 decimals
        }
      }
    }
  });

  // Generate Excel file and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export data to PDF file
 */
export function exportToPDF(data: ExportData, filename: string = 'reporte'): void {
  // Create a new PDF document
  const doc = new jsPDF();

  // Add title if provided
  if (data.title) {
    doc.setFontSize(16);
    doc.text(data.title, 14, 20);
    doc.setFontSize(10);
  }

  // Prepare data for table
  const tableData = data.rows.map((row) => row.map((cell) => String(cell || '')));

  // Add table
  autoTable(doc, {
    head: [data.headers],
    body: tableData,
    startY: data.title ? 30 : 20,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 20, right: 14, bottom: 20, left: 14 },
  });

  // Add totals if provided
  if (data.totals && data.totals.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 20;
    let currentY = finalY + 10;

    data.totals.forEach((total) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(total.label, 14, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(formatCurrency(total.value), 180, currentY, { align: 'right' });
      currentY += 7;
    });
  }

  // Save PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Prepare purchases book data for export
 */
export function preparePurchasesBookData(records: any[]): ExportData {
  return {
    title: 'Libro de Compras',
    headers: ['Fecha', 'Proveedor', 'Obra', 'Monto', 'IVA', 'Percepción IVA', 'Percepción IIBB'],
    rows: records.map((record) => [
      formatDate(record.date),
      record.supplier?.name || record.supplierName || '-',
      record.work?.name || record.workName || '-',
      Number(record.amount || 0),
      Number(record.vat_amount || 0),
      Number(record.vat_perception || 0),
      Number(record.iibb_perception || 0),
    ]),
  };
}

/**
 * Prepare perceptions report data for export
 */
export function preparePerceptionsData(
  records: any[],
  totals?: { total_vat_perception: number; total_iibb_perception: number },
): ExportData {
  return {
    title: 'Reporte de Percepciones',
    headers: ['Fecha', 'Proveedor', 'Obra', 'Percepción IVA', 'Percepción IIBB'],
    rows: records.map((record) => [
      formatDate(record.date),
      record.supplier?.name || record.supplierName || '-',
      record.work?.name || record.workName || '-',
      Number(record.vat_perception || 0),
      Number(record.iibb_perception || 0),
    ]),
    totals: totals
      ? [
          { label: 'Total Percepción IVA', value: Number(totals.total_vat_perception || 0) },
          { label: 'Total Percepción IIBB', value: Number(totals.total_iibb_perception || 0) },
        ]
      : undefined,
  };
}

/**
 * Prepare withholdings report data for export
 */
export function prepareWithholdingsData(
  records: any[],
  totals?: { total_vat_withholding: number; total_income_tax_withholding: number },
): ExportData {
  return {
    title: 'Reporte de Retenciones',
    headers: ['Fecha', 'Proveedor', 'Obra', 'Retención IVA', 'Retención Ganancias'],
    rows: records.map((record) => [
      formatDate(record.date),
      record.supplier?.name || record.supplierName || '-',
      record.work?.name || record.workName || '-',
      Number(record.vat_withholding || 0),
      Number(record.income_tax_withholding || 0),
    ]),
    totals: totals
      ? [
          { label: 'Total Retención IVA', value: Number(totals.total_vat_withholding || 0) },
          { label: 'Total Retención Ganancias', value: Number(totals.total_income_tax_withholding || 0) },
        ]
      : undefined,
  };
}

/**
 * Format date for display
 */
function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateString;
  }
}

