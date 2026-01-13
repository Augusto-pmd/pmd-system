"use client";

import { ReactNode } from "react";
import { LucideIcon, Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  text: string;
  timestamp: string;
  type?: "work" | "user" | "document" | "audit" | "movement";
}

interface ActivityFeedProps {
  items?: ActivityItem[];
  title?: string;
}

export function ActivityFeed({ items = [], title = "Actividad Reciente" }: ActivityFeedProps) {
  const containerStyle: React.CSSProperties = {
    backgroundColor: "var(--apple-surface)",
    border: "1px solid var(--apple-border)",
    borderRadius: "var(--radius-xl)",
    boxShadow: "var(--shadow-apple)",
    padding: "var(--space-xl)",
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-sm)",
    marginBottom: "var(--space-lg)",
  };

  const titleStyle: React.CSSProperties = {
    font: "var(--font-card-title)",
    color: "var(--apple-text-primary)",
    margin: 0,
  };

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "var(--space-md)",
    padding: "var(--space-md) 0",
    borderBottom: "1px solid var(--apple-border)",
  };

  const iconContainerStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--pmd-accent-light)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
  };

  const accentDotStyle: React.CSSProperties = {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "var(--pmd-accent)",
    opacity: 0.7,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <Activity className="w-5 h-5" style={{ color: "var(--apple-text-primary)" }} />
        <h2 style={titleStyle}>{title}</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {items.length > 0 ? (
          items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} style={itemStyle}>
                <div style={iconContainerStyle}>
                  <Icon className="w-4 h-4" style={{ color: "var(--pmd-accent)" }} />
                  <div style={accentDotStyle} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      font: "var(--font-body)",
                      color: "var(--apple-text-primary)",
                      margin: "0 0 var(--space-xs) 0",
                    }}
                  >
                    {item.text}
                  </p>
                  <p
                    style={{
                      font: "var(--font-caption)",
                      color: "var(--apple-text-secondary)",
                      margin: 0,
                    }}
                  >
                    {item.timestamp}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              padding: "var(--space-xl) 0",
              textAlign: "center",
            }}
          >
            <p
              style={{
                font: "var(--font-body)",
                color: "var(--apple-text-secondary)",
                margin: 0,
              }}
            >
              No hay actividad reciente
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

