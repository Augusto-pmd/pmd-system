"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "./UserAvatar";
import { AuthUser } from "@/lib/normalizeUser";
import { getRoleString, translateRole, getRoleVariant } from "@/lib/roleHelpers";

interface UserInfoSectionProps {
  user: (AuthUser & { createdAt?: string }) | null;
}

export function UserInfoSection({ user }: UserInfoSectionProps) {
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">No hay información de usuario disponible</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "No disponible";
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Usar helpers centralizados desde lib/roleHelpers

  return (
    <Card className="border-l-4 border-l-pmd-darkBlue">
      <CardHeader>
        <CardTitle>Datos del Usuario</CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="flex flex-col items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <UserAvatar name={user.fullName} size="xl" />
          </div>

          {/* Información del usuario */}
          <div className="flex-1 w-full space-y-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-pmd-darkBlue mb-3">
                {user.fullName || "Usuario sin nombre"}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Badge variant={getRoleVariant(user.role)} className="text-sm px-3 py-1">
                  {translateRole(user.role)}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700">Email</p>
                <p className="text-gray-900 text-lg">{user.email || "No especificado"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700">Rol</p>
                <p className="text-gray-900 text-lg">{translateRole(user.role)}</p>
              </div>

              {user.id && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-700">ID de usuario</p>
                  <p className="text-gray-600 font-mono text-sm break-all">{user.id}</p>
                </div>
              )}

              {user.createdAt && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-700">Fecha de creación</p>
                  <p className="text-gray-900 text-lg">{formatDate(user.createdAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

