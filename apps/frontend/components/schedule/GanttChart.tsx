"use client";

import { useMemo } from "react";
import { Gantt, Task, EventOption, StylingOption, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Schedule, ScheduleState } from "@/lib/types/schedule";

interface GanttChartProps {
  schedules: Schedule[];
  onTaskChange?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  readOnly?: boolean;
}

export function GanttChart({ schedules, onTaskChange, onTaskDelete, readOnly = false }: GanttChartProps) {
  const tasks: Task[] = useMemo(() => {
    return schedules.map((schedule, index) => {
      const startDate = new Date(schedule.start_date);
      const endDate = new Date(schedule.end_date);
      
      // Calculate progress based on state
      let progress = 0;
      if (schedule.state === ScheduleState.COMPLETED) {
        progress = 100;
      } else if (schedule.state === ScheduleState.IN_PROGRESS) {
        // Calculate progress based on time elapsed
        const now = new Date();
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsed = now.getTime() - startDate.getTime();
        progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
      }

      // Determine task type and color based on state
      let type: "task" | "project" | "milestone" = "task";
      let styles: { progressColor?: string; progressSelectedColor?: string; backgroundColor?: string } = {};
      
      switch (schedule.state) {
        case ScheduleState.COMPLETED:
          styles = {
            progressColor: "#10b981", // green
            progressSelectedColor: "#059669",
            backgroundColor: "#d1fae5",
          };
          break;
        case ScheduleState.IN_PROGRESS:
          styles = {
            progressColor: "#3b82f6", // blue
            progressSelectedColor: "#2563eb",
            backgroundColor: "#dbeafe",
          };
          break;
        case ScheduleState.DELAYED:
          styles = {
            progressColor: "#ef4444", // red
            progressSelectedColor: "#dc2626",
            backgroundColor: "#fee2e2",
          };
          break;
        default: // PENDING
          styles = {
            progressColor: "#f59e0b", // amber
            progressSelectedColor: "#d97706",
            backgroundColor: "#fef3c7",
          };
          break;
      }

      return {
        start: startDate,
        end: endDate,
        name: schedule.stage_name,
        id: schedule.id,
        type,
        progress: progress,
        isDisabled: readOnly,
        project: schedule.work_id,
        hideChildren: false,
        styles: {
          progressColor: styles.progressColor,
          progressSelectedColor: styles.progressSelectedColor,
          backgroundColor: styles.backgroundColor,
        },
      } as Task;
    });
  }, [schedules, readOnly]);

  const handleTaskChange = (task: Task) => {
    if (readOnly || !onTaskChange) return;
    onTaskChange(task);
  };

  const handleTaskDelete = (task: Task) => {
    if (readOnly || !onTaskDelete) return;
    onTaskDelete(task.id);
  };

  // Calculate view mode based on date range
  const viewMode: ViewMode = useMemo(() => {
    if (tasks.length === 0) return ViewMode.Month;
    
    const minDate = Math.min(...tasks.map(t => t.start.getTime()));
    const maxDate = Math.max(...tasks.map(t => t.end.getTime()));
    const duration = maxDate - minDate;
    const days = duration / (1000 * 60 * 60 * 24);

    if (days <= 30) return ViewMode.Day;
    if (days <= 90) return ViewMode.Week;
    if (days <= 365) return ViewMode.Month;
    return ViewMode.Year;
  }, [tasks]);

  return (
    <div className="w-full overflow-x-auto">
      <Gantt
        tasks={tasks}
        viewMode={viewMode}
        locale="es"
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        onProgressChange={handleTaskChange}
        onDoubleClick={handleTaskChange}
        listCellWidth=""
        columnWidth={65}
        rowHeight={50}
        ganttHeight={Math.max(300, tasks.length * 50 + 100)}
        preStepsCount={1}
      />
    </div>
  );
}

