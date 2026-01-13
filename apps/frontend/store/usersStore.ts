import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { logCreate, logUpdate, logDelete } from "@/lib/auditHelper";
import { normalizeId } from "@/lib/normalizeId";

export interface UserPMD {
  id: string;
  email: string;
  fullName: string;
  roleId?: string;
  role?: {
    id: string;
    name: string;
    permissions?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
  // Campos que pueden venir del backend pero no se deben enviar en create/update
  // organizationId?: string; // NO enviar - backend lo toma del JWT
  // status?: string; // NO existe en backend
  // phone?: string; // NO existe en backend
  // position?: string; // NO existe en backend
  // notes?: string; // NO existe en backend
  // isActive?: boolean; // NO existe en backend
}

interface UsersState {
  users: UserPMD[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  createUser: (payload: Partial<UserPMD> & { password?: string; phone?: string; position?: string }) => Promise<void>;
  updateUser: (id: string, payload: Partial<UserPMD> & { password?: string; phone?: string; position?: string }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changeUserRole: (id: string, roleId: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  async fetchUsers() {
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get("/users");
      const rawUsers = (data as any)?.data || data || [];
      
      // Normalizar IDs de usuarios y roles, y mapear campos de snake_case a camelCase
      const normalizedUsers = rawUsers.map((user: Record<string, unknown>) => ({
        ...user,
        id: normalizeId(user.id),
        roleId: user.roleId ? normalizeId(user.roleId) : undefined,
        role: user.role ? {
          ...(user.role as any),
          id: normalizeId((user.role as any).id),
        } : undefined,
        // Mapear created_at a createdAt
        createdAt: user.created_at || user.createdAt || undefined,
        // Mapear updated_at a updatedAt
        updatedAt: user.updated_at || user.updatedAt || undefined,
      }));
      
      set({ users: normalizedUsers, isLoading: false });
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [usersStore] Error al obtener usuarios:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar usuarios";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async createUser(payload) {
    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [usersStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios
    if (!payload.fullName || payload.fullName.trim() === "") {
      throw new Error("El nombre completo es obligatorio");
    }
    if (!payload.email || payload.email.trim() === "") {
      throw new Error("El email es obligatorio");
    }
    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      throw new Error("El email no es válido");
    }
    if (!payload.password || payload.password.trim() === "") {
      throw new Error("La contraseña es obligatoria al crear usuario");
    }
    if (payload.password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
    if (!payload.roleId) {
      throw new Error("El rol es obligatorio");
    }

    try {
      // Construir payload exacto según DTO del backend
      // El backend espera: name (no fullName), role_id (no roleId)
      const userPayload: {
        name: string;
        email: string;
        password: string;
        role_id: string;
      } = {
        name: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        role_id: payload.roleId,
      };

      // NO agregar campos que no existen en el backend DTO
      // phone, position, notes, isActive, organizationId NO se envían

      const response = await apiClient.post("/users", userPayload);
      
      // Registrar en auditoría (solo si hay un ID válido)
      const userId = (response as any)?.data?.id || (response as any)?.id;
      if (userId) {
        await logCreate("users", "User", userId, `Se creó el usuario ${userPayload.name}`);
      }
      
      await get().fetchUsers();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [usersStore] Error al crear usuario:", error);
      }
      throw error;
    }
  },

  async updateUser(id, payload) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [usersStore] id no está definido");
      }
      throw new Error("ID de usuario no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [usersStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Obtener usuario actual para auditoría
    const currentUser = get().users.find((u) => u.id === id);
    const beforeState = currentUser ? { ...currentUser } : null;

    // Validar email si se proporciona
    if (payload.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email)) {
        throw new Error("El email no es válido");
      }
    }

    // Validar contraseña si se proporciona
    if (payload.password && payload.password.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    try {
      // Construir payload exacto según DTO del backend
      // El backend espera: name (no fullName), role_id (no roleId)
      const userPayload: {
        name?: string;
        email?: string;
        password?: string;
        role_id?: string;
      } = {};

      // Mapear de camelCase del frontend a snake_case del backend
      if (payload.fullName) userPayload.name = payload.fullName.trim();
      if (payload.email) userPayload.email = payload.email.trim().toLowerCase();
      if (payload.password) userPayload.password = payload.password;
      if (payload.roleId !== undefined && payload.roleId !== null) {
        userPayload.role_id = payload.roleId;
      }
      // NO enviar: phone, position, notes, isActive, organizationId

      const response = await apiClient.patch(`/users/${id}`, userPayload);
      
      // Registrar en auditoría
      // Mapear de vuelta a camelCase para auditoría
      const afterState = { 
        ...beforeState, 
        fullName: userPayload.name || beforeState?.fullName,
        roleId: userPayload.role_id || beforeState?.roleId,
        email: userPayload.email || beforeState?.email
      };
      await logUpdate("users", "User", id, beforeState, afterState, `Se actualizó el usuario ${userPayload.name || currentUser?.fullName || id}`);
      
      await get().fetchUsers();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [usersStore] Error al actualizar usuario:", error);
      }
      throw error;
    }
  },

  async deleteUser(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [usersStore] id no está definido");
      }
      throw new Error("ID de usuario no está definido");
    }

    // Obtener usuario para auditoría
    const user = get().users.find((u) => u.id === id);
    const userName = user?.fullName || user?.email || id;

    try {
      await apiClient.delete(`/users/${id}`);
      
      // Registrar en auditoría
      await logDelete("users", "User", id, `Se eliminó el usuario ${userName}`);
      
      await get().fetchUsers();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [usersStore] Error al eliminar usuario:", error);
      }
      throw error;
    }
  },

  async changeUserRole(id, roleId) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [usersStore] id no está definido");
      }
      throw new Error("ID de usuario no está definido");
    }

    if (!roleId) {
      throw new Error("El roleId es obligatorio");
    }

    // Obtener usuario actual para auditoría
    const user = get().users.find((u) => u.id === id);
    const beforeRoleId = user?.roleId || null;

    try {
      await apiClient.patch(`/users/${id}/role`, { roleId });
      
      // Registrar cambio de rol específicamente en auditoría
      const roleChange = `Se cambió el rol del usuario ${user?.fullName || id} de ${beforeRoleId || "sin rol"} a ${roleId}`;
      
      await logUpdate("users", "User", id, { roleId: beforeRoleId || null }, { roleId }, roleChange);
      
      await get().fetchUsers();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [usersStore] Error al cambiar rol:", error);
      }
      throw error;
    }
  },

  async deactivateUser(id) {
    // isActive no existe en el backend - todos los usuarios son activos
    throw new Error("La funcionalidad de activar/desactivar usuarios no está disponible en el backend");
  },

  async activateUser(id) {
    // isActive no existe en el backend - todos los usuarios son activos
    throw new Error("La funcionalidad de activar/desactivar usuarios no está disponible en el backend");
  },
}));

