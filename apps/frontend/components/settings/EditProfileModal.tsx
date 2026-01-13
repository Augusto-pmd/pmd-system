"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.fullName || "",
        email: user.email || "",
        phone: (user as any).phone || "",
      });
      setErrors({});
    } else if (!isOpen) {
      // Resetear formulario cuando se cierra el modal
      setFormData({
        name: "",
        email: "",
        phone: "",
      });
      setErrors({});
    }
  }, [isOpen, user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      if (formData.phone) {
        payload.phone = formData.phone.trim();
      }

      const response = await apiClient.patch("/users/me", payload);
      
      // Actualizar el usuario en el store
      if (response) {
        const updatedUser = (response as any)?.data || response;
        setUser(updatedUser);
        toast.success("Perfil actualizado correctamente");
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Error al actualizar el perfil";
      toast.error(errorMessage);
      if (process.env.NODE_ENV === "development") {
        console.error("Error al actualizar perfil:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil" size="md">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <InputField
          label="Nombre completo"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          required
          placeholder="Ingresa tu nombre completo"
        />

        <InputField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          required
          placeholder="tu@email.com"
        />

        <InputField
          label="Teléfono (opcional)"
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          error={errors.phone}
          placeholder="+1234567890"
        />

        <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

