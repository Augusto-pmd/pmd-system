"use client";

// NOTE: This component is not available - backend does not have /api/employees endpoint
export function EmployeeCard() {
  return (
    <div style={{ padding: "var(--space-xl)", textAlign: "center" }}>
      <p style={{ color: "var(--apple-text-secondary)" }}>
        El módulo de RRHH no está disponible en el backend actual.
      </p>
    </div>
  );
}
