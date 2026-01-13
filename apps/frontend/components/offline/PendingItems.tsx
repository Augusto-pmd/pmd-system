"use client";

import { usePendingOfflineItems } from "@/hooks/api/offline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OfflineItem } from "@/lib/types/offline-item";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

export function PendingItems() {
  const { items, isLoading, error } = usePendingOfflineItems();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Cargando items pendientes...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error al cargar items pendientes</p>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Items Pendientes</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No hay items pendientes de sincronización</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Items Pendientes ({items.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item: OfflineItem) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="warning">{item.item_type}</Badge>
                    {item.error_message && (
                      <Badge variant="error">Error</Badge>
                    )}
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
                    {item.error_message && (
                      <p className="text-red-600">
                        <span className="font-medium">Error:</span>{" "}
                        {item.error_message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Creado:{" "}
                      {new Date(item.created_at).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.is_synced ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : item.error_message ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

