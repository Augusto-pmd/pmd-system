"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { offlineApi } from "@/hooks/api/offline";
import { usePendingOfflineItems } from "@/hooks/api/offline";
import { RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function SyncStatus() {
  const { items, mutate } = usePendingOfflineItems();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    synced: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const result = await offlineApi.sync();

      setSyncResult({
        synced: result.synced || 0,
        failed: result.failed || 0,
        errors: result.errors || [],
      });

      // Refresh pending items
      await mutate();
    } catch (error: any) {
      setSyncResult({
        synced: 0,
        failed: items.length,
        errors: [error.message || "Error al sincronizar"],
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingCount = items.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Sincronización</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items pendientes:</span>
            <Badge variant={pendingCount > 0 ? "warning" : "success"}>
              {pendingCount}
            </Badge>
          </div>
          <Button
            onClick={handleSync}
            disabled={isSyncing || pendingCount === 0}
            loading={isSyncing}
            variant="primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Sincronizar
          </Button>
        </div>

        {syncResult && (
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {syncResult.failed === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className="font-medium">
                Sincronización completada
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Sincronizados:</span>
                <Badge variant="success" className="ml-2">
                  {syncResult.synced}
                </Badge>
              </div>
              <div>
                <span className="text-gray-600">Fallidos:</span>
                <Badge variant="error" className="ml-2">
                  {syncResult.failed}
                </Badge>
              </div>
            </div>
            {syncResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-600 mb-1">Errores:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {syncResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

