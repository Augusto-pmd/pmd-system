import { Page, expect } from '@playwright/test';
import { clearCache, verifyCacheCleared } from './clear-cache';

/**
 * Helpers para autenticación en pruebas E2E
 */

export interface UserCredentials {
  email: string;
  password: string;
  role: 'Direction' | 'Supervisor' | 'Administration' | 'Operator';
}

export const TEST_USERS: Record<string, UserCredentials> = {
  direction: {
    email: 'direction@pmd.com',
    password: 'password123',
    role: 'Direction',
  },
  supervisor: {
    email: 'supervisor@pmd.com',
    password: 'password123',
    role: 'Supervisor',
  },
  administration: {
    email: 'admin@pmd.com',
    password: 'password123',
    role: 'Administration',
  },
  operator: {
    email: 'operator@pmd.com',
    password: 'password123',
    role: 'Operator',
  },
};

/**
 * Realiza login con las credenciales proporcionadas
 * Limpia el caché antes de hacer login para asegurar un estado limpio
 */
export async function login(page: Page, credentials: UserCredentials): Promise<void> {
  // Limpiar caché antes de hacer login (optimizado: solo cookies + init script)
  await clearCache(page);
  
  // Navegar a login - el init script limpiará localStorage automáticamente
  await page.goto('/login', { waitUntil: 'networkidle', timeout: 120000 });
  
  // Esperar a que el formulario esté visible - usar id específico del LoginForm
  // El LoginForm usa: id="email" y id="password"
  await expect(page.locator('#email')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#password')).toBeVisible({ timeout: 30000 });
  
  // Llenar formulario usando los IDs específicos
  await page.fill('#email', credentials.email);
  await page.fill('#password', credentials.password);
  
  // El botón de login dice "Sign In" cuando no está cargando, o "Signing in..." cuando está cargando
  // Usar selector por type="submit" que es más confiable
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
  await expect(submitButton).toContainText(/Sign In|Signing in/);
  
  // Hacer clic en el botón de login
  await submitButton.click();
  
  // Esperar activamente a que el token se guarde en localStorage (máximo 30 segundos)
  let token: string | null = null;
  const maxWaitTime = 30000; // 30 segundos
  const checkInterval = 500; // Verificar cada 500ms
  const maxChecks = maxWaitTime / checkInterval;
  
  for (let i = 0; i < maxChecks; i++) {
    token = await page.evaluate(() => localStorage.getItem('access_token'));
    if (token) {
      console.log(`[TEST AUTH] ✅ Token encontrado después de ${i * checkInterval}ms`);
      break;
    }
    
    // Verificar si hay un error visible
    const errorElement = page.locator('text=/error|incorrecto|inválido|credenciales|too many|429|throttle/i').first();
    const hasError = await errorElement.isVisible({ timeout: 100 }).catch(() => false);
    if (hasError) {
      const errorText = await errorElement.textContent();
      // Si es error de throttling o "Credenciales incorrectas" después de varios intentos, esperar y reintentar
      // (El backend puede mostrar "Credenciales incorrectas" cuando está en throttling)
      if (errorText && (/too many|429|throttle/i.test(errorText) || (i > 10 && /credenciales incorrectas/i.test(errorText)))) {
        console.log(`[TEST AUTH] ⚠️ Posible error de throttling detectado (${errorText}), esperando 20 segundos para que el throttling se resetee...`);
        await page.waitForTimeout(20000);
        // Limpiar el error y reintentar login
        await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 });
        await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#password')).toBeVisible({ timeout: 10000 });
        await page.fill('#email', credentials.email);
        await page.fill('#password', credentials.password);
        const retryButton = page.locator('button[type="submit"]');
        await retryButton.click();
        // Esperar de nuevo el token con más tiempo (el throttling puede tardar en resetearse)
        for (let j = 0; j < maxChecks * 2; j++) {
          token = await page.evaluate(() => localStorage.getItem('access_token'));
          if (token) {
            console.log(`[TEST AUTH] ✅ Token encontrado después de reintento (${j * checkInterval}ms)`);
            break;
          }
          // Verificar si hay error de nuevo (solo después de varios intentos para evitar falsos positivos)
          if (j > 30) {
            const retryErrorElement = page.locator('text=/error|incorrecto|inválido|credenciales|too many|429|throttle/i').first();
            const hasRetryError = await retryErrorElement.isVisible({ timeout: 100 }).catch(() => false);
            if (hasRetryError) {
              // Si después de 30 intentos todavía hay error, puede ser un problema real
              const retryErrorText = await retryErrorElement.textContent();
              // Pero antes de fallar, verificar si el token se guardó de todas formas
              const finalTokenCheck = await page.evaluate(() => localStorage.getItem('access_token'));
              if (!finalTokenCheck) {
                throw new Error(`Login falló después de reintento. Error persistente: ${retryErrorText}`);
              }
              // Si hay token, continuar aunque haya error visible (puede ser un error residual)
              token = finalTokenCheck;
              break;
            }
          }
          await page.waitForTimeout(checkInterval);
        }
        if (!token) {
          throw new Error(`Login falló: no se guardó el token después del reintento por throttling`);
        }
        break;
      } else if (i < 20) {
        // Si es un error temprano, puede ser un falso positivo o throttling, continuar esperando
        // Esperar un poco más antes de verificar de nuevo
        await page.waitForTimeout(checkInterval * 2);
        continue;
      } else {
        // Si es un error después de muchos intentos, intentar reintentar una vez más
        // Puede ser throttling residual o un problema temporal
        console.log(`[TEST AUTH] ⚠️ Error persistente después de ${i * checkInterval}ms, intentando reintento final...`);
        await page.waitForTimeout(5000);
        await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 });
        await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#password')).toBeVisible({ timeout: 10000 });
        await page.fill('#email', credentials.email);
        await page.fill('#password', credentials.password);
        const finalRetryButton = page.locator('button[type="submit"]');
        await finalRetryButton.click();
        // Esperar de nuevo el token con más tiempo (el throttling puede tardar en resetearse)
        for (let k = 0; k < maxChecks * 2; k++) {
          token = await page.evaluate(() => localStorage.getItem('access_token'));
          if (token) {
            console.log(`[TEST AUTH] ✅ Token encontrado después de reintento final (${k * checkInterval}ms)`);
            break;
          }
          // Verificar si hay error de nuevo
          const finalErrorElement = page.locator('text=/error|incorrecto|inválido|credenciales|too many|429|throttle/i').first();
          const hasFinalError = await finalErrorElement.isVisible({ timeout: 100 }).catch(() => false);
          if (hasFinalError && k > 20) {
            // Si después de 20 intentos todavía hay error, puede ser un problema real
            const finalErrorText = await finalErrorElement.textContent();
            throw new Error(`Login falló después de reintento final. Error persistente: ${finalErrorText}`);
          }
          await page.waitForTimeout(checkInterval);
        }
        if (!token) {
          throw new Error(`Login falló después de múltiples reintentos. Error original: ${errorText}`);
        }
        break;
      }
    }
    
    await page.waitForTimeout(checkInterval);
  }
  
  // Verificar que el token se guardó
  if (!token) {
    // Verificar la URL actual para debugging
    const currentUrl = page.url();
    const pageContent = await page.content().catch(() => '');
    throw new Error(`Login falló: no se guardó el token en localStorage después de ${maxWaitTime}ms. URL: ${currentUrl}`);
  }
  
  // Esperar a que la navegación se complete (puede ser lenta)
  try {
    await page.waitForURL(/\/dashboard/, { timeout: 30000 });
  } catch (e) {
    // Si no navega automáticamente, navegar manualmente
    console.log(`[TEST AUTH] ⚠️ No se redirigió automáticamente, navegando manualmente...`);
    await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  }
  
  // Esperar un poco más para que el estado de la aplicación se estabilice
  await page.waitForTimeout(1000);
  
  // Esperar un poco más para que el estado de la aplicación se estabilice
  await page.waitForTimeout(1000);
  
  // Verificar que estamos en el dashboard
  const currentUrl = page.url();
  if (!currentUrl.includes('/dashboard')) {
    console.log(`[TEST AUTH] ⚠️ URL actual no es /dashboard: ${currentUrl}, navegando manualmente...`);
    await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
  }
  
  // 🔍 LOGGING: Verificar permisos después del login
  // Esperar un poco más para que el estado se estabilice completamente
  await page.waitForTimeout(2000);
  
  // Forzar recarga de permisos llamando a loadMe si es necesario
  // Esto asegura que los permisos se carguen correctamente desde el backend
  try {
    await page.evaluate(async () => {
      // Intentar llamar a loadMe si está disponible en el store
      if (typeof window !== 'undefined' && (window as any).__PMD_AUTH_STORE__) {
        const store = (window as any).__PMD_AUTH_STORE__;
        if (store.getState && typeof store.getState().loadMe === 'function') {
          try {
            await store.getState().loadMe();
          } catch (e) {
            // Ignorar errores silenciosamente
          }
        }
      }
    });
    // Esperar un poco más después de loadMe
    await page.waitForTimeout(1000);
  } catch (e) {
    // Si falla, continuar de todas formas
    console.log(`[TEST AUTH] ⚠️ No se pudo forzar recarga de permisos: ${e}`);
  }
  
  const userData = await page.evaluate(() => {
    try {
      const authStorage = localStorage.getItem('pmd-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.user || null;
      }
      // Fallback: intentar desde user key individual
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (e) {
      return null;
    }
  });
  
  if (userData) {
    console.log(`[TEST AUTH] ✅ Login exitoso para: ${userData.email}`);
    console.log(`[TEST AUTH] 📋 Rol: ${userData.role?.name}`);
    console.log(`[TEST AUTH] 📋 Permisos (${userData.role?.permissions?.length || 0}):`, userData.role?.permissions?.slice(0, 10));
    if (userData.role?.name?.toLowerCase() === 'supervisor') {
      const hasUsersRead = userData.role?.permissions?.includes('users.read');
      const hasIncomesRead = userData.role?.permissions?.includes('incomes.read');
      console.log(`[TEST AUTH] ${hasUsersRead ? '❌' : '✅'} Supervisor tiene 'users.read': ${hasUsersRead}`);
      console.log(`[TEST AUTH] ${hasIncomesRead ? '✅' : '❌'} Supervisor tiene 'incomes.read': ${hasIncomesRead}`);
    }
    if (userData.role?.name?.toLowerCase() === 'operator') {
      const hasAccountingRead = userData.role?.permissions?.includes('accounting.read');
      const hasIncomesRead = userData.role?.permissions?.includes('incomes.read');
      const hasContractsRead = userData.role?.permissions?.includes('contracts.read');
      console.log(`[TEST AUTH] ${hasAccountingRead ? '❌' : '✅'} Operator tiene 'accounting.read': ${hasAccountingRead}`);
      console.log(`[TEST AUTH] ${hasIncomesRead ? '❌' : '✅'} Operator tiene 'incomes.read': ${hasIncomesRead}`);
      console.log(`[TEST AUTH] ${hasContractsRead ? '❌' : '✅'} Operator tiene 'contracts.read': ${hasContractsRead}`);
    }
    if (userData.role?.name?.toLowerCase() === 'administration') {
      const hasUsersRead = userData.role?.permissions?.includes('users.read');
      const hasRolesRead = userData.role?.permissions?.includes('roles.read');
      const hasAuditRead = userData.role?.permissions?.includes('audit.read');
      console.log(`[TEST AUTH] ${hasUsersRead ? '❌' : '✅'} Administration tiene 'users.read': ${hasUsersRead}`);
      console.log(`[TEST AUTH] ${hasRolesRead ? '❌' : '✅'} Administration tiene 'roles.read': ${hasRolesRead}`);
      console.log(`[TEST AUTH] ${hasAuditRead ? '❌' : '✅'} Administration tiene 'audit.read': ${hasAuditRead}`);
    }
  } else {
    console.warn(`[TEST AUTH] ⚠️ No se pudo obtener datos del usuario desde localStorage`);
  }
}

