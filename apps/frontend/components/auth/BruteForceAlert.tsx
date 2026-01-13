"use client";

import { AlertCircle, Clock, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useBruteForce } from "@/hooks/useBruteForce";

export function BruteForceAlert() {
  const { status, isLoading } = useBruteForce();

  if (isLoading || !status) {
    return null;
  }

  // Show warning if close to blocking
  if (!status.isBlocked && status.remainingAttempts <= 2 && status.remainingAttempts > 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-yellow-800">Advertencia de seguridad</span>
                <Badge variant="warning">
                  {status.remainingAttempts} intento{status.remainingAttempts > 1 ? "s" : ""} restante{status.remainingAttempts > 1 ? "s" : ""}
                </Badge>
              </div>
              <p className="text-sm text-yellow-700">
                Has realizado {status.attemptCount} intento{status.attemptCount > 1 ? "s" : ""} fallido{status.attemptCount > 1 ? "s" : ""}.
                Después de {status.maxAttempts} intentos fallidos, tu IP será bloqueada por {Math.ceil(status.blockDuration / 60000)} minutos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show block message if blocked
  if (status.isBlocked) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-red-800">Acceso bloqueado</span>
                <Badge variant="error">Bloqueado</Badge>
              </div>
              <p className="text-sm text-red-700 mb-2">
                Demasiados intentos de inicio de sesión fallidos. Tu IP ha sido bloqueada por seguridad.
              </p>
              <div className="flex items-center gap-2 text-sm text-red-600">
                <Clock className="w-4 h-4" />
                <span>
                  Puedes intentar nuevamente en{" "}
                  <strong>{status.remainingMinutes} minuto{status.remainingMinutes > 1 ? "s" : ""}</strong>
                </span>
              </div>
              {status.retryAfter && (
                <p className="text-xs text-red-600 mt-1">
                  Desbloqueo: {new Date(status.retryAfter).toLocaleString("es-AR")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

