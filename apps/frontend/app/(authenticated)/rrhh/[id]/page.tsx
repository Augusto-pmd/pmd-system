"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, CardContent } from "@/components/ui/Card";

// NOTE: This module is not available in the backend
// Backend does not have /api/employees endpoint
function EmployeeDetailContent() {
  return (
    <Card>
        <CardContent style={{ padding: "var(--space-xl)", textAlign: "center" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "var(--space-md)", color: "var(--apple-text-primary)" }}>
            Módulo no disponible
          </h2>
          <p style={{ color: "var(--apple-text-secondary)", marginBottom: "var(--space-lg)" }}>
            El módulo de RRHH no está disponible en el backend actual.
          </p>
          <p style={{ fontSize: "14px", color: "var(--apple-text-tertiary)" }}>
            Este módulo ha sido deshabilitado porque el backend no proporciona el endpoint /api/employees.
          </p>
        </CardContent>
      </Card>
  );
}

export default function EmployeeDetailPage() {
  return (
    <ProtectedRoute>
      <EmployeeDetailContent />
    </ProtectedRoute>
  );
}
