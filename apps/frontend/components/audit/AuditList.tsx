"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TableContainer } from "@/components/ui/TableContainer";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { useAuditStore, AuditLog } from "@/store/auditStore";
import { useToast } from "@/components/ui/Toast";
import { parseBackendError } from "@/lib/parse-backend-error";
import { Eye, Trash2, Shield, User, Calendar, FileText } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface AuditListProps {
  logs: AuditLog[];
  onRefresh?: () => void;
  searchQuery?: string;
  moduleFilter?: string;
  userFilter?: string;
  actionFilter?: string;
  entityFilter?: string;
  ipFilter?: string;
  startDateFilter?: string;
  endDateFilter?: string;
}

export function AuditList({
  logs,
  onRefresh,
  searchQuery = "",
  moduleFilter = "all",
  userFilter = "all",
  actionFilter = "all",
  entityFilter = "all",
  ipFilter = "",
  startDateFilter = "",
  endDateFilter = "",
}: AuditListProps) {
  const router = useRouter();
  const { clearAuditEntry, clearAll } = useAuditStore();
  const { user } = useAuthStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Verificar permisos: solo admin puede eliminar
  const roleName = user?.role?.name?.toLowerCase() || "";
  const isAdmin = roleName === "admin" || roleName === "administrator" || roleName === "superadmin";
  const canDelete = isAdmin; // Solo admin puede eliminar registros de auditoría

  const filteredLogs = logs.filter((log) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesAction = log.action?.toLowerCase().includes(query);
      const matchesModule = log.module?.toLowerCase().includes(query);
      
      // Extraer el nombre del usuario de manera segura
      let userName = "";
      if (log.user && typeof log.user === 'object') {
        userName = (log.user as any).fullName || (log.user as any).name || (log.user as any).email || "";
      } else if (typeof log.user === 'string') {
        userName = log.user;
      } else {
        userName = log.userName || "";
      }
      
      const matchesUser = userName?.toLowerCase().includes(query);
      const matchesDetails = log.details?.toLowerCase().includes(query);
      if (!matchesAction && !matchesModule && !matchesUser && !matchesDetails) return false;
    }

    if (moduleFilter !== "all" && log.module !== moduleFilter) return false;

    if (userFilter !== "all") {
      // Extraer el nombre del usuario de manera segura para comparar
      let userName = "";
      if (log.user && typeof log.user === 'object') {
        userName = (log.user as any).fullName || (log.user as any).name || (log.user as any).email || log.user_id || "";
      } else if (typeof log.user === 'string') {
        userName = log.user;
      } else {
        userName = log.userName || log.user_id || "";
      }
      
      const userId = log.userId || log.user_id;
      if (userName !== userFilter && userId !== userFilter && log.user_id !== userFilter) return false;
    }

    if (actionFilter !== "all" && log.action !== actionFilter) return false;

    if (entityFilter !== "all" && log.entity_type !== entityFilter && log.entity !== entityFilter) return false;

    if (ipFilter) {
      const logIp = (log as any).ip_address || log.ip_address;
      if (!logIp || !logIp.toLowerCase().includes(ipFilter.toLowerCase())) return false;
    }

    if (startDateFilter) {
      const logTimestamp = log.timestamp || log.created_at;
      if (logTimestamp) {
        const logDate = logTimestamp.split("T")[0];
        if (logDate < startDateFilter) return false;
      }
    }
    if (endDateFilter) {
      const logTimestamp = log.timestamp || log.created_at;
      if (logTimestamp) {
        const logDate = logTimestamp.split("T")[0];
        if (logDate > endDateFilter) return false;
      }
    }

    return true;
  });

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!selectedLog) return;
    setIsSubmitting(true);
    try {
      await clearAuditEntry(selectedLog.id);
      await onRefresh?.();
      toast.success("Log eliminado");
      setIsDeleteModalOpen(false);
      setSelectedLog(null);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al eliminar log:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    setIsSubmitting(true);
    try {
      await clearAll();
      await onRefresh?.();
      toast.success("Todos los registros limpiados");
      setIsClearAllModalOpen(false);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error al limpiar todos los registros:", err);
      }
      const errorMessage = parseBackendError(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (filteredLogs.length === 0) {
    return (
      <div style={{
        backgroundColor: "var(--apple-surface)",
        border: "1px solid var(--apple-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-apple)",
        padding: "40px 0",
        textAlign: "center",
        fontFamily: "Inter, system-ui, sans-serif"
      }}>
        <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--apple-text-secondary)" }} />
        <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
          {logs.length === 0
            ? "No hay registros de auditoría"
            : "No se encontraron registros con los filtros aplicados"}
        </p>
      </div>
    );
  }

  return (
    <>
      {canDelete && (
        <div style={{ marginBottom: "var(--space-md)", display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="outline"
            onClick={() => setIsClearAllModalOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FF3B30" }}
          >
            <Trash2 className="w-4 h-4" />
            Limpiar Todo
          </Button>
        </div>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>IP / Dispositivo</TableHead>
              <TableHead>Fecha & Hora</TableHead>
              <TableHead align="right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <User className="w-4 h-4" style={{ color: "var(--apple-text-secondary)", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--apple-text-primary)" }}>
                        {(() => {
                          // Si log.user es un objeto (relación cargada desde el backend), extraer el nombre
                          if (log.user && typeof log.user === 'object') {
                            return (log.user as any).fullName || (log.user as any).name || (log.user as any).email || log.user_id || "-";
                          }
                          // Si es un string, usarlo directamente
                          return log.userName || log.user || log.user_id || "-";
                        })()}
                      </div>
                      {(() => {
                        const userId = log.userId || log.user_id;
                        const userName = typeof log.user === 'object' 
                          ? ((log.user as any).fullName || (log.user as any).name || (log.user as any).email)
                          : (log.userName || log.user);
                        if (userId && userId !== userName) {
                          return (
                            <div style={{ fontSize: "12px", color: "var(--apple-text-secondary)" }}>{userId}</div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText className="w-4 h-4" style={{ color: "var(--apple-text-secondary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "var(--apple-text-primary)" }}>{log.module}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ fontSize: "14px", color: "var(--apple-text-primary)" }}>{log.action}</div>
                  {log.details && (
                    <div style={{ fontSize: "12px", color: "var(--apple-text-secondary)", marginTop: "4px" }}>
                      {log.details}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div style={{ fontSize: "14px", color: "var(--apple-text-primary)" }}>
                    {(log as any).ip_address || log.ip_address || "-"}
                  </div>
                  {(log as any).device_info && (
                    <div style={{ fontSize: "12px", color: "var(--apple-text-secondary)", marginTop: "4px" }}>
                      {(log as any).device_info.browser && `${(log as any).device_info.browser}${(log as any).device_info.browser_version ? ` ${(log as any).device_info.browser_version}` : ""}`}
                      {(log as any).device_info.os && ` • ${(log as any).device_info.os}`}
                      {(log as any).device_info.device_type && ` • ${(log as any).device_info.device_type}`}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar className="w-4 h-4" style={{ color: "var(--apple-text-secondary)", flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "var(--apple-text-secondary)" }}>
                      {formatTimestamp(log.timestamp || log.created_at)}
                    </span>
                  </div>
                </TableCell>
                <TableCell align="right">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => router.push(`/audit/${log.id}`)}
                      style={{ color: "var(--apple-blue)" }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="icon"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setIsDeleteModalOpen(true);
                        }}
                        style={{ color: "#FF3B30" }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedLog && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedLog(null);
          }}
          title="Confirmar Eliminación"
          size="md"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
            <p style={{ font: "var(--font-body)", color: "var(--apple-text-primary)" }}>
              ¿Estás seguro de que deseas eliminar este registro de auditoría?
            </p>
            <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)", fontWeight: 500 }}>
              {selectedLog.action}
            </p>
            <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedLog(null);
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isSubmitting}
                style={{ color: "#FF3B30", borderColor: "#FF3B30" }}
              >
                {isSubmitting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <Modal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        title="Confirmar Limpieza Total"
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <p style={{ font: "var(--font-body)", color: "var(--apple-text-primary)", fontWeight: 500 }}>
            ¿Estás seguro de que deseas eliminar TODOS los registros de auditoría?
          </p>
          <p style={{ fontSize: "13px", color: "var(--apple-text-secondary)" }}>
            Esta acción eliminará {logs.length} registro{logs.length !== 1 ? "s" : ""} y no se puede deshacer.
          </p>
          <div style={{ display: "flex", gap: "var(--space-sm)", justifyContent: "flex-end", paddingTop: "var(--space-md)" }}>
            <Button
              variant="outline"
              onClick={() => setIsClearAllModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={isSubmitting}
              style={{ color: "#FF3B30", borderColor: "#FF3B30" }}
            >
              {isSubmitting ? "Limpiando..." : "Limpiar Todo"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
