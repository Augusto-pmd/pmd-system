import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { logCreate, logUpdate, logDelete } from "@/lib/auditHelper";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
  cantidadUsuarios?: number;
}

interface RolesState {
  roles: Role[];
  permissions: string[];
  isLoading: boolean;
  error: string | null;

  fetchRoles: () => Promise<void>;
  fetchRoleById: (id: string) => Promise<Role | null>;
  fetchPermissions: () => Promise<void>;
  createRole: (payload: Partial<Role>) => Promise<void>;
  updateRole: (id: string, payload: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
}

export const useRolesStore = create<RolesState>((set, get) => ({
  roles: [],
  permissions: [],
  isLoading: false,
  error: null,

  async fetchRoles() {
    try {
      set({ isLoading: true, error: null });
      const data = await apiClient.get("/roles");
      const rolesData = (data as any)?.data || data || [];
      
      // Normalizar roles para asegurar que permissions es siempre un array
      const normalizedRoles = Array.isArray(rolesData)
        ? rolesData.map((role: any) => ({
            ...role,
            permissions: Array.isArray(role.permissions) 
              ? role.permissions 
              : (role.permissions && typeof role.permissions === 'object' 
                  ? Object.keys(role.permissions).filter(
                      (key) => role.permissions[key] === true || role.permissions[key] === 'true'
                    )
                  : []),
            userCount: role.userCount !== undefined ? Number(role.userCount) : (role.cantidadUsuarios !== undefined ? Number(role.cantidadUsuarios) : 0),
          }))
        : [];
      
      set({ roles: normalizedRoles, isLoading: false });
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [rolesStore] Error al obtener roles:", error);
      }
      const errorMessage = error instanceof Error ? error.message : "Error al cargar roles";
      set({ error: errorMessage, isLoading: false });
    }
  },

  async fetchRoleById(id: string): Promise<Role | null> {
    try {
      const data = await apiClient.get(`/roles/${id}`);
      const roleData = (data as any)?.data || data;
      
      if (!roleData) {
        return null;
      }

      // Normalizar permisos
      let permissionsArray: string[] = [];
      if (roleData.permissions) {
        if (Array.isArray(roleData.permissions)) {
          permissionsArray = roleData.permissions.filter((p: any) => typeof p === "string");
        } else if (typeof roleData.permissions === 'object') {
          permissionsArray = Object.keys(roleData.permissions).filter(
            (key) => roleData.permissions[key] === true || roleData.permissions[key] === 'true'
          );
        }
      }

      return {
        id: roleData.id,
        name: roleData.name,
        description: roleData.description,
        permissions: permissionsArray,
        createdAt: roleData.createdAt || roleData.created_at,
        updatedAt: roleData.updatedAt || roleData.updated_at,
        userCount: roleData.userCount || roleData.cantidadUsuarios || 0,
      };
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [rolesStore] Error al obtener rol por ID:", error);
      }
      return null;
    }
  },

  async fetchPermissions() {
    // El backend no tiene endpoint /permissions genérico
    // Los permisos vienen con cada rol en /roles
    // Usamos lista estándar de permisos disponibles para el formulario
    const standardPermissions = [
      "works.read", "works.create", "works.update", "works.delete", "works.manage",
      "suppliers.read", "suppliers.create", "suppliers.update", "suppliers.delete", "suppliers.manage",
      "documents.read", "documents.create", "documents.update", "documents.delete", "documents.manage",
      "accounting.read", "accounting.create", "accounting.update", "accounting.delete", "accounting.manage",
      "cashboxes.read", "cashboxes.create", "cashboxes.update", "cashboxes.delete", "cashboxes.close", "cashboxes.approve",
      "alerts.read", "alerts.create", "alerts.update", "alerts.delete", "alerts.manage",
      "audit.read", "audit.delete", "audit.manage",
      "settings.read", "settings.update", "settings.manage",
      "users.read", "users.create", "users.update", "users.delete", "users.manage",
      "roles.read", "roles.create", "roles.update", "roles.delete", "roles.manage",
      "expenses.read", "expenses.create", "expenses.update", "expenses.delete", "expenses.validate",
      "contracts.read", "contracts.create", "contracts.update", "contracts.delete",
      "incomes.read", "incomes.create", "incomes.update", "incomes.delete",
      "reports.read",
      "schedule.read", "schedule.create", "schedule.update", "schedule.delete",
      "dashboard.read",
    ];
    set({ permissions: standardPermissions });
  },

  async createRole(payload) {
    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rolesStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Validar campos obligatorios
    if (!payload.name || payload.name.trim() === "") {
      throw new Error("El nombre del rol es obligatorio");
    }

    try {
      // Construir payload exacto según DTO
      const rolePayload: {
        name: string;
        description?: string;
        permissions: string[];
      } = {
        name: payload.name.trim(),
        permissions: [],
      };

      // Agregar campos opcionales
      if (payload.description) rolePayload.description = payload.description.trim();
      if (payload.permissions && Array.isArray(payload.permissions)) {
        rolePayload.permissions = payload.permissions;
      }

      const response = await apiClient.post("/roles", rolePayload);
      
      // Registrar en auditoría
      // Registrar en auditoría (solo si hay un ID válido)
      const roleId = (response as any)?.data?.id || (response as any)?.id;
      if (roleId) {
        await logCreate("roles", "Role", roleId, `Se creó el rol ${rolePayload.name}`);
      }
      
      await get().fetchRoles();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [rolesStore] Error al crear rol:", error);
      }
      throw error;
    }
  },

