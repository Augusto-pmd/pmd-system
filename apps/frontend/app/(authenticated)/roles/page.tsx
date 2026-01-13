"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PermissionRoute } from "@/components/auth/PermissionRoute";
import { useRolesStore } from "@/store/rolesStore";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RoleForm } from "../settings/roles/components/RoleForm";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { Plus, Edit, Trash2 } from "lucide-react";
import { TableContainer } from "@/components/ui/TableContainer";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { useCan } from "@/lib/acl";

function RolesContent() {
  const { roles, isLoading, error, fetchRoles, fetchRoleById, createRole, updateRole, deleteRole } = useRolesStore();
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(false);
  const toast = useToast();
  
  // Verificar permisos
  const canCreate = useCan("roles.create");
  const canUpdate = useCan("roles.update");
  const canDelete = useCan("roles.delete");

  useEffect(() => {
    if (organizationId) {
      fetchRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Cargando roles…" />;
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
        Error al cargar los roles: {error}
      </div>
    );
  }

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await createRole(data);
      toast.success("Rol creado correctamente");
      setIsFormModalOpen(false);
      setSelectedRole(null);
      await fetchRoles();
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al crear rol:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: { name: string; description?: string; permissions?: string[] }) => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await updateRole(selectedRole.id, data);
      toast.success("Rol actualizado correctamente");
      setIsFormModalOpen(false);
      setSelectedRole(null);
      await fetchRoles();
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al actualizar rol:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      await deleteRole(selectedRole.id);
      toast.success("Rol eliminado correctamente");
      setIsDeleteModalOpen(false);
      setSelectedRole(null);
      await fetchRoles();
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al eliminar rol:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
        <div>
          <BotonVolver />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-md)" }}>
            <div>
              <h1 style={{ font: "var(--font-title)", color: "var(--apple-text-primary)", marginBottom: "var(--space-xs)" }}>
                Roles & Permisos
              </h1>
              <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
                Gestión de roles y permisos del sistema PMD
              </p>
            </div>
            {canCreate && (
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedRole(null);
                  setIsFormModalOpen(true);
                }}
              >
                <Plus style={{ width: "16px", height: "16px", marginRight: "8px" }} />
                Nuevo Rol
              </Button>
            )}
          </div>
        </div>

        {roles.length === 0 ? (
          <div style={{
            backgroundColor: "var(--apple-surface)",
            border: "1px solid var(--apple-border)",
            borderRadius: "var(--radius-xl)",
            padding: "40px 0",
            textAlign: "center"
          }}>
            <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
              No hay roles registrados
            </p>
          </div>
        ) : (
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead align="right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
                        {(role as any).name || (role as any).nombre || "Sin nombre"}
                      </div>
                      {(role as any).description && (
                        <div style={{ fontSize: "12px", color: "var(--apple-text-secondary)", marginTop: "4px" }}>
                          {(role as any).description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">
                        {((role as any).permissions || (role as any).permisos || []).length} permiso{((role as any).permissions || (role as any).permisos || []).length !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div style={{ fontSize: "14px", color: "var(--apple-text-secondary)" }}>
                        {(role as any).userCount || (role as any).cantidadUsuarios || 0} usuario{((role as any).userCount || (role as any).cantidadUsuarios || 0) !== 1 ? "s" : ""}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                        {canUpdate && (
                          <Button
                            variant="icon"
                            size="sm"
                            onClick={async () => {
                              setIsLoadingRole(true);
                              try {
                                // Obtener el rol completo desde el backend para asegurar que tenga los permisos
                                const fullRole = await fetchRoleById(role.id);
                                if (fullRole) {
                                  setSelectedRole(fullRole);
                                  setIsFormModalOpen(true);
                                } else {
                                  // Si falla, usar el rol del listado como fallback
                                  setSelectedRole(role);
                                  setIsFormModalOpen(true);
                                }
                              } catch (err) {
                                if (process.env.NODE_ENV === "development") {
                                  console.error("Error al cargar rol:", err);
                                }
                                // Fallback al rol del listado
                                setSelectedRole(role);
                                setIsFormModalOpen(true);
                              } finally {
                                setIsLoadingRole(false);
                              }
                            }}
                            style={{ color: "var(--apple-blue)" }}
                            disabled={isLoadingRole}
                          >
                            <Edit style={{ width: "16px", height: "16px" }} />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="icon"
                            size="sm"
                            onClick={() => {
                              setSelectedRole(role);
                              setIsDeleteModalOpen(true);
                            }}
                            style={{ color: "#FF3B30" }}
                          >
                            <Trash2 style={{ width: "16px", height: "16px" }} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Modal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedRole(null);
          }}
          title={selectedRole ? "Editar Rol" : "Nuevo Rol"}
          size="lg"
        >
          <RoleForm
            initialData={selectedRole}
            onSubmit={selectedRole ? handleUpdate : handleCreate}
            onCancel={() => {
              setIsFormModalOpen(false);
              setSelectedRole(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>

        {selectedRole && (
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedRole(null);
            }}
            title="Confirmar Eliminación"
            size="md"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
              <p style={{ font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                ¿Estás seguro de que deseas eliminar este rol?
              </p>
              <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)", fontWeight: 500 }}>
                {(selectedRole as any).name || (selectedRole as any).nombre}
              </p>
              <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
                Esta acción no se puede deshacer.
              </p>
              <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedRole(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  style={{ color: "#FF3B30", borderColor: "#FF3B30" }}
                >
                  {isSubmitting ? "Eliminando..." : "Eliminar"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}

export default function RolesPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute permission="roles.read">
        <RolesContent />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

