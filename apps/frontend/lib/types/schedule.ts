/**
 * Schedule interface matching backend Schedule entity
 * Based on pmd-backend/src/schedule/schedule.entity.ts
 */

export enum ScheduleState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
}

export interface Schedule {
  id: string;
  work_id: string;
  stage_name: string;
  start_date: string | Date;
  end_date: string | Date;
  actual_end_date?: string | Date | null;
  state: ScheduleState;
  order?: number | null;
  description?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
  work?: {
    id: string;
    name: string;
  };
}

export interface CreateScheduleData {
  work_id: string;
  stage_name: string;
  start_date: string;
  end_date: string;
  actual_end_date?: string;
  state?: ScheduleState;
  order?: number;
  description?: string;
}

export interface UpdateScheduleData {
  stage_name?: string;
  start_date?: string;
  end_date?: string;
  actual_end_date?: string | null;
  state?: ScheduleState;
  order?: number;
  description?: string;
}

