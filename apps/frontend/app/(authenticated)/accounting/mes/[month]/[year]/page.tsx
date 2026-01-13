"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAccountingMonth } from "@/hooks/api/accounting";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { 
  Info, 
  FileText, 
  Building2, 
  Truck, 
  Calendar, 
  DollarSign,
  Hash,
  CheckCircle2,
  XCircle,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Tag
} from "lucide-react";

function AccountingMonthContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  
  // Safely extract and parse month and year from params
  const monthStr = typeof params?.month === "string" ? params.month : null;
  const yearStr = typeof params?.year === "string" ? params.year : null;
  const month = monthStr ? parseInt(monthStr, 10) : null;
  const year = yearStr ? parseInt(yearStr, 10) : null;
  
  const { monthData, isLoading, error } = useAccountingMonth(month, year);
  
  // Guard check after all hooks
  if (!month || !year || isNaN(month) || isNaN(year)) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Parámetros de mes o año inválidos
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/accounting")}>Volver a Contabilidad</Button>
        </div>
      </>
    );
  }

  const getMonthName = (monthNum: number) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[monthNum - 1] || `Mes ${monthNum}`;
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === null || amount === undefined) return "No disponible";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getFieldIcon = (key: string) => {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('work') || keyLower.includes('obra')) return Building2;
    if (keyLower.includes('supplier') || keyLower.includes('proveedor')) return Truck;
    if (keyLower.includes('date') || keyLower.includes('fecha')) return Calendar;
    if (keyLower.includes('amount') || keyLower.includes('monto') || keyLower.includes('total')) return DollarSign;
    if (keyLower.includes('number') || keyLower.includes('numero') || keyLower.includes('id')) return Hash;
    if (keyLower.includes('status') || keyLower.includes('estado')) return Tag;
    if (keyLower.includes('email') || keyLower.includes('correo')) return Mail;
    if (keyLower.includes('phone') || keyLower.includes('telefono')) return Phone;
    if (keyLower.includes('address') || keyLower.includes('direccion')) return MapPin;
    if (keyLower.includes('name') || keyLower.includes('nombre')) return User;
    if (keyLower.includes('description') || keyLower.includes('descripcion') || keyLower.includes('notes')) return FileText;
    return Info;
  };

  // Campos relevantes a mostrar en objetos de contabilidad
  const getRelevantFields = (obj: Record<string, any>): string[] => {
    const relevantFields = [
      'id',
      'accounting_type',
      'expense_id',
      'work_id',
      'supplier_id',
      'amount',
      'total',
      'monto',
      'date',
      'fecha',
      'status',
      'estado',
      'currency',
      'moneda',
      'description',
      'descripcion',
      'created_at',
      'updated_at'
    ];
    
    // Retornar solo los campos que existen en el objeto y están en la lista de relevantes
    return Object.keys(obj).filter(key => 
      relevantFields.some(relevant => key.toLowerCase().includes(relevant.toLowerCase()))
    );
  };

  const formatValue = (value: any, key: string, depth: number = 0, showOnlyRelevant: boolean = false): React.ReactNode => {
    if (value === null || value === undefined) {
      return (
        <span className="inline-flex items-center gap-1 text-gray-400 italic">
          <XCircle className="h-3 w-3" />
          No disponible
        </span>
      );
    }

    if (typeof value === "number") {
      if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('monto') || key.toLowerCase().includes('total') || key.toLowerCase().includes('budget')) {
        return (
          <span className="font-semibold text-green-600">
            {formatCurrency(value)}
          </span>
        );
      }
      return <span className="font-medium">{value.toLocaleString('es-AR')}</span>;
    }

    if (typeof value === "boolean") {
      return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {value ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {value ? "Sí" : "No"}
        </span>
      );
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return (
            <span className="text-gray-400 italic text-sm">Lista vacía</span>
          );
        }
        return (
          <div className="space-y-2 mt-2">
            {value.map((item, index) => (
              <div 
                key={index} 
                className={`pl-4 border-l-3 ${
                  depth % 2 === 0 ? 'border-blue-300 bg-blue-50/30' : 'border-purple-300 bg-purple-50/30'
                } rounded-r-md py-2`}
              >
                <div className="text-xs font-medium text-gray-500 mb-1">Item {index + 1}</div>
                {formatValue(item, `${key}[${index}]`, depth + 1, showOnlyRelevant)}
              </div>
            ))}
          </div>
        );
      }

      // Para objetos, mostrar solo campos relevantes si showOnlyRelevant es true
      const entries = showOnlyRelevant 
        ? getRelevantFields(value).map(field => [field, value[field]])
        : Object.entries(value);

      if (entries.length === 0) {
        return (
          <span className="text-gray-400 italic text-sm">Sin datos relevantes</span>
        );
      }

      return (
        <div className={`space-y-2 mt-2 ${depth > 0 ? 'pl-2' : ''}`}>
          {entries.map(([objKey, objValue]) => {
            const Icon = getFieldIcon(objKey);
            const isNestedObject = typeof objValue === 'object' && objValue !== null && !Array.isArray(objValue);
            
            return (
              <div 
                key={objKey} 
                className={`p-2.5 rounded-lg border ${
                  isNestedObject 
                    ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200' 
                    : 'bg-white border-gray-200'
                } hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-3.5 w-3.5 text-gray-500" />
                  <div className="text-xs font-semibold text-gray-700 capitalize">
                    {objKey.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </div>
                </div>
                <div className="text-gray-900 ml-5 text-sm">
                  {formatValue(objValue, objKey, depth + 1, showOnlyRelevant)}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Para strings y otros tipos
    const stringValue = String(value);
    if (stringValue.length > 100) {
      return (
        <div className="space-y-1">
          <p className="text-sm text-gray-900 line-clamp-2">{stringValue}</p>
          <span className="text-xs text-gray-500">{stringValue.length} caracteres</span>
        </div>
      );
    }
    return <span className="text-sm">{stringValue}</span>;
  };

  if (isLoading) {
    return (
      <LoadingState message="Cargando datos del mes…" />
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar los datos del mes: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/accounting")}>Volver a Contabilidad</Button>
        </div>
      </>
    );
  }

  if (!monthData || (typeof monthData === "object" && Object.keys(monthData).length === 0)) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          No hay datos disponibles para este mes
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/accounting")}>Volver a Contabilidad</Button>
        </div>
      </>
    );
  }

  const data = monthData && typeof monthData === "object" ? monthData : {};

  return (
    <div className="space-y-6">
        <div>
          <BotonVolver backTo="/accounting" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">
              Detalle de Contabilidad — {month ? getMonthName(month) : ""} {year}
            </h1>
            <p className="text-gray-600">Información contable del período seleccionado</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/accounting")}>
            Volver a Contabilidad
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.ingresos !== undefined && (
            <Card className="border-l-4 border-green-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Ingresos</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.ingresos)}</p>
              </CardContent>
            </Card>
          )}

          {data.egresos !== undefined && (
            <Card className="border-l-4 border-red-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Egresos</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.egresos)}</p>
              </CardContent>
            </Card>
          )}

          {data.ivaCompras !== undefined && (
            <Card className="border-l-4 border-blue-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">IVA Compras</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.ivaCompras)}</p>
              </CardContent>
            </Card>
          )}

          {data.ivaVentas !== undefined && (
            <Card className="border-l-4 border-blue-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">IVA Ventas</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.ivaVentas)}</p>
              </CardContent>
            </Card>
          )}

          {data.percepciones !== undefined && (
            <Card className="border-l-4 border-purple-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Percepciones</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.percepciones)}</p>
              </CardContent>
            </Card>
          )}

          {data.retenciones !== undefined && (
            <Card className="border-l-4 border-purple-500">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Retenciones</h3>
                <p className="text-2xl font-bold text-pmd-darkBlue">{formatCurrency(data.retenciones)}</p>
              </CardContent>
            </Card>
          )}

          {data.totalGeneral !== undefined && (
            <Card className="border-l-4 border-pmd-gold">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total General</h3>
                <p
                  className={`text-2xl font-bold ${
                    (data.totalGeneral || 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(data.totalGeneral)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mostrar otros campos si existen */}
        {Object.keys(data).some(
          (key) =>
            ![
              "ingresos",
              "egresos",
              "ivaCompras",
              "ivaVentas",
              "percepciones",
              "retenciones",
              "totalGeneral",
            ].includes(key) &&
            data[key] !== null &&
            data[key] !== undefined &&
            data[key] !== ""
        ) && (
          <Card className="shadow-lg border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-r from-pmd-darkBlue to-blue-700 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <Info className="h-6 w-6 mx-[10px]" />
                <CardTitle 
                  className="text-xl font-bold"
                  style={{
                    color: 'var(--apple-button-active)',
                    fontSize: '25px',
                    paddingTop: '10px',
                    paddingBottom: '10px'
                  }}
                >
                  Información Adicional
                </CardTitle>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                Detalles adicionales del registro contable
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 m-0">
                {Object.keys(data)
                  .filter(
                    (key) =>
                      ![
                        "ingresos",
                        "egresos",
                        "ivaCompras",
                        "ivaVentas",
                        "percepciones",
                        "retenciones",
                        "totalGeneral",
                      ].includes(key) &&
                      data[key] !== null &&
                      data[key] !== undefined &&
                      data[key] !== ""
                  )
                  .map((key) => {
                    const Icon = getFieldIcon(key);
                    const isObject = typeof data[key] === 'object' && data[key] !== null;
                    
                    return (
                      <div 
                        key={key} 
                        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                          isObject
                            ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-400 hover:shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                        }`}
                      >
                        <div className={`p-5 ${isObject ? 'bg-gradient-to-r from-blue-50 to-transparent' : ''}`}>
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
                            <div className={`p-2 rounded-lg ${
                              isObject 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-gray-800 capitalize flex-1">
                              {key.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </h3>
                            {isObject && (
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                Objeto
                              </span>
                            )}
                          </div>
                          <div className="text-gray-900 min-h-[40px]">
                            {formatValue(data[key], key, 0, isObject)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}

export default function AccountingMonthPage() {
  return (
    <ProtectedRoute>
      <AccountingMonthContent />
    </ProtectedRoute>
  );
}

