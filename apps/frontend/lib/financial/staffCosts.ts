/**
 * Utilidades para cálculos financieros del personal
 */

export interface StaffMember {
  id: string;
  fullName?: string;
  name?: string;
  salary?: number;
  department?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

/**
 * Calcula el costo laboral total por departamento
 */
export function calculateStaffCostByDepartment(staffList: StaffMember[]): Record<string, number> {
  const costs: Record<string, number> = {
    Arquitectura: 0,
    Administración: 0,
    Logística: 0,
    "Oficina Técnica": 0,
    "Jefe de Obra": 0,
    Operativo: 0,
  };

  staffList.forEach((staff) => {
    if (!staff.isActive && staff.isActive !== undefined) return; // Solo contar activos
    
    const salary = staff.salary || 0;
    const department = staff.department || "";

    if (department && costs.hasOwnProperty(department)) {
      costs[department] += salary;
    } else if (department) {
      // Si el departamento no está en la lista, agregarlo
      costs[department] = (costs[department] || 0) + salary;
    }
  });

  return costs;
}

/**
 * Calcula el costo laboral mensual total
 */
export function calculateTotalStaffCost(staffList: StaffMember[]): number {
  return staffList
    .filter((staff) => staff.isActive !== false) // Solo contar activos
    .reduce((total, staff) => total + (staff.salary || 0), 0);
}

/**
 * Calcula el costo de oficina (Arquitectura + Administración + Oficina Técnica)
 */
export function calculateOfficeCost(staffList: StaffMember[]): number {
  const officeDepartments = ["Arquitectura", "Administración", "Oficina Técnica"];
  
  return staffList
    .filter((staff) => {
      if (staff.isActive === false) return false;
      const dept = staff.department || "";
      return officeDepartments.includes(dept);
    })
    .reduce((total, staff) => total + (staff.salary || 0), 0);
}

/**
 * Calcula el costo operativo (Operativo + Jefes de Obra + Logística)
 */
export function calculateOperativeCost(staffList: StaffMember[]): number {
  const operativeDepartments = ["Operativo", "Jefe de Obra", "Logística"];
  
  return staffList
    .filter((staff) => {
      if (staff.isActive === false) return false;
      const dept = staff.department || "";
      return operativeDepartments.includes(dept);
    })
    .reduce((total, staff) => total + (staff.salary || 0), 0);
}

/**
 * Obtiene estadísticas de personal por departamento
 */
export function getStaffStatsByDepartment(staffList: StaffMember[]): {
  department: string;
  count: number;
  totalCost: number;
  averageSalary: number;
}[] {
  const departmentMap: Record<string, { count: number; totalCost: number }> = {};

  staffList.forEach((staff) => {
    if (staff.isActive === false) return;
    
    const dept = staff.department || "Sin departamento";
    const salary = staff.salary || 0;

    if (!departmentMap[dept]) {
      departmentMap[dept] = { count: 0, totalCost: 0 };
    }

    departmentMap[dept].count += 1;
    departmentMap[dept].totalCost += salary;
  });

  return Object.entries(departmentMap).map(([department, data]) => ({
    department,
    count: data.count,
    totalCost: data.totalCost,
    averageSalary: data.count > 0 ? data.totalCost / data.count : 0,
  }));
}

