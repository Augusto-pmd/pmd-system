"use client";

import { useBackupLogs } from "@/hooks/api/backups";
import { Backup, BackupType, BackupStatus } from "@/lib/types/backup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/LoadingState";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";

export function BackupLogs() {
  const { logs, isLoading, error } = useBackupLogs();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getStatusIcon = (status: BackupStatus) => {
    switch (status) {
      case BackupStatus.COMPLETED:
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case BackupStatus.FAILED:
        return <XCircle className="w-4 h-4 text-red-600" />;
      case BackupStatus.IN_PROGRESS:
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: BackupStatus) => {
    switch (status) {
      case BackupStatus.COMPLETED:
        return <Badge variant="success">Completado</Badge>;
      case BackupStatus.FAILED:
        return <Badge variant="error">Fallido</Badge>;
      case BackupStatus.IN_PROGRESS:
        return <Badge variant="info">En progreso</Badge>;
      default:
        return <Badge variant="warning">Pendiente</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <LoadingState message="Cargando logs..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error al cargar logs</p>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs de Backups (Últimos 50)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No hay logs disponibles</p>
        </CardContent>
      </Card>
    );
  }

  // Check for failed backups to show alert
  const failedBackups = logs.filter((log: Backup) => log.status === BackupStatus.FAILED);
  const recentFailed = failedBackups.filter((log: Backup) => {
    const logDate = new Date(log.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24; // Failed in last 24 hours
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Logs de Backups (Últimos 50)</span>
          {recentFailed.length > 0 && (
            <Badge variant="error" className="flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {recentFailed.length} fallo{recentFailed.length > 1 ? "s" : ""} reciente{recentFailed.length > 1 ? "s" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentFailed.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Alerta: {recentFailed.length} backup{recentFailed.length > 1 ? "s" : ""} falló{recentFailed.length > 1 ? "ron" : ""} en las últimas 24 horas
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Revisa los detalles a continuación para más información
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Iniciado</TableHead>
                <TableHead>Completado</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log: Backup) => {
                const startedAt = log.started_at ? new Date(log.started_at) : null;
                const completedAt = log.completed_at ? new Date(log.completed_at) : null;
                const duration = startedAt && completedAt
                  ? Math.round((completedAt.getTime() - startedAt.getTime()) / 1000) // seconds
                  : null;

                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="default">
                        {log.type === BackupType.FULL ? "Completo" : "Incremental"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        {getStatusBadge(log.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatFileSize(log.file_size)}</TableCell>
                    <TableCell>
                      {startedAt
                        ? startedAt.toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {completedAt
                        ? completedAt.toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {duration !== null
                        ? `${duration}s`
                        : log.status === BackupStatus.IN_PROGRESS
                        ? "En curso..."
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {log.error_message ? (
                        <div className="max-w-xs">
                          <p className="text-xs text-red-600 truncate" title={log.error_message}>
                            {log.error_message}
                          </p>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

