"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useWorks } from "@/hooks/api/works";

interface ClientFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClientForm({ initialData, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const { works } = useWorks();
  
  const [formData, setFormData] = useState({
    name: "",
    nombre: "",
    email: "",
    phone: "",
    telefono: "",
    address: "",
    direccion: "",
    notes: "",
    notas: "",
    status: "activo" as "activo" | "inactivo",
    estado: "activo" as "activo" | "inactivo",
    projects: [] as string[],
    obras: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // Normalizar datos del backend (puede venir en español o inglés)
      setFormData({
        name: initialData.name || initialData.nombre || "",
        nombre: initialData.nombre || initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || initialData.telefono || "",
        telefono: initialData.telefono || initialData.phone || "",
        address: initialData.address || initialData.direccion || "",
        direccion: initialData.direccion || initialData.address || "",
        notes: initialData.notes || initialData.notas || "",
        notas: initialData.notas || initialData.notes || "",
        status: initialData.status || initialData.estado || "activo",
        estado: initialData.estado || initialData.status || "activo",
        projects: initialData.projects || initialData.obras || [],
        obras: initialData.obras || initialData.projects || [],
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validación obligatoria: nombre
    const nombre = formData.name || formData.nombre;
    if (!nombre?.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    // Validar email si está presente
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    
    // Validar teléfono si está presente (formato básico)
    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "El formato del teléfono no es válido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Preparar payload según lo que el backend espera
    const payload: any = {
      // Campos principales (usar name como estándar, pero también enviar nombre para compatibilidad)
      name: (formData.name || formData.nombre).trim(),
      nombre: (formData.name || formData.nombre).trim(), // Compatibilidad
      email: formData.email.trim() || undefined,
      phone: formData.phone || formData.telefono || undefined,
      telefono: formData.phone || formData.telefono || undefined, // Compatibilidad
      address: formData.address || formData.direccion || undefined,
      direccion: formData.address || formData.direccion || undefined, // Compatibilidad
      notes: formData.notes || formData.notas || undefined,
      notas: formData.notes || formData.notas || undefined, // Compatibilidad
      status: formData.status || formData.estado || "activo",
      estado: formData.status || formData.estado || "activo", // Compatibilidad
      projects: formData.projects.length > 0 ? formData.projects : undefined,
      obras: formData.projects.length > 0 ? formData.projects : undefined, // Compatibilidad
    };

    // Limpiar campos undefined del payload
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    try {
      await onSubmit(payload);
    } catch (error) {
      // El error ya se maneja en el componente padre
      console.error("Error en ClientForm:", error);
    }
  };

  const toggleProject = (workId: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.includes(workId)
        ? prev.projects.filter((id: string) => id !== workId)
        : [...prev.projects, workId],
      obras: prev.projects.includes(workId)
        ? prev.projects.filter((id: string) => id !== workId)
        : [...prev.projects, workId], // Compatibilidad
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      {/* Nombre - OBLIGATORIO */}
      <FormField label="Nombre" required error={errors.name}>
        <Input
          type="text"
          value={formData.name || formData.nombre}
          onChange={(e) => setFormData({ ...formData, name: e.target.value, nombre: e.target.value })}
          placeholder="Nombre completo del cliente"
          required
        />
      </FormField>

      {/* Email y Teléfono */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
        <FormField label="Email" error={errors.email}>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="cliente@ejemplo.com"
          />
        </FormField>
        <FormField label="Teléfono" error={errors.phone}>
          <Input
            type="tel"
            value={formData.phone || formData.telefono}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value, telefono: e.target.value })}
            placeholder="+54 9 11 1234-5678"
          />
        </FormField>
      </div>

      {/* Dirección */}
      <FormField label="Dirección">
        <Textarea
          value={formData.address || formData.direccion}
          onChange={(e) => setFormData({ ...formData, address: e.target.value, direccion: e.target.value })}
          rows={3}
          placeholder="Dirección completa del cliente"
        />
      </FormField>

      {/* Estado */}
      <FormField label="Estado">
        <Select
          value={formData.status || formData.estado}
          onChange={(e) => {
            const status = e.target.value as "activo" | "inactivo";
            setFormData({ ...formData, status, estado: status });
          }}
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </Select>
      </FormField>

      {/* Notas */}
      <FormField label="Notas internas">
        <Textarea
          value={formData.notes || formData.notas}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value, notas: e.target.value })}
          rows={3}
          placeholder="Notas adicionales sobre el cliente"
        />
      </FormField>

      {/* Obras Vinculadas */}
      <FormField label="Obras Vinculadas">
        <div
          style={{
            border: "1px solid var(--apple-border-strong)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
            maxHeight: "192px",
            overflowY: "auto",
            backgroundColor: "var(--apple-surface)",
          }}
        >
          {works?.length === 0 ? (
            <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)", margin: 0 }}>
              No hay obras disponibles
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
              {works?.map((work: any) => {
                const workName = work.name || work.title || work.nombre || work.id;
                const isSelected = formData.projects.includes(work.id);
                return (
                  <label
                    key={work.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-sm)",
                      cursor: "pointer",
                      padding: "var(--space-xs) var(--space-sm)",
                      borderRadius: "var(--radius-md)",
                      transition: "background-color 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--apple-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProject(work.id)}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                        accentColor: "var(--apple-blue)",
                      }}
                    />
                    <span style={{ font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
                      {workName}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        {formData.projects.length > 0 && (
          <p
            style={{
              marginTop: "var(--space-xs)",
              fontSize: "13px",
              color: "var(--apple-text-secondary)",
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            {formData.projects.length} obra{formData.projects.length !== 1 ? "s" : ""} seleccionada
            {formData.projects.length !== 1 ? "s" : ""}
          </p>
        )}
      </FormField>

      {/* Botones */}
      <div style={{ display: "flex", gap: "var(--space-sm)", paddingTop: "var(--space-md)" }}>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          style={{ flex: 1 }}
        >
          {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear Cliente"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
