"use client";

import { useBackups } from "@/hooks/api/backups";
import { Backup, BackupType, BackupStatus } from "@/lib/types/backup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Download, Trash2, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { backupsApi } from "@/hooks/api/backups";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";

export function BackupList() {
  const { backups, isLoading, error, mutate } = useBackups();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const isAdministration = user?.role?.name === "ADMINISTRATION" || user?.role?.name === "administration";
  const isDirection = user?.role?.name === "DIRECTION" || user?.role?.name === "direction";
  const canManage = isAdministration || isDirection;

  const handleDownload = async (backup: Backup) => {
    try {
      const blob = await backupsApi.download(backup.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = backup.file_path.split("/").pop() || `backup-${backup.id}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Backup descargado correctamente");
    } catch (error: any) {
      toast.error(error.message || "Error al descargar el backup");
    }
  };

  const handleDelete = async (backup: Backup) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar este backup?`)) {
      return;
    }

    try {
      await backupsApi.delete(backup.id);
      toast.success("Backup eliminado correctamente");
      await mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al eliminar el backup");
    }
  };

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
          <LoadingState message="Cargando backups..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error al cargar backups</p>
        </CardContent>
      </Card>
    );
  }

  if (backups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Backups</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No hay backups disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Backups ({backups.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Tamaño</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Creado por</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backups.map((backup: Backup) => (
              <TableRow key={backup.id}>
                <TableCell>
                  <Badge variant="default">
                    {backup.type === BackupType.FULL ? "Completo" : "Incremental"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(backup.status)}
                    {getStatusBadge(backup.status)}
                  </div>
                </TableCell>
                <TableCell>{formatFileSize(backup.file_size)}</TableCell>
                <TableCell>
                  {new Date(backup.created_at).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  {backup.created_by?.fullName || backup.created_by?.name || "Sistema"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {backup.status === BackupStatus.COMPLETED && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(backup)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {canManage && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(backup)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

