"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useUsers } from "@/hooks/api/users";
import { User } from "@/lib/types/user";

interface AssignUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string, role?: string) => Promise<void>;
  assignedUserIds: string[];
  isLoading?: boolean;
}

export function AssignUserModal({
  isOpen,
  onClose,
  onAssign,
  assignedUserIds,
  isLoading = false,
}: AssignUserModalProps) {
  const { users } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [role, setRole] = useState("");

  // Filtrar usuarios que no están asignados
  const availableUsers = (users || []).filter(
    (user: User) => !assignedUserIds.includes(user.id)
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId("");
      setRole("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    await onAssign(selectedUserId, role || undefined);
    setSelectedUserId("");
    setRole("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Personal">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Usuario"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          required
          disabled={isLoading}
        >
          <option value="">Seleccionar usuario</option>
          {availableUsers.map((user: User) => (
            <option key={user.id} value={user.id}>
              {user.fullName || user.name || user.email} {user.role && `(${user.role.name})`}
            </option>
          ))}
        </Select>

        <Input
          label="Rol en la obra (opcional)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Ej: Operador, Supervisor, etc."
          disabled={isLoading}
        />

        {availableUsers.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay usuarios disponibles para asignar
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !selectedUserId || availableUsers.length === 0}
          >
            {isLoading ? "Asignando..." : "Asignar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

