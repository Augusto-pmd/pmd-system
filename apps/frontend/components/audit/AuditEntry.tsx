"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AuditLog } from "@/lib/types/audit";

interface AuditEntryProps {
  entry: AuditLog;
}

export function AuditEntry({ entry }: AuditEntryProps) {
  const router = useRouter();

  const getActionType = (action: string | undefined): "success" | "warning" | "error" | "info" => {
    if (!action) return "info";
    const actionLower = action.toLowerCase();
    
    // Acciones exitosas (verde)
    if (
      actionLower.includes("create") ||
      actionLower.includes("crear") ||
      actionLower.includes("login") ||
      actionLower.includes("approve") ||
      actionLower.includes("aprobar")
    ) {
      return "success";
    }
    
    // Acciones críticas (rojo)
    if (
      actionLower.includes("delete") ||
      actionLower.includes("eliminar") ||
      actionLower.includes("reject") ||
      actionLower.includes("rechazar")
    ) {
      return "error";
    }
    
    // Advertencias (amarillo)
    if (
      actionLower.includes("update") ||
      actionLower.includes("actualizar") ||
      actionLower.includes("modify") ||
      actionLower.includes("modificar")
    ) {
      return "warning";
    }
    
    return "info";
  };

  const getActionIcon = (action: string | undefined): string => {
    if (!action) return "📋";
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes("create") || actionLower.includes("crear")) return "➕";
    if (actionLower.includes("update") || actionLower.includes("actualizar")) return "✏️";
    if (actionLower.includes("delete") || actionLower.includes("eliminar")) return "🗑️";
    if (actionLower.includes("login")) return "🔐";
    if (actionLower.includes("approve") || actionLower.includes("aprobar")) return "✅";
    if (actionLower.includes("reject") || actionLower.includes("rechazar")) return "❌";
    
    return "📋";
  };

  const translateAction = (action: string | undefined): string => {
    if (!action) return "Acción desconocida";
    const actionLower = action.toLowerCase();
    
    const translations: Record<string, string> = {
      create: "Crear",
      crear: "Crear",
      update: "Actualizar",
      actualizar: "Actualizar",
      delete: "Eliminar",
      eliminar: "Eliminar",
      login: "Inicio de sesión",
      approve: "Aprobar",
      aprobar: "Aprobar",
      reject: "Rechazar",
      rechazar: "Rechazar",
    };
    
    for (const [key, value] of Object.entries(translations)) {
      if (actionLower.includes(key)) {
        return value;
      }
    }
    
    return action;
  };

  const translateModule = (module: string | undefined): string => {
    if (!module) return "Sistema";
    const moduleLower = module.toLowerCase();
    
    const translations: Record<string, string> = {
      works: "Obras",
      obras: "Obras",
      suppliers: "Proveedores",
      proveedores: "Proveedores",
      accounting: "Contabilidad",
      contabilidad: "Contabilidad",
      users: "Usuarios",
      usuarios: "Usuarios",
      roles: "Roles",
      cashboxes: "Cajas",
      cajas: "Cajas",
      "cash-movements": "Movimientos de Caja",
      audit: "Auditoría",
      auditoria: "Auditoría",
    };
    
    for (const [key, value] of Object.entries(translations)) {
      if (moduleLower.includes(key)) {
        return value;
      }
    }
    
    return module;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "No especificada";
    try {
      return new Date(dateString).toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const action = entry.accion || entry.action || "";
  const actionType = getActionType(action);
  const actionIcon = getActionIcon(action);
  const moduleName = (entry as any).modulo || (entry as any).entity || entry.entityType || "";
  const userName = (entry as any).usuario || (entry as any).userName || (entry as any).userId || "Usuario desconocido";
  const date = (entry as any).fecha || (entry as any).timestamp || entry.createdAt;
  const entityId = entry.entity_id || entry.id;

  return (
    <div
      onClick={() => router.push(`/audit/${entry.id}`)}
      className="cursor-pointer"
    >
      <Card
        className={`border-l-4 hover:shadow-lg transition-shadow ${
          actionType === "success"
            ? "border-green-500"
            : actionType === "error"
            ? "border-red-500"
            : actionType === "warning"
            ? "border-yellow-500"
            : "border-blue-500"
        }`}
      >
        <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{actionIcon}</span>
              <div>
                <Badge variant={actionType}>{translateAction(action)}</Badge>
                <p className="text-sm text-gray-500 mt-1">{translateModule(moduleName)}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{formatDate(date)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Usuario:</span>
              <span className="text-sm text-gray-900">{userName}</span>
            </div>

            {entityId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">ID del objeto:</span>
                <span className="text-sm text-gray-600 font-mono">{entityId}</span>
              </div>
            )}

            {(entry.descripcion || entry.details) && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  {entry.descripcion || entry.details}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/audit/${entry.id}`);
              }}
            >
              Ver detalle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

