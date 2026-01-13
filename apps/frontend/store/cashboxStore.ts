import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { accountingApi } from "@/hooks/api/accounting";
import { 
  Cashbox, 
  CashMovement, 
  CreateCashboxData, 
  CreateCashMovementData, 
  UpdateCashMovementData, 
  CashMovementType,
  CashboxStatus, 
  Currency 
} from "@/lib/types/cashbox";

// Re-exportar tipos para compatibilidad con código existente
export type { Cashbox, CashMovement };

interface CashboxState {
  cashboxes: Cashbox[];
  movements: Record<string, CashMovement[]>; // cashboxId -> movements[]
  isLoading: boolean;
  error: string | null;

  fetchCashboxes: () => Promise<void>;
  createCashbox: (payload: Partial<Cashbox>) => Promise<void>;
  updateCashbox: (id: string, payload: Partial<Cashbox>) => Promise<void>;
  closeCashbox: (id: string, closingData?: { closing_balance_ars: number; closing_balance_usd?: number }) => Promise<void>;
  openCashbox: (id: string) => Promise<void>;
  fetchMovements: (cashboxId: string) => Promise<void>;
  createMovement: (cashboxId: string, payload: Partial<CashMovement>) => Promise<void>;
  updateMovement: (cashboxId: string, id: string, payload: Partial<CashMovement>) => Promise<void>;
  deleteMovement: (cashboxId: string, id: string) => Promise<void>;
}

