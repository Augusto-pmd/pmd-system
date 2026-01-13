"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  color?: string;
}

export function Progress({ value, max = 100, className, color }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        "w-full bg-gray-200 rounded-full overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "h-full transition-all duration-300 ease-in-out",
          color || "bg-blue-500"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

