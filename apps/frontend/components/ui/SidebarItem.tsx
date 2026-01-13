"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  badge?: number;
  onClick?: () => void;
}

export function SidebarItem({ href, icon: Icon, label, isActive = false, badge, onClick }: SidebarItemProps) {
  const baseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "var(--radius-lg)",
    fontSize: "15px",
    fontWeight: 500,
    color: "var(--apple-text-primary)",
    textDecoration: "none",
    transition: "background-color var(--apple-duration-fast) var(--apple-ease), transform var(--apple-duration-fast) var(--apple-ease), border-color var(--apple-duration-fast) var(--apple-ease)",
    fontFamily: "Inter, system-ui, sans-serif",
    position: "relative",
  };

  const activeStyle: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: "var(--pmd-accent-light)",
    borderLeft: "3px solid var(--pmd-accent)",
    paddingLeft: "9px", // 12px - 3px border
  };

  const hoverStyle: React.CSSProperties = {
    backgroundColor: "rgba(0,0,0,0.04)",
    color: "var(--pmd-accent)",
  };

  const activeHoverStyle: React.CSSProperties = {
    backgroundColor: "var(--pmd-accent-light)",
    transform: "translateX(1px)",
  };

  const currentStyle = isActive ? activeStyle : baseStyle;

  return (
    <Link
      href={href}
      onClick={onClick}
      style={currentStyle}
      onMouseEnter={(e) => {
        if (isActive) {
          Object.assign(e.currentTarget.style, { ...currentStyle, ...activeHoverStyle });
        } else {
          Object.assign(e.currentTarget.style, { ...currentStyle, ...hoverStyle });
          // Update text color on hover
          e.currentTarget.style.color = "var(--pmd-accent)";
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, currentStyle);
        // Reset text color on leave
        if (!isActive) {
          e.currentTarget.style.color = "var(--apple-text-primary)";
        }
      }}
    >
      <Icon
        className="w-5 h-5 flex-shrink-0"
        style={{
          color: isActive ? "var(--pmd-accent)" : "var(--apple-text-primary)",
          transition: "opacity var(--apple-duration-fast) var(--apple-ease), color var(--apple-duration-fast) var(--apple-ease)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.8";
          if (!isActive) {
            e.currentTarget.style.color = "var(--pmd-accent)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.color = isActive ? "var(--pmd-accent)" : "var(--apple-text-primary)";
        }}
      />
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          style={{
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 6px",
            borderRadius: "10px",
            minWidth: "18px",
            textAlign: "center",
            backgroundColor: "var(--apple-text-primary)",
            color: "var(--apple-surface)",
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

