/**
 * Tipos TypeScript para Employee del frontend
 * Basado en las interfaces Employee encontradas en los componentes de organigrama
 */

export interface Employee {
  id: string;
  fullName?: string;
  name?: string;
  nombre?: string;
  role?: string;
  subrole?: string;
  workId?: string;
  obraId?: string; // Alias para workId
  isActive?: boolean;
  email?: string;
  phone?: string;
  hireDate?: string;
  puesto?: string;
  position?: string;
  area?: string;
  areaTrabajo?: string;
  seguro?: {
    fechaVencimiento?: string;
    expirationDate?: string;
  };
  insurance?: {
    fechaVencimiento?: string;
    expirationDate?: string;
  };
}

