"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OfflineItem {
  id: string;
  item_type: string;
  data: Record<string, any>;
  user_id: string;
  created_at: string;
  is_synced?: boolean;
  synced_at?: string | null;
  error_message?: string | null;
}

interface OfflineState {
  items: OfflineItem[];
  addItem: (item: Omit<OfflineItem, "id" | "created_at">) => void;
  removeItem: (id: string) => void;
  markAsSynced: (id: string) => void;
  markAsError: (id: string, error: string) => void;
  clearSynced: () => void;
  getPendingCount: () => number;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const newItem: OfflineItem = {
          ...item,
          id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          is_synced: false,
          synced_at: null,
          error_message: null,
        };

        set((state) => ({
          ...state,
          items: [...state.items, newItem],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      markAsSynced: (id) => {
        set((state) => ({
          ...state,
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  is_synced: true,
                  synced_at: new Date().toISOString(),
                  error_message: null,
                }
              : item
          ),
        }));
      },

      markAsError: (id, error) => {
        set((state) => ({
          ...state,
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  error_message: error,
                }
              : item
          ),
        }));
      },

      clearSynced: () => {
        set((state) => ({
          ...state,
          items: state.items.filter((item) => !item.is_synced),
        }));
      },

      getPendingCount: () => {
        return get().items.filter((item) => !item.is_synced).length;
      },
    }),
    {
      name: "pmd-offline-storage",
    }
  )
);

