"use client";

import { useBackupStatus } from "@/hooks/api/backups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { Activity, CheckCircle2, XCircle, Clock, Loader2, Calendar, Database } from "lucide-react";
import { Backup } from "@/lib/types/backup";

export function BackupStatus() {
  const { status, isLoading, error } = useBackupStatus();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingState message="Cargando estado..." />
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error al cargar estado</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
            year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Estado de Backups Programados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estadísticas */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{status.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{status.completed}</div>
              <div className="text-xs text-gray-600">Completados</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{status.failed}</div>
              <div className="text-xs text-gray-600">Fallidos</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {status.inProgress + status.pending}
              </div>
              <div className="text-xs text-gray-600">En progreso</div>
            </div>
          </div>
        </div>

        {/* Último backup */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Último Backup</h3>
          {status.lastBackup ? (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {status.lastBackup.type === "full" ? "Completo" : "Incremental"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(status.lastBackup.created_at)}
                  </div>
                </div>
                <Badge
                  variant={
                    status.lastBackup.status === "completed"
                      ? "success"
                      : status.lastBackup.status === "failed"
                      ? "error"
                      : "warning"
                  }
                >
                  {status.lastBackup.status === "completed"
                    ? "Completado"
                    : status.lastBackup.status === "failed"
                    ? "Fallido"
                    : "En progreso"}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay backups registrados</p>
          )}
        </div>

        {/* Último backup exitoso */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Último Backup Exitoso</h3>
          {status.lastSuccessfulBackup ? (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {status.lastSuccessfulBackup.type === "full" ? "Completo" : "Incremental"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(status.lastSuccessfulBackup.completed_at || status.lastSuccessfulBackup.created_at)}
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay backups exitosos</p>
          )}
        </div>

        {/* Tareas programadas */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Tareas Programadas
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Backup Completo Diario
                  </div>
                  <div className="text-sm text-gray-600">
                    {status.scheduledJobs.dailyFullBackup.schedule}
                  </div>
                </div>
                <Badge variant={status.scheduledJobs.dailyFullBackup.enabled ? "success" : "error"}>
                  {status.scheduledJobs.dailyFullBackup.enabled ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Backup Incremental
                  </div>
                  <div className="text-sm text-gray-600">
                    {status.scheduledJobs.incrementalBackup.schedule}
                  </div>
                </div>
                <Badge variant={status.scheduledJobs.incrementalBackup.enabled ? "success" : "error"}>
                  {status.scheduledJobs.incrementalBackup.enabled ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Limpieza Semanal
                  </div>
                  <div className="text-sm text-gray-600">
                    {status.scheduledJobs.weeklyCleanup.schedule}
                  </div>
                </div>
                <Badge variant={status.scheduledJobs.weeklyCleanup.enabled ? "success" : "error"}>
                  {status.scheduledJobs.weeklyCleanup.enabled ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

