"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SyncStatus } from "@/components/offline/SyncStatus";
import { PendingItems } from "@/components/offline/PendingItems";
import { useAllOfflineItems } from "@/hooks/api/offline";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OfflineItem } from "@/lib/types/offline-item";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

function OfflineContent() {
  const { items, isLoading, error } = useAllOfflineItems();

  if (isLoading) {
    return <LoadingState message="Cargando items offline…" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Error al cargar los items offline: {error}
      </div>
    );
  }

  const pendingItems = items.filter((item: OfflineItem) => !item.is_synced);
  const syncedItems = items.filter((item: OfflineItem) => item.is_synced);

  return (
    <div className="space-y-6">
      <div>
        <BotonVolver />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Items Offline</h1>
            <p className="text-gray-600">
              Gestiona los items creados mientras estabas sin conexión
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <SyncStatus />
          <PendingItems />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items Sincronizados ({syncedItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {syncedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay items sincronizados
                </p>
              ) : (
                <div className="space-y-3">
                  {syncedItems.slice(0, 10).map((item: OfflineItem) => (
                    <div
                      key={item.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="success">{item.item_type}</Badge>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <span className="font-medium">Acción:</span>{" "}
                              {item.data?.action || "N/A"}
                            </p>
                            {item.data?.entity && (
                              <p>
                                <span className="font-medium">Entidad:</span>{" "}
                                {item.data.entity}
                              </p>
                            )}
                            {item.synced_at && (
                              <p className="text-xs text-gray-500">
                                Sincronizado:{" "}
                                {new Date(item.synced_at).toLocaleString("es-AR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {syncedItems.length > 10 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      Mostrando 10 de {syncedItems.length} items sincronizados
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total items:</span>
                  <Badge variant="default">{items.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pendientes:</span>
                  <Badge variant="warning">{pendingItems.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Sincronizados:</span>
                  <Badge variant="success">{syncedItems.length}</Badge>
                </div>
                {items.some((item: OfflineItem) => item.error_message) && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Con errores:</span>
                    <Badge variant="error">
                      {
                        items.filter(
                          (item: OfflineItem) => item.error_message
                        ).length
                      }
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OfflinePage() {
  return (
    <ProtectedRoute>
      <OfflineContent />
    </ProtectedRoute>
  );
}

