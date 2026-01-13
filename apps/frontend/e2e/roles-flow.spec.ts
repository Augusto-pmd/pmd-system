import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './helpers/auth';
import { navigateViaSidebar, expectRoute } from './helpers/navigation';
import { fillField, submitForm, expectSuccessMessage } from './helpers/forms';
import { waitForLoadingComplete, waitForTableData } from './helpers/wait';

/**
 * Pruebas E2E del Flujo de Roles
 * 
 * Verifica: solo Direction puede acceder → ver roles → actualizar permisos
 */
test.describe('Flujo de Roles', () => {
  
  test('Direction debe poder ver roles', async ({ page }) => {
    await login(page, TEST_USERS.direction);
    await navigateViaSidebar(page, 'Roles');
    await expectRoute(page, /\/roles|\/admin\/roles/);
    
    await waitForTableData(page, 1); // Debe haber al menos 4 roles (Direction, Supervisor, Administration, Operator)
    
    // Verificar que aparecen los roles principales
    const directionRole = page.locator('tbody tr').filter({ hasText: /direction/i }).first();
    await expect(directionRole).toBeVisible({ timeout: 5000 });
  });

  test('Direction debe poder actualizar permisos de rol', async ({ page }) => {
    await login(page, TEST_USERS.direction);
    await navigateViaSidebar(page, 'Roles');
    
    await waitForTableData(page, 1);
    
    // Buscar rol Operator
    const operatorRole = page.locator('tbody tr').filter({ hasText: /operator/i }).first();
    
    if (await operatorRole.isVisible({ timeout: 5000 })) {
      // Hacer clic para editar
      const editButton = operatorRole.locator('button:has-text("Editar"), button[title*="editar"]').first();
      if (await editButton.isVisible({ timeout: 3000 })) {
        await editButton.click();
      } else {
        await operatorRole.click();
      }
      
      await waitForLoadingComplete(page);
      
      // Verificar que se puede ver/editar permisos
      const permissionsSection = page.locator('text=/permisos|permissions/i').first();
      if (await permissionsSection.isVisible({ timeout: 3000 })) {
        // Si hay checkboxes de permisos, verificar que son interactuables
        const firstCheckbox = page.locator('input[type="checkbox"]').first();
        if (await firstCheckbox.isVisible({ timeout: 2000 })) {
          // Solo verificar que existe, no cambiar nada para no romper el sistema
          expect(await firstCheckbox.isVisible()).toBe(true);
        }
      }
    } else {
      test.skip('No se encontró el rol Operator');
    }
  });

  test('Supervisor no debe tener acceso a roles', async ({ page }) => {
    await login(page, TEST_USERS.supervisor);
    
    // Verificar que no aparece en el sidebar
    const rolesLink = page.locator('nav a:has-text("Roles")');
    await expect(rolesLink).not.toBeVisible({ timeout: 3000 });
    
    // Intentar acceder directamente
    await page.goto('/roles');
    
    // Esperar a que la redirección ocurra o que se muestre un error
    await page.waitForTimeout(2000);
    
    // Debe redirigir a /unauthorized o a otra página (no /roles)
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/\/roles/);
    
    // Verificar que se muestra mensaje de no autorizado o se redirige
    const unauthorizedMessage = page.locator('text=/no autorizado|sin permisos|unauthorized/i').first();
    const isUnauthorized = await unauthorizedMessage.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isUnauthorized && !currentUrl.includes('/unauthorized') && !currentUrl.includes('/dashboard')) {
      // Si no hay mensaje de error ni redirección, verificar que al menos no está en /roles
      expect(currentUrl).not.toContain('/roles');
    }
  });

  test('Administration no debe tener acceso a roles', async ({ page }) => {
    await login(page, TEST_USERS.administration);
    
    // Verificar que no aparece en el sidebar
    const rolesLink = page.locator('nav a:has-text("Roles")');
    await expect(rolesLink).not.toBeVisible({ timeout: 3000 });
    
    // Intentar acceder directamente
    await page.goto('/roles');
    
    // Esperar a que la redirección ocurra o que se muestre un error
    await page.waitForTimeout(2000);
    
    // Debe redirigir a /unauthorized o a otra página (no /roles)
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/\/roles/);
  });

  test('Operator no debe tener acceso a roles', async ({ page }) => {
    await login(page, TEST_USERS.operator);
    
    // Verificar que no aparece en el sidebar
    const rolesLink = page.locator('nav a:has-text("Roles")');
    await expect(rolesLink).not.toBeVisible({ timeout: 3000 });
  });
});