/**
 * Realiza logout
 * 
 * El botón de logout está en el Header y puede decir:
 * - "Logout" (en Header.tsx línea 235)
 * - "Cerrar sesión" (en Settings)
 * También tiene un icono LogOut de lucide-react
 */
export async function logout(page: Page): Promise<void> {
  // Buscar el botón de logout en el Header
  // El Header tiene un botón con texto "Logout" y un icono LogOut
  // También puede estar en Settings como "Cerrar sesión"
  const logoutSelectors = [
    // Header: botón con texto "Logout" (puede estar oculto en mobile, solo visible en sm:inline)
    'button:has-text("Logout")',
    // Settings: botón con texto "Cerrar sesión"
    'button:has-text("Cerrar sesión")',
    'button:has-text("Cerrar Sesión")',
    // Buscar por icono LogOut (lucide-react) - el botón contiene el icono
    'button:has(svg)',
    // Fallback: cualquier botón que contenga "logout" en el texto (case insensitive)
    'button:has-text(/logout/i)',
    '[data-testid="logout-button"]',
  ];
  
  let logoutButton = null;
  for (const selector of logoutSelectors) {
    const buttons = page.locator(selector);
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        const text = await button.textContent().catch(() => '');
        // Verificar que el botón contiene texto relacionado con logout
        if (text && /logout|cerrar sesión/i.test(text)) {
          logoutButton = button;
          break;
        }
      }
    }
    
    if (logoutButton) break;
  }
  
  if (logoutButton) {
    console.log(`[TEST AUTH] 🔓 Haciendo clic en botón de logout...`);
    await logoutButton.click();
    
    // Esperar a que se complete el logout (redirección al login)
    try {
      await page.waitForURL(/\/login/, { timeout: 10000 });
      console.log(`[TEST AUTH] ✅ Logout exitoso, redirigido a login`);
    } catch (e) {
      // Si no redirige automáticamente, verificar que el token se eliminó
      const token = await page.evaluate(() => localStorage.getItem('access_token'));
      if (!token) {
        console.log(`[TEST AUTH] ⚠️ Token eliminado pero no se redirigió, navegando manualmente...`);
        await page.goto('/login');
      } else {
        throw new Error(`Logout falló: el token aún existe. URL actual: ${page.url()}`);
      }
    }
  } else {
    console.log(`[TEST AUTH] ⚠️ No se encontró botón de logout, limpiando manualmente...`);
    // Si no hay botón visible, limpiar manualmente
    await page.evaluate(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('pmd-auth-storage');
      // Limpiar también el store de Zustand si existe
      if (typeof window !== 'undefined' && (window as any).__PMD_AUTH_STORE__) {
        (window as any).__PMD_AUTH_STORE__.setState({ user: null, token: null });
      }
    });
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 });
  }
  
  // Esperar un poco para que el estado se estabilice
  await page.waitForTimeout(1000);
}

/**
 * Verifica que el usuario está autenticado
 */
export async function expectAuthenticated(page: Page): Promise<void> {
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  expect(token).toBeTruthy();
  expect(page.url()).toMatch(/\/dashboard|\/works|\/expenses|\/suppliers/);
}

/**
 * Verifica que el usuario NO está autenticado
 */
export async function expectNotAuthenticated(page: Page): Promise<void> {
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  expect(token).toBeFalsy();
  expect(page.url()).toMatch(/\/login/);
}

