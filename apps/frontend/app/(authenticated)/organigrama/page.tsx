"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { normalizeId } from "@/lib/normalizeId";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUsers } from "@/hooks/api/users";
import { useAlertsStore } from "@/store/alertsStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { OrganigramGrid } from "@/components/organigrama/OrganigramGrid";
import { OrganigramTree } from "@/components/organigrama/OrganigramTree";
import { EmployeeDetailModal } from "@/components/organigrama/EmployeeDetailModal";
import { AssignWorkModal } from "@/components/organigrama/AssignWorkModal";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Filter, X, Grid3x3, Network } from "lucide-react";
import { useWorks } from "@/hooks/api/works";
import { useRoles } from "@/hooks/api/roles";
import { useAuthStore } from "@/store/authStore";
import { can } from "@/lib/acl";
import { Employee } from "@/lib/types/employee";

type ViewMode = "grid" | "tree";

function OrganigramaContent() {
  const router = useRouter();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;
  const { users, isLoading, error } = useUsers();
  const { alerts, fetchAlerts } = useAlertsStore();
  const { works } = useWorks();
  const { roles } = useRoles();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [subroleFilter, setSubroleFilter] = useState("all");
  const [workFilter, setWorkFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [alertsFilter, setAlertsFilter] = useState<"all" | "with" | "without">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignWorkModalOpen, setIsAssignWorkModalOpen] = useState(false);

  useEffect(() => {
    if (organizationId) {
      fetchAlerts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // Verificar permisos ACL
  if (!can("staff.read")) {
    return (
      <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
        No tienes permisos para acceder al Organigrama
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingState message="Cargando organigrama…" />
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
        Error al cargar el organigrama: {error?.message || "Error desconocido"}
      </div>
    );
  }

  // Filtrar usuarios (nota: organigrama requiere módulo de empleados que no existe)
  const filteredEmployees: Employee[] = [];

  // Obtener valores únicos para filtros (vacío porque no hay empleados)
  const uniqueRoles: string[] = [];
  const subroles: string[] = [];
  
  // Obtener nombres de roles desde rolesStore si están disponibles
  const getRoleName = (roleId?: string) => {
    if (!roleId) return null;
    const role = roles.find((r: any) => r.id === roleId || r.name === roleId);
    return role?.name || (role as any)?.nombre || roleId;
  };

  const handleViewDetail = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    router.push(`/rrhh/${employee.id}`);
  };

  const handleAssignWork = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsAssignWorkModalOpen(true);
  };

  const handleViewAlerts = (employee: Employee) => {
    router.push(`/alerts?personId=${employee.id}`);
  };

  return (
    <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Organigrama PMD</h1>
              <p className="text-gray-600">Estructura del personal y áreas internas</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "primary" : "outline"}
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-2"
              >
                <Grid3x3 className="h-4 w-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "tree" ? "primary" : "outline"}
                onClick={() => setViewMode("tree")}
                className="flex items-center gap-2"
              >
                <Network className="h-4 w-4" />
                Tree
              </Button>
            </div>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="bg-white rounded-lg shadow-pmd p-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            {(searchQuery ||
              roleFilter !== "all" ||
              subroleFilter !== "all" ||
              workFilter !== "all" ||
              statusFilter !== "all" ||
              alertsFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setSubroleFilter("all");
                  setWorkFilter("all");
                  setStatusFilter("all");
                  setAlertsFilter("all");
                }}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  {uniqueRoles.map((role) => {
                    const roleName = getRoleName(role) || role;
                    return (
                      <option key={role} value={role}>
                        {roleName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subrol</label>
                <select
                  value={subroleFilter}
                  onChange={(e) => setSubroleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  {subroles.map((subrole) => (
                    <option key={subrole} value={subrole}>
                      {subrole}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obra</label>
                <select
                  value={workFilter}
                  onChange={(e) => setWorkFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  {works.map((work: any) => {
                    const workName = work.name || work.title || work.nombre || work.id;
                    return (
                      <option key={work.id} value={normalizeId(work.id)}>
                        {workName}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alertas</label>
                <select
                  value={alertsFilter}
                  onChange={(e) => setAlertsFilter(e.target.value as "all" | "with" | "without")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none text-sm"
                >
                  <option value="all">Todas</option>
                  <option value="with">Con alertas</option>
                  <option value="without">Sin alertas</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Vista seleccionada */}
        {viewMode === "grid" ? (
          <OrganigramGrid
            employees={filteredEmployees}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onAssignWork={handleAssignWork}
          />
        ) : (
          <OrganigramTree
            employees={filteredEmployees}
            onEmployeeClick={handleViewDetail}
          />
        )}

        {/* Modales */}
        <EmployeeDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onEdit={handleEdit}
          onAssignWork={handleAssignWork}
          onViewAlerts={handleViewAlerts}
        />

        <AssignWorkModal
          isOpen={isAssignWorkModalOpen}
          onClose={() => {
            setIsAssignWorkModalOpen(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onSuccess={() => {
            // Los datos se recargarán automáticamente desde los hooks
            setIsAssignWorkModalOpen(false);
            setSelectedEmployee(null);
          }}
        />
      </div>
  );
}

export default function OrganigramaPage() {
  return (
    <ProtectedRoute>
      <OrganigramaContent />
    </ProtectedRoute>
  );
}

