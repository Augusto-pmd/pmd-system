import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function PageSection({ children, className, title, subtitle }: PageSectionProps) {
  return (
    <section 
      className={cn(className)}
      style={{
        marginBottom: "var(--space-xl)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: "var(--space-lg)" }}>
          {title && (
            <h2 
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "var(--apple-text-primary)",
                marginBottom: subtitle ? "4px" : 0,
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p 
              style={{
                fontSize: "15px",
                fontWeight: 400,
                color: "var(--apple-text-secondary)",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

