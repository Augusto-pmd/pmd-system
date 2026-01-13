"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { alertApi } from "@/hooks/api/alerts";
import { useToast } from "@/components/ui/Toast";
import { useUsers } from "@/hooks/api/users";
import { Alert, AlertStatus } from "@/lib/types/alert";
import { UserPlus, CheckCircle, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface AlertActionsProps {
  alert: Alert;
  onActionComplete: () => void;
}

export function AlertActions({ alert, onActionComplete }: AlertActionsProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const { users } = useUsers();
  const user = useAuthStore.getState().user;
  const isDirection = user?.role?.name === "DIRECTION" || user?.role?.name === "direction";
  const isAdministration = user?.role?.name === "ADMINISTRATION" || user?.role?.name === "administration";
  const canAssign = isDirection || isAdministration;
  const canResolve = 
    alert.assigned_to_id === user?.id || 
    isDirection || 
    isAdministration;

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error("Debe seleccionar un usuario");
      return;
    }

    setIsSubmitting(true);
    try {
      await alertApi.assign(alert.id, { assigned_to_id: selectedUserId });
      toast.success("Alerta asignada correctamente");
      setIsAssignModalOpen(false);
      setSelectedUserId("");
      onActionComplete();
    } catch (error: any) {
      console.error("Error assigning alert:", error);
      toast.error(error?.response?.data?.message || "Error al asignar alerta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    try {
      await alertApi.resolve(alert.id, { resolution_notes: resolutionNotes || undefined });
      toast.success("Alerta resuelta correctamente");
      setIsResolveModalOpen(false);
      setResolutionNotes("");
      onActionComplete();
    } catch (error: any) {
      console.error("Error resolving alert:", error);
      toast.error(error?.response?.data?.message || "Error al resolver alerta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.OPEN:
        return "Abierta";
      case AlertStatus.IN_REVIEW:
        return "En Revisión";
      case AlertStatus.RESOLVED:
        return "Resuelta";
      default:
        return status;
    }
  };

  const getStatusVariant = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.OPEN:
        return "warning";
      case AlertStatus.IN_REVIEW:
        return "info";
      case AlertStatus.RESOLVED:
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      {alert.status && (
        <span className={`px-2 py-1 text-xs font-medium rounded ${
          getStatusVariant(alert.status) === "warning" ? "bg-yellow-100 text-yellow-800" :
          getStatusVariant(alert.status) === "info" ? "bg-blue-100 text-blue-800" :
          getStatusVariant(alert.status) === "success" ? "bg-green-100 text-green-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {getStatusLabel(alert.status)}
        </span>
      )}

      {/* Assign Button */}
      {canAssign && alert.status !== AlertStatus.RESOLVED && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAssignModalOpen(true)}
          className="flex items-center gap-1"
        >
          <UserPlus className="h-3 w-3" />
          {alert.assigned_to_id ? "Reasignar" : "Asignar"}
        </Button>
      )}

      {/* Resolve Button */}
      {canResolve && alert.status !== AlertStatus.RESOLVED && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsResolveModalOpen(true)}
          className="flex items-center gap-1 text-green-600 border-green-300 hover:bg-green-50"
        >
          <CheckCircle className="h-3 w-3" />
          Resolver
        </Button>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedUserId("");
        }}
        title={alert.assigned_to_id ? "Reasignar Alerta" : "Asignar Alerta"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#162F7F] focus:border-[#162F7F] outline-none text-sm"
            >
              <option value="">Seleccionar usuario</option>
              {users?.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.nombre || u.email || u.id}
                </option>
              ))}
            </select>
          </div>
          {alert.assigned_to && (
            <p className="text-sm text-gray-600">
              Actualmente asignada a: <strong>{alert.assigned_to.name || alert.assigned_to.id}</strong>
            </p>
          )}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedUserId("");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAssign} disabled={isSubmitting || !selectedUserId}>
              {isSubmitting ? "Asignando..." : "Asignar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => {
          setIsResolveModalOpen(false);
          setResolutionNotes("");
        }}
        title="Resolver Alerta"
      >
        <div className="space-y-4">
          <Textarea
            label="Notas de Resolución (Opcional)"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            rows={4}
            placeholder="Describe cómo se resolvió la alerta..."
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsResolveModalOpen(false);
                setResolutionNotes("");
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleResolve} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Resolviendo..." : "Resolver"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

