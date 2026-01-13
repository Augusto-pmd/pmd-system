"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { BackupType } from "@/lib/types/backup";
import { backupsApi } from "@/hooks/api/backups";
import { useBackups } from "@/hooks/api/backups";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { Database, Settings, Trash2 } from "lucide-react";

export function BackupConfig() {
  const [backupType, setBackupType] = useState<BackupType>(BackupType.FULL);
  const [isCreating, setIsCreating] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState("30");
  const [isCleaning, setIsCleaning] = useState(false);
  const toast = useToast();
  const { mutate } = useBackups();
  const user = useAuthStore((state) => state.user);
  const isAdministration = user?.role?.name === "ADMINISTRATION" || user?.role?.name === "administration";
  const isDirection = user?.role?.name === "DIRECTION" || user?.role?.name === "direction";
  const canManage = isAdministration || isDirection;

  const handleCreateBackup = async () => {
    if (!canManage) {
      toast.error("Solo Administración y Dirección pueden crear backups");
      return;
    }

    setIsCreating(true);
    try {
      await backupsApi.create({ type: backupType });
      toast.success(
        `Backup ${backupType === BackupType.FULL ? "completo" : "incremental"} iniciado correctamente`
      );
      await mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al crear el backup");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCleanup = async () => {
    if (!canManage) {
      toast.error("Solo Administración y Dirección pueden limpiar backups");
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar backups más antiguos de ${daysToKeep} días?`)) {
      return;
    }

    setIsCleaning(true);
    try {
      const result = await backupsApi.cleanup({ daysToKeep: parseInt(daysToKeep) });
      toast.success(`${result.deleted} backups eliminados`);
      await mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al limpiar backups");
    } finally {
      setIsCleaning(false);
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Configuración de Backups
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Crear Backup */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Crear Backup
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Tipo de backup"
              value={backupType}
              onChange={(e) => setBackupType(e.target.value as BackupType)}
            >
              <option value={BackupType.FULL}>Completo</option>
              <option value={BackupType.INCREMENTAL}>Incremental</option>
            </Select>
            <div className="flex items-end">
              <Button
                onClick={handleCreateBackup}
                loading={isCreating}
                disabled={isCreating}
                variant="primary"
                className="w-full"
              >
                Crear Backup
              </Button>
            </div>
          </div>
        </div>

        {/* Limpiar Backups Antiguos */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Limpiar Backups Antiguos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Días a conservar"
              type="number"
              value={daysToKeep}
              onChange={(e) => setDaysToKeep(e.target.value)}
              min="1"
              placeholder="30"
            />
            <div className="flex items-end">
              <Button
                onClick={handleCleanup}
                loading={isCleaning}
                disabled={isCleaning}
                variant="danger"
                className="w-full"
              >
                Limpiar Backups
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Se eliminarán todos los backups completados más antiguos que el número de días especificado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

