import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './helpers/auth';
import { navigateViaSidebar, expectRoute } from './helpers/navigation';
import { fillField, selectOption, submitForm, expectSuccessMessage } from './helpers/forms';
import { waitForLoadingComplete, waitForTableData } from './helpers/wait';

/**
 * Pruebas E2E del Flujo de Ingresos
 * 
 * Verifica: crear ingreso → ver lista → permisos por rol
 */
test.describe('Flujo de Ingresos', () => {
  
  test('Direction debe poder crear ingreso', async ({ page }) => {
    await login(page, TEST_USERS.direction);
    await navigateViaSidebar(page, 'Ingresos');
    await expectRoute(page, /\/incomes/);
    
    await waitForTableData(page, 0);
    
    const createButton = page.locator('button:has-text("Add Income"), button:has-text("+ Add Income"), button:has-text("Nuevo"), button:has-text("Crear"), button:has-text("Crear Ingreso")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    await waitForLoadingComplete(page);
    
    // Verificar que el modal está abierto antes de continuar
    const modal = page.locator('div[class*="modal"], div[class*="Modal"], [role="dialog"]').first();
    const isModalOpen = await modal.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isModalOpen) {
      throw new Error('El modal no está abierto. No se puede llenar el formulario.');
    }
    
    // Llenar formulario de ingreso
    try {
      await fillField(page, 'Obra', 'Test');
      await page.keyboard.press('Enter');
    } catch {
      await selectOption(page, 'Obra', 'Test');
    }
    
    await fillField(page, 'Monto', '25000');
    await fillField(page, 'Fecha', new Date().toISOString().split('T')[0]);
    
    // Seleccionar moneda
    const currencySelect = page.locator('select[name*="currency"], select[name*="moneda"]').first();
    if (await currencySelect.isVisible()) {
      await currencySelect.selectOption('ARS');
    }
    
    await submitForm(page, 'Guardar');
    await expectSuccessMessage(page);
    
    // Esperar a que el modal se cierre y el refresh termine
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Verificar que aparece en la lista
    await waitForTableData(page, 1);
  });

  test('Supervisor debe poder ver ingresos pero no crear', async ({ page }) => {
    await login(page, TEST_USERS.supervisor);
    await navigateViaSidebar(page, 'Ingresos');
    
    await waitForTableData(page, 0);
    
    // Verificar que no hay botón de crear
    const createButton = page.locator('button:has-text("Add Income"), button:has-text("+ Add Income"), button:has-text("Nuevo"), button:has-text("Crear"), button:has-text("Crear Ingreso")').first();
    await expect(createButton).not.toBeVisible({ timeout: 3000 });
  });

  test('Administration debe poder ver ingresos', async ({ page }) => {
    await login(page, TEST_USERS.administration);
    await navigateViaSidebar(page, 'Ingresos');
    
    await waitForTableData(page, 0);
    
    // Verificar que la página carga correctamente
    const pageTitle = page.locator('h1, h2').filter({ hasText: /ingresos|incomes/i }).first();
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
  });

  test('Operator no debe tener acceso a ingresos', async ({ page }) => {
    await login(page, TEST_USERS.operator);
    
    // Verificar que no aparece en el sidebar
    const incomesLink = page.locator('nav a:has-text("Ingresos")');
    await expect(incomesLink).not.toBeVisible({ timeout: 3000 });
    
    // Intentar acceder directamente
    await page.goto('/incomes');
    
    // Esperar a que la redirección ocurra o que se muestre un error
    await page.waitForTimeout(2000);
    
    // Debe redirigir a /unauthorized o a otra página (no /incomes)
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/\/incomes/);
    
    // Verificar que se muestra mensaje de no autorizado o se redirige
    const unauthorizedMessage = page.locator('text=/no autorizado|sin permisos|unauthorized/i').first();
    const isUnauthorized = await unauthorizedMessage.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isUnauthorized && !currentUrl.includes('/unauthorized') && !currentUrl.includes('/dashboard')) {
      // Si no hay mensaje de error ni redirección, verificar que al menos no está en /incomes
      expect(currentUrl).not.toContain('/incomes');
    }
  });
});

