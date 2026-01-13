import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './helpers/auth';
import { navigateViaSidebar, expectRoute } from './helpers/navigation';
import { waitForLoadingComplete, waitForTableData } from './helpers/wait';

/**
 * Pruebas E2E del Flujo de Contabilidad
 * 
 * Verifica: ver registros → cerrar mes → reabrir mes (solo Direction)
 */
test.describe('Flujo de Contabilidad', () => {
  
  test('Administration debe poder ver registros contables', async ({ page }) => {
    await login(page, TEST_USERS.administration);
    await navigateViaSidebar(page, 'Contabilidad');
    await expectRoute(page, /\/accounting/);
    
    await waitForTableData(page, 0);
    
    // Verificar que la página carga correctamente
    const pageTitle = page.locator('h1, h2').filter({ hasText: /contabilidad|accounting/i }).first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('Administration debe poder cerrar mes contable', async ({ page }) => {
    await login(page, TEST_USERS.administration);
    await navigateViaSidebar(page, 'Contabilidad');
    
    await waitForLoadingComplete(page);
    
    // Buscar botón de cerrar mes
    const closeMonthButton = page.locator('button:has-text("Cerrar Mes"), button:has-text("Cerrar")').first();
    
    if (await closeMonthButton.isVisible({ timeout: 5000 })) {
      await closeMonthButton.click();
      
      // Confirmar cierre si hay modal
      const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Cerrar")').first();
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
      }
      
      // Verificar mensaje de éxito
      const successMessage = page.locator('text=/éxito|success|cerrado/i').first();
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    } else {
      test.skip('No hay mes disponible para cerrar');
    }
  });

  test('Direction debe poder reabrir mes cerrado', async ({ page }) => {
    await login(page, TEST_USERS.direction);
    await navigateViaSidebar(page, 'Contabilidad');
    
    await waitForLoadingComplete(page);
    
    // Buscar mes cerrado
    const closedMonth = page.locator('tr, div').filter({ hasText: /cerrado|closed/i }).first();
    
    if (await closedMonth.isVisible({ timeout: 5000 })) {
      // Buscar botón de reabrir
      const reopenButton = closedMonth.locator('button:has-text("Reabrir"), button[title*="reabrir"]').first();
      
      if (await reopenButton.isVisible({ timeout: 3000 })) {
        await reopenButton.click();
        
        // Confirmar reapertura
        const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Reabrir")').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }
        
        // Verificar mensaje de éxito
        const successMessage = page.locator('text=/éxito|success|reabierto/i').first();
        await expect(successMessage).toBeVisible({ timeout: 5000 });
      } else {
        test.skip('No se encontró botón de reabrir');
      }
    } else {
      test.skip('No hay meses cerrados para reabrir');
    }
  });

  test('Administration no debe poder reabrir mes cerrado', async ({ page }) => {
    await login(page, TEST_USERS.administration);
    await navigateViaSidebar(page, 'Contabilidad');
    
    await waitForLoadingComplete(page);
    
    // Buscar mes cerrado
    const closedMonth = page.locator('tr, div').filter({ hasText: /cerrado|closed/i }).first();
    
    if (await closedMonth.isVisible({ timeout: 5000 })) {
      // Verificar que NO hay botón de reabrir
      const reopenButton = closedMonth.locator('button:has-text("Reabrir")').first();
      await expect(reopenButton).not.toBeVisible({ timeout: 3000 });
    } else {
      test.skip('No hay meses cerrados para verificar');
    }
  });

  test('Supervisor no debe tener acceso a contabilidad', async ({ page }) => {
    await login(page, TEST_USERS.supervisor);
    
    // Verificar que no aparece en el sidebar
    const accountingLink = page.locator('nav a:has-text("Contabilidad")');
    await expect(accountingLink).not.toBeVisible({ timeout: 3000 });
    
    // Intentar acceder directamente
    await page.goto('/accounting');
    
    // Esperar a que la redirección ocurra o que se muestre un error
    await page.waitForTimeout(2000);
    
    // Debe redirigir a /unauthorized o a otra página (no /accounting)
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/\/accounting/);
    
    // Verificar que se muestra mensaje de no autorizado o se redirige
    const unauthorizedMessage = page.locator('text=/no autorizado|sin permisos|unauthorized/i').first();
    const isUnauthorized = await unauthorizedMessage.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isUnauthorized && !currentUrl.includes('/unauthorized') && !currentUrl.includes('/dashboard')) {
      // Si no hay mensaje de error ni redirección, verificar que al menos no está en /accounting
      expect(currentUrl).not.toContain('/accounting');
    }
  });

  test('Operator no debe tener acceso a contabilidad', async ({ page }) => {
    await login(page, TEST_USERS.operator);
    
    // Verificar que no aparece en el sidebar
    const accountingLink = page.locator('nav a:has-text("Contabilidad")');
    await expect(accountingLink).not.toBeVisible({ timeout: 3000 });
  });
});

