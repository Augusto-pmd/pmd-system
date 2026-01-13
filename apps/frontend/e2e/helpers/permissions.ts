import { Page } from '@playwright/test';

/**
 * Helpers para verificar permisos de usuario en pruebas E2E
 */

/**
 * Obtiene los permisos del usuario actual desde localStorage
 */
export async function getUserPermissions(page: Page): Promise<string[]> {
  const permissions = await page.evaluate(() => {
    try {
      const authStorage = localStorage.getItem('pmd-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.user?.role?.permissions || [];
      }
      return [];
    } catch (e) {
      return [];
    }
  });
  
  return permissions || [];
}

/**
 * Verifica si el usuario tiene un permiso específico
 */
export async function hasPermission(page: Page, permission: string): Promise<boolean> {
  const permissions = await getUserPermissions(page);
  return permissions.includes(permission);
}

/**
 * Verifica si el usuario tiene al menos uno de los permisos especificados
 */
export async function hasAnyPermission(page: Page, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(page);
  return permissions.some(perm => userPermissions.includes(perm));
}

/**
 * Verifica si el usuario tiene todos los permisos especificados
 */
export async function hasAllPermissions(page: Page, permissions: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(page);
  return permissions.every(perm => userPermissions.includes(perm));
}

/**
 * Obtiene el rol del usuario actual
 */
export async function getUserRole(page: Page): Promise<string | null> {
  const role = await page.evaluate(() => {
    try {
      const authStorage = localStorage.getItem('pmd-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.user?.role?.name || null;
      }
      return null;
    } catch (e) {
      return null;
    }
  });
  
  return role;
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export async function hasRole(page: Page, role: string): Promise<boolean> {
  const userRole = await getUserRole(page);
  return userRole?.toLowerCase() === role.toLowerCase();
}

/**
 * Verifica si un error 403 es esperado según los permisos del usuario
 * @param page - Página de Playwright
 * @param requiredPermission - Permiso requerido para la operación
 * @param errorMessage - Mensaje de error recibido
 * @returns true si el error 403 es esperado (el usuario no tiene el permiso), false si es inesperado
 */
export async function isExpected403Error(
  page: Page, 
  requiredPermission: string, 
  errorMessage: string
): Promise<boolean> {
  // Verificar si el error menciona 403 o Forbidden
  if (!errorMessage.includes('403') && !errorMessage.includes('Forbidden') && !errorMessage.includes('Insufficient permissions')) {
    return false; // No es un error 403
  }
  
  // Verificar si el usuario tiene el permiso requerido
  const hasPerm = await hasPermission(page, requiredPermission);
  
  // Si el usuario NO tiene el permiso, el error 403 es esperado
  // Si el usuario SÍ tiene el permiso, el error 403 es inesperado (bug)
  return !hasPerm;
}

/**
 * Maneja errores 403 esperados en tests
 * Si el error es esperado (usuario no tiene permiso), hace skip del test
 * Si el error es inesperado (usuario tiene permiso pero recibe 403), lanza excepción
 */
export async function handleExpected403(
  page: Page,
  requiredPermission: string,
  errorMessage: string,
  testContext?: { skip: (reason: string) => void }
): Promise<void> {
  const isExpected = await isExpected403Error(page, requiredPermission, errorMessage);
  
  if (isExpected) {
    const reason = `Usuario no tiene permiso '${requiredPermission}'. Error 403 es esperado.`;
    console.log(`[PERMISSIONS] ⚠️ ${reason}`);
    if (testContext?.skip) {
      testContext.skip(reason);
    } else {
      throw new Error(reason);
    }
  } else {
    // El usuario tiene el permiso pero recibió 403 - esto es un bug
    const userRole = await getUserRole(page);
    const userPermissions = await getUserPermissions(page);
    throw new Error(
      `Error 403 inesperado. Usuario con rol '${userRole}' tiene permiso '${requiredPermission}' ` +
      `pero recibió 403. Permisos del usuario: ${userPermissions.join(', ')}. ` +
      `Mensaje de error: ${errorMessage}`
    );
  }
}

