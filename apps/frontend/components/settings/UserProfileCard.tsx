"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AuthUser } from "@/lib/normalizeUser";
import { getRoleString, translateRole, getRoleVariant } from "@/lib/roleHelpers";

interface UserProfileCardProps {
  user: (AuthUser & { createdAt?: string }) | null;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500 text-center">No hay información de usuario disponible</p>
        </CardContent>
      </Card>
    );
  }

  const getInitial = (name: string | undefined): string => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

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
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pmd-darkBlue to-pmd-mediumBlue flex items-center justify-center text-pmd-white text-3xl font-bold shadow-lg">
            {getInitial(user.fullName)}
          </div>

          {/* Información del usuario */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-pmd-darkBlue mb-2">
                {user.fullName || "Usuario sin nombre"}
              </h2>
              <div className="flex items-center gap-3">
                <Badge variant={getRoleVariant(user.role)}>{translateRole(user.role)}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                <p className="text-gray-900">{user.email || "No especificado"}</p>
              </div>

              {user.id && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">ID de usuario</p>
                  <p className="text-gray-600 font-mono text-sm">{user.id}</p>
                </div>
              )}

              {user.createdAt && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Fecha de creación</p>
                  <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
              )}

              {user.role && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Rol</p>
                  <p className="text-gray-900">{translateRole(user.role)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

