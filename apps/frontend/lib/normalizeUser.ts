import { normalizeId } from "./normalizeId";

/**
 * Modelo unificado de usuario que coincide con la respuesta del backend
 * TODOS los IDs son SIEMPRE strings (normalizados)
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive?: boolean;
  role: {
    id: string;
    name: string;
    permissions: string[]; // SIEMPRE presente como array (puede estar vacío si backend no envía)
  };
  roleId: string | null;
  organizationId: string | null;
  organization: {
    id: string;
    name: string;
    [key: string]: unknown;
  } | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Normaliza un usuario del backend preservando explícitamente role.permissions
 * NO infiere permisos por role.name - solo preserva lo que viene del backend
 */
export function normalizeUser(rawUser: unknown): AuthUser | null {
  if (!rawUser || typeof rawUser !== "object") return null;

  const user = rawUser as Record<string, unknown>;
  const id = normalizeId(user.id);
  const email = typeof user.email === "string" ? user.email : "";
  const fullName = (typeof user.fullName === "string" ? user.fullName : typeof user.name === "string" ? user.name : "") || "";

  // Preservar permissions explícitas del backend
  let permissions: string[] = [];
  const role = user.role as Record<string, unknown> | undefined;
  if (role?.permissions && Array.isArray(role.permissions)) {
    // Filtrar solo strings válidos
    permissions = role.permissions.filter((p: unknown) => typeof p === "string" && p.length > 0);
  }
  // Si el backend no envía permissions, el array queda vacío (pero existe)

  const normalizedRole = role
    ? {
        id: normalizeId(role.id),
        name: (typeof role.name === "string" ? role.name : "ADMINISTRATION") || "ADMINISTRATION",
        permissions, // SIEMPRE presente como array (preservado del backend o vacío)
      }
    : {
        id: "",
        name: "ADMINISTRATION",
        permissions: [], // Array vacío si no hay role
      };

  let organization: { id: string; name: string; [key: string]: unknown } | null = null;
  let organizationId: string = "";

  const org = user.organization as Record<string, unknown> | undefined;
  if (org) {
    organization = {
      id: normalizeId(org.id),
      name: (typeof org.name === "string" ? org.name : "") || "",
    };
    organizationId = organization.id;
  } else if (user.organizationId) {
    organizationId = normalizeId(user.organizationId);
  }

  return {
    id,
    email,
    fullName,
    role: normalizedRole,
    roleId: normalizeId(user.roleId || normalizedRole.id),
    organization,
    organizationId: organizationId || null,
    isActive: typeof user.isActive === "boolean" ? user.isActive : true,
    created_at: (typeof user.created_at === "string" ? user.created_at : typeof user.createdAt === "string" ? user.createdAt : undefined),
    updated_at: (typeof user.updated_at === "string" ? user.updated_at : typeof user.updatedAt === "string" ? user.updatedAt : undefined),
  };
}

