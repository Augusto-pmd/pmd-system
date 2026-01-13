/**
 * Helper para construir URLs de API de forma segura
 * Previene URLs con "undefined" o "null" en los paths
 */

/**
 * Valida que una URL no contenga "undefined" o "null" como string
 * @param url - URL a validar
 * @returns true si la URL es válida, false si contiene undefined/null
 */
export function isValidApiUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (typeof url !== "string") return false;
  
  // Detectar "undefined" o "null" como strings en la URL
  if (url.includes("undefined") || url.includes("null")) {
    console.warn("⚠️ [safeApi] URL contiene undefined/null:", url);
    return false;
  }
  
  // Detectar dobles barras (excepto después de http:// o https://)
  if (url.includes("//") && !url.match(/^https?:\/\//)) {
    console.warn("⚠️ [safeApi] URL contiene dobles barras:", url);
    return false;
  }
  
  return true;
}

/**
 * Construye una URL de API de forma segura
 * @param parts - Partes de la URL a unir
 * @returns URL válida o null si alguna parte es inválida
 */
export function buildSafeApiUrl(...parts: (string | null | undefined)[]): string | null {
  // Filtrar partes nulas/undefined y convertir a string
  const validParts = parts
    .filter((part): part is string => {
      if (part === null || part === undefined) {
        console.warn("⚠️ [safeApi] Parte de URL es null/undefined, omitiendo");
        return false;
      }
      if (typeof part !== "string") {
        console.warn("⚠️ [safeApi] Parte de URL no es string:", typeof part);
        return false;
      }
      return true;
    })
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (validParts.length === 0) {
    console.warn("⚠️ [safeApi] No hay partes válidas para construir URL");
    return null;
  }

  // Unir partes, eliminando barras duplicadas
  let url = validParts.join("/");
  
  // Normalizar: eliminar dobles barras (excepto después de http:// o https://)
  url = url.replace(/([^:]\/)\/+/g, "$1");
  
  // Asegurar que no termine con barra (excepto si es solo la base)
  if (url.endsWith("/") && url.split("/").length > 4) {
    url = url.slice(0, -1);
  }

  // Validar la URL final
  if (!isValidApiUrl(url)) {
    return null;
  }

  return url;
}

/**
 * Obtiene la URL base de la API de forma segura (sin /api)
 * @returns URL base o null si no está definida
 */
export function getApiBaseUrl(): string | null {
  // Usar el helper que carga correctamente desde .env.local
  const { getBackendUrl } = require('./env');
  const apiUrl = getBackendUrl();
  
  if (!apiUrl || apiUrl.includes("undefined") || apiUrl.includes("null")) {
    console.error("🔴 [safeApi] NEXT_PUBLIC_API_URL no está definida en variables de entorno");
    return null;
  }
  
  if (!isValidApiUrl(apiUrl)) {
    console.error("🔴 [safeApi] NEXT_PUBLIC_API_URL contiene valores inválidos:", apiUrl);
    return null;
  }
  
  return apiUrl;
}

/**
 * Obtiene la API_URL completa de forma segura (con /api)
 * Construye EXACTAMENTE: ${NEXT_PUBLIC_API_URL}/api
 * @returns API_URL o null si no está definida
 */
export function getApiUrl(): string | null {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  
  const API_URL = `${baseUrl}/api`;
  
  if (!isValidApiUrl(API_URL)) {
    console.error("🔴 [safeApi] API_URL inválida:", API_URL);
    return null;
  }
  
  return API_URL;
}

/**
 * Construye una URL completa de API de forma segura
 * @param endpoint - Endpoint relativo (ej: "/works", "/suppliers/123")
 * @returns URL completa o null si es inválida
 */
export function safeApiUrl(endpoint: string | null | undefined): string | null {
  if (!endpoint) {
    console.warn("⚠️ [safeApi] Endpoint es null/undefined");
    return null;
  }
  
  const API_URL = getApiUrl();
  if (!API_URL) {
    return null;
  }
  
  // Normalizar endpoint: asegurar que empiece con /
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  return buildSafeApiUrl(API_URL, normalizedEndpoint);
}

/**
 * Construye una ruta relativa para API (sin organizationId en la URL)
 * El backend deriva organizationId del JWT token (req.user.organizationId)
 * @param organizationId - ID de la organización (ignorado, solo para compatibilidad)
 * @param resource - Recurso (ej: "works", "clients", "alerts")
 * @param params - Parámetros adicionales opcionales (ej: ["123", "movements"])
 * @returns Ruta relativa como `resource/param1/param2/...` o null si algún parámetro es inválido
 */
export function buildApiRoute(
  organizationId: string | null | undefined,
  resource: string,
  ...params: (string | number | null | undefined)[]
): string | null {
  // organizationId se ignora - el backend lo deriva del JWT token
  
  // Validar resource
  if (!resource || typeof resource !== "string" || !resource.trim()) {
    console.warn("⚠️ [buildApiRoute] resource inválido");
    return null;
  }
  
  // Validar parámetros adicionales
  const validParams = params
    .map((param) => {
      if (param === null || param === undefined) {
        return null;
      }
      const str = String(param).trim();
      return str.length > 0 ? str : null;
    })
    .filter((param): param is string => param !== null);
  
  // Construir ruta relativa SIN organizationId: resource/param1/param2/...
  const parts = [resource.trim(), ...validParams];
  return parts.join("/");
}

/**
 * Valida y construye una URL con parámetros dinámicos (DEPRECATED - usar buildApiRoute)
 * @param baseEndpoint - Endpoint base (ej: "/works" o "" para rutas con organizationId)
 * @param params - Parámetros dinámicos (ej: [organizationId, "clients"] o ["123", "suppliers"])
 * @returns URL válida o null si algún parámetro es inválido
 */
export function safeApiUrlWithParams(
  baseEndpoint: string,
  ...params: (string | number | null | undefined)[]
): string | null {
  const API_URL = getApiUrl();
  if (!API_URL) {
    return null;
  }
  
  // Validar que todos los parámetros sean válidos
  const validParams = params
    .map((param) => {
      if (param === null || param === undefined) {
        console.warn("⚠️ [safeApi] Parámetro es null/undefined");
        return null;
      }
      return String(param).trim();
    })
    .filter((param): param is string => param !== null && param.length > 0);
  
  if (validParams.length !== params.length) {
    console.warn("⚠️ [safeApi] Algunos parámetros son inválidos");
    return null;
  }
  
  // Si baseEndpoint es "/" o vacío, construir directamente con API_URL y params
  // Esto es para rutas como /api/${organizationId}/clients
  if (baseEndpoint === "/" || baseEndpoint === "") {
    return buildSafeApiUrl(API_URL, ...validParams);
  }
  
  // Construir URL con endpoint base
  const normalizedEndpoint = baseEndpoint.startsWith("/") ? baseEndpoint : `/${baseEndpoint}`;
  return buildSafeApiUrl(API_URL, normalizedEndpoint, ...validParams);
}

