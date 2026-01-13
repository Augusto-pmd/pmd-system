"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuditLog } from "@/hooks/api/audit";
import { LoadingState } from "@/components/ui/LoadingState";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { Card, CardContent } from "@/components/ui/Card";
import { Shield, User, Calendar, FileText, ArrowRight, Globe, Monitor, Smartphone, Laptop, Tablet, Plus, Minus, Edit } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { compareObjects, formatValue } from "@/lib/utils/diff";

function AuditDetailContent() {
  // All hooks must be called unconditionally at the top
  const params = useParams();
  
  // Safely extract logId from params
  const logId = typeof params?.id === "string" ? params.id : null;
  
  const { log, isLoading, error } = useAuditLog(logId || "");
  const authState = useAuthStore.getState();
  const organizationId = authState.user?.organizationId;

  // Guard check after all hooks
  if (!logId) {
    return null;
  }

  if (!organizationId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p className="font-semibold mb-2">No se pudo determinar la organización</p>
        <p className="text-sm">Por favor, vuelve a iniciar sesión para continuar.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoadingState message="Cargando registro de auditoría…" />
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "rgba(255,59,48,0.1)", border: "1px solid rgba(255,59,48,0.3)", color: "rgba(255,59,48,1)", padding: "var(--space-md)", borderRadius: "var(--radius-md)" }}>
        Error al cargar el registro: {error.message || "Error desconocido"}
      </div>
    );
  }

  if (!log) {
    return (
      <div style={{ backgroundColor: "var(--apple-surface)", border: "1px solid var(--apple-border)", borderRadius: "var(--radius-xl)", padding: "var(--space-xl)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <Shield className="w-12 h-12 mb-4" style={{ color: "var(--apple-text-secondary)" }} />
          <p style={{ font: "var(--font-body)", color: "var(--apple-text-secondary)" }}>
            Registro de auditoría no encontrado
          </p>
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasChanges = log.previous_value || log.new_value || log.before || log.after;
  const previousValue = log.previous_value || log.before;
  const newValue = log.new_value || log.after;

  return (
    <div className="space-y-6">
        <div>
          <BotonVolver />
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Detalle de Auditoría</h1>
            <p className="text-gray-600">Información completa del registro</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Principal */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información General</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Usuario</p>
                    <p className="text-base font-medium text-gray-900">
                      {(() => {
                        // Si log.user es un objeto (relación cargada desde el backend), extraer el nombre
                        if (log.user && typeof log.user === 'object') {
                          return (log.user as any).fullName || (log.user as any).name || (log.user as any).email || log.user_id || "-";
                        }
                        // Si es un string, usarlo directamente
                        return log.userName || log.user || log.user_id || "-";
                      })()}
                    </p>
                    {(() => {
                      const userId = log.userId || log.user_id;
                      const userName = typeof log.user === 'object' 
                        ? ((log.user as any).fullName || (log.user as any).name || (log.user as any).email)
                        : (log.userName || log.user);
                      if (userId && userId !== userName) {
                        return (
                          <p className="text-xs text-gray-500 mt-1">ID: {userId}</p>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Módulo</p>
                    <p className="text-base font-medium text-gray-900">{log.module}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Acción</p>
                    <p className="text-base font-medium text-gray-900">{log.action}</p>
                    {log.details && (
                      <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha & Hora</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatTimestamp(log.timestamp || log.created_at)}
                    </p>
                  </div>
                </div>

                {log.ip_address && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Dirección IP</p>
                      <p className="text-base font-medium text-gray-900">{log.ip_address}</p>
                    </div>
                  </div>
                )}

                {log.user_agent && (
                  <div className="flex items-start gap-3">
                    <Monitor className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">User Agent</p>
                      <p className="text-base font-medium text-gray-900 break-all text-xs">{log.user_agent}</p>
                    </div>
                  </div>
                )}

                {(log as any).device_info && (
                  <div className="flex items-start gap-3">
                    {(log as any).device_info.device_type === 'Mobile' ? (
                      <Smartphone className="h-5 w-5 text-gray-400 mt-0.5" />
                    ) : (log as any).device_info.device_type === 'Tablet' ? (
                      <Tablet className="h-5 w-5 text-gray-400 mt-0.5" />
                    ) : (
                      <Laptop className="h-5 w-5 text-gray-400 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Dispositivo</p>
                      <div className="text-base font-medium text-gray-900">
                        {(log as any).device_info.browser && (
                          <span>{(log as any).device_info.browser}</span>
                        )}
                        {(log as any).device_info.browser_version && (
                          <span className="text-gray-600"> {(log as any).device_info.browser_version}</span>
                        )}
                        {(log as any).device_info.os && (
                          <div className="text-sm text-gray-600 mt-1">
                            {(log as any).device_info.os}
                            {(log as any).device_info.os_version && ` ${(log as any).device_info.os_version}`}
                          </div>
                        )}
                        {(log as any).device_info.device_type && (
                          <div className="text-xs text-gray-500 mt-1 capitalize">
                            {(log as any).device_info.device_type}
                          </div>
                        )}
                        {/* Mostrar alerta si se detectó cambio de dispositivo */}
                        {((log as any).device_info.device_change_detected || (log as any).new_value?.device_change_detected) && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            ⚠️ Cambio de dispositivo detectado
                            {(log as any).device_info.previous_device && (
                              <div className="mt-1 text-yellow-700">
                                Anterior: {(log as any).device_info.previous_device.browser || 'N/A'} / {(log as any).device_info.previous_device.os || 'N/A'}
                              </div>
                            )}
                            {(log as any).device_info.previous_ip && log.ip_address !== (log as any).device_info.previous_ip && (
                              <div className="mt-1 text-yellow-700">
                                IP anterior: {(log as any).device_info.previous_ip}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {log.criticality && (
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Criticidad</p>
                      <p className="text-base font-medium text-gray-900 capitalize">{log.criticality}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cambios (si existen) */}
          {hasChanges && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Cambios Realizados</h2>
                {previousValue && newValue ? (
                  // Show detailed diff
                  <div className="space-y-4">
                    {(() => {
                      const diff = compareObjects(previousValue, newValue);
                      const hasChanges = Object.keys(diff.added).length > 0 || 
                                        Object.keys(diff.removed).length > 0 || 
                                        Object.keys(diff.changed).length > 0;
                      
                      if (!hasChanges) {
                        return (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-600">
                            No hay cambios detectados
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {/* Campos agregados */}
                          {Object.keys(diff.added).length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Plus className="h-4 w-4 text-green-600" />
                                <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                                  Campos Agregados ({Object.keys(diff.added).length})
                                </p>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                                {Object.entries(diff.added).map(([key, value]) => (
                                  <div key={key} className="border-b border-green-200 last:border-0 pb-2 last:pb-0">
                                    <div className="font-semibold text-green-900 text-sm">{key}:</div>
                                    <pre className="text-xs text-green-700 whitespace-pre-wrap font-mono mt-1">
                                      {formatValue(value)}
                                    </pre>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Campos eliminados */}
                          {Object.keys(diff.removed).length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Minus className="h-4 w-4 text-red-600" />
                                <p className="text-xs font-medium text-red-700 uppercase tracking-wide">
                                  Campos Eliminados ({Object.keys(diff.removed).length})
                                </p>
                              </div>
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                                {Object.entries(diff.removed).map(([key, value]) => (
                                  <div key={key} className="border-b border-red-200 last:border-0 pb-2 last:pb-0">
                                    <div className="font-semibold text-red-900 text-sm">{key}:</div>
                                    <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono mt-1">
                                      {formatValue(value)}
                                    </pre>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Campos modificados */}
                          {Object.keys(diff.changed).length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Edit className="h-4 w-4 text-yellow-600" />
                                <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">
                                  Campos Modificados ({Object.keys(diff.changed).length})
                                </p>
                              </div>
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-3">
                                {Object.entries(diff.changed).map(([key, { old, new: newVal }]) => (
                                  <div key={key} className="border-b border-yellow-200 last:border-0 pb-3 last:pb-0">
                                    <div className="font-semibold text-yellow-900 text-sm mb-2">{key}:</div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="bg-red-50 border border-red-200 rounded p-2">
                                        <div className="text-xs font-medium text-red-700 mb-1">Anterior:</div>
                                        <pre className="text-xs text-red-600 whitespace-pre-wrap font-mono">
                                          {formatValue(old)}
                                        </pre>
                                      </div>
                                      <div className="bg-green-50 border border-green-200 rounded p-2">
                                        <div className="text-xs font-medium text-green-700 mb-1">Nuevo:</div>
                                        <pre className="text-xs text-green-600 whitespace-pre-wrap font-mono">
                                          {formatValue(newVal)}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  // Fallback to simple view if diff not available
                  <div className="space-y-4">
                    {previousValue && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Valor Anterior</p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {JSON.stringify(previousValue, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {newValue && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Valor Nuevo</p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                            {JSON.stringify(newValue, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {previousValue && newValue && (
                      <div className="flex items-center justify-center pt-2">
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Si no hay cambios, mostrar información adicional */}
          {!hasChanges && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-pmd-darkBlue mb-4">Información Adicional</h2>
                <div className="space-y-4">
                  {log.entity && (
                    <div>
                      <p className="text-sm text-gray-500">Entidad</p>
                      <p className="text-base font-medium text-gray-900">{log.entity}</p>
                    </div>
                  )}
                  {log.entityId && (
                    <div>
                      <p className="text-sm text-gray-500">ID de Entidad</p>
                      <p className="text-base font-medium text-gray-900">{log.entityId}</p>
                    </div>
                  )}
                  {log.details && (
                    <div>
                      <p className="text-sm text-gray-500">Detalles</p>
                      <p className="text-base text-gray-700">{log.details}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
  );
}

export default function AuditDetailPage() {
  return (
    <ProtectedRoute>
      <AuditDetailContent />
    </ProtectedRoute>
  );
}
