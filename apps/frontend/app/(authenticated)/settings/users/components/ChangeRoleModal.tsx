"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormField";
import { useUsersStore, UserPMD } from "@/store/usersStore";
import { useRoles } from "@/hooks/api/roles";
import { useToast } from "@/components/ui/Toast";
import { normalizeId } from "@/lib/normalizeId";

interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserPMD | null;
  onSuccess?: () => void;
}

export function ChangeRoleModal({ isOpen, onClose, user, onSuccess }: ChangeRoleModalProps) {
  const { changeUserRole } = useUsersStore();
  const { roles } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setSelectedRoleId(normalizeId(user.roleId));
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;

    if (!selectedRoleId) {
      toast.error("Debes seleccionar un rol");
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects: PATCH /api/users/:id/role with { roleId: UUID }
      await changeUserRole(user.id, selectedRoleId);
      toast.success("Rol actualizado correctamente");
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al cambiar rol:", err);
      }
      const errorMessage = err instanceof Error ? err.message : "Error al cambiar el rol";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const roleOptions = roles.map((role: any) => {
    const roleName = role.name || role.nombre || role.id;
    return { value: normalizeId(role.id), label: roleName };
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar Rol de Usuario"
      subtitle={`Selecciona un nuevo rol para ${user.fullName}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="outline" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </>
      }
    >
      <SelectField
        label="Rol"
        value={selectedRoleId}
        onChange={(e) => setSelectedRoleId(e.target.value)}
        options={roleOptions}
      />
    </Modal>
  );
}

