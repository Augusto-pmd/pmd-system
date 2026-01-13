"use client";

import { useRouter } from "next/navigation";
import { Card, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Cashbox } from "@/lib/types/cashbox";

interface CashboxCardProps {
  cashbox: Cashbox;
}

export function CashboxCard({ cashbox }: CashboxCardProps) {
  const router = useRouter();

  const getCashboxName = () => {
    return (cashbox as any).nombre || (cashbox as any).name || `Caja ${cashbox.id.slice(0, 8)}`;
  };

  const getCashboxStatus = () => {
    return (cashbox as any).estado || (cashbox as any).status || (cashbox as any).state || "abierta";
  };

  const getStatusVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "abierta" || statusLower === "open" || statusLower === "opened") {
      return "success";
    }
    return "default";
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "open" || statusLower === "opened") return "Abierta";
    if (statusLower === "closed") return "Cerrada";
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

  const status = getCashboxStatus();

  return (
    <Card>
      <CardContent style={{ padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CardTitle style={{ margin: 0 }}>{getCashboxName()}</CardTitle>
            <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
                Fecha de apertura:
              </span>
              <span style={{ fontSize: "13px", color: "var(--apple-text-primary)", fontWeight: 500 }}>
                {formatDate(cashbox.opening_date)}
              </span>
            </div>

            {(cashbox.closedAt || cashbox.closed_at) && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
                  Fecha de cierre:
                </span>
                <span style={{ fontSize: "13px", color: "var(--apple-text-primary)", fontWeight: 500 }}>
                  {formatDate(cashbox.closedAt || cashbox.closed_at)}
                </span>
              </div>
            )}

            {cashbox.balance !== undefined && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
                  Saldo:
                </span>
                <span style={{ fontSize: "13px", color: "var(--apple-text-primary)", fontWeight: 600 }}>
                  ${((cashbox as any).balance || 0).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter style={{ margin: 0, padding: 0, border: "none" }}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/cashboxes/${cashbox.id}`)}
          style={{ width: "100%" }}
        >
          Ver caja
        </Button>
      </CardFooter>
    </Card>
  );
}