  async updateRole(id, payload) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rolesStore] id no está definido");
      }
      throw new Error("ID de rol no está definido");
    }

    if (!payload) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rolesStore] payload no está definido");
      }
      throw new Error("Payload no está definido");
    }

    // Obtener rol actual para auditoría
    const currentRole = get().roles.find((r) => r.id === id);
    const beforeState = currentRole ? { ...currentRole } : null;

    try {
      // Construir payload exacto según DTO
      // El backend espera permissions como Record<string, any> (objeto), no array
      const rolePayload: {
        name?: string;
        description?: string;
        permissions?: Record<string, any>;
      } = {};

      if (payload.name) rolePayload.name = payload.name.trim();
      if (payload.description !== undefined) rolePayload.description = payload.description?.trim() || undefined;
      
      // Convertir array de permisos a objeto: ["users.create", "users.read"] -> { "users.create": true, "users.read": true }
      if (payload.permissions !== undefined) {
        if (Array.isArray(payload.permissions)) {
          // Convertir array a objeto plano
          const permissionsObj: Record<string, boolean> = {};
          payload.permissions.forEach((permission: string) => {
            if (typeof permission === 'string' && permission.trim()) {
              permissionsObj[permission.trim()] = true;
            }
          });
          rolePayload.permissions = permissionsObj;
        } else if (typeof payload.permissions === 'object' && payload.permissions !== null && !Array.isArray(payload.permissions)) {
          // Si ya es un objeto, usarlo directamente
          rolePayload.permissions = payload.permissions as Record<string, any>;
        }
      }

      const response = await apiClient.patch(`/roles/${id}`, rolePayload);
      
      // Registrar en auditoría
      const afterState = { ...beforeState, ...rolePayload };
      await logUpdate("roles", "Role", id, beforeState, afterState, `Se actualizó el rol ${rolePayload.name || currentRole?.name || id}`);
      
      await get().fetchRoles();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [rolesStore] Error al actualizar rol:", error);
      }
      throw error;
    }
  },

  async deleteRole(id) {
    if (!id) {
      if (process.env.NODE_ENV === "development") {
        console.warn("❗ [rolesStore] id no está definido");
      }
      throw new Error("ID de rol no está definido");
    }

    // Obtener rol para auditoría
    const role = get().roles.find((r) => r.id === id);
    const roleName = role?.name || id;

    try {
      await apiClient.delete(`/roles/${id}`);
      
      // Registrar en auditoría
      await logDelete("roles", "Role", id, `Se eliminó el rol ${roleName}`);
      
      await get().fetchRoles();
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🔴 [rolesStore] Error al eliminar rol:", error);
      }
      throw error;
    }
  },
}));

