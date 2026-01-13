"use client";

import { RoleCard } from "./RoleCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Role } from "@/lib/types/role";

interface RolesListProps {
  roles: Role[];
}

export function RolesList({ roles }: RolesListProps) {
  if (roles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-pmd p-12 text-center">
        <p className="text-gray-600 text-lg">No hay roles registrados</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => (
        <RoleCard key={role.id} role={role} />
      ))}
    </div>
  );
}

