"use client";

import { useOffline } from "@/hooks/useOffline";
import { useOfflineStore } from "@/store/offlineStore";
import { Badge } from "./Badge";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const isOffline = useOffline();
  const pendingCount = useOfflineStore((state) => state.getPendingCount());

  if (!isOffline && pendingCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isOffline ? (
        <Badge variant="warning" className="flex items-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Sin conexión</span>
        </Badge>
      ) : (
        <Badge variant="info" className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5" />
          <span>En línea</span>
        </Badge>
      )}

      {pendingCount > 0 && (
        <Badge
          variant={isOffline ? "warning" : "info"}
          className="flex items-center gap-1.5"
        >
          <span>{pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}</span>
        </Badge>
      )}
    </div>
  );
}

