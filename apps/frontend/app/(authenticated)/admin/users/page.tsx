"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUsers, userApi } from "@/hooks/api/users";
import { useRoles } from "@/hooks/api/roles";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { UserForm } from "@/components/forms/UserForm";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSWRConfig } from "swr";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { CreateUserData, UpdateUserData } from "@/lib/types/user";

function AdminUsersContent() {
  const { users, isLoading, error, mutate } = useUsers();
  const { roles } = useRoles();
  const { mutate: globalMutate } = useSWRConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeleteLoading(id);
    try {
      await userApi.delete(id);
      mutate();
      globalMutate("/users");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete user";
      alert(message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (data: { name: string; email: string; password?: string; role: string }) => {
    setIsSubmitting(true);
    try {
      // Buscar el role_id del rol por su nombre
      const roleObj = roles?.find((r: any) => r.name === data.role);
      const roleId = roleObj?.id || editingUser?.role?.id;

      if (editingUser) {
        // Para actualizar
        const updateData: UpdateUserData = {
          name: data.name,
          email: data.email,
          role_id: roleId,
        };
        if (data.password) {
          updateData.password = data.password;
        }
        await userApi.update(editingUser.id, updateData);
      } else {
        // Para crear, role_id es requerido
        if (!roleId) {
          alert("Error: No se pudo encontrar el ID del rol seleccionado");
          setIsSubmitting(false);
          return;
        }
        if (!data.password) {
          alert("Error: La contraseña es requerida para crear un usuario");
          setIsSubmitting(false);
          return;
        }
        const createData: CreateUserData = {
          name: data.name,
          email: data.email,
          password: data.password,
          role_id: roleId,
        };
        await userApi.create(createData);
      }
      mutate();
      globalMutate("/users");
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save user";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState message="Loading users..." />
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error loading users: {error.message || "Unknown error"}
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
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Users – PMD Backend Integration</h1>
            <p className="text-gray-600">Manage system users</p>
          </div>
          <Button onClick={handleCreate}>+ Add User</Button>
        </div>

        <div className="bg-white rounded-lg shadow-pmd p-6">
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-pmd-darkBlue">{users?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users?.filter((u) => (u as any).status !== "inactive").length || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-pmd p-4">
                <p className="text-sm text-gray-600 mb-1">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-600">
                  {users?.filter((u) => (u as any).status === "inactive").length || 0}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-pmd-darkBlue mb-4">User List</h2>
            {users?.length === 0 ? (
              <EmptyState
                title="No users found"
                description="Create your first user to get started"
                action={<Button onClick={handleCreate}>Create User</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users?.map((user) => {
                      // role ahora es SIEMPRE un objeto { id, name }
                      const userRole = user?.role?.name || '';
                      return (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{user?.fullName || user?.name || ""}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant="info">{String(userRole)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant={(user as any).status === "active" ? "success" : "default"}>
                            {(user as any).status || "active"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(user)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(user.id)}
                              disabled={deleteLoading === user.id}
                            >
                              {deleteLoading === user.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
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
            setEditingUser(null);
          }}
          title={editingUser ? "Edit User" : "Create User"}
        >
          <UserForm
            initialData={editingUser ? {
              name: editingUser.fullName || editingUser.name || "",
              email: editingUser.email || "",
              role: editingUser.role?.name || "operator",
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingUser(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
