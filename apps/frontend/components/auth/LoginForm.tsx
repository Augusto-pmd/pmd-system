"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { BruteForceAlert } from "./BruteForceAlert";
import { useBruteForce } from "@/hooks/useBruteForce";
import LogoPMD from "@/components/LogoPMD";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthContext();
  const { status, refresh } = useBruteForce();
  
  // Refresh brute force status after failed login
  useEffect(() => {
    if (error) {
      refresh();
    }
  }, [error, refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const ok = await login(email, password);

      setIsLoading(false);

      if (!ok) {
        setError("Credenciales incorrectas");
        return;
      }

      router.push("/dashboard");
    } catch (error: unknown) {
      setIsLoading(false);
      
      // Handle brute force blocking (429)
      const errorObj = error && typeof error === 'object' ? error as { 
        code?: string; 
        message?: string;
        response?: { status?: number; data?: any };
      } : null;
      
      if (errorObj?.response?.status === 429 || errorObj?.code === "BRUTE_FORCE_BLOCKED") {
        const bruteForceData = errorObj?.response?.data || errorObj;
        setError(
          bruteForceData?.message || 
          `Demasiados intentos fallidos. Intenta nuevamente en ${bruteForceData?.remainingMinutes || 15} minutos.`
        );
        refresh(); // Refresh status to show block
        return;
      }
      
      // Handle explicit backend error messages
      if (errorObj?.code === "USER_NOT_FOUND") {
        setError("Usuario no encontrado");
      } else if (errorObj?.code === "INVALID_PASSWORD") {
        setError("Contraseña incorrecta");
      } else {
        setError(errorObj?.message || "Credenciales incorrectas");
      }
      
      // Refresh brute force status after error
      refresh();
    }
  };

  const isBlocked = status?.isBlocked || false;
  const isSubmitDisabled = isLoading || isBlocked;

  return (
    <div className="w-full max-w-[420px] space-y-4">
      {/* Brute Force Alert */}
      <BruteForceAlert />
      
      {/* Main Card Container */}
      <div
        style={{
          backgroundColor: "var(--apple-surface)",
          border: "1px solid var(--apple-border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-apple-strong)",
          padding: "var(--space-xl)",
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <LogoPMD size={60} className="opacity-95" />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: "rgba(255,59,48,0.1)",
                border: "1px solid rgba(255,59,48,0.3)",
                color: "rgba(255,59,48,1)",
                padding: "var(--space-sm) var(--space-md)",
                borderRadius: "var(--radius-md)",
                fontSize: "14px",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                font: "var(--font-label)",
                color: "var(--apple-text-secondary)",
                marginBottom: "6px",
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.email@example.com"
              style={{
                width: "100%",
                height: "42px",
                backgroundColor: "var(--apple-surface)",
                border: "1px solid var(--apple-border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "0 14px",
                fontSize: "14px",
                fontFamily: "Inter, system-ui, sans-serif",
                color: "var(--apple-text-primary)",
                outline: "none",
                transition: "all 200ms ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid var(--apple-blue)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px rgba(0,122,255,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid var(--apple-border-strong)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                font: "var(--font-label)",
                color: "var(--apple-text-secondary)",
                marginBottom: "6px",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                height: "42px",
                backgroundColor: "var(--apple-surface)",
                border: "1px solid var(--apple-border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "0 14px",
                fontSize: "14px",
                fontFamily: "Inter, system-ui, sans-serif",
                color: "var(--apple-text-primary)",
                outline: "none",
                transition: "all 200ms ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = "1px solid var(--apple-blue)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 2px rgba(0,122,255,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = "1px solid var(--apple-border-strong)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Attempt Counter */}
          {status && !status.isBlocked && status.remainingAttempts < status.maxAttempts && (
            <div
              style={{
                fontSize: "12px",
                color: "var(--apple-text-secondary)",
                textAlign: "center",
                padding: "var(--space-xs)",
              }}
            >
              {status.remainingAttempts > 0 ? (
                <span>
                  {status.remainingAttempts} intento{status.remainingAttempts > 1 ? "s" : ""} restante{status.remainingAttempts > 1 ? "s" : ""} antes del bloqueo
                </span>
              ) : (
                <span style={{ color: "rgba(255,59,48,1)" }}>
                  Sin intentos restantes. IP será bloqueada.
                </span>
              )}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            style={{
              width: "100%",
              height: "44px",
              backgroundColor: "var(--apple-surface)",
              color: "var(--apple-text-primary)",
              border: "1px solid rgba(0,0,0,0.15)",
              borderRadius: "var(--radius-lg)",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              transition: "all 200ms ease",
              cursor: isSubmitDisabled ? "not-allowed" : "pointer",
              opacity: isSubmitDisabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "var(--apple-button-hover)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--apple-surface)";
            }}
            onMouseDown={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = "var(--apple-button-active)";
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.backgroundColor = "var(--apple-button-hover)";
            }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
