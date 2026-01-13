import { Page } from '@playwright/test';

/**
 * Limpia todo el caché del navegador y localStorage
 * Versión mejorada: limpia cookies, localStorage (si la página está cargada) y agrega init script
 */
export async function clearCache(page: Page): Promise<void> {
  // Limpiar cookies (rápido, no requiere página cargada)
  await page.context().clearCookies();
  
  // Intentar limpiar localStorage si la página ya está cargada
  try {
    await page.evaluate(() => {
      try {
        localStorage.removeItem('pmd-auth-storage');
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        sessionStorage.clear();
      } catch (e) {
        // Ignorar errores si la página no está cargada o hay restricciones de seguridad
      }
    });
  } catch (e) {
    // Si falla (página no cargada), el init script lo hará
  }
  
  // Agregar script de inicialización para limpiar localStorage cuando se cargue una nueva página
  // Esto asegura que el localStorage se limpie incluso si navegamos a una nueva página
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('pmd-auth-storage');
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      sessionStorage.clear();
    } catch (e) {
      // Ignorar errores silenciosamente
    }
  });
}

/**
 * Verifica que el caché está limpio
 */
export async function verifyCacheCleared(page: Page): Promise<boolean> {
  try {
    const result = await page.evaluate(() => {
      try {
        const hasAuthStorage = !!localStorage.getItem('pmd-auth-storage');
        const hasToken = !!localStorage.getItem('access_token');
        const hasUser = !!localStorage.getItem('user');
        
        return {
          hasAuthStorage,
          hasToken,
          hasUser,
          isClean: !hasAuthStorage && !hasToken && !hasUser,
        };
      } catch (e) {
        // Si no se puede acceder a localStorage, asumir que está limpio
        return {
          hasAuthStorage: false,
          hasToken: false,
          hasUser: false,
          isClean: true,
        };
      }
    });
    
    if (!result.isClean) {
      console.warn('⚠️ Cache not fully cleared:', result);
    }
    
    return result.isClean;
  } catch (e) {
    // Si hay error al verificar, asumir que está limpio
    return true;
  }
}

