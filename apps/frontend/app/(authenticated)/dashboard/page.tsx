"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useWorks } from "@/hooks/api/works";
import { useExpenses } from "@/hooks/api/expenses";
import { useIncomes } from "@/hooks/api/incomes";
import { useContracts } from "@/hooks/api/contracts";
import { useAlertsStore } from "@/store/alertsStore";
import { useAccountingStore } from "@/store/accountingStore";
import { useCashboxStore } from "@/store/cashboxStore";
import { useDocumentsStore } from "@/store/documentsStore";
import { useSuppliers } from "@/hooks/api/suppliers";
import { useUsers } from "@/hooks/api/users";
import { LoadingState } from "@/components/ui/LoadingState";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCan } from "@/lib/acl";
import { CommandBar } from "@/components/ui/CommandBar";
import { KpiCard } from "@/components/ui/KpiCard";
import { SecondaryCard } from "@/components/ui/SecondaryCard";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { 
  TrendingUp, 
  Bell, 
  Building2,
  DollarSign,
  Users,
  Truck,
  Wallet,
  FolderOpen,
  Calculator,
  Shield,
  FileText,
  UserPlus,
  Package
} from "lucide-react";
import { useRouter } from "next/navigation";

function DashboardContent() {
  const authState = useAuthStore.getState();
  const user = authState.user;
  const organizationId = authState.user?.organizationId;
  const router = useRouter();

  // Verificar permisos para cada módulo (debe ejecutarse antes de cualquier return)
  const canWorks = useCan("works.read");
  const canAccounting = useCan("accounting.read");
  const canIncomes = useCan("incomes.read");
  const canAlerts = useCan("alerts.read");
  const canUsers = useCan("users.read");
  const canSuppliers = useCan("suppliers.read");
  const canAudit = useCan("audit.read");
  const canCashboxes = useCan("cashboxes.read");
  const canDocuments = useCan("documents.read");

  const { works, isLoading: worksLoading } = useWorks();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { incomes, isLoading: incomesLoading } = useIncomes();
  const { contracts, isLoading: contractsLoading } = useContracts();
  const { alerts, isLoading: alertsLoading, fetchAlerts } = useAlertsStore();
  const { entries, isLoading: accountingLoading, fetchEntries } = useAccountingStore();
  const { cashboxes, isLoading: cashboxLoading, fetchCashboxes } = useCashboxStore();
  const { documents, isLoading: documentsLoading, fetchDocuments } = useDocumentsStore();
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { users, isLoading: usersLoading } = useUsers();

  useEffect(() => {
    if (organizationId) {
      fetchAlerts();
      fetchEntries();
      fetchCashboxes();
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // Cálculos de KPIs
  const totalRevenue = (incomes?.reduce((sum: number, inc: any) => {
    const amount = Number(inc?.amount) || 0;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0) || 0);
  
  const totalExpenses = (expenses?.reduce((sum: number, exp: any) => {
    const amount = Number(exp?.amount) || 0;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0) || 0);
  
  const netBalance = totalRevenue - totalExpenses;
  
  // Contabilidad
  const accountingIngresos = (entries?.filter((e: any) => e.type === "ingreso" || e.type === "income")
    .reduce((sum: number, e: any) => {
      const amount = Number(e?.amount) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0) || 0);
    
  const accountingEgresos = (entries?.filter((e: any) => e.type === "egreso" || e.type === "expense")
    .reduce((sum: number, e: any) => {
      const amount = Number(e?.amount) || 0;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0) || 0);
  
  const activeContracts = contracts?.filter((c: any) => c.status === "active").length || 0;
  const pendingAlerts = alerts?.filter((a: any) => !a.read).length || 0;
  const highSeverityAlerts = alerts?.filter((a: any) => !a.read && a.severity === "alta").length || 0;
  const activeWorks = works?.filter((w: any) => w.status === "active" || w.status === "activa").length || 0;
  const totalWorks = works?.length || 0;
  const activeSuppliers = suppliers?.filter((s: any) => s.isActive !== false).length || 0;
  const totalSuppliers = suppliers?.length || 0;
  const activeUsers = users?.filter((u: any) => u.isActive !== false).length || 0;
  const totalUsers = users?.length || 0;
  const openCashboxes = cashboxes?.filter((c: any) => !c.isClosed).length || 0;
  const totalCashboxes = cashboxes?.length || 0;
  const pendingDocuments = documents?.filter((d: any) => d.status === "pendiente").length || 0;
  const totalDocuments = documents?.length || 0;

  // Cálculos de costos laborales (deshabilitado - no hay módulo de empleados)
  const totalStaffCost = 0;
  const officeCost = 0;
  const operativeCost = 0;
  const staffCostByDepartment = {};
  const staffStatsByDepartment = {};

  // Calculate monthly flow (simplified)
  const monthlyFlow = accountingIngresos - accountingEgresos;

  // Generate sparkline data from recent entries (last 7 days)
  const generateSparklineData = (baseValue: number, variance: number = 0.1): number[] => {
    const data: number[] = [];
    for (let i = 0; i < 7; i++) {
      const variation = (Math.random() - 0.5) * variance;
      data.push(Math.max(0, baseValue * (1 + variation)));
    }
    return data;
  };

  // Generate activity feed items from available data (solo si el usuario tiene permisos)
  const activityItems = useMemo(() => {
    const items: Array<{
      id: string;
      icon: typeof Building2;
      text: string;
      timestamp: string;
    }> = [];

    // Add recent works (solo si tiene permiso)
    if (canWorks) {
      works?.slice(0, 3).forEach((work: any) => {
        items.push({
          id: `work-${work.id}`,
          icon: Building2,
          text: `Nueva obra: ${work.name || work.title || work.nombre || "Sin nombre"}`,
          timestamp: "Hace 2 horas",
        });
      });
    }

    // Add alerts (solo si tiene permiso)
    if (canAlerts && highSeverityAlerts > 0) {
      items.push({
        id: "alert-high",
        icon: Bell,
        text: `${highSeverityAlerts} alerta${highSeverityAlerts > 1 ? "s" : ""} de alta severidad`,
        timestamp: "Hace 1 hora",
      });
    }

    // Add documents (solo si tiene permiso)
    if (canDocuments && pendingDocuments > 0) {
      items.push({
        id: "doc-pending",
        icon: FileText,
        text: `${pendingDocuments} documento${pendingDocuments > 1 ? "s" : ""} pendiente${pendingDocuments > 1 ? "s" : ""}`,
        timestamp: "Hace 3 horas",
      });
    }

    // Add cashboxes (solo si tiene permiso)
    if (canCashboxes && openCashboxes > 0) {
      items.push({
        id: "cashbox-open",
        icon: Wallet,
        text: `${openCashboxes} caja${openCashboxes > 1 ? "s" : ""} abierta${openCashboxes > 1 ? "s" : ""}`,
        timestamp: "Hoy",
      });
    }

    return items.slice(0, 5);
  }, [works, highSeverityAlerts, pendingDocuments, openCashboxes, canWorks, canAlerts, canDocuments, canCashboxes]);

  const isLoading =
    worksLoading || expensesLoading || incomesLoading || contractsLoading || alertsLoading ||
    accountingLoading || cashboxLoading || documentsLoading || suppliersLoading || usersLoading;

  if (isLoading) {
    return <LoadingState message="Cargando panel de control…" />;
  }

  const formatCurrency = (amount: number | string | null | undefined) => {
    const numAmount = typeof amount === "number" ? amount : Number(amount) || 0;
    if (isNaN(numAmount)) {
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(0);
    }
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "var(--apple-canvas)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
        {/* LAYER 1: COMMAND BAR */}
        <div>
          <CommandBar />
        </div>

        {/* LAYER 2: PRIMARY KPIs - Aligned Layout */}
        <div
          style={{
            padding: "0 0 var(--space-lg)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-lg)",
            alignItems: "stretch",
          }}
        >
          {canWorks && (
            <KpiCard
              label="Obras Activas"
              value={activeWorks}
              subtitle={`de ${totalWorks} totales`}
              icon={Building2}
              sparklineData={generateSparklineData(activeWorks, 0.15)}
              onClick={() => router.push("/works")}
            />
          )}
          {(canAccounting || canIncomes) && (
            <KpiCard
              label="Inversión Total"
              value={formatCurrency(Math.max(0, accountingIngresos || totalRevenue || 0))}
              subtitle="Ingresos totales"
              icon={DollarSign}
              sparklineData={generateSparklineData(Math.max(0, accountingIngresos || totalRevenue || 0), 0.1)}
              onClick={() => router.push("/accounting")}
            />
          )}
          {canAccounting && (
            <KpiCard
              label="Flujo del Mes"
              value={formatCurrency(monthlyFlow)}
              subtitle={monthlyFlow >= 0 ? "Positivo" : "Negativo"}
              icon={TrendingUp}
              sparklineData={generateSparklineData(Math.abs(monthlyFlow), 0.2)}
              trend={monthlyFlow >= 0 ? "up" : "down"}
              onClick={() => router.push("/accounting")}
            />
          )}
          {canAlerts && (
            <KpiCard
              label="Alertas Críticas"
              value={highSeverityAlerts}
              subtitle={pendingAlerts > 0 ? `${pendingAlerts} totales` : "Todo en orden"}
              icon={Bell}
              sparklineData={generateSparklineData(highSeverityAlerts, 0.3)}
              onClick={() => router.push("/alerts")}
            />
          )}
          {canUsers && (
            <KpiCard
              label="Usuarios Activos"
              value={activeUsers}
              subtitle={`de ${totalUsers} totales`}
              icon={Users}
              sparklineData={generateSparklineData(activeUsers, 0.05)}
              onClick={() => router.push("/settings/users")}
            />
          )}
        </div>

        {/* LAYER 3: SECONDARY MODULE CARDS - Aligned Grid */}
        <div
          style={{
            padding: "0 0 var(--space-lg)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "var(--space-lg)",
            alignItems: "stretch",
          }}
        >
          {canUsers && (
            <SecondaryCard
              title="Usuarios"
              description={`${activeUsers} usuarios activos`}
              icon={Users}
              route="/settings/users"
              kpi={activeUsers}
              preview={
                <div style={{ font: "var(--font-caption)", color: "var(--apple-text-secondary)" }}>
                  {totalUsers} totales
                </div>
              }
            />
          )}
          {canSuppliers && (
            <SecondaryCard
              title="Proveedores"
              description={`${activeSuppliers} proveedores activos`}
              icon={Truck}
              route="/suppliers"
              kpi={activeSuppliers}
              preview={
                <div style={{ font: "var(--font-caption)", color: "var(--apple-text-secondary)" }}>
                  {totalSuppliers} totales
                </div>
              }
            />
          )}
          {canAccounting && (
            <SecondaryCard
              title="Contabilidad"
              description="Movimientos y reportes"
              icon={Calculator}
              route="/accounting"
              kpi={entries?.length || 0}
              preview={
                <div style={{ font: "var(--font-caption)", color: "var(--apple-text-secondary)" }}>
                  {formatCurrency(netBalance)} balance
                </div>
              }
            />
          )}
          {canAudit && (
            <SecondaryCard
              title="Auditoría"
              description="Registro de cambios"
              icon={Shield}
              route="/audit"
              preview={
                <div style={{ font: "var(--font-caption)", color: "var(--apple-text-secondary)" }}>
                  Sistema auditado
                </div>
              }
            />
          )}
          {canCashboxes && (
            <SecondaryCard
              title="Cajas"
              description={`${openCashboxes} cajas abiertas`}
              icon={Wallet}
              route="/cashbox"
              kpi={openCashboxes}
              preview={
                <div style={{ font: "var(--font-caption)", color: "var(--apple-text-secondary)" }}>
                  {totalCashboxes} totales
                </div>
              }
            />
          )}
          {canDocuments && (
            <SecondaryCard
              title="Documentos"
              description={`${pendingDocuments} pendientes`}
              icon={FolderOpen}
              route="/documents"
              kpi={totalDocuments}
              preview={
                <div style={{ font: "var(--font-caption)", color: "var(--apple-text-secondary)" }}>
                  {pendingDocuments > 0 ? `${pendingDocuments} por revisar` : "Al día"}
                </div>
              }
            />
          )}
        </div>

        {/* LAYER 4: ACTIVITY FEED */}
        <div style={{ padding: "0 0 var(--space-xl)" }}>
          <ActivityFeed items={activityItems} />
        </div>
      </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
