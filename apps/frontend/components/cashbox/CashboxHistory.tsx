"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cashboxApi } from "@/hooks/api/cashboxes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { FormField } from "@/components/ui/FormField";

interface CashboxHistoryProps {
  cashboxId: string;
}

interface HistoryItem {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  created_at: string;
  expense?: any;
  income?: any;
}

interface HistoryResponse {
  data: HistoryItem[];
  total: number;
  page: number;
  limit: number;
  summary: {
    totalRefills: number;
    totalExpenses: number;
    totalIncomes: number;
    totalRefillsAmount: number;
    totalExpensesAmount: number;
    totalIncomesAmount: number;
  };
}

export function CashboxHistory({ cashboxId }: CashboxHistoryProps) {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({
    type: "",
    currency: "",
    startDate: "",
    endDate: "",
  });
  const toast = useToast();
  const isFetchingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchParamsRef = useRef<string>("");

  const fetchHistory = useCallback(async () => {
    if (!cashboxId || isFetchingRef.current) return;
    
    // Crear una clave única para esta petición basada en los parámetros
    const fetchKey = JSON.stringify({ cashboxId, page, limit, filters });
    
    // Si los parámetros no han cambiado, no hacer la petición
    if (lastFetchParamsRef.current === fetchKey) {
      return;
    }
    
    isFetchingRef.current = true;
    lastFetchParamsRef.current = fetchKey;
    setIsLoading(true);
    try {
      const response = await cashboxApi.getHistory(cashboxId, {
        page,
        limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.currency && { currency: filters.currency }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      }) as any;
      
      // El backend devuelve directamente el objeto con data, total, page, limit, summary
      // No está envuelto en otro objeto data
      const historyData = response?.data || response;
      
      // Verificar que tenga la estructura esperada
      if (historyData && (Array.isArray(historyData.data) || historyData.total !== undefined)) {
        setHistory(historyData as HistoryResponse);
      } else {
        // Si la respuesta no tiene la estructura esperada, intentar construirla
        if (Array.isArray(historyData)) {
          setHistory({
            data: historyData,
            total: historyData.length,
            page: 1,
            limit: historyData.length,
            summary: {
              totalRefills: 0,
              totalExpenses: 0,
              totalIncomes: 0,
              totalRefillsAmount: 0,
              totalExpensesAmount: 0,
              totalIncomesAmount: 0,
            },
          });
        } else {
          setHistory(null);
        }
      }
    } catch (error: any) {
      // Solo mostrar error si no es un error 429 (Too Many Requests)
      if (error?.response?.status !== 429) {
        const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar historial";
        toast.error(errorMessage);
      }
      // No limpiar history en caso de error 429 para mantener los datos anteriores
      if (error?.response?.status !== 429) {
        setHistory(null);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [cashboxId, page, limit, filters, toast]);

  // Efecto para manejar cambios en filtros con debounce
  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Resetear página cuando cambian los filtros (excepto en el primer render)
    if (page !== 1) {
      setPage(1);
      return;
    }
    
    // Debounce de 500ms para filtros
    debounceTimerRef.current = setTimeout(() => {
      fetchHistory();
    }, 500);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [cashboxId, filters.type, filters.currency, filters.startDate, filters.endDate, fetchHistory, page]);

  // Fetch inmediato cuando cambia la página o el límite (sin debounce)
  useEffect(() => {
    // Evitar fetch en el primer render si ya se ejecutó el efecto de filtros
    if (page === 1 && debounceTimerRef.current) {
      return;
    }
    fetchHistory();
  }, [page, limit, fetchHistory]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      refill: "Refuerzo",
      expense: "Egreso",
      income: "Ingreso",
    };
    return typeMap[type.toLowerCase()] || type;
  };

  const getTypeBadgeVariant = (type: string) => {
    if (type.toLowerCase() === "refill" || type.toLowerCase() === "income") {
      return "success";
    }
    return "error";
  };

  const totalPages = history ? Math.ceil(history.total / limit) : 0;

  const handleResetFilters = () => {
    setFilters({
      type: "",
      currency: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial Detallado</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
          <FormField label="Tipo">
            <Select
              value={filters.type}
              onChange={(e) => {
                setFilters({ ...filters, type: e.target.value });
                setPage(1);
              }}
            >
              <option value="">Todos</option>
              <option value="refill">Refuerzo</option>
              <option value="expense">Egreso</option>
              <option value="income">Ingreso</option>
            </Select>
          </FormField>

          <FormField label="Moneda">
            <Select
              value={filters.currency}
              onChange={(e) => {
                setFilters({ ...filters, currency: e.target.value });
                setPage(1);
              }}
            >
              <option value="">Todas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </Select>
          </FormField>

          <FormField label="Fecha desde">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value });
                setPage(1);
              }}
            />
          </FormField>

          <FormField label="Fecha hasta">
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value });
                setPage(1);
              }}
            />
          </FormField>
        </div>

        <div style={{ display: "flex", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
          <Button variant="outline" onClick={handleResetFilters}>
            Limpiar Filtros
          </Button>
        </div>

        {/* Resumen */}
        {history?.summary && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--space-md)", marginBottom: "var(--space-lg)", padding: "var(--space-md)", backgroundColor: "var(--apple-surface)", borderRadius: "var(--radius-md)" }}>
            <div>
              <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                Refuerzos
              </div>
              <div style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)" }}>
                {history.summary.totalRefills}
              </div>
              <div style={{ font: "var(--font-body)", color: "rgba(52, 199, 89, 1)" }}>
                {formatCurrency(history.summary.totalRefillsAmount)}
              </div>
            </div>
            <div>
              <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                Egresos
              </div>
              <div style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)" }}>
                {history.summary.totalExpenses}
              </div>
              <div style={{ font: "var(--font-body)", color: "rgba(255, 59, 48, 1)" }}>
                {formatCurrency(history.summary.totalExpensesAmount)}
              </div>
            </div>
            <div>
              <div style={{ font: "var(--font-label)", color: "var(--apple-text-secondary)", marginBottom: "var(--space-xs)" }}>
                Ingresos
              </div>
              <div style={{ font: "var(--font-card-title)", color: "var(--apple-text-primary)" }}>
                {history.summary.totalIncomes}
              </div>
              <div style={{ font: "var(--font-body)", color: "rgba(52, 199, 89, 1)" }}>
                {formatCurrency(history.summary.totalIncomesAmount)}
              </div>
            </div>
          </div>
        )}

        {/* Lista de movimientos */}
        {isLoading ? (
          <LoadingState message="Cargando historial..." />
        ) : !history?.data || history.data.length === 0 ? (
          <EmptyState
            title="No hay movimientos en el historial"
            description="No se encontraron movimientos con los filtros aplicados"
          />
        ) : (
          <>
            <div style={{ overflowX: "auto", marginBottom: "var(--space-md)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--apple-border-strong)", backgroundColor: "var(--apple-surface)" }}>
                    <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                      Fecha
                    </th>
                    <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                      Tipo
                    </th>
                    <th style={{ padding: "14px 16px", textAlign: "right", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                      Monto
                    </th>
                    <th style={{ padding: "14px 16px", textAlign: "left", font: "var(--font-label)", color: "var(--apple-text-secondary)" }}>
                      Descripción
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.data.map((item) => {
                    const isIncome = item.type.toLowerCase() === "refill" || item.type.toLowerCase() === "income";
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: "1px solid var(--apple-border)",
                          transition: "background-color var(--apple-duration-fast) var(--apple-ease)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "var(--apple-hover)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td style={{ padding: "12px 16px", font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                          {formatDate(item.date)}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge variant={getTypeBadgeVariant(item.type)}>
                            {getTypeLabel(item.type)}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", font: "var(--font-body)", fontWeight: 600, color: isIncome ? "rgba(52, 199, 89, 1)" : "rgba(255, 59, 48, 1)" }}>
                          {isIncome ? "+" : "-"} {formatCurrency(item.amount, item.currency)}
                        </td>
                        <td style={{ padding: "12px 16px", font: "var(--font-body)", color: "var(--apple-text-secondary)", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {(() => {
                            let descriptionText = item.description || "-";
                            if (descriptionText !== "-") {
                              // Remover "Responsable: [name] | " de la descripción para movimientos de ingreso
                              if (isIncome) {
                                const responsibleMatch = descriptionText.match(/Responsable:\s*[^|]+\s*\|\s*(.*)/);
                                if (responsibleMatch && responsibleMatch[1]) {
                                  descriptionText = responsibleMatch[1].trim();
                                } else {
                                  // Si solo hay "Responsable: [name]" sin otras notas
                                  const onlyResponsibleMatch = descriptionText.match(/Responsable:\s*[^|]+/);
                                  if (onlyResponsibleMatch && onlyResponsibleMatch[0] === descriptionText.trim()) {
                                    descriptionText = "-"; // Mostrar como vacío si solo hay responsable
                                  }
                                }
                              }
                            }
                            return descriptionText;
                          })()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "var(--space-md)", borderTop: "1px solid var(--apple-border)" }}>
                <div style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
                  Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, history.total)} de {history.total} movimientos
                </div>
                <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <div style={{ display: "flex", alignItems: "center", padding: "0 var(--space-md)", font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                    Página {page} de {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

