"use client";

import { useState, useEffect } from "react";
import { normalizeId } from "@/lib/normalizeId";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { useUsers } from "@/hooks/api/users";
import { mapCreateWorkPayload } from "@/lib/payload-mappers";
import { Work, CreateWorkData, UpdateWorkData, WorkType } from "@/lib/types/work";

interface WorkFormProps {
  initialData?: Work | null;
  onSubmit: (data: CreateWorkData | UpdateWorkData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function WorkForm({ initialData, onSubmit, onCancel, isLoading }: WorkFormProps) {
  const { users } = useUsers();
  
  // ✅ Modelo interno único alineado al backend (sin duplicados)
  const [formData, setFormData] = useState({
    name: "", // Nombre de la obra
    client: "", // Cliente (requerido)
    address: "", // Dirección (requerido)
    currency: "USD" as "USD" | "ARS", // Moneda (requerido)
    start_date: "", // Fecha de inicio (requerido, formato YYYY-MM-DD)
    end_date: "", // Fecha de fin (opcional, formato YYYY-MM-DD)
    status: "active" as "active" | "paused" | "finished" | "administratively_closed" | "archived", // Estado
    work_type: "" as WorkType | "", // Tipo de obra (opcional)
    supervisor_id: "", // Responsable (opcional, UUID)
    total_budget: "", // Presupuesto (opcional)
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      // ✅ Normalizar datos del backend al modelo único interno
      // Mapear estado del backend a valores válidos del enum
      const backendStatus = initialData.status || (initialData as any).estado || "active";
      const validStatus: "active" | "paused" | "finished" | "administratively_closed" | "archived" = 
        ["active", "paused", "finished", "administratively_closed", "archived"].includes(backendStatus)
          ? (backendStatus as any)
          : "active";
      
      // Normalizar fechas a formato YYYY-MM-DD
      const normalizeDate = (date: any): string => {
        if (!date) return "";
        try {
          const d = new Date(date);
          if (isNaN(d.getTime())) return "";
          return d.toISOString().split("T")[0];
        } catch {
          return "";
        }
      };
      
      setFormData({
        name: initialData.name || (initialData as any).nombre || "",
        client: initialData.client || "",
        address: initialData.address || (initialData as any).direccion || "",
        currency: (initialData.currency === "ARS" || initialData.currency === "USD") 
          ? initialData.currency 
          : "USD",
        start_date: normalizeDate(initialData.start_date || initialData.startDate || (initialData as any).fechaInicio || (initialData as any).estimatedStartDate),
        end_date: normalizeDate(initialData.end_date || initialData.endDate || (initialData as any).fechaFin),
        status: validStatus,
        work_type: initialData.work_type || "",
        supervisor_id: initialData.supervisor_id || (initialData as any).managerId || (initialData as any).responsableId || "",
        total_budget: initialData.total_budget !== undefined && initialData.total_budget !== null
          ? String(initialData.total_budget)
          : ((initialData as any).budget !== undefined && (initialData as any).budget !== null ? String((initialData as any).budget) : ((initialData as any).presupuesto || "")),
      });
    }
  }, [initialData]);

  // ✅ Validación UUID
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // ✅ Validación reactiva - se ejecuta cuando cambian los campos
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    // Validación obligatoria: name
    if (!formData.name?.trim()) {
      newErrors.name = "El nombre de la obra es obligatorio";
    }
    
    // Validación obligatoria: client
    if (!formData.client?.trim()) {
      newErrors.client = "El cliente es obligatorio";
    }
    
    // Validación obligatoria: address
    if (!formData.address?.trim()) {
      newErrors.address = "La dirección es obligatoria";
    }
    
    // Validación obligatoria: start_date
    if (!formData.start_date?.trim()) {
      newErrors.start_date = "La fecha de inicio es obligatoria";
    }
    
    // Validación obligatoria: currency
    if (!formData.currency || (formData.currency !== "ARS" && formData.currency !== "USD")) {
      newErrors.currency = "La moneda es obligatoria (ARS o USD)";
    }
    
    // ✅ Validación reactiva: fechaFin no puede ser < fechaInicio
    if (formData.start_date && formData.end_date) {
      const inicio = new Date(formData.start_date);
      const fin = new Date(formData.end_date);
      if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
        // Fechas inválidas ya se manejan arriba
      } else if (inicio > fin) {
        newErrors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
      }
    }
    
    // ✅ Validación: supervisor_id debe ser UUID válido si existe
    if (formData.supervisor_id && formData.supervisor_id.trim() !== "") {
      if (!isValidUUID(formData.supervisor_id.trim())) {
        newErrors.supervisor_id = "El ID del responsable debe ser un UUID válido";
      }
    }
    
    // ✅ Validación: total_budget no puede ser negativo
    if (formData.total_budget && formData.total_budget.trim() !== "") {
      const budgetNum = parseFloat(formData.total_budget);
      if (isNaN(budgetNum) || budgetNum < 0) {
        newErrors.total_budget = "El presupuesto debe ser un número positivo";
      }
    }
    
