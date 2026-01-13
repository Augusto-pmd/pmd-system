"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackupList } from "@/components/backups/BackupList";
import { BackupConfig } from "@/components/backups/BackupConfig";
import { BackupLogs } from "@/components/backups/BackupLogs";
import { BackupStatus } from "@/components/backups/BackupStatus";
import { BotonVolver } from "@/components/ui/BotonVolver";

function BackupsContent() {
  return (
    <div className="space-y-6">
      <div>
        <BotonVolver />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Gestión de Backups</h1>
            <p className="text-gray-600">
              Crea, descarga y gestiona los backups de la base de datos
            </p>
          </div>
        </div>
      </div>

      {/* Estado y Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BackupStatus />
        </div>
        <div>
          <BackupConfig />
        </div>
      </div>

      {/* Lista de Backups */}
      <BackupList />

      {/* Logs de Backups */}
      <BackupLogs />
    </div>
  );
}

export default function BackupsPage() {
  return (
    <ProtectedRoute>
      <BackupsContent />
    </ProtectedRoute>
  );
}

