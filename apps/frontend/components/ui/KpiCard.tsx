"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Sparkline } from "./Sparkline";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  sparklineData?: number[];
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}

export function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  sparklineData,
  trend,
  onClick,
}: KpiCardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--apple-surface)",
    border: "1px solid var(--apple-border)",
    borderRadius: "var(--radius-xl)",
    boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
    padding: "var(--space-xl)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-md)",
    fontFamily: "Inter, system-ui, sans-serif",
    transition: "all var(--apple-duration-medium) var(--apple-ease-out)",
    cursor: onClick ? "pointer" : "default",
    position: "relative",
    overflow: "hidden",
    height: "100%",
    minHeight: "184px",
  };

  const accentLineStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "2px",
    backgroundColor: "var(--pmd-accent)",
    opacity: 0.1,
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
        e.currentTarget.style.boxShadow = "0 20px 56px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.08)";
      }}
    >
      {/* PMD Accent Line */}
      <div style={accentLineStyle} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <p
            style={{
              font: "var(--font-label)",
              color: "var(--apple-text-secondary)",
              margin: "0 0 var(--space-xs) 0",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "var(--apple-text-primary)",
              margin: 0,
              lineHeight: 1.2,
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            {value}
          </p>
          {subtitle && (
            <p
              style={{
                font: "var(--font-caption)",
                color: "var(--apple-text-secondary)",
                margin: "var(--space-xs) 0 0 0",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <Icon
          className="w-6 h-6 flex-shrink-0"
          style={{
            color: "var(--pmd-accent)",
            opacity: 0.7,
            transition: "opacity var(--apple-duration-fast) var(--apple-ease)",
          }}
        />
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div style={{ marginTop: "var(--space-sm)" }}>
          <Sparkline data={sparklineData} color="var(--pmd-accent)" />
        </div>
      )}
    </div>
  );
}

