/**
 * Backup interface matching backend Backup entity
 * Based on pmd-backend/src/backup/backup.entity.ts
 */

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
}

export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Backup {
  id: string;
  type: BackupType;
  status: BackupStatus;
  file_path: string;
  storage_url: string | null;
  file_size: number;
  error_message: string | null;
  created_by_id: string | null;
  created_by?: {
    id: string;
    fullName?: string;
    name?: string;
    email?: string;
  };
  started_at: string | Date | null;
  completed_at: string | Date | null;
  created_at: string | Date;
}

export interface CreateBackupData {
  type: BackupType;
}

export interface CleanupBackupsData {
  daysToKeep?: number;
}

