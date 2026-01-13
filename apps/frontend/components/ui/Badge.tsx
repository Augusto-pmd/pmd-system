import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-white/30 text-[#3A3A3C]",
    success: "bg-[rgba(52,199,89,0.12)] text-[rgba(52,199,89,1)]", // Apple green
    warning: "bg-[rgba(255,204,0,0.12)] text-[rgba(255,204,0,1)]", // Apple yellow
    error: "bg-[rgba(255,59,48,0.12)] text-[rgba(255,59,48,1)]", // Apple red
    info: "bg-[rgba(0,122,255,0.12)] text-[rgba(0,122,255,1)]", // Apple blue
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
