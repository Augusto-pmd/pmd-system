"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRoles, roleApi } from "@/hooks/api/roles";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSWRConfig } from "swr";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { CreateRoleData, UpdateRoleData, UserRole } from "@/lib/types/role";

function AdminRolesContent() {
  const { roles, isLoading, error, mutate } = useRoles();
  const { mutate: globalMutate } = useSWRConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", permissions: [] });

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "", permissions: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name || "",
      description: role.description || "",
      permissions: role.permissions || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    setDeleteLoading(id);
    try {
      await roleApi.delete(id);
      mutate();
      globalMutate("/roles");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete role";
      alert(errorMessage);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingRole) {
        // Para actualizar, solo enviamos los campos que tienen valores
        const updateData: UpdateRoleData = {};
        if (formData.name) {
          updateData.name = formData.name as UserRole;
        }
        if (formData.description) {
          updateData.description = formData.description;
        }
        if (formData.permissions && formData.permissions.length > 0) {
          // Convertir array a Record si es necesario, o mantener como array
          updateData.permissions = formData.permissions as string[];
        }
        await roleApi.update(editingRole.id, updateData);
      } else {
        // Para crear, el name es requerido
        const createData: CreateRoleData = {
          name: formData.name as UserRole,
          description: formData.description || undefined,
          // Omitir permissions si está vacío, ya que CreateRoleData espera Record<string, unknown>
          // y en este componente no se manejan permisos como objeto
        };
        await roleApi.create(createData);
      }
      mutate();
      globalMutate("/roles");
      setIsModalOpen(false);
      setEditingRole(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save role";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState message="Loading roles..." />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error loading roles: {error.message || "Unknown error"}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <BotonVolver />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Roles – PMD Backend Integration</h1>
            <p className="text-gray-600">Manage user roles and permissions</p>
          </div>
          <Button onClick={handleCreate}>+ Add Role</Button>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total Roles</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">{roles?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Admin</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">
                  {roles?.filter((r: any) => r.name === "admin").length || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Auditor</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">
                  {roles?.filter((r: any) => r.name === "auditor").length || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Operator</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">
                  {roles?.filter((r: any) => r.name === "operator").length || 0}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">Role List</h2>
            {roles?.length === 0 ? (
              <EmptyState
                title="No roles found"
                description="Create your first role to get started"
                action={<Button onClick={handleCreate}>Create Role</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Permissions</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {roles?.map((role: any) => (
                      <tr key={role.id}>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{role.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{role.description || "-"}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {Array.isArray(role.permissions)
                            ? role.permissions.length
                            : 0}{" "}
                          permissions
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(role)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(role.id)}
                              disabled={deleteLoading === role.id}
                            >
                              {deleteLoading === role.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRole(null);
          }}
          title={editingRole ? "Edit Role" : "Create Role"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Role Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-pmd focus:ring-2 focus:ring-pmd-gold focus:border-pmd-gold outline-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRole(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingRole ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}

export default function AdminRolesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminRolesContent />
    </ProtectedRoute>
  );
}
