"use client";

import { Badge } from "@/components/ui/Badge";
import { ContractStatus } from "@/lib/types/contract";

interface ContractStatusBadgeProps {
  status?: ContractStatus | string;
  isBlocked?: boolean;
}

export function ContractStatusBadge({ status, isBlocked }: ContractStatusBadgeProps) {
  const getStatusVariant = (status?: string) => {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case ContractStatus.PENDING:
        return "warning"; // Amarillo
      case ContractStatus.APPROVED:
        return "info"; // Azul
      case ContractStatus.ACTIVE:
        return "success"; // Verde
      case ContractStatus.LOW_BALANCE:
        return "warning"; // Naranja (usando warning como naranja)
      case ContractStatus.NO_BALANCE:
        return "error"; // Rojo
      case ContractStatus.PAUSED:
        return "default"; // Gris
      case ContractStatus.FINISHED:
        return "default"; // Gris
      case ContractStatus.CANCELLED:
        return "error"; // Rojo
      default:
        return "default";
    }
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "Sin estado";
    const statusLower = status.toLowerCase();
    
    const statusMap: Record<string, string> = {
      [ContractStatus.PENDING]: "Pendiente",
      [ContractStatus.APPROVED]: "Aprobado",
      [ContractStatus.ACTIVE]: "Activo",
      [ContractStatus.LOW_BALANCE]: "Saldo Bajo",
      [ContractStatus.NO_BALANCE]: "Sin Saldo",
      [ContractStatus.PAUSED]: "Pausado",
      [ContractStatus.FINISHED]: "Finalizado",
      [ContractStatus.CANCELLED]: "Cancelado",
    };
    
    return statusMap[statusLower] || status;
  };

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {isBlocked && (
        <Badge variant="error" className="text-xs">
          Bloqueado
        </Badge>
      )}
      {status && (
        <Badge variant={getStatusVariant(status)} className="text-xs">
          {getStatusLabel(status)}
        </Badge>
      )}
    </div>
  );
}

