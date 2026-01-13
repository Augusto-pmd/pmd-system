/**
 * Helper para obtener la URL del backend desde las variables de entorno
 * Next.js carga automáticamente las variables NEXT_PUBLIC_* tanto en servidor como en cliente
 * 
 * NOTA: Este archivo debe ser compatible con el navegador (no usar módulos de Node.js como 'fs')
 */

/**
 * Obtiene la URL del backend desde las variables de entorno
 * Con fallback a localhost para desarrollo
 * Funciona tanto en servidor (rutas API) como en cliente (componentes)
 * 
 * Next.js automáticamente inyecta las variables NEXT_PUBLIC_* en el bundle del cliente,
 * por lo que no necesitamos cargar manualmente desde .env.local
 */
export function getBackendUrl(): string {
  // Obtener la URL desde process.env
  // Next.js automáticamente reemplaza NEXT_PUBLIC_* variables en tiempo de build
  // tanto para el servidor como para el cliente
  const url = process.env.NEXT_PUBLIC_API_URL;
  
  // Fallback a localhost:3001 si no está definida
  return url || 'http://localhost:3001';
}

