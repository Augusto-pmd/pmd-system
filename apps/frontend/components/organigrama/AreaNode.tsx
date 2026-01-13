"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmployeeNode } from "./EmployeeNode";
import { Employee } from "@/lib/types/employee";

interface AreaNodeProps {
  areaName: string;
  employees: Employee[];
}

export function AreaNode({ areaName, employees }: AreaNodeProps) {
  // Clasificar empleados por jerarquía
  const clasificarPorJerarquia = (employees: Employee[]) => {
    const jefes: Employee[] = [];
    const intermedios: Employee[] = [];
    const base: Employee[] = [];

    employees.forEach((emp) => {
      const puesto = (emp.puesto || emp.position || emp.role || "").toLowerCase();
      
      if (
        puesto.includes("jefe") ||
        puesto.includes("líder") ||
        puesto.includes("lider") ||
        puesto.includes("encargado") ||
        puesto.includes("director") ||
        puesto.includes("gerente") ||
        puesto.includes("coordinador")
      ) {
        jefes.push(emp);
      } else if (
        puesto.includes("obrero") ||
        puesto.includes("operario") ||
        puesto.includes("técnico") ||
        puesto.includes("tecnico") ||
        puesto.includes("ayudante")
      ) {
        base.push(emp);
      } else {
        intermedios.push(emp);
      }
    });

    return { jefes, intermedios, base };
  };

  const { jefes, intermedios, base } = clasificarPorJerarquia(employees);
  const todosEmpleados = [...jefes, ...intermedios, ...base];

  if (todosEmpleados.length === 0) {
    return (
      <Card className="border-l-4 border-l-pmd-mediumBlue">
        <CardHeader>
          <CardTitle className="text-xl">{areaName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No hay empleados en esta área</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-pmd-mediumBlue">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-pmd-darkBlue">{areaName}</CardTitle>
        <p className="text-sm text-gray-600 mt-1">{todosEmpleados.length} empleado{todosEmpleados.length !== 1 ? "s" : ""}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Jefes / Líderes */}
          {jefes.length > 0 && (
            <div className="space-y-3">
              {jefes.map((emp, index) => (
                <div key={emp.id} className="relative">
                  <EmployeeNode
                    employee={emp}
                    isFirst={index === 0}
                    isLast={index === jefes.length - 1 && intermedios.length === 0 && base.length === 0}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Conexión entre jefes e intermedios */}
          {jefes.length > 0 && intermedios.length > 0 && (
            <div className="flex justify-center">
              <div className="w-0.5 h-4 bg-gray-300" />
            </div>
          )}

          {/* Roles Intermedios */}
          {intermedios.length > 0 && (
            <div className="space-y-3">
              {intermedios.map((emp, index) => (
                <div key={emp.id} className="relative">
                  <EmployeeNode
                    employee={emp}
                    isFirst={index === 0 && jefes.length === 0}
                    isLast={index === intermedios.length - 1 && base.length === 0}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Conexión entre intermedios y base */}
          {intermedios.length > 0 && base.length > 0 && (
            <div className="flex justify-center">
              <div className="w-0.5 h-4 bg-gray-300" />
            </div>
          )}

          {/* Obreros / Base */}
          {base.length > 0 && (
            <div className="space-y-3">
              {base.map((emp, index) => (
                <div key={emp.id} className="relative">
                  <EmployeeNode
                    employee={emp}
                    isFirst={index === 0 && jefes.length === 0 && intermedios.length === 0}
                    isLast={index === base.length - 1}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

