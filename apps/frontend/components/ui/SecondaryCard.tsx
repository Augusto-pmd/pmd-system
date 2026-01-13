"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface SecondaryCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  route?: string;
  kpi?: string | number;
  preview?: ReactNode;
  onClick?: () => void;
}

export function SecondaryCard({
  title,
  description,
  icon: Icon,
  route,
  kpi,
  preview,
  onClick,
}: SecondaryCardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--apple-surface)",
    border: "1px solid var(--apple-border)",
    borderRadius: "var(--radius-xl)",
    boxShadow: "var(--shadow-apple)",
    padding: "var(--space-lg)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-md)",
    fontFamily: "Inter, system-ui, sans-serif",
    transition: "all var(--apple-duration-medium) var(--apple-ease-out)",
    cursor: onClick || route ? "pointer" : "default",
    position: "relative",
    height: "100%",
  };

  const content = (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--pmd-accent-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon
            className="w-5 h-5"
            style={{
              color: "var(--pmd-accent)",
              transition: "opacity var(--apple-duration-fast) var(--apple-ease)",
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              font: "var(--font-card-title)",
              color: "var(--apple-text-primary)",
              margin: "0 0 var(--space-xs) 0",
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              style={{
                font: "var(--font-caption)",
                color: "var(--apple-text-secondary)",
                margin: 0,
              }}
            >
              {description}
            </p>
          )}
        </div>
        {kpi !== undefined && (
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--pmd-accent)",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            {kpi}
          </div>
        )}
      </div>

      {/* Preview Content */}
      {preview && <div style={{ marginTop: "var(--space-xs)" }}>{preview}</div>}
    </>
  );

  if (route) {
    return (
      <Link
        href={route}
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "var(--shadow-apple-strong)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "var(--shadow-apple)";
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "var(--shadow-apple-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-apple)";
      }}
    >
      {content}
    </div>
  );
}

