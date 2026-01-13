/**
 * Normaliza cualquier valor a string para IDs
 * Garantiza que todos los IDs en el frontend sean siempre strings
 * @param id - ID a normalizar (puede ser string, number, null, undefined)
 * @returns ID como string (cadena vacía si es null/undefined)
 */
export const normalizeId = (id: unknown): string => {
  if (id === null || id === undefined) return "";
  return String(id);
};