export const useCashboxStore = create<CashboxState>((set, get) => ({
  cashboxes: [],
  movements: {},
  isLoading: false,
  error: null,

  async fetchCashboxes() {
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get("/cashboxes");
      set({ cashboxes: (data as any)?.data || data || [], isLoading: false });
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] Error al obtener cajas:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar cajas";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async createCashbox(payload) {
    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios según backend DTO
    if (!payload.opening_date) {
      throw new Error("La fecha de apertura es obligatoria");
    }
    if (!payload.user_id) {
      throw new Error("El ID de usuario es obligatorio");
    }

    try {
      // Construir payload exacto según DTO del backend
      const cashboxPayload: CreateCashboxData = {
        opening_date: payload.opening_date, // ISO8601 string
        user_id: payload.user_id, // UUID
        ...(payload.status && { status: payload.status as CashboxStatus }),
        ...(payload.opening_balance_ars !== undefined && { opening_balance_ars: payload.opening_balance_ars }),
        ...(payload.opening_balance_usd !== undefined && { opening_balance_usd: payload.opening_balance_usd }),
      };

      await apiClient.post("/cashboxes", cashboxPayload);
      await get().fetchCashboxes();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] Error al crear caja:", error);
      }
      throw error;
    }
  },

  async updateCashbox(id, payload) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    try {
      await apiClient.put(`/cashboxes/${id}`, payload);
      await get().fetchCashboxes();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] Error al actualizar caja:", error);
      }
      throw error;
    }
  },

  async closeCashbox(id, closingData?: { closing_balance_ars: number; closing_balance_usd?: number }) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }

    if (!closingData || closingData.closing_balance_ars === undefined) {
      throw new Error("El saldo de cierre ARS es obligatorio");
    }

    try {
      const { cashboxApi } = await import("@/hooks/api/cashboxes");
      await cashboxApi.close(id, {
        closing_balance_ars: closingData.closing_balance_ars,
        closing_balance_usd: closingData.closing_balance_usd,
        closing_date: new Date().toISOString().split('T')[0],
      });
      await get().fetchCashboxes();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] Error al cerrar caja:", error);
      }
      throw error;
    }
  },

  async openCashbox(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] id no está definido");
      }
      throw new Error("ID de caja no está definido");
    }

    try {
      const { cashboxApi } = await import("@/hooks/api/cashboxes");
      await cashboxApi.open(id);
      await get().fetchCashboxes();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] Error al abrir caja:", error);
      }
      throw error;
    }
  },

  async fetchMovements(cashboxId) {
    if (!cashboxId) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] cashboxId inválido");
      }
      set({ error: "ID de caja inválido", isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get(`/cash-movements?cashboxId=${cashboxId}`);
      const movements = (data as any)?.data || data || [];
      
      set((state) => ({
        movements: { ...state.movements, [cashboxId]: movements },
        isLoading: false,
      }));
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] Error al obtener movimientos:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar movimientos";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async createMovement(cashboxId, payload) {
    if (!cashboxId) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] cashboxId no está definido");
      }
      throw new Error("ID de caja no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios
    if (!payload.amount || payload.amount <= 0) {
      throw new Error("El monto es obligatorio y debe ser mayor a 0");
    }

    try {
      // Construir payload exacto según CreateCashMovementDto del backend
      const movementType: CashMovementType = payload.type === "ingreso" || payload.type === "income" 
        ? CashMovementType.INCOME 
        : CashMovementType.EXPENSE;
      
      const movementCurrency: Currency = (payload.currency === "USD" ? Currency.USD : Currency.ARS);
      
      const movementDate: string = payload.date 
        ? (typeof payload.date === "string" ? payload.date : new Date(payload.date).toISOString())
        : new Date().toISOString();

      const movementPayload: CreateCashMovementData = {
        cashbox_id: cashboxId, // required, UUID
        type: movementType, // required, CashMovementType enum
        amount: payload.amount as number, // required, number
        currency: movementCurrency, // required, Currency enum
        date: movementDate, // required, ISO8601
        ...(payload.description && { description: payload.description.trim() }),
        ...(payload.expense_id && { expense_id: payload.expense_id }),
        ...(payload.income_id && { income_id: payload.income_id }),
      };
      
      const createdMovement = await apiClient.post("/cash-movements", movementPayload);
      
      // Note: Accounting entries should be created separately through the accounting module
      // El backend maneja la relación entre cash movements y accounting entries
      
      // Refrescar movimientos
      await get().fetchMovements(cashboxId);
      
      // Si es un refuerzo (income), el backend actualiza automáticamente el saldo de apertura
      // Refrescar los datos de la caja para obtener el saldo actualizado
      const isRefill = movementPayload.type === "income";
      if (isRefill) {
        await get().fetchCashboxes();
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] Error al crear movimiento:", error);
      }
      throw error;
    }
  },

  async updateMovement(cashboxId, id, payload) {
    if (!cashboxId) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] cashboxId no está definido");
      }
      throw new Error("ID de caja no está definido");
    }

    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] id no está definido");
      }
      throw new Error("ID de movimiento no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    try {
      // Construir payload exacto según UpdateCashMovementDto del backend
      const movementPayload: UpdateCashMovementData = {};

      // Campos opcionales para actualización
      if (payload.type !== undefined) {
        movementPayload.type = payload.type === "ingreso" || payload.type === "income" 
          ? CashMovementType.INCOME 
          : CashMovementType.EXPENSE;
      }
      if (payload.amount !== undefined) movementPayload.amount = payload.amount;
      if (payload.date !== undefined) {
        movementPayload.date = typeof payload.date === "string" ? payload.date : new Date(payload.date).toISOString();
      }
      if (payload.description !== undefined) movementPayload.description = payload.description.trim();
      if (payload.expense_id !== undefined) movementPayload.expense_id = payload.expense_id;
      if (payload.income_id !== undefined) movementPayload.income_id = payload.income_id;
      
      // Usar PATCH en lugar de PUT (el backend usa @Patch)
      await apiClient.patch(`/cash-movements/${id}`, movementPayload);
      await get().fetchMovements(cashboxId);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] Error al actualizar movimiento:", error);
      }
      throw error;
    }
  },

  async deleteMovement(cashboxId, id) {
    if (!cashboxId) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] cashboxId no está definido");
      }
      throw new Error("ID de caja no está definido");
    }

    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [cashboxStore] id no está definido");
      }
      throw new Error("ID de movimiento no está definido");
    }

    try {
      await apiClient.delete(`/cash-movements/${id}`);
      await get().fetchMovements(cashboxId);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [cashboxStore] Error al eliminar movimiento:", error);
      }
      throw error;
    }
  },
}));

