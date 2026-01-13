"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useScheduleByWork, scheduleApi } from "@/hooks/api/schedule";
import { useWork } from "@/hooks/api/works";
import { LoadingState } from "@/components/ui/LoadingState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { GanttChart } from "@/components/schedule/GanttChart";
import { useToast } from "@/components/ui/Toast";
import { BotonVolver } from "@/components/ui/BotonVolver";
import { RefreshCw, Calendar, Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Schedule, ScheduleState } from "@/lib/types/schedule";
import { Task } from "gantt-task-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

function SchedulePageContent() {
  const params = useParams();
  const router = useRouter();
  const workId = typeof params?.id === 'string' ? params.id : null;
  const { work, isLoading: isLoadingWork } = useWork(workId);
  const { schedules, isLoading: isLoadingSchedules, mutate } = useScheduleByWork(workId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editFormData, setEditFormData] = useState({
    start_date: "",
    end_date: "",
    state: ScheduleState.PENDING,
    description: "",
  });
  const toast = useToast();
  const user = useAuthStore.getState().user;
  const isDirection = user?.role?.name === "DIRECTION" || user?.role?.name === "direction";

  if (!workId) return null;

  if (isLoadingWork || isLoadingSchedules) {
    return <LoadingState message="Cargando cronograma…" />;
  }

  if (!work) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Obra no encontrada
        </div>
        <Button onClick={() => router.push("/works")}>Volver a Obras</Button>
      </div>
    );
  }

  const handleGenerateGantt = async () => {
    if (!workId) return;
    
    setIsGenerating(true);
    try {
      await scheduleApi.generateGantt(workId);
      await mutate();
      toast.success("Cronograma generado automáticamente");
    } catch (error: any) {
      console.error("Error generating Gantt:", error);
      toast.error(error?.response?.data?.message || "Error al generar cronograma");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateGantt = async () => {
    if (!workId) return;
    
    if (!confirm("¿Está seguro de regenerar el cronograma? Esto eliminará el cronograma actual.")) {
      return;
    }

    setIsRegenerating(true);
    try {
      await scheduleApi.regenerateGantt(workId);
      await mutate();
      toast.success("Cronograma regenerado correctamente");
    } catch (error: any) {
      console.error("Error regenerating Gantt:", error);
      toast.error(error?.response?.data?.message || "Error al regenerar cronograma");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleTaskChange = async (task: Task) => {
    if (!isDirection) return;

    const schedule = schedules.find((s: Schedule) => s.id === task.id);
    if (!schedule) return;

    setEditingSchedule(schedule);
    setEditFormData({
      start_date: new Date(task.start).toISOString().split('T')[0],
      end_date: new Date(task.end).toISOString().split('T')[0],
      state: schedule.state,
      description: schedule.description || "",
    });
    setIsEditModalOpen(true);
  };

  const handleTaskDelete = async (taskId: string) => {
    if (!isDirection) return;

    if (!confirm("¿Está seguro de eliminar esta etapa?")) {
      return;
    }

    try {
      await scheduleApi.delete(taskId);
      await mutate();
      toast.success("Etapa eliminada correctamente");
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      toast.error(error?.response?.data?.message || "Error al eliminar etapa");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSchedule) return;

    try {
      await scheduleApi.update(editingSchedule.id, editFormData);
      await mutate();
      setIsEditModalOpen(false);
      setEditingSchedule(null);
      toast.success("Etapa actualizada correctamente");
    } catch (error: any) {
      console.error("Error updating schedule:", error);
      toast.error(error?.response?.data?.message || "Error al actualizar etapa");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pmd-darkBlue mb-2">
            Cronograma - {work.name || work.nombre}
          </h1>
          <p className="text-gray-600">Gestiona las etapas y fechas del proyecto</p>
        </div>
        <BotonVolver />
      </div>

      {/* Actions */}
      {isDirection && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              {schedules.length === 0 ? (
                <Button
                  onClick={handleGenerateGantt}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {isGenerating ? "Generando..." : "Generar Cronograma Automático"}
                </Button>
              ) : (
                <Button
                  onClick={handleRegenerateGantt}
                  disabled={isRegenerating}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
                  {isRegenerating ? "Regenerando..." : "Regenerar Cronograma"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gantt Chart */}
      {schedules.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Diagrama de Gantt</CardTitle>
          </CardHeader>
          <CardContent>
            <GanttChart
              schedules={schedules}
              onTaskChange={isDirection ? handleTaskChange : undefined}
              onTaskDelete={isDirection ? handleTaskDelete : undefined}
              readOnly={!isDirection}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                No hay cronograma generado para esta obra.
              </p>
              {isDirection && (
                <Button onClick={handleGenerateGantt} disabled={isGenerating}>
                  {isGenerating ? "Generando..." : "Generar Cronograma Automático"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSchedule(null);
        }}
        title="Editar Etapa"
      >
        <div className="space-y-4">
          <Input
            label="Fecha de Inicio"
            type="date"
            value={editFormData.start_date}
            onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
            required
          />
          <Input
            label="Fecha de Fin"
            type="date"
            value={editFormData.end_date}
            onChange={(e) => setEditFormData({ ...editFormData, end_date: e.target.value })}
            required
          />
          <Select
            label="Estado"
            value={editFormData.state}
            onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value as ScheduleState })}
          >
            <option value={ScheduleState.PENDING}>Pendiente</option>
            <option value={ScheduleState.IN_PROGRESS}>En Progreso</option>
            <option value={ScheduleState.COMPLETED}>Completada</option>
            <option value={ScheduleState.DELAYED}>Atrasada</option>
          </Select>
          <Textarea
            label="Descripción"
            value={editFormData.description}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            rows={3}
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingSchedule(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <ProtectedRoute>
      <SchedulePageContent />
    </ProtectedRoute>
  );
}

