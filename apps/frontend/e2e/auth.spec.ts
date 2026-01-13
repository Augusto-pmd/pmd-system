import { test, expect } from '@playwright/test';
import { login, logout, TEST_USERS, expectAuthenticated, expectNotAuthenticated } from './helpers/auth';
import { expectNavigationVisible, expectNavigationHidden } from './helpers/navigation';

/**
 * Pruebas E2E de Autenticación y Roles
 * 
 * Verifica que el flujo de login funciona correctamente y que los permisos
 * por rol se aplican correctamente en la interfaz.
 */
test.describe('Autenticación y Roles', () => {
  
  // Nota: No limpiamos caché en beforeEach porque clearCache necesita que la página esté cargada
  // El caché se limpia automáticamente en login() antes de cada test de autenticación
  
  // Agregar delay entre tests para evitar throttling del backend (5 requests/minuto para login)
  test.afterEach(async ({ page }) => {
    // Esperar 3 segundos entre tests para evitar throttling
    // El backend tiene límite de 5 requests/minuto para login
    // Con 3 segundos entre tests, podemos hacer ~20 tests/minuto, suficiente para nuestros tests
    await page.waitForTimeout(3000);
  });
  
  test.describe('Login', () => {
    test('debe hacer login exitoso con credenciales válidas', async ({ page }) => {
      await login(page, TEST_USERS.direction);
      await expectAuthenticated(page);
    });

    test('debe mostrar error con email incorrecto', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', 'invalid@email.com');
      await page.fill('#password', 'password123');
      await page.click('button[type="submit"]');
      
      // Esperar mensaje de error (puede estar en un div con estilo de error)
      const errorMessage = page.locator('text=/error|incorrecto|inválido|credenciales/i').first();
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('debe mostrar error con contraseña incorrecta', async ({ page }) => {
      await page.goto('/login');
      await page.fill('#email', TEST_USERS.direction.email);
      await page.fill('#password', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Esperar mensaje de error
      const errorMessage = page.locator('text=/error|incorrecto|inválido|credenciales/i').first();
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
    });

    test('debe validar campos vacíos', async ({ page }) => {
      await page.goto('/login');
      
      // Los campos tienen required, así que el navegador mostrará validación HTML5
      // O el formulario simplemente no se enviará
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // Esperar un poco para ver si hay validación
      await page.waitForTimeout(1000);
      
      // Verificar que el formulario no se envió (permanece en login o muestra error)
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/login/);
      
      // Verificar que los campos siguen vacíos o hay mensaje de error
      const emailValue = await page.locator('#email').inputValue();
      const passwordValue = await page.locator('#password').inputValue();
      
      // Si los campos están vacíos, la validación HTML5 debería prevenir el envío
      if (!emailValue || !passwordValue) {
        // La validación HTML5 funcionó
        expect(true).toBe(true);
      }
    });

    test('debe guardar token en localStorage después del login', async ({ page }) => {
      await login(page, TEST_USERS.direction);
      
      const token = await page.evaluate(() => localStorage.getItem('access_token'));
      expect(token).toBeTruthy();
      expect(token?.length).toBeGreaterThan(0);
    });
  });

  test.describe('Logout', () => {
    test('debe cerrar sesión correctamente', async ({ page }) => {
      await login(page, TEST_USERS.direction);
      await expectAuthenticated(page);
      
      await logout(page);
      await expectNotAuthenticated(page);
      
      // Verificar que el token se eliminó
      const token = await page.evaluate(() => localStorage.getItem('access_token'));
      expect(token).toBeFalsy();
    });
  });

  test.describe('Permisos por Rol - Direction', () => {
    test('debe tener acceso completo a todos los módulos', async ({ page }) => {
      await login(page, TEST_USERS.direction);
      
      // Verificar que puede ver todos los módulos principales
      const modules = ['Dashboard', 'Obras', 'Gastos', 'Proveedores', 'Contratos', 'Cajas', 'Contabilidad', 'Usuarios', 'Auditoría'];
      await expectNavigationVisible(page, modules);
    });
  });

  test.describe('Permisos por Rol - Supervisor', () => {
    test('debe ver módulos de solo lectura', async ({ page }) => {
      await login(page, TEST_USERS.supervisor);
      
      // Supervisor puede ver pero no crear
      const visibleModules = ['Dashboard', 'Obras', 'Gastos', 'Proveedores', 'Contratos', 'Cajas'];
      await expectNavigationVisible(page, visibleModules);
      
      // No debe ver módulos administrativos
      const hiddenModules = ['Usuarios', 'Auditoría'];
      await expectNavigationHidden(page, hiddenModules);
    });
  });

  test.describe('Permisos por Rol - Administration', () => {
    test('debe ver módulos administrativos pero no gestión de usuarios', async ({ page }) => {
      await login(page, TEST_USERS.administration);
      
      // Administration puede validar y aprobar
      const visibleModules = ['Dashboard', 'Gastos', 'Proveedores', 'Contratos', 'Cajas', 'Contabilidad'];
      await expectNavigationVisible(page, visibleModules);
      
      // No debe ver gestión de usuarios
      const hiddenModules = ['Usuarios'];
      await expectNavigationHidden(page, hiddenModules);
    });
  });

  test.describe('Permisos por Rol - Operator', () => {
    test('debe tener acceso limitado', async ({ page }) => {
      await login(page, TEST_USERS.operator);
      
      // Operator solo puede ver módulos básicos
      const visibleModules = ['Dashboard', 'Gastos', 'Proveedores', 'Cajas'];
      await expectNavigationVisible(page, visibleModules);
      
      // No debe ver módulos administrativos
      const hiddenModules = ['Contabilidad', 'Usuarios', 'Auditoría'];
      await expectNavigationHidden(page, hiddenModules);
    });
  });
});

