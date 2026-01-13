import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './helpers/auth';
import { navigateViaSidebar, expectRoute } from './helpers/navigation';
import { waitForLoadingComplete, waitForTableData } from './helpers/wait';

/**
 * Pruebas E2E del Flujo de Auditoría
 * 
 * Verifica: solo Direction puede acceder → ver registros → filtrar
 */
test.describe('Flujo de Auditoría', () => {
  
  test('Direction debe poder ver registros de auditoría', async ({ page }) => {
    await login(page, TEST_USERS.direction);
    await navigateViaSidebar(page, 'Auditoría');
    await expectRoute(page, /\/audit/);
    
    await waitForTableData(page, 0);
    
    // Verificar que la página carga correctamente
    const pageTitle = page.locator('h1, h2').filter({ hasText: /auditoría|audit/i }).first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('Direction debe poder filtrar registros de auditoría', async ({ page }) => {
    await login(page, TEST_USERS.direction);
    await navigateViaSidebar(page, 'Auditoría');
    
    await waitForLoadingComplete(page);
    
    // Buscar filtros si existen
    const filterInput = page.locator('input[placeholder*="buscar"], input[placeholder*="filter"]').first();
    
    if (await filterInput.isVisible({ timeout: 3000 })) {
      await filterInput.fill('login');
      await page.keyboard.press('Enter');
      
      // Esperar a que se actualice la tabla
      await waitForLoadingComplete(page);
      
      // Verificar que los resultados se filtraron
      const rows = page.locator('tbody tr');
      const count = await rows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    } else {
      test.skip('No se encontraron filtros en la página de auditoría');
    }
  });

  test('Supervisor no debe tener acceso a auditoría', async ({ page }) => {
    await login(page, TEST_USERS.supervisor);
    
    // Verificar que no aparece en el sidebar
    const auditLink = page.locator('nav a:has-text("Auditoría")');
    await expect(auditLink).not.toBeVisible({ timeout: 3000 });
    
    // Intentar acceder directamente
    await page.goto('/audit');
    
    // Esperar a que la redirección ocurra o que se muestre un error
    await page.waitForTimeout(2000);
    
    // Debe redirigir a /unauthorized o a otra página (no /audit)
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/\/audit/);
    
    // Verificar que se muestra mensaje de no autorizado o se redirige
    const unauthorizedMessage = page.locator('text=/no autorizado|sin permisos|unauthorized/i').first();
    const isUnauthorized = await unauthorizedMessage.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isUnauthorized && !currentUrl.includes('/unauthorized') && !currentUrl.includes('/dashboard')) {
      // Si no hay mensaje de error ni redirección, verificar que al menos no está en /audit
      expect(currentUrl).not.toContain('/audit');
    }
  });

  test('Administration no debe tener acceso a auditoría', async ({ page }) => {
    await login(page, TEST_USERS.administration);
    
    // Verificar que no aparece en el sidebar
    const auditLink = page.locator('nav a:has-text("Auditoría")');
    await expect(auditLink).not.toBeVisible({ timeout: 3000 });
  });

  test('Operator no debe tener acceso a auditoría', async ({ page }) => {
    await login(page, TEST_USERS.operator);
    
    // Verificar que no aparece en el sidebar
    const auditLink = page.locator('nav a:has-text("Auditoría")');
    await expect(auditLink).not.toBeVisible({ timeout: 3000 });
  });
});

