"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUsers } from "@/hooks/api/users";
import { LoadingState } from "@/components/ui/LoadingState";
import { UsersList } from "@/components/users/UsersList";
import { BotonVolver } from "@/components/ui/BotonVolver";

function UsersContent() {
  const { users, isLoading, error } = useUsers();

  if (isLoading) {
    return <LoadingState message="Cargando usuarios…" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
        Error al cargar los usuarios: {error.message || "Error desconocido"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <BotonVolver />
        <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Usuarios</h1>
        <p className="text-gray-600">Listado de usuarios registrados en PMD</p>
      </div>

      <UsersList users={users || []} />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  );
}

