"use client";

import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
// NOTE: This module is not available in the backend
// Backend does not have /api/employees endpoint
import { useAlertsStore } from "@/store/alertsStore";
import { useWorks } from "@/hooks/api/works";
import { useRoles } from "@/hooks/api/roles";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { UserAvatar } from "@/components/settings/UserAvatar";
import { Building2, Mail, Phone, Calendar, Bell, Edit, AlertTriangle, FileText, Shield } from "lucide-react";
import Link from "next/link";
import { can } from "@/lib/acl";

function EmployeeDetailContent() {
  const router = useRouter();
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

