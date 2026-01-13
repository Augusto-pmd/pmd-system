"use client";

import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useUser } from "@/hooks/api/users";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";

function UserDetailContent() {
  const params = useParams();
  const router = useRouter();
  
  const id = typeof params?.id === "string" ? params.id : null;
  
  const { user, isLoading, error } = useUser(id || "");

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <LoadingState message="Cargando usuario…" />
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar el usuario: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/users")}>Volver a Usuarios</Button>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Usuario no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/users")}>Volver a Usuarios</Button>
        </div>
      </>
    );
  }

  const getUserName = () => {
    return (user as any).nombre || user.fullName || user.name || "Sin nombre";
  };

  const getUserRole = () => {
    if ((user as any).rol) return (user as any).rol;
    if (user.role) {
      return user.role.name || null;
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No especificada";
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

  // Función para renderizar un campo si existe
  const renderField = (label: string, value: any, formatter?: (val: any) => string) => {
    if (value === null || value === undefined || value === "") return null;
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{label}</h3>
        <p className="text-gray-900">{formatter ? formatter(value) : String(value)}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
        <div>
          <BotonVolver backTo="/users" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle del usuario</h1>
            <p className="text-gray-600">Información completa del usuario seleccionado</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/users")}>
            Volver a Usuarios
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{getUserName()}</CardTitle>
              <div className="flex gap-2">
                {getUserRole() && (
                  <Badge variant={getRoleVariant(getUserRole())}>
                    {getRoleLabel(getUserRole())}
                  </Badge>
                )}
                <Badge variant={getStatusVariant(getUserStatus())}>
                  {getStatusLabel(getUserStatus())}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField("Nombre completo", (user as any).nombre || user.fullName || user.name)}
              {renderField("Email", user.email)}
              {renderField("Rol", getUserRole() ? getRoleLabel(getUserRole()) : null)}
              {renderField("Estado", getStatusLabel(getUserStatus()))}
              {renderField("Fecha de creación", user.createdAt, formatDate)}
              {renderField("Última actualización", user.updatedAt, formatDate)}
            </div>

            {/* Mostrar campos adicionales si existen */}
            {Object.keys(user).some(
              (key) =>
                ![
                  "id",
                  "nombre",
                  "name",
                  "fullName",
                  "email",
                  "rol",
                  "role",
                  "estado",
                  "status",
                  "createdAt",
                  "updatedAt",
                ].includes(key) &&
                (user as any)[key] !== null &&
                (user as any)[key] !== undefined &&
                (user as any)[key] !== ""
            ) && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Información adicional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.keys(user)
                    .filter(
                      (key) =>
                        ![
                          "id",
                          "nombre",
                          "name",
                          "fullName",
                          "email",
                          "rol",
                          "role",
                          "estado",
                          "status",
                          "createdAt",
                          "updatedAt",
                        ].includes(key) &&
                        (user as any)[key] !== null &&
                        (user as any)[key] !== undefined &&
                        (user as any)[key] !== ""
                    )
                    .map((key) => (
                      <div key={key}>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h3>
                        <p className="text-gray-900">
                          {typeof (user as any)[key] === "object"
                            ? JSON.stringify((user as any)[key])
                            : String((user as any)[key])}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {user.id && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">ID del usuario</h3>
                <p className="text-gray-600 font-mono text-sm">{user.id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}

export default function UserDetailPage() {
  return (
    <ProtectedRoute>
      <UserDetailContent />
    </ProtectedRoute>
  );
}

