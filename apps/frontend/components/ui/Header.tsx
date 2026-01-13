"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { LogOut, Bell, DollarSign } from "lucide-react";
import { Button } from "./Button";
import { useEffect, useState } from "react";
import { useAlertsStore } from "@/store/alertsStore";
import { OfflineIndicator } from "./OfflineIndicator";
import { useCurrentExchangeRate } from "@/hooks/api/exchange-rates";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const { alerts, fetchAlerts } = useAlertsStore();
  const [mounted, setMounted] = useState(false);
  const { currentRate } = useCurrentExchangeRate();

  useEffect(() => {
    setMounted(true);
    // Cargar alertas al montar el componente
    if (user?.organizationId) {
      fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organizationId]);

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalUnreadCount = alerts.filter((a) => !a.read && a.severity === "critical").length;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Apple Header Styles - Always the same structure
  const headerStyle: React.CSSProperties = {
    position: "relative",
    height: "auto",
    padding: "16px 24px",
    backgroundColor: "var(--apple-surface)",
    borderBottom: "1px solid var(--apple-border)",
    boxShadow: "var(--shadow-apple-subtle)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "Inter, system-ui, sans-serif",
    width: "100%",
  };

  const leftSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    font: "var(--font-section-title)",
    color: "var(--apple-text-primary)",
    margin: 0,
    padding: 0,
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };


  const userInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const userTextStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    textAlign: "right",
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--apple-text-primary)",
    margin: 0,
    lineHeight: 1.2,
  };

  const userRoleStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 400,
    color: "var(--apple-text-secondary)",
    margin: "2px 0 0 0",
    lineHeight: 1.2,
    textTransform: "capitalize",
  };

  const avatarStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "var(--apple-text-primary)",
    color: "var(--apple-surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 500,
    flexShrink: 0,
  };

  // Always render the same structure to avoid hydration mismatches
  return (
    <div style={headerStyle} role="banner">
      {/* Left Section */}
      <div style={leftSectionStyle}>
        {/* Title */}
        {mounted && title && <h1 style={titleStyle}>{title}</h1>}
      </div>

      {/* Right Section */}
      <div style={rightSectionStyle}>
        {/* Current Exchange Rate */}
        {mounted && currentRate && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "var(--apple-surface-elevated)",
              borderRadius: "8px",
              border: "1px solid var(--apple-border)",
              fontSize: "13px",
            }}
            className="hidden md:flex"
          >
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span style={{ color: "var(--apple-text-secondary)", fontSize: "12px" }}>
              1 USD =
            </span>
            <span style={{ color: "var(--apple-text-primary)", fontWeight: 500 }}>
              {new Intl.NumberFormat("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(currentRate.rate_usd_to_ars)}{" "}
              ARS
            </span>
          </div>
        )}

        {/* Offline Indicator */}
        {mounted && <OfflineIndicator />}

        {/* Alerts Counter */}
        {mounted && unreadCount > 0 && (
          <Button
            variant="outline"
            size="md"
            onClick={() => router.push("/alerts")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              position: "relative",
            }}
            className="relative"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alertas</span>
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: criticalUnreadCount > 0 ? "#dc2626" : "#3b82f6",
                color: "white",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </Button>
        )}

        {/* User Info */}
        {mounted && user && (
          <div style={userInfoStyle} className="hidden sm:flex">
            <div style={userTextStyle}>
              <p style={userNameStyle}>{user.fullName}</p>
              <p style={userRoleStyle}>
                {user.role?.name || user.roleId || "Sin rol"}
              </p>
            </div>
            <div style={avatarStyle}>
              {(user.fullName?.charAt(0) || "").toUpperCase()}
            </div>
          </div>
        )}

        {/* Logout Button */}
        {mounted && (
          <Button
            variant="outline"
            size="md"
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <LogOut 
              className="w-4 h-4"
              style={{
                transition: "opacity var(--apple-duration-fast) var(--apple-ease)",
              }}
            />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        )}
      </div>
    </div>
  );
}

