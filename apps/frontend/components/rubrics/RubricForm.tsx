"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface RubricFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RubricForm({ initialData, onSubmit, onCancel, isLoading }: RubricFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setCode(initialData.code || "");
      setIsActive(initialData.is_active !== undefined ? initialData.is_active : true);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name || name.trim() === "") {
      newErrors.name = "El nombre de la rúbrica es obligatorio";
    }

    if (name && name.length > 255) {
      newErrors.name = "El nombre no puede exceder 255 caracteres";
    }

    if (code && code.length > 50) {
      newErrors.code = "El código no puede exceder 50 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload: any = {
      name: name.trim(),
      is_active: isActive,
    };

    if (description.trim()) {
      payload.description = description.trim();
    }

    if (code.trim()) {
      payload.code = code.trim();
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <div>
        <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
          Nombre <span style={{ color: "#FF3B30" }}>*</span>
        </label>
        <Input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          placeholder="Ej: Materiales, Mano de Obra, Servicios"
          error={errors.name}
          disabled={isLoading}
          maxLength={255}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
          Código
        </label>
        <Input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (errors.code) setErrors({ ...errors, code: "" });
          }}
          placeholder="Ej: MAT, MO, SERV"
          error={errors.code}
          disabled={isLoading}
          maxLength={50}
        />
        <p style={{ fontSize: "12px", color: "var(--apple-text-secondary)", marginTop: "4px" }}>
          Identificador corto para la rúbrica (opcional)
        </p>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción de la rúbrica (opcional)"
          disabled={isLoading}
          rows={3}
          style={{
            width: "100%",
            padding: "var(--space-sm)",
            border: "1px solid var(--apple-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "14px",
            fontFamily: "inherit",
            resize: "vertical",
            backgroundColor: "var(--apple-surface)",
            color: "var(--apple-text-primary)",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "var(--space-xs)", fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
          Estado
        </label>
        <Select
          value={isActive ? "active" : "inactive"}
          onChange={(e) => setIsActive(e.target.value === "active")}
          disabled={isLoading}
        >
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
        </Select>
      </div>

      <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}

