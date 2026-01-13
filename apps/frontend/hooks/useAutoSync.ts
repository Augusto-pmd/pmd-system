"use client";

import { useEffect, useRef } from "react";
import { useOffline } from "./useOffline";
import { useOfflineStore } from "@/store/offlineStore";
import { offlineApi } from "./api/offline";
import { useAuthStore } from "@/store/authStore";

/**
 * Hook para sincronizar automáticamente items offline cuando vuelve la conexión
 */
export function useAutoSync() {
  const isOffline = useOffline();
  const pendingCount = useOfflineStore((state) => state.getPendingCount());
  const items = useOfflineStore((state) => state.items);
  const markAsSynced = useOfflineStore((state) => state.markAsSynced);
  const markAsError = useOfflineStore((state) => state.markAsError);
  const removeItem = useOfflineStore((state) => state.removeItem);
  const user = useAuthStore((state) => state.user);
  const isSyncingRef = useRef(false);
  const lastSyncTimeRef = useRef<number>(0);

  useEffect(() => {
    // Solo sincronizar si:
    // 1. Estamos online
    // 2. Hay items pendientes
    // 3. Hay un usuario autenticado
    // 4. No estamos sincronizando ya
    // 5. Han pasado al menos 2 segundos desde la última sincronización
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTimeRef.current;

    if (
      !isOffline &&
      pendingCount > 0 &&
      user &&
      !isSyncingRef.current &&
      timeSinceLastSync > 2000
    ) {
      isSyncingRef.current = true;
      lastSyncTimeRef.current = now;

      const syncItems = async () => {
        try {
          // Obtener items pendientes del store local
          const pendingItems = items.filter((item) => !item.is_synced);

          if (pendingItems.length === 0) {
            isSyncingRef.current = false;
            return;
          }

          // Primero, enviar todos los items al backend para que se guarden
          const syncPromises = pendingItems.map(async (item) => {
            try {
              await offlineApi.create({
                item_type: item.item_type,
                data: item.data,
              });
              return { success: true, itemId: item.id };
            } catch (error: any) {
              const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Error al sincronizar";
              markAsError(item.id, errorMessage);
              return { success: false, itemId: item.id, error: errorMessage };
            }
          });

          await Promise.allSettled(syncPromises);

          // Luego, ejecutar la sincronización masiva en el backend
          try {
            const syncResult = await offlineApi.sync();
            
            // Marcar como sincronizados los items que se sincronizaron exitosamente
            if (syncResult.synced > 0) {
              // Los items sincronizados serán marcados por el backend
              // Aquí solo removemos los items del store local que ya fueron sincronizados
              pendingItems.forEach((item) => {
                // El backend manejará el estado de sincronización
                // Por ahora, solo marcamos como sincronizado si no hay error
                if (!item.error_message) {
                  markAsSynced(item.id);
                }
              });
            }
          } catch (error) {
            console.error("Error en sincronización masiva:", error);
          }
        } catch (error) {
          console.error("Error en sincronización automática:", error);
        } finally {
          isSyncingRef.current = false;
        }
      };

      // Ejecutar sincronización con un pequeño delay para asegurar que la conexión está estable
      const timeoutId = setTimeout(syncItems, 1000);

      return () => {
        clearTimeout(timeoutId);
      };
    }

    // Resetear el flag cuando vuelve a estar offline
    if (isOffline) {
      isSyncingRef.current = false;
    }
  }, [isOffline, pendingCount, user, items, markAsSynced, markAsError, removeItem]);
}

