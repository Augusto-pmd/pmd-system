"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { validatePositiveNumber, validateRequired } from "@/lib/validations";
import { CreateExchangeRateData, UpdateExchangeRateData } from "@/lib/types/exchange-rate";

interface ExchangeRateFormProps {
  initialData?: any;
  onSubmit: (data: CreateExchangeRateData | UpdateExchangeRateData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ExchangeRateForm({ initialData, onSubmit, onCancel, isLoading }: ExchangeRateFormProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    rate_ars_to_usd: 0.0012,
    rate_usd_to_ars: 850,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date?.split("T")[0] || new Date().toISOString().split("T")[0],
        rate_ars_to_usd: initialData.rate_ars_to_usd || 0.0012,
        rate_usd_to_ars: initialData.rate_usd_to_ars || 850,
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) {
      newErrors.date = "La fecha es obligatoria";
    }
    
    const arsToUsdValidation = validatePositiveNumber(formData.rate_ars_to_usd);
    if (!arsToUsdValidation.isValid) {
      newErrors.rate_ars_to_usd = arsToUsdValidation.error || "La tasa ARS a USD debe ser mayor que 0";
    }
    
    if (formData.rate_ars_to_usd > 1) {
      newErrors.rate_ars_to_usd = "La tasa ARS a USD no puede ser mayor que 1";
    }
    
    const usdToArsValidation = validatePositiveNumber(formData.rate_usd_to_ars);
    if (!usdToArsValidation.isValid) {
      newErrors.rate_usd_to_ars = usdToArsValidation.error || "La tasa USD a ARS debe ser mayor que 0";
    }
    
    if (formData.rate_usd_to_ars < 1) {
      newErrors.rate_usd_to_ars = "La tasa USD a ARS debe ser mayor o igual a 1";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    await onSubmit({
      date: formData.date,
      rate_ars_to_usd: Number(formData.rate_ars_to_usd),
      rate_usd_to_ars: Number(formData.rate_usd_to_ars),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Fecha"
        type="date"
        value={formData.date}
        onChange={(e) => {
          setFormData({ ...formData, date: e.target.value });
          if (errors.date) setErrors({ ...errors, date: "" });
        }}
        onBlur={() => {
          setTouched({ ...touched, date: true });
          if (!formData.date) {
            setErrors({ ...errors, date: "La fecha es obligatoria" });
          } else {
            setErrors({ ...errors, date: "" });
          }
        }}
        error={touched.date ? errors.date : undefined}
        required
      />

      <Input
        label="Tasa ARS a USD"
        type="number"
        step="0.0001"
        min="0.0001"
        max="1"
        value={formData.rate_ars_to_usd}
        onChange={(e) => {
          setFormData({ ...formData, rate_ars_to_usd: parseFloat(e.target.value) || 0 });
          if (errors.rate_ars_to_usd) setErrors({ ...errors, rate_ars_to_usd: "" });
        }}
        onBlur={() => {
          setTouched({ ...touched, rate_ars_to_usd: true });
          const validation = validatePositiveNumber(formData.rate_ars_to_usd);
          if (!validation.isValid) {
            setErrors({ ...errors, rate_ars_to_usd: validation.error || "La tasa debe ser mayor que 0" });
          } else if (formData.rate_ars_to_usd > 1) {
            setErrors({ ...errors, rate_ars_to_usd: "La tasa no puede ser mayor que 1" });
          } else {
            setErrors({ ...errors, rate_ars_to_usd: "" });
          }
        }}
        error={touched.rate_ars_to_usd ? errors.rate_ars_to_usd : undefined}
        required
      />

      <Input
        label="Tasa USD a ARS"
        type="number"
        step="0.0001"
        min="1"
        value={formData.rate_usd_to_ars}
        onChange={(e) => {
          setFormData({ ...formData, rate_usd_to_ars: parseFloat(e.target.value) || 0 });
          if (errors.rate_usd_to_ars) setErrors({ ...errors, rate_usd_to_ars: "" });
        }}
        onBlur={() => {
          setTouched({ ...touched, rate_usd_to_ars: true });
          const validation = validatePositiveNumber(formData.rate_usd_to_ars);
          if (!validation.isValid) {
            setErrors({ ...errors, rate_usd_to_ars: validation.error || "La tasa debe ser mayor que 0" });
          } else if (formData.rate_usd_to_ars < 1) {
            setErrors({ ...errors, rate_usd_to_ars: "La tasa debe ser mayor o igual a 1" });
          } else {
            setErrors({ ...errors, rate_usd_to_ars: "" });
          }
        }}
        error={touched.rate_usd_to_ars ? errors.rate_usd_to_ars : undefined}
        required
      />

      <div className="flex gap-3 justify-end pt-4">
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

