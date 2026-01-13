"use client";

import { ModuleCard } from "./ModuleCard";
import {
  Building2,
  Truck,
  TrendingUp,
  Shield,
  Users,
  Bell,
  Wallet,
  DollarSign,
  FileText,
  FolderOpen,
  UserRound,
  Briefcase,
} from "lucide-react";

const modules = [
  {
    title: "Obras",
    description: "Gestiona obras, proyectos y actividades de construcción",
    icon: Building2,
    route: "/works",
  },
  {
    title: "Proveedores",
    description: "Administra proveedores y sus contratos",
    icon: Truck,
    route: "/suppliers",
  },
  {
    title: "Contabilidad",
    description: "Contabilidad, reportes financieros y análisis",
    icon: TrendingUp,
    route: "/accounting",
  },
  {
    title: "Roles",
    description: "Administra roles y permisos del sistema",
    icon: Shield,
    route: "/admin/roles",
  },
  {
    title: "Usuarios",
    description: "Gestiona usuarios del sistema y sus permisos",
    icon: Users,
    route: "/admin/users",
  },
  {
    title: "Alertas",
    description: "Notificaciones y alertas del sistema",
    icon: Bell,
    route: "/alerts",
  },
  {
    title: "Caja",
    description: "Gestiona cajas de efectivo y saldos",
    icon: Wallet,
    route: "/cashbox",
  },
  {
    title: "Movimientos de Caja",
    description: "Movimientos de efectivo y transacciones",
    icon: DollarSign,
    route: "/cash",
  },
  {
    title: "Auditoría",
    description: "Registro de auditoría y actividad del sistema",
    icon: FileText,
    route: "/audit",
  },
  {
    title: "Documentación",
    description: "Archivos y adjuntos del sistema PMD",
    icon: FolderOpen,
    route: "/documents",
  },
  {
    title: "Recursos Humanos",
    description: "Empleados, obreros y seguros",
    icon: UserRound,
    route: "/rrhh",
  },
  {
    title: "Organigrama",
    description: "Estructura completa del personal PMD",
    icon: Briefcase,
    route: "/organigrama",
  },
];

export function DashboardModules() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {modules.map((module) => (
        <ModuleCard
          key={module.route}
          title={module.title}
          description={module.description}
          icon={module.icon}
          route={module.route}
        />
      ))}
    </div>
  );
}
