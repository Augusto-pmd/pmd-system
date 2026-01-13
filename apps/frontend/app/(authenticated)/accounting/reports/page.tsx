"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAccountingPurchasesBook, useAccountingPerceptions, useAccountingWithholdings, accountingApi } from "@/hooks/api/accounting";
import { useWorks } from "@/hooks/api/works";
import { useSuppliers } from "@/hooks/api/suppliers";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { FileDown, Download, FileText, Calculator } from "lucide-react";
import { exportToExcel, exportToPDF, preparePurchasesBookData, preparePerceptionsData, prepareWithholdingsData } from "@/lib/export-utils";
import { BotonVolver } from "@/components/ui/BotonVolver";

type ReportType = "purchases" | "perceptions" | "withholdings";

function ReportsContent() {
  const [reportType, setReportType] = useState<ReportType>("purchases");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [workId, setWorkId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const { works } = useWorks();
  const { suppliers } = useSuppliers();
  const toast = useToast();

  // Fetch reports based on type
  const { purchasesBook, isLoading: isLoadingPurchases } = useAccountingPurchasesBook(
    reportType === "purchases" ? { month, year, workId: workId || undefined, supplierId: supplierId || undefined } : undefined
  );

  const { perceptions, isLoading: isLoadingPerceptions } = useAccountingPerceptions(
    reportType === "perceptions" ? { month, year, workId: workId || undefined, supplierId: supplierId || undefined } : undefined
  );

  const { withholdings, isLoading: isLoadingWithholdings } = useAccountingWithholdings(
    reportType === "withholdings" ? { month, year, workId: workId || undefined, supplierId: supplierId || undefined } : undefined
  );

  const isLoading = isLoadingPurchases || isLoadingPerceptions || isLoadingWithholdings;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const reportData = getReportData();
      if (reportData.length === 0) {
        toast.error("No hay datos para exportar");
        return;
      }

      let exportData;
      let filename = "";

      switch (reportType) {
        case "purchases":
          exportData = preparePurchasesBookData(reportData);
          filename = `libro-compras-${month}-${year}`;
          break;
        case "perceptions":
          exportData = preparePerceptionsData(reportData, perceptions || undefined);
          filename = `percepciones-${month}-${year}`;
          break;
        case "withholdings":
          exportData = prepareWithholdingsData(reportData, withholdings || undefined);
          filename = `retenciones-${month}-${year}`;
          break;
        default:
          return;
      }

      // Add filters to filename if applied
      if (workId) {
        const work = works?.find((w) => w.id === workId);
        if (work) {
          filename += `-${work.name.replace(/\s+/g, "-")}`;
        }
      }
      if (supplierId) {
        const supplier = suppliers?.find((s) => s.id === supplierId);
        if (supplier) {
          filename += `-${(supplier.name || supplier.nombre || "").replace(/\s+/g, "-")}`;
        }
      }

      await exportToExcel(exportData, filename);
      toast.success("Archivo Excel exportado correctamente");
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast.error("Error al exportar a Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportData = getReportData();
      if (reportData.length === 0) {
        toast.error("No hay datos para exportar");
        return;
      }

      let exportData;
      let filename = "";

      switch (reportType) {
        case "purchases":
          exportData = preparePurchasesBookData(reportData);
          filename = `libro-compras-${month}-${year}`;
          break;
        case "perceptions":
          exportData = preparePerceptionsData(reportData, perceptions || undefined);
          filename = `percepciones-${month}-${year}`;
          break;
        case "withholdings":
          exportData = prepareWithholdingsData(reportData, withholdings || undefined);
          filename = `retenciones-${month}-${year}`;
          break;
        default:
          return;
      }

      // Add filters to filename if applied
      if (workId) {
        const work = works?.find((w) => w.id === workId);
        if (work) {
          filename += `-${work.name.replace(/\s+/g, "-")}`;
        }
      }
      if (supplierId) {
        const supplier = suppliers?.find((s) => s.id === supplierId);
        if (supplier) {
          filename += `-${(supplier.name || supplier.nombre || "").replace(/\s+/g, "-")}`;
        }
      }

      exportToPDF(exportData, filename);
      toast.success("Archivo PDF exportado correctamente");
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      toast.error("Error al exportar a PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const getReportData = () => {
    switch (reportType) {
      case "purchases":
        return purchasesBook || [];
      case "perceptions":
        return perceptions?.records || [];
      case "withholdings":
        return withholdings?.records || [];
      default:
        return [];
    }
  };

  const getReportTotals = () => {
    switch (reportType) {
      case "perceptions":
        return {
          total_vat_perception: perceptions?.total_vat_perception || 0,
          total_iibb_perception: perceptions?.total_iibb_perception || 0,
        };
      case "withholdings":
        return {
          total_vat_withholding: withholdings?.total_vat_withholding || 0,
          total_income_tax_withholding: withholdings?.total_income_tax_withholding || 0,
        };
      default:
        return null;
    }
  };

  const reportData = getReportData();
  const totals = getReportTotals();

  return (
    <div className="space-y-6">
      <div>
        <BotonVolver />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reportes Contables</h1>
            <p className="text-gray-600">Genera y exporta reportes contables detallados</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Tipo de Reporte"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
            >
              <option value="purchases">Libro de Compras</option>
              <option value="perceptions">Percepciones</option>
              <option value="withholdings">Retenciones</option>
            </Select>

            <Select
              label="Mes"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleDateString("es-ES", { month: "long" })}
                </option>
              ))}
            </Select>

            <Select
              label="Año"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>

            <Select
              label="Obra (Opcional)"
              value={workId}
              onChange={(e) => setWorkId(e.target.value)}
            >
              <option value="">Todas las obras</option>
              {works?.map((work) => (
                <option key={work.id} value={work.id}>
                  {work.name}
                </option>
              ))}
            </Select>

            <Select
              label="Proveedor (Opcional)"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Todos los proveedores</option>
              {suppliers?.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name || supplier.nombre}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {totals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportType === "perceptions" && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Percepción IVA</p>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(totals.total_vat_perception)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Percepción IIBB</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(totals.total_iibb_perception)}</p>
                  </div>
                </>
              )}
              {reportType === "withholdings" && (
                <>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Retención IVA</p>
                    <p className="text-2xl font-bold text-orange-900">{formatCurrency(totals.total_vat_withholding)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Retención Ganancias</p>
                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(totals.total_income_tax_withholding)}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={handleExportExcel}
          disabled={isExporting || reportData.length === 0}
        >
          <FileDown className="h-4 w-4 mr-2" />
          {isExporting ? "Exportando..." : "Exportar a Excel"}
        </Button>
        <Button
          variant="outline"
          onClick={handleExportPDF}
          disabled={isExporting || reportData.length === 0}
        >
          <FileText className="h-4 w-4 mr-2" />
          {isExporting ? "Exportando..." : "Exportar a PDF"}
        </Button>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {reportType === "purchases" && "Libro de Compras"}
              {reportType === "perceptions" && "Reporte de Percepciones"}
              {reportType === "withholdings" && "Reporte de Retenciones"}
            </CardTitle>
            <Badge variant="info">{reportData.length} registros</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState message="Cargando reporte..." />
          ) : reportData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay datos para el período seleccionado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                    {reportType === "purchases" && (
                      <>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Proveedor</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Obra</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monto</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">IVA</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percepción IVA</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percepción IIBB</th>
                      </>
                    )}
                    {reportType === "perceptions" && (
                      <>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Proveedor</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Obra</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percepción IVA</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percepción IIBB</th>
                      </>
                    )}
                    {reportType === "withholdings" && (
                      <>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Proveedor</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Obra</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Retención IVA</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Retención Ganancias</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.map((record: any) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDate(record.date)}</td>
                      {reportType === "purchases" && (
                        <>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.supplier?.name || record.supplierName || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.work?.name || record.workName || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(record.amount || 0)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(record.vat_amount || 0)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(record.vat_perception || 0)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(record.iibb_perception || 0)}</td>
                        </>
                      )}
                      {reportType === "perceptions" && (
                        <>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.supplier?.name || record.supplierName || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.work?.name || record.workName || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(record.vat_perception || 0)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(record.iibb_perception || 0)}</td>
                        </>
                      )}
                      {reportType === "withholdings" && (
                        <>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.supplier?.name || record.supplierName || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record.work?.name || record.workName || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(record.vat_withholding || 0)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(record.income_tax_withholding || 0)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}

