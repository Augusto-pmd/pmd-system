"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { InputField, SelectField, TextareaField } from "@/components/ui/FormField";
import { useUsersStore, UserPMD } from "@/store/usersStore";
import { useRoles } from "@/hooks/api/roles";
import { useToast } from "@/components/ui/Toast";
import { normalizeId } from "@/lib/normalizeId";
import styles from "@/components/ui/form.module.css";

interface UserFormProps {
  user?: UserPMD | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { createUser, updateUser } = useUsersStore();
  const { roles } = useRoles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    roleId: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        roleId: normalizeId(user.roleId) || "",
        password: "",
        confirmPassword: "",
      });
    } else {
      // Resetear formulario cuando no hay usuario (creación nueva)
      setFormData({
        fullName: "",
        email: "",
        roleId: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!formData.fullName.trim()) {
        toast.error("El nombre completo es obligatorio");
        setIsSubmitting(false);
        return;
      }

      if (!formData.email.trim()) {
        toast.error("El email es obligatorio");
        setIsSubmitting(false);
        return;
      }

      // Validar email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("El email no es válido");
        setIsSubmitting(false);
        return;
      }

      if (!formData.roleId) {
        toast.error("El rol es obligatorio");
        setIsSubmitting(false);
        return;
      }

      // Si es creación, validar contraseña
      if (!user) {
        if (!formData.password) {
          toast.error("La contraseña es obligatoria");
          setIsSubmitting(false);
          return;
        }

        if (formData.password.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres");
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          setIsSubmitting(false);
          return;
        }
      }

      // Si es edición y hay contraseña, validar
      if (user && formData.password) {
        if (formData.password.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres");
          setIsSubmitting(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Las contraseñas no coinciden");
          setIsSubmitting(false);
          return;
        }
      }

      // Construir payload exacto según backend DTO
      const payload: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        roleId: formData.roleId,
      };

      // Solo incluir contraseña si se proporcionó (creación o actualización con nueva contraseña)
      if (formData.password) {
        payload.password = formData.password;
      }

      if (user) {
        await updateUser(user.id, payload);
        toast.success("Usuario actualizado correctamente");
      } else {
        await createUser(payload);
        toast.success("Usuario creado correctamente");
      }

      onSuccess?.();
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al guardar usuario:", err);
      }
      const errorMessage = err instanceof Error ? err.message : "Error al guardar el usuario";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preparar opciones de roles, agregando una opción vacía por defecto cuando se crea un usuario nuevo
  const roleOptions = [
    ...(!user ? [{ value: "", label: "Seleccionar rol" }] : []),
    ...roles.map((role: any) => {
      const roleName = role.name || role.nombre || role.id;
      return { value: normalizeId(role.id), label: roleName };
    }),
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <InputField
        label="Nombre Completo"
        required
        type="text"
        value={formData.fullName}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, fullName: e.target.value }))}
        placeholder="Nombre completo del usuario"
      />

      <InputField
        label="Email"
        required
        type="email"
        value={formData.email}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
        placeholder="usuario@pmd.com"
      />

      <SelectField
        label="Rol"
        required
        value={formData.roleId}
        onChange={(e) => setFormData((prev: any) => ({ ...prev, roleId: e.target.value }))}
        options={roleOptions}
      />

      {!user && (
        <>
          <InputField
            label="Contraseña"
            required
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, password: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
          />

          <InputField
            label="Repetir Contraseña"
            required
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="Repetir contraseña"
          />
        </>
      )}

      {user && (
        <>
          <InputField
            label="Nueva Contraseña (opcional)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, password: e.target.value }))}
            placeholder="Dejar vacío para mantener la actual"
          />

          {formData.password && (
            <InputField
              label="Repetir Nueva Contraseña"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Repetir nueva contraseña"
            />
          )}
        </>
      )}

      <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-sm)" }}>
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="outline" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : user ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}

