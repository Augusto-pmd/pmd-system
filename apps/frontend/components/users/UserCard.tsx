"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { User } from "@/lib/types/user";

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const router = useRouter();

  const getUserName = () => {
    return (user as any).nombre || user.fullName || user.name || "Sin nombre";
  };

  const getUserEmail = () => {
    return user.email || null;
  };

  const getUserRole = (): string | null => {
    if ((user as any).rol) return (user as any).rol;
    if (user.role && typeof user.role.name === "string") {
      return user.role.name;
    }
    return null;
  };

  const getRoleLabel = (role: string | null) => {
    if (!role) return "Sin rol";
    const roleLower = role.toLowerCase();
    if (roleLower === "admin") return "Administrador";
    if (roleLower === "operator") return "Operador";
    if (roleLower === "auditor") return "Auditor";
    return role;
  };

  const getRoleVariant = (role: string | null) => {
    if (!role) return "default";
    const roleLower = role.toLowerCase();
    if (roleLower === "admin") return "error";
    if (roleLower === "operator") return "info";
    if (roleLower === "auditor") return "warning";
    return "default";
  };

  const getUserStatus = () => {
    return (user as any).estado || (user as any).status || "activo";
  };

  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "activo" || statusLower === "active") return "success";
    if (statusLower === "inactivo" || statusLower === "inactive") return "default";
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "active") return "Activo";
    if (statusLower === "inactive") return "Inactivo";
    return status;
  };

  return (
    <Card className="border-l-4 border-[#162F7F]/40 hover:bg-white/15 transition-all">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-pmd-darkBlue mb-2">{getUserName()}</h3>
          </div>

          <div className="space-y-2">
            {getUserEmail() && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="text-sm text-gray-900 font-medium">{getUserEmail()}</span>
              </div>
            )}

            {getUserRole() && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Rol:</span>
                <Badge variant={getRoleVariant(getUserRole())}>
                  {getRoleLabel(getUserRole())}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Estado:</span>
              <Badge variant={getStatusVariant(getUserStatus())}>
                {getStatusLabel(getUserStatus())}
              </Badge>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/users/${user.id}`)}
            >
              Ver usuario
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

