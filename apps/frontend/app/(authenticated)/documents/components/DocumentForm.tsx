"use client";

import { useState, useEffect } from "react";
import { InputField, SelectField, TextareaField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { useWorks } from "@/hooks/api/works";
import { useUsers } from "@/hooks/api/users";
import { normalizeId } from "@/lib/normalizeId";
import styles from "@/components/ui/form.module.css";

interface DocumentFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  defaultWorkId?: string;
}

const DOCUMENT_TYPES = [
  "Planos",
  "Memoria descriptiva",
  "Memoria técnica",
  "Contrato",
  "Permisos",
  "Legales",
  "Especificaciones",
  "Presupuesto",
  "Otro",
];

const DOCUMENT_STATUSES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en revisión", label: "En Revisión" },
  { value: "aprobado", label: "Aprobado" },
  { value: "rechazado", label: "Rechazado" },
];

export function DocumentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  defaultWorkId,
}: DocumentFormProps) {
  const { works } = useWorks();
  const { users } = useUsers();
  const [formData, setFormData] = useState({
    workId: defaultWorkId || "",
    type: "",
    name: "",
    version: "",
    status: "pendiente" as "aprobado" | "en revisión" | "pendiente" | "rechazado",
    uploadedBy: "",
    notes: "",
    file: null as File | null,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Asegurar que todos los campos estén definidos correctamente
      setFormData({
        workId: initialData.workId || initialData.work_id || defaultWorkId || "",
        type: initialData.type || "",
        name: initialData.name || initialData.nombre || "",
        version: initialData.version || "",
        status: (initialData.status || "pendiente") as "aprobado" | "en revisión" | "pendiente" | "rechazado",
        uploadedBy: initialData.uploadedBy || initialData.uploaded_by || "",
        notes: initialData.notes || initialData.notes || "",
        file: null,
      });
    } else if (defaultWorkId) {
      setFormData((prev: typeof formData) => ({ ...prev, workId: defaultWorkId }));
    }
  }, [initialData, defaultWorkId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.workId?.trim()) {
      newErrors.workId = "La obra es obligatoria";
    }

    if (!formData.type?.trim()) {
      newErrors.type = "El tipo es obligatorio";
    }

    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: any = {
      workId: formData.workId.trim(),
      type: formData.type.trim(),
      name: formData.name.trim(),
      version: formData.version?.trim() || undefined,
      status: formData.status,
      uploadedBy: formData.uploadedBy?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      file: formData.file || undefined,
    };

    // Limpiar campos undefined (excepto file)
    Object.keys(payload).forEach((key) => {
      if (key !== "file" && (payload[key] === undefined || payload[key] === "")) {
        delete payload[key];
      }
    });

    await onSubmit(payload);
  };

  const workOptions = [
    { value: "", label: "Seleccionar obra" },
    ...works.map((work: any) => {
      const workName = work.name || work.title || work.nombre || work.id;
      return { value: normalizeId(work.id), label: workName };
    }),
  ];

  const typeOptions = [
    { value: "", label: "Seleccionar tipo" },
    ...DOCUMENT_TYPES.map((type) => ({ value: type, label: type })),
  ];

  const statusOptions = DOCUMENT_STATUSES.map((status) => ({
    value: status.value,
    label: status.label,
  }));

  const userOptions = [
    { value: "", label: "Seleccionar responsable" },
    ...users.map((user: any) => {
      const userName = user.fullName || user.name || user.nombre || user.id;
      return { value: normalizeId(user.id), label: userName };
    }),
  ];

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <SelectField
        label="Obra"
        required
        value={formData.workId}
        onChange={(e) => setFormData({ ...formData, workId: e.target.value })}
        error={errors.workId}
        options={workOptions}
        disabled={!!defaultWorkId}
      />

      <SelectField
        label="Tipo"
        required
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        error={errors.type}
        options={typeOptions}
      />

      <InputField
        label="Nombre del documento"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        placeholder="Ej: Planta baja – V1.2"
      />

      <InputField
        label="Versión"
        value={formData.version}
        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
        placeholder="Ej: 1.2, v2.0, draft"
      />

      <SelectField
        label="Estado"
        value={formData.status}
        onChange={(e) =>
          setFormData({ ...formData, status: e.target.value as typeof formData.status })
        }
        options={statusOptions}
      />

      <SelectField
        label="Responsable"
        value={formData.uploadedBy}
        onChange={(e) => setFormData({ ...formData, uploadedBy: e.target.value })}
        options={userOptions}
      />

      <TextareaField
        label="Notas"
        value={formData.notes || ""}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        rows={3}
        placeholder="Notas adicionales sobre el documento"
      />

      <div>
        <label className={styles.label} style={{ marginBottom: "6px", display: "block" }}>
          Archivo (opcional)
        </label>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setFormData({ ...formData, file });
          }}
          className={styles.input}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf"
        />
        {formData.file && (
          <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)", marginTop: "4px" }}>
            Archivo seleccionado: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-sm)" }}>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Subir Documento"}
        </Button>
      </div>
    </form>
  );
}

