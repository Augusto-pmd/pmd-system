/**
 * OfflineItem interface matching backend OfflineItem entity
 * Based on pmd-backend/src/offline/offline-items.entity.ts
 */

export interface OfflineItem {
  id: string;
  item_type: string;
  data: Record<string, any>;
  user_id: string;
  is_synced: boolean;
  synced_at: string | Date | null;
  error_message: string | null;
  created_at: string | Date;
  user?: {
    id: string;
    fullName?: string;
    name?: string;
    email?: string;
  };
}

export interface CreateOfflineItemData {
  item_type: string;
  data: Record<string, any>;
}

export interface SyncResult {
  synced: number;
  failed: number;
  errors: string[];
  message?: string;
  pendingCount?: number;
  items?: OfflineItem[];
}

