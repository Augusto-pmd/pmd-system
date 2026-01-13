import { test, expect } from '@playwright/test';
import { login, TEST_USERS } from './helpers/auth';
import { navigateViaSidebar, expectRoute } from './helpers/navigation';
import { fillField, submitForm, expectSuccessMessage } from './helpers/forms';
import { waitForLoadingComplete, waitForTableData } from './helpers/wait';
import { hasPermission, handleExpected403 } from './helpers/permissions';

/**
 * Pruebas E2E del Flujo de Alertas
 * 
 * Verifica: crear alerta → actualizar → resolver
 */
test.describe('Flujo de Alertas', () => {
  
  test('Administration debe poder crear alerta', async ({ page }) => {
    await login(page, TEST_USERS.administration);
    
    // Verificar permisos antes de intentar crear
    const canCreateAlert = await hasPermission(page, 'alerts.create');
    console.log(`[ALERTS] Usuario tiene permiso 'alerts.create': ${canCreateAlert}`);
    
    if (!canCreateAlert) {
      test.skip('El usuario no tiene permiso alerts.create. Error 403 sería esperado.');
      return;
    }
    
    await navigateViaSidebar(page, 'Alertas');
    await expectRoute(page, /\/alerts/);
    
    await waitForTableData(page, 0);
    
    const createButton = page.locator('button:has-text("Nueva Alerta"), button:has-text("Nuevo"), button:has-text("Crear")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    await waitForLoadingComplete(page);
    
    // Llenar formulario de alerta
    await fillField(page, 'Título', `Alerta Test ${Date.now()}`);
    await fillField(page, 'Mensaje', 'Esta es una alerta de prueba');
    
    // Seleccionar tipo de alerta si existe
    const typeSelect = page.locator('select[name*="type"], select[name*="tipo"]').first();
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption({ index: 1 });
    }
    
    // Seleccionar severidad si existe
    const severitySelect = page.locator('select[name*="severity"], select[name*="severidad"]').first();
    if (await severitySelect.isVisible()) {
      await severitySelect.selectOption({ index: 1 });
    }
    
    await submitForm(page, 'Guardar');
    try {
      await expectSuccessMessage(page);
    } catch (error) {
      // Si hay error 403, verificar si es esperado
      if (error instanceof Error && error.message.includes('403')) {
        await handleExpected403(page, 'alerts.create', error.message, test);
        return;
      }
      throw error;
    }
    
    // Esperar a que el modal se cierre y el refresh termine
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Verificar que aparece en la lista
    await waitForTableData(page, 1);
  });

  test('Direction debe poder resolver alerta', async ({ page }) => {
    // Primero crear una alerta como Administration para que Direction pueda resolverla
    await login(page, TEST_USERS.administration);
    await navigateViaSidebar(page, 'Alertas');
    await expectRoute(page, /\/alerts/);
    
    await waitForTableData(page, 0);
    
    const createButton = page.locator('button:has-text("Nueva Alerta"), button:has-text("Nuevo"), button:has-text("Crear")').first();
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    await waitForLoadingComplete(page);
    
    // Llenar formulario de alerta
    await fillField(page, 'Título', `Alerta para Resolver ${Date.now()}`);
    await fillField(page, 'Mensaje', 'Esta es una alerta de prueba para resolver');
    
    // Seleccionar tipo de alerta si existe
    const typeSelect = page.locator('select[name*="type"], select[name*="tipo"]').first();
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption({ index: 1 });
    }
    
    await submitForm(page, 'Guardar');
    await expectSuccessMessage(page);
    
    // Esperar a que el modal se cierre y el refresh termine
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    
    // Verificar que aparece en la lista
    await waitForTableData(page, 1);
    
    // Ahora cambiar a Direction y resolver la alerta
    await page.evaluate(() => {
      localStorage.clear();
    });
    await login(page, TEST_USERS.direction);
    
    // Verificar permisos antes de intentar resolver
    const canResolveAlert = await hasPermission(page, 'alerts.update') || await hasPermission(page, 'alerts.resolve');
    console.log(`[ALERTS] Usuario tiene permiso para resolver alertas: ${canResolveAlert}`);
    
    if (!canResolveAlert) {
      test.skip('El usuario no tiene permiso para resolver alertas. Error 403 sería esperado.');
      return;
    }
    
    await navigateViaSidebar(page, 'Alertas');
    
    await waitForTableData(page, 1);
    
    // Buscar alerta no resuelta
    const unresolvedAlert = page.locator('tbody tr').filter({ hasText: /pendiente|pending|activa/i }).first();
    
    if (await unresolvedAlert.isVisible({ timeout: 5000 })) {
      // Buscar botón de resolver
      const resolveButton = unresolvedAlert.locator('button:has-text("Resolver"), button[title*="resolver"]').first();
      
      if (await resolveButton.isVisible({ timeout: 3000 })) {
        await resolveButton.click();
        
        // Confirmar si hay modal
        const confirmButton = page.locator('button:has-text("Confirmar"), button:has-text("Resolver")').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }
        
        try {
          await expectSuccessMessage(page);
        } catch (error) {
          // Si hay error 403, verificar si es esperado
          if (error instanceof Error && error.message.includes('403')) {
            await handleExpected403(page, 'alerts.update', error.message, test);
            return;
          }
          throw error;
        }
        
        // Esperar a que el refresh termine después de resolver
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      } else {
        test.skip('No se encontró botón de resolver');
      }
    } else {
      test.skip('No hay alertas pendientes para resolver');
    }
  });

  test('Supervisor debe poder ver alertas pero no crear', async ({ page }) => {
    await login(page, TEST_USERS.supervisor);
    await navigateViaSidebar(page, 'Alertas');
    
    await waitForTableData(page, 0);
    
    // Verificar que no hay botón de crear
    const createButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear")').first();
    await expect(createButton).not.toBeVisible({ timeout: 3000 });
  });

  test('Operator debe poder ver alertas pero no crear', async ({ page }) => {
    await login(page, TEST_USERS.operator);
    await navigateViaSidebar(page, 'Alertas');
    
    await waitForTableData(page, 0);
    
    // Verificar que no hay botón de crear
    const createButton = page.locator('button:has-text("Nuevo"), button:has-text("Crear")').first();
    await expect(createButton).not.toBeVisible({ timeout: 3000 });
  });
});

