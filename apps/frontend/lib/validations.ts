/**
 * Funciones de validación reutilizables para formularios
 */

/**
 * Valida formato de CUIT (11 dígitos)
 */
export function validateCuit(cuit: string): { isValid: boolean; error?: string } {
  if (!cuit) return { isValid: true }; // Opcional
  
  // Remover guiones y espacios
  const cleanCuit = cuit.replace(/[-\s]/g, '');
  
  // Debe tener 11 dígitos
  if (!/^\d{11}$/.test(cleanCuit)) {
    return { isValid: false, error: 'El CUIT debe tener 11 dígitos' };
  }
  
  // Validar checksum
  const digits = cleanCuit.split('').map(Number);
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * multipliers[i];
  }
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  if (checkDigit !== digits[10]) {
    return { isValid: false, error: 'El CUIT no es válido (dígito verificador incorrecto)' };
  }
  
  return { isValid: true };
}

/**
 * Formatea CUIT con guiones (XX-XXXXXXXX-X)
 */
export function formatCuit(cuit: string): string {
  if (!cuit) return '';
  const cleanCuit = cuit.replace(/[-\s]/g, '');
  if (cleanCuit.length <= 2) return cleanCuit;
  if (cleanCuit.length <= 10) return `${cleanCuit.slice(0, 2)}-${cleanCuit.slice(2)}`;
  return `${cleanCuit.slice(0, 2)}-${cleanCuit.slice(2, 10)}-${cleanCuit.slice(10)}`;
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) return { isValid: true }; // Opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'El email no tiene un formato válido' };
  }
  return { isValid: true };
}

/**
 * Valida que un número sea mayor que 0
 */
export function validatePositiveNumber(value: number | string): { isValid: boolean; error?: string } {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return { isValid: false, error: 'Debe ser un número válido' };
  }
  if (num <= 0) {
    return { isValid: false, error: 'Debe ser mayor que 0' };
  }
  return { isValid: true };
}

/**
 * Valida que un número sea mayor o igual que 0
 */
export function validateNonNegativeNumber(value: number | string): { isValid: boolean; error?: string } {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return { isValid: false, error: 'Debe ser un número válido' };
  }
  if (num < 0) {
    return { isValid: false, error: 'Debe ser mayor o igual que 0' };
  }
  return { isValid: true };
}

/**
 * Valida rango de fechas (endDate debe ser después de startDate)
 */
export function validateDateRange(
  startDate: string,
  endDate: string
): { isValid: boolean; error?: string } {
  if (!startDate || !endDate) return { isValid: true }; // Opcional
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Las fechas deben tener un formato válido' };
  }
  
  if (end <= start) {
    return { isValid: false, error: 'La fecha de fin debe ser posterior a la fecha de inicio' };
  }
  
  return { isValid: true };
}

/**
 * Valida que un campo requerido no esté vacío
 */
export function validateRequired(value: any): { isValid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'Este campo es obligatorio' };
  }
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: 'Este campo es obligatorio' };
  }
  return { isValid: true };
}

/**
 * Valida que un UUID tenga formato válido
 */
export function validateUuid(uuid: string): { isValid: boolean; error?: string } {
  if (!uuid) return { isValid: true }; // Opcional
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return { isValid: false, error: 'El ID no tiene un formato válido' };
  }
  return { isValid: true };
}

/**
 * Valida porcentaje (0-100)
 */
export function validatePercentage(value: number | string): { isValid: boolean; error?: string } {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return { isValid: false, error: 'Debe ser un número válido' };
  }
  if (num < 0 || num > 100) {
    return { isValid: false, error: 'Debe estar entre 0 y 100' };
  }
  return { isValid: true };
}

