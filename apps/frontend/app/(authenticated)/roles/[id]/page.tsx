"use client";

import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRole } from "@/hooks/api/roles";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BotonVolver } from "@/components/ui/BotonVolver";

function RoleDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  const router = useRouter();
  
  // Safely extract id from params
  const id = typeof params?.id === "string" ? params.id : null;
  
  const { role, isLoading, error } = useRole(id || "");

  // Guard check after all hooks
  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <LoadingState message="Cargando rol…" />
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-pmd">
          Error al cargar el rol: {error.message || "Error desconocido"}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/roles")}>Volver a Roles</Button>
        </div>
      </>
    );
  }

  if (!role) {
    return (
      <>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-pmd">
          Rol no encontrado
        </div>
        <div className="mt-4">
          <Button onClick={() => router.push("/roles")}>Volver a Roles</Button>
        </div>
      </>
    );
  }

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

  const getPermissions = () => {
    return (role as any).permisos || role.permissions || [];
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

  const permissions = getPermissions();
  const isPermissionsArray = Array.isArray(permissions);

  return (
    <div className="space-y-6">
        <div>
          <BotonVolver />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">Detalle del rol</h1>
            <p className="text-gray-600">Información completa del rol seleccionado</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/roles")}>
            Volver a Roles
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{getRoleName()}</CardTitle>
              <Badge variant={getRoleVariant(getRoleName())}>
                {getRoleLabel(getRoleName())}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {getRoleDescription() && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Descripción</h3>
                <p className="text-gray-600">{getRoleDescription()}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(role as any).cantidadUsuarios !== undefined || (role as any).userCount !== undefined ? (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Usuarios asociados</h3>
                  <p className="text-gray-900">
                    {(role as any).cantidadUsuarios || (role as any).userCount || 0} usuario(s)
                  </p>
                </div>
              ) : null}

              {permissions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Cantidad de permisos</h3>
                  <p className="text-gray-900">{permissions.length} permiso(s)</p>
                </div>
              )}

              {role.createdAt && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Fecha de creación</h3>
                  <p className="text-gray-900">{formatDate(role.createdAt)}</p>
                </div>
              )}

              {role.updatedAt && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Última actualización</h3>
                  <p className="text-gray-900">{formatDate(role.updatedAt)}</p>
                </div>
              )}
            </div>

            {isPermissionsArray && permissions.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Permisos</h3>
                <div className="flex flex-wrap gap-2">
                  {permissions.map((permission: string, index: number) => (
                    <Badge key={index} variant="info">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Mostrar usuarios asociados si el backend los devuelve */}
            {(role as any).users && Array.isArray((role as any).users) && (role as any).users.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Usuarios con este rol</h3>
                <div className="space-y-2">
                  {(role as any).users.map((user: any) => (
                    <div
                      key={user.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {user.nombre || user.fullName || user.name || "Sin nombre"}
                      </p>
                      {user.email && (
                        <p className="text-xs text-gray-500">{user.email}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {role.id && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">ID del rol</h3>
                <p className="text-gray-600 font-mono text-sm">{role.id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}

export default function RoleDetailPage() {
  return (
    <ProtectedRoute>
      <RoleDetailContent />
    </ProtectedRoute>
  );
}

