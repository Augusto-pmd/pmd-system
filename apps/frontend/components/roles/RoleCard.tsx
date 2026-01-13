"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Role } from "@/lib/types/role";

interface RoleCardProps {
  role: Role;
}

export function RoleCard({ role }: RoleCardProps) {
  const router = useRouter();

  const getRoleName = () => {
    return (role as any).nombre || role.name || "Sin nombre";
  };

  const getRoleDescription = () => {
    return (role as any).descripcion || role.description || null;
  };

  const getRoleLabel = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower === "admin") return "Administrador";
    if (nameLower === "operator") return "Operador";
    if (nameLower === "auditor") return "Auditor";
    return name;
  };

  const getRoleVariant = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower === "admin") return "error";
    if (nameLower === "operator") return "info";
    if (nameLower === "auditor") return "warning";
    return "default";
  };

  const getPermissionsCount = () => {
    const permissions = (role as any).permisos || role.permissions || [];
    return Array.isArray(permissions) ? permissions.length : 0;
  };

  const getUserCount = () => {
    return (role as any).cantidadUsuarios || (role as any).userCount || null;
  };

  return (
    <Card className="border-l-4 border-[#162F7F]/40 hover:bg-white/15 transition-all">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-pmd-darkBlue">{getRoleName()}</h3>
              <Badge variant={getRoleVariant(getRoleName())}>
                {getRoleLabel(getRoleName())}
              </Badge>
            </div>
            {getRoleDescription() && (
              <p className="text-sm text-gray-600 line-clamp-2">{getRoleDescription()}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Permisos:</span>
              <span className="text-sm text-gray-900 font-medium">{getPermissionsCount()}</span>
            </div>
            {getUserCount() !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Usuarios:</span>
                <span className="text-sm text-gray-900 font-medium">{getUserCount()}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/roles/${role.id}`)}
            >
              Ver rol
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

