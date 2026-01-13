"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { TrendingUp, DollarSign, BarChart3 } from "lucide-react";

interface ProgressIndicatorsProps {
  physicalProgress?: number;
  economicProgress?: number;
  financialProgress?: number;
  onUpdateProgress?: () => void;
  showUpdateButton?: boolean;
}

export function ProgressIndicators({
  physicalProgress = 0,
  economicProgress = 0,
  financialProgress = 0,
  onUpdateProgress,
  showUpdateButton = false,
}: ProgressIndicatorsProps) {
  const formatProgress = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  const getProgressColor = (value: number): string => {
    if (value >= 80) return "bg-green-500";
    if (value >= 50) return "bg-blue-500";
    if (value >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-pmd-darkBlue" />
            Indicadores de Avance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Physical Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">Avance Físico</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatProgress(physicalProgress)}
              </span>
            </div>
            <Progress
              value={physicalProgress}
              className="h-3"
              color={getProgressColor(physicalProgress)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Basado en etapas completadas del cronograma
            </p>
          </div>

          {/* Economic Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">Avance Económico</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatProgress(economicProgress)}
              </span>
            </div>
            <Progress
              value={economicProgress}
              className="h-3"
              color={getProgressColor(economicProgress)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Basado en ingresos recibidos vs presupuesto total
            </p>
          </div>

          {/* Financial Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-700">Avance Financiero</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatProgress(financialProgress)}
              </span>
            </div>
            <Progress
              value={financialProgress}
              className="h-3"
              color={getProgressColor(financialProgress)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Basado en ingresos recibidos vs gastos ejecutados
            </p>
          </div>

          {/* Comparison Chart */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Comparación de Avances</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600">Físico</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(physicalProgress)}}`}
                    style={{ width: `${Math.min(physicalProgress, 100)}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-right text-gray-700 font-medium">
                  {formatProgress(physicalProgress)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600">Económico</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(economicProgress)}`}
                    style={{ width: `${Math.min(economicProgress, 100)}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-right text-gray-700 font-medium">
                  {formatProgress(economicProgress)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600">Financiero</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(financialProgress)}`}
                    style={{ width: `${Math.min(financialProgress, 100)}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-right text-gray-700 font-medium">
                  {formatProgress(financialProgress)}
                </div>
              </div>
            </div>
          </div>

          {showUpdateButton && onUpdateProgress && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onUpdateProgress}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Actualizar avances
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

