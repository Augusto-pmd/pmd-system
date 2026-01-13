/**
 * Helpers para trabajar con roles de usuario
 * El modelo unificado asume que role SIEMPRE es un objeto { id, name }
 */

/**
 * Extrae el nombre del rol como string
 * @param role - Objeto role { id: string, name } o null/undefined
 * @returns Nombre del rol o undefined si no existe
 */
export const getRoleString = (
  role?: { id: string; name: string; permissions?: string[] } | null
): string | undefined => {
  return role?.name;
};

/**
 * Traduce el nombre del rol al español
 * @param role - Objeto role { id: string, name } o null/undefined
 * @returns Nombre traducido del rol o "Sin rol" si no existe
 */
export const translateRole = (
  role?: { id: string; name: string; permissions?: string[] } | null
): string => {
  const roleStr = getRoleString(role);
  if (!roleStr) return "Sin rol";
  const roleLower = roleStr.toLowerCase();
  const translations: Record<string, string> = {
    admin: "Administrador",
    administrator: "Administrador",
    operator: "Operador",
    operador: "Operador",
    auditor: "Auditor",
    supervisor: "Supervisor",
    manager: "Gerente",
  };
  return translations[roleLower] || roleStr;
};

/**
 * Obtiene la variante de Badge según el rol
 * @param role - Objeto role { id: string, name } o null/undefined
 * @returns Variante de Badge
 */
export const getRoleVariant = (
  role?: { id: string; name: string; permissions?: string[] } | null
): "default" | "success" | "warning" | "error" | "info" => {
  const roleStr = getRoleString(role);
  if (!roleStr) return "default";
  const roleLower = roleStr.toLowerCase();
  if (roleLower === "admin" || roleLower === "administrator") return "error";
  if (roleLower === "operator" || roleLower === "operador") return "info";
  if (roleLower === "auditor") return "warning";
  return "default";
};

