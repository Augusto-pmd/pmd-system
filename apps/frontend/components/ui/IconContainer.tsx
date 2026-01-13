import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function IconContainer({ children, className, size = "md" }: IconContainerProps) {
  const sizes = {
    sm: "24px",
    md: "32px",
    lg: "40px",
  };

  return (
    <div
      className={cn(className)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: sizes[size],
        height: sizes[size],
        color: "var(--apple-text-primary)",
        transition: "opacity var(--apple-duration-fast) var(--apple-ease)",
      }}
      onMouseEnter={(e) => {
        const svg = e.currentTarget.querySelector("svg");
        if (svg) {
          svg.style.opacity = "0.8";
        }
      }}
      onMouseLeave={(e) => {
        const svg = e.currentTarget.querySelector("svg");
        if (svg) {
          svg.style.opacity = "1";
        }
      }}
    >
      {children}
    </div>
  );
}

