import { create } from "zustand";
import { apiClient } from "@/lib/api";

export interface AccountingEntry {
  id: string;
  workId?: string;
  obraId?: string;
  supplierId?: string;
  proveedorId?: string;
  date: string;
  fecha?: string;
  amount: number;
  monto?: number;
  type: "ingreso" | "egreso" | "income" | "expense";
  tipo?: "ingreso" | "egreso";
  category?: string;
  categoria?: string;
  notes?: string;
  notas?: string;
  description?: string;
  descripcion?: string;
  month?: number;
  year?: number;
  month_status?: "OPEN" | "CLOSED" | "open" | "closed";
  createdAt?: string;
  updatedAt?: string;
}

interface AccountingState {
  entries: AccountingEntry[];
  isLoading: boolean;
  error: string | null;

  fetchEntries: (filters?: {
    workId?: string;
    supplierId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
  }) => Promise<void>;
  createEntry: (payload: Partial<AccountingEntry>) => Promise<void>;
  updateEntry: (id: string, payload: Partial<AccountingEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useAccountingStore = create<AccountingState>((set, get) => ({
  entries: [],
  isLoading: false,
  error: null,

  async fetchEntries(filters = {}) {
    try {
      set({ isLoading: true, error: null });

      // Construir query string con filtros
      const queryParams = new URLSearchParams();
      if (filters.workId) queryParams.append("workId", filters.workId);
      if (filters.supplierId) queryParams.append("supplierId", filters.supplierId);
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.category) queryParams.append("category", filters.category);

      const queryString = queryParams.toString();
      const url = queryString ? `/accounting?${queryString}` : "/accounting";

      const data = await apiClient.get(url);
      set({ entries: (data as any)?.data || data || [], isLoading: false });
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [accountingStore] Error al obtener movimientos:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar movimientos contables";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async createEntry(payload) {
    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [accountingStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios (el backend espera snake_case)
    if (!payload.date) {
      throw new Error("La fecha es obligatoria");
    }
    if (!payload.amount || payload.amount <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }
    if (!payload.workId && !(payload as any).work_id) {
      throw new Error("La obra es obligatoria");
    }
    if (!payload.type && !(payload as any).accounting_type) {
      throw new Error("El tipo de movimiento es obligatorio");
    }

    try {
      await apiClient.post("/accounting", payload);
      await get().fetchEntries();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [accountingStore] Error al crear movimiento:", error);
      }
      throw error;
    }
  },

  async updateEntry(id, payload) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [accountingStore] id no está definido");
      }
      throw new Error("ID de movimiento no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [accountingStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios si están presentes
    if (payload.amount !== undefined && payload.amount <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }

    try {
      // El backend usa PATCH, no PUT
      await apiClient.patch(`/accounting/${id}`, payload);
      await get().fetchEntries();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [accountingStore] Error al actualizar movimiento:", error);
      }
      throw error;
    }
  },

  async deleteEntry(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [accountingStore] id no está definido");
      }
      throw new Error("ID de movimiento no está definido");
    }

    try {
      await apiClient.delete(`/accounting/${id}`);
      await get().fetchEntries();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [accountingStore] Error al eliminar movimiento:", error);
      }
      throw error;
    }
  },
}));