    setErrors(newErrors);
  }, [formData]);

  const validate = (): boolean => {
    // Las validaciones ya se ejecutan reactivamente, solo verificar si hay errores
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Usar función de mapeo para alinear EXACTAMENTE con el DTO del backend
    const payload = mapCreateWorkPayload(formData);

    // Validar campos requeridos del payload (ya validados en validate() pero doble verificación)
    if (!payload.name || !payload.client || !payload.address || !payload.start_date || !payload.currency) {
      throw new Error("Faltan campos requeridos: nombre, cliente, dirección, fecha de inicio o moneda");
    }

    try {
      await onSubmit(payload as any);
    } catch (error) {
      // El error ya se maneja en el componente padre
      if (process.env.NODE_ENV === "development") {
        console.error("Error en WorkForm:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      {/* Sección: Información Básica */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <div style={{ borderBottom: "1px solid var(--apple-border)", paddingBottom: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--apple-text-primary)" }}>Información Básica</h3>
        </div>
        
        {/* Nombre de la obra - OBLIGATORIO */}
        <FormField label="Nombre de la obra" required error={errors.name}>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Edificio Residencial Centro"
            required
          />
        </FormField>

        {/* Cliente - OBLIGATORIO */}
        <FormField label="Cliente" required error={errors.client}>
          <Input
            type="text"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            placeholder="Nombre del cliente"
            required
          />
        </FormField>

        {/* Dirección - OBLIGATORIO */}
        <FormField label="Dirección" required error={errors.address}>
          <Input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Dirección completa de la obra"
            required
          />
        </FormField>

        {/* Moneda - OBLIGATORIO */}
        <FormField label="Moneda" required error={errors.currency}>
          <Select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value as "USD" | "ARS" })}
            required
          >
            <option value="USD">USD (Dólar Estadounidense)</option>
            <option value="ARS">ARS (Peso Argentino)</option>
          </Select>
        </FormField>

        {/* Tipo de obra - OPCIONAL */}
        <FormField label="Tipo de obra">
          <Select
            value={formData.work_type}
            onChange={(e) => setFormData({ ...formData, work_type: e.target.value as WorkType | "" })}
          >
            <option value="">Seleccionar tipo</option>
            <option value={WorkType.HOUSE}>Casa</option>
            <option value={WorkType.LOCAL}>Local</option>
            <option value={WorkType.EXPANSION}>Ampliación</option>
            <option value={WorkType.RENOVATION}>Renovación</option>
            <option value={WorkType.OTHER}>Otro</option>
          </Select>
        </FormField>
      </div>

      {/* Sección: Estado y Fechas */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <div style={{ borderBottom: "1px solid var(--apple-border)", paddingBottom: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--apple-text-primary)" }}>Estado y Fechas</h3>
        </div>
        
        {/* Estado - OBLIGATORIO - Valores alineados con enum WorkStatus del backend */}
        <FormField label="Estado" required>
          <Select
            value={formData.status}
            onChange={(e) => {
              const status = e.target.value as "active" | "paused" | "finished" | "administratively_closed" | "archived";
              setFormData({ ...formData, status });
            }}
            required
          >
            <option value="active">Activa</option>
            <option value="paused">Pausada</option>
            <option value="finished">Finalizada</option>
            <option value="administratively_closed">Cerrada Administrativamente</option>
            <option value="archived">Archivada</option>
          </Select>
        </FormField>

        {/* Fechas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <FormField label="Fecha de inicio" required error={errors.start_date}>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Fecha estimada de finalización" error={errors.end_date}>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              min={formData.start_date}
            />
          </FormField>
        </div>
      </div>

      {/* Sección: Asignación y Presupuesto */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <div style={{ borderBottom: "1px solid var(--apple-border)", paddingBottom: "var(--space-sm)", marginBottom: "var(--space-xs)" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--apple-text-primary)" }}>Asignación y Presupuesto</h3>
        </div>
        
        {/* Responsable y Presupuesto */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-md)" }}>
          <FormField label="Responsable" error={errors.supervisor_id}>
            <Select
              value={formData.supervisor_id}
              onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
            >
              <option value="">Seleccionar responsable</option>
              {users?.map((user: any) => {
                const nombre = user.fullName || user.name || user.nombre || "Sin nombre";
                return (
                  <option key={user.id} value={normalizeId(user.id)}>
                    {nombre}
                  </option>
                );
              })}
            </Select>
          </FormField>
          <FormField label="Presupuesto" error={errors.total_budget}>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.total_budget}
              onChange={(e) => {
                const value = e.target.value;
                // ✅ Prevenir valores negativos en tiempo real
                if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setFormData({ ...formData, total_budget: value });
                }
              }}
              placeholder="0.00"
            />
          </FormField>
        </div>
      </div>


      {/* Botones - Sticky en mobile */}
      <div 
        style={{ 
          display: "flex", 
          gap: "var(--space-sm)", 
          position: "sticky",
          bottom: 0,
          backgroundColor: "var(--apple-surface)",
          paddingTop: "var(--space-md)",
          paddingBottom: "var(--space-md)",
          marginTop: "var(--space-md)",
          borderTop: "1px solid var(--apple-border)",
        }}
        className="md:static md:border-0 md:bg-transparent md:pb-0"
      >
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          style={{ flex: 1 }}
        >
          {initialData ? "Actualizar" : "Crear Obra"}
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
