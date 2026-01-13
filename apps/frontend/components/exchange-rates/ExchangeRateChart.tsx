"use client";

import { useExchangeRates } from "@/hooks/api/exchange-rates";
import { Card, CardContent } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMemo } from "react";

interface ExchangeRateChartProps {
  height?: number;
  showLegend?: boolean;
}

export function ExchangeRateChart({ height = 300, showLegend = true }: ExchangeRateChartProps) {
  const { exchangeRates, isLoading, error } = useExchangeRates();

  const chartData = useMemo(() => {
    if (!exchangeRates || exchangeRates.length === 0) return null;

    // Ordenar por fecha (más antiguo a más reciente)
    const sorted = [...exchangeRates].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    return sorted.map((rate) => ({
      date: new Date(rate.date),
      dateStr: new Date(rate.date).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      }),
      rateUsdToArs: Number(rate.rate_usd_to_ars),
      rateArsToUsd: Number(rate.rate_ars_to_usd),
    }));
  }, [exchangeRates]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingState message="Cargando datos del gráfico…" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600 text-sm">
            Error al cargar los datos: {String(error)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p className="text-sm">No hay datos suficientes para mostrar el gráfico</p>
            <p className="text-xs mt-2">Se necesitan al menos 2 tipos de cambio registrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length < 2) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p className="text-sm">Se necesitan al menos 2 tipos de cambio para mostrar el gráfico</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular estadísticas
  const rates = chartData.map((d) => d.rateUsdToArs);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const firstRate = rates[0];
  const lastRate = rates[rates.length - 1];
  const trend = lastRate > firstRate ? "up" : lastRate < firstRate ? "down" : "stable";
  const changePercent = ((lastRate - firstRate) / firstRate) * 100;

  // Dimensiones del gráfico
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = 800;
  const chartHeight = height;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Escalas
  const xScale = (index: number) => {
    return padding.left + (index / (chartData.length - 1)) * innerWidth;
  };

  const yScale = (value: number) => {
    const range = maxRate - minRate || 1;
    const normalized = (value - minRate) / range;
    return padding.top + innerHeight - normalized * innerHeight;
  };

  // Generar puntos para la línea
  const points = chartData.map((data, index) => ({
    x: xScale(index),
    y: yScale(data.rateUsdToArs),
    ...data,
  }));

  // Generar path para la línea
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  // Generar área bajo la curva
  const areaPath = `
    ${pathData}
    L ${points[points.length - 1].x} ${padding.top + innerHeight}
    L ${points[0].x} ${padding.top + innerHeight}
    Z
  `;

  // Generar puntos de datos (cada 3 puntos o al inicio/fin)
  const visiblePoints = points.filter((_, index) => {
    return (
      index === 0 ||
      index === points.length - 1 ||
      index % Math.max(1, Math.floor(points.length / 8)) === 0
    );
  });

  // Generar líneas de grid
  const gridLines = 5;
  const gridYPositions = Array.from({ length: gridLines }, (_, i) => {
    const value = minRate + ((maxRate - minRate) * i) / (gridLines - 1);
    return {
      y: yScale(value),
      value: value.toFixed(2),
    };
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header con estadísticas */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Evolución del Tipo de Cambio</h3>
              <p className="text-sm text-gray-500">USD a ARS</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Cambio total</p>
                <div className="flex items-center gap-1">
                  {trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
                  {trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
                  <span
                    className={`text-sm font-semibold ${
                      trend === "up"
                        ? "text-green-600"
                        : trend === "down"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {changePercent > 0 ? "+" : ""}
                    {changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Rango</p>
                <p className="text-sm font-semibold text-gray-900">
                  {minRate.toFixed(2)} - {maxRate.toFixed(2)} ARS
                </p>
              </div>
            </div>
          </div>

          {/* Gráfico SVG */}
          <div className="overflow-x-auto">
            <svg
              width={chartWidth}
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full"
            >
              {/* Grid lines */}
              {gridYPositions.map((grid, index) => (
                <g key={index}>
                  <line
                    x1={padding.left}
                    y1={grid.y}
                    x2={padding.left + innerWidth}
                    y2={grid.y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  <text
                    x={padding.left - 10}
                    y={grid.y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#6b7280"
                  >
                    {grid.value}
                  </text>
                </g>
              ))}

              {/* Área bajo la curva */}
              <path
                d={areaPath}
                fill="url(#gradient)"
                opacity="0.2"
              />

              {/* Definición del gradiente */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Línea principal */}
              <path
                d={pathData}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Puntos de datos visibles */}
              {visiblePoints.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Tooltip trigger area */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill="transparent"
                    className="cursor-pointer hover:fill-blue-100"
                    opacity="0"
                  />
                </g>
              ))}

              {/* Eje X - Fechas */}
              {visiblePoints.map((point, index) => (
                <g key={`x-axis-${index}`}>
                  <line
                    x1={point.x}
                    y1={padding.top + innerHeight}
                    x2={point.x}
                    y2={padding.top + innerHeight + 5}
                    stroke="#6b7280"
                    strokeWidth="1"
                  />
                  <text
                    x={point.x}
                    y={padding.top + innerHeight + 20}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#6b7280"
                    transform={`rotate(-45 ${point.x} ${padding.top + innerHeight + 20})`}
                  >
                    {point.dateStr}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Leyenda */}
          {showLegend && (
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500"></div>
                <span className="text-xs text-gray-600">USD → ARS</span>
              </div>
              <div className="text-xs text-gray-500">
                {chartData.length} punto{chartData.length !== 1 ? "s" : ""} de datos
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

