"use client";

import { useAuthStore } from "@/store/authStore";
import { Calendar, Settings, Bell, TrendingUp } from "lucide-react";

export function CommandBar() {
  const authState = useAuthStore.getState();
  const user = authState.user;
  const organization = (user as any)?.organization;

  const organizationName =
    organization?.name || organization?.nombre || "PMD Management";

  const commandBarStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--apple-border)",
    boxShadow: "var(--shadow-apple)",
    borderRadius: "0 0 var(--radius-xl) var(--radius-xl)",
    padding: "var(--space-xl)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "Inter, system-ui, sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 100,
    marginBottom: "var(--space-xl)",
  };

  const leftSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-lg)",
    flex: 1,
  };

  const organizationNameStyle: React.CSSProperties = {
    fontSize: "22px",
    fontWeight: 600,
    color: "var(--apple-text-primary)",
    margin: 0,
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-md)",
  };

  const iconButtonStyle: React.CSSProperties = {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-md)",
    border: "none",
    backgroundColor: "transparent",
    color: "var(--apple-text-primary)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color var(--apple-duration-fast) var(--apple-ease), opacity var(--apple-duration-fast) var(--apple-ease)",
  };

  const accentLineStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    left: "var(--space-xl)",
    right: "var(--space-xl)",
    height: "1px",
    backgroundColor: "var(--pmd-accent)",
    opacity: 0.1,
  };

  return (
    <div style={commandBarStyle}>
      {/* PMD Accent Line */}
      <div style={accentLineStyle} />

      {/* Left Section */}
      <div style={leftSectionStyle}>
        <h1 style={organizationNameStyle}>{organizationName}</h1>
      </div>

      {/* Right Section */}
      <div style={rightSectionStyle}>
        {/* Date Range - Simplified for now */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            padding: "6px 12px",
            borderRadius: "var(--radius-md)",
            backgroundColor: "rgba(0,0,0,0.02)",
            font: "var(--font-label)",
            color: "var(--apple-text-secondary)",
          }}
        >
          <Calendar className="w-4 h-4" />
          <span>Este mes</span>
        </div>

        {/* Quick Actions */}
        <button
          style={iconButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--apple-hover)";
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.opacity = "1";
          }}
          aria-label="Alertas"
        >
          <Bell className="w-5 h-5" strokeWidth={2} />
        </button>
        <button
          style={iconButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--apple-hover)";
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.opacity = "1";
          }}
          aria-label="Reportes"
        >
          <TrendingUp className="w-5 h-5" strokeWidth={2} />
        </button>
        <button
          style={iconButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--apple-hover)";
            e.currentTarget.style.opacity = "0.8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.opacity = "1";
          }}
          aria-label="Configuración"
        >
          <Settings className="w-5 h-5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

