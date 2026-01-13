import { Page, expect } from '@playwright/test';

/**
 * Helpers para esperar condiciones en pruebas E2E
 */

/**
 * Espera a que una tabla cargue datos
 * @param page - Página de Playwright
 * @param minRows - Número mínimo de filas esperadas (0 = solo verificar que la tabla existe o hay estado vacío)
 */
export async function waitForTableData(page: Page, minRows: number = 1): Promise<void> {
  console.log(`[WAIT] Esperando tabla con al menos ${minRows} fila(s)...`);
  console.log(`[WAIT] URL actual: ${page.url()}`);
  
  // 1. Esperar a que la página termine de cargar
  // Usar un timeout más largo si esperamos datos (minRows > 0) porque puede haber un refresh después de crear
  const networkTimeout = minRows > 0 ? 20000 : 15000;
  await page.waitForLoadState('networkidle', { timeout: networkTimeout }).catch(() => {
    console.log(`[WAIT] ⚠️ Network idle timeout, continuando...`);
  });
  
  // 2. Esperar un poco para que los componentes se rendericen
  // Si esperamos datos (minRows > 0), dar más tiempo para que el refresh termine
  const renderTimeout = minRows > 0 ? 3000 : 2000;
  await page.waitForTimeout(renderTimeout);
  
  // 3. Verificar si hay un LoadingState visible y esperar a que desaparezca
  const loadingSelectors = [
    'text=/cargando|loading|espera/i',
    '[data-testid="loading"]',
    '.spinner',
    '.loading',
  ];
  
  for (const selector of loadingSelectors) {
    const loadingElement = page.locator(selector).first();
    const isLoading = await loadingElement.isVisible({ timeout: 1000 }).catch(() => false);
    if (isLoading) {
      console.log(`[WAIT] ⏳ Detectado estado de carga, esperando a que termine...`);
      await loadingElement.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
        console.log(`[WAIT] ⚠️ LoadingState no desapareció, continuando...`);
      });
      await page.waitForTimeout(1000);
      break;
    }
  }
  
  // 4. Buscar tabla (múltiples selectores)
  const tableSelectors = [
    'table',
    '[role="table"]',
    'div[class*="TableContainer"] table', // Para AuditList, AccountingTable
    'div[class*="table-container"] table',
  ];
  
  let table = null;
  for (const selector of tableSelectors) {
    try {
      const locator = page.locator(selector).first();
      const isVisible = await locator.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        table = locator;
        console.log(`[WAIT] ✅ Tabla encontrada con selector: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  // 5. Si minRows es 0, verificar estados vacíos primero
  if (minRows === 0) {
    // 5.1 Verificar si hay tabla (aunque esté vacía)
    if (table) {
      const tbody = table.locator('tbody').first();
      const hasTbody = await tbody.isVisible({ timeout: 2000 }).catch(() => false);
      if (hasTbody) {
        console.log(`[WAIT] ✅ Tabla encontrada con tbody (puede estar vacía, minRows=0)`);
        return;
      }
    }
    
    // 5.2 Buscar estados vacíos (EmptyState component, mensajes, etc.)
    const emptyStateSelectors = [
      // EmptyState component (estructura: div.text-center.py-12 con emoji)
      'div.text-center.py-12',
      'div:has(> div.text-6xl)', // Div con emoji grande
      // Mensajes comunes de "sin datos"
      'text=/no hay documentos|no se encontraron documentos|no hay usuarios|no se encontraron usuarios|no hay obras|no se encontraron obras|no hay proveedores|no se encontraron proveedores|no hay gastos|no se encontraron gastos|no hay contratos|no contracts found|no se encontraron contratos|no hay alertas|no se encontraron alertas|no hay registros de auditoría|no se encontraron registros|no hay movimientos|no tienes cajas|no hay cajas|no income records|create your first/i',
      // SuppliersList empty state
      'div:has-text(/no hay proveedores registrados/i)',
      // AuditList empty state
      'div:has(svg):has-text(/no hay registros de auditoría|no se encontraron registros con los filtros/i)',
      'p:has-text(/no hay registros de auditoría|no se encontraron registros con los filtros/i)',
    ];
    
    for (const selector of emptyStateSelectors) {
      try {
        const locator = page.locator(selector).first();
        const isVisible = await locator.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          const text = await locator.textContent().catch(() => '');
          console.log(`[WAIT] ✅ Estado vacío encontrado (minRows=0): "${text?.substring(0, 80)}"`);
          return;
        }
      } catch (error) {
        continue;
      }
    }
    
    // 5.3 Si hay tabla pero no tbody, asumir que está vacía
    if (table) {
      console.log(`[WAIT] ✅ Tabla encontrada pero sin tbody (minRows=0, asumiendo vacía)`);
      return;
    }
    
    // 5.4 Verificar si hay cards/grids (SuppliersList, WorksList) - para minRows=0, aceptar si existen
    const gridSelectors = [
      'div.grid.grid-cols-1',
      'div.grid[class*="grid-cols"]',
      'div[class*="grid"]',
    ];
    
    for (const selector of gridSelectors) {
      const grid = page.locator(selector).first();
      const hasGrid = await grid.isVisible({ timeout: 2000 }).catch(() => false);
      if (hasGrid) {
        console.log(`[WAIT] ✅ Grid encontrado (minRows=0, puede estar vacío)`);
        return;
      }
    }
    
    // 5.5 Si no hay tabla ni estado vacío, lanzar error con contexto
    const pageUrl = page.url();
    throw new Error(`No se encontró tabla ni estado vacío en la página. URL: ${pageUrl}. minRows=0, se esperaba tabla o estado vacío.`);
  }
  
  // 6. Si minRows > 0, buscar tabla o cards y verificar datos
  let rows = null;
  let rowCount = 0;
  let foundTable = false;
  let foundCards = false;
  
  // 6.1 Si encontramos tabla, buscar filas primero
  if (table) {
    foundTable = true;
    console.log(`[WAIT] ✅ Tabla encontrada, buscando filas...`);
    
    // Esperar un poco para que las filas se rendericen
    await page.waitForTimeout(1000);
    
    const rowSelectors = [
      'tbody tr',
      'table tbody tr',
      'div[class*="TableContainer"] tbody tr',
    ];
    
    for (const selector of rowSelectors) {
      try {
        // Buscar filas dentro de la tabla encontrada
        const locator = table.locator(selector);
        const count = await locator.count();
        if (count > 0) {
          const firstRow = locator.first();
          const isVisible = await firstRow.isVisible({ timeout: 3000 }).catch(() => false);
          if (isVisible) {
            rows = locator;
            rowCount = count;
            console.log(`[WAIT] ✅ Filas encontradas (${count}) con selector: ${selector}`);
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    // También buscar filas directamente en la página (por si la tabla está dentro de otro contenedor)
    if (!rows || rowCount === 0) {
      for (const selector of rowSelectors) {
        try {
          const locator = page.locator(selector);
          const count = await locator.count();
          if (count > 0) {
            const firstRow = locator.first();
            const isVisible = await firstRow.isVisible({ timeout: 3000 }).catch(() => false);
            if (isVisible) {
              rows = locator;
              rowCount = count;
              console.log(`[WAIT] ✅ Filas encontradas (${count}) con selector global: ${selector}`);
              break;
            }
          }
        } catch (error) {
          continue;
        }
      }
    }
  }
  
  // 6.2 Si no encontramos tabla o no hay filas, buscar cards/grids (SuppliersList, WorksList)
  if (!rows || rowCount === 0) {
    console.log(`[WAIT] ⚠️ No se encontraron filas, buscando cards/grids...`);
    
    const cardSelectors = [
      'div.grid.grid-cols-1 > div:not(:has(> div.grid))', // Cards directas en grid, no grids anidados
      'div.grid[class*="grid-cols"] > div:not(:has(> div.grid))',
      'div[class*="grid"][class*="grid-cols"] > div',
    ];
    
    for (const selector of cardSelectors) {
      try {
        const locator = page.locator(selector);
        const count = await locator.count();
        if (count > 0) {
          // Verificar que al menos una card sea visible y tenga contenido
          const firstCard = locator.first();
          const isVisible = await firstCard.isVisible({ timeout: 3000 }).catch(() => false);
          if (isVisible) {
            // Verificar que la card tiene contenido (no es solo un contenedor vacío)
            const hasContent = await firstCard.locator('text=/./').count().catch(() => 0);
            if (hasContent > 0 || count >= minRows) {
              rows = locator;
              rowCount = count;
              foundCards = true;
              console.log(`[WAIT] ✅ Cards encontradas (${count}) con selector: ${selector}`);
              break;
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  // 6.3 Si aún no hay datos, esperar un poco más y buscar de nuevo
  if (!rows || rowCount === 0) {
    console.log(`[WAIT] ⚠️ Esperando más tiempo para que aparezcan datos...`);
    await page.waitForTimeout(3000);
    
    // Buscar tabla de nuevo
    if (!foundTable) {
      for (const selector of tableSelectors) {
        try {
          const locator = page.locator(selector).first();
          const isVisible = await locator.isVisible({ timeout: 3000 }).catch(() => false);
          if (isVisible) {
            table = locator;
            foundTable = true;
            console.log(`[WAIT] ✅ Tabla encontrada (intento 2) con selector: ${selector}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    // Buscar filas si ahora tenemos tabla
    if (foundTable && (!rows || rowCount === 0)) {
      const rowSelectors = ['tbody tr', 'table tbody tr'];
      for (const selector of rowSelectors) {
        try {
          const locator = page.locator(selector);
          const count = await locator.count();
          if (count > 0) {
            const firstRow = locator.first();
            const isVisible = await firstRow.isVisible({ timeout: 3000 }).catch(() => false);
            if (isVisible) {
              rows = locator;
              rowCount = count;
              console.log(`[WAIT] ✅ Filas encontradas (${count}) después de esperar`);
              break;
            }
          }
        } catch (error) {
          continue;
        }
      }
    }
    
    // Buscar cards si aún no encontramos nada
    if (!foundCards && (!rows || rowCount === 0)) {
      const cardSelectors = [
        'div.grid > div',
        'div[class*="grid"] > div[class*="rounded"]', // Cards con bordes redondeados
      ];
      
      for (const selector of cardSelectors) {
        try {
          const locator = page.locator(selector);
          const count = await locator.count();
          if (count > 0) {
            const firstCard = locator.first();
            const isVisible = await firstCard.isVisible({ timeout: 3000 }).catch(() => false);
            if (isVisible) {
              rows = locator;
              rowCount = count;
              foundCards = true;
              console.log(`[WAIT] ✅ Cards encontradas (${count}) después de esperar`);
              break;
            }
          }
        } catch (error) {
          continue;
        }
      }
    }
  }
  
  // 6.4 Verificar errores de permisos antes de fallar
  // Nota: Los errores 403 pueden ser esperados si el usuario no tiene permisos
  // En ese caso, el test debería verificar permisos antes de intentar listar datos
  if (!rows || rowCount === 0) {
    const errorSelectors = [
      'text=/sin permisos|forbidden|403|insufficient permissions|permission denied/i',
      'div.bg-red-50:has-text(/sin permisos|forbidden|403/i)',
    ];
    
    for (const selector of errorSelectors) {
      const errorElement = page.locator(selector).first();
      const hasError = await errorElement.isVisible({ timeout: 2000 }).catch(() => false);
      if (hasError) {
        const text = await errorElement.textContent().catch(() => '');
        if (text && /sin permisos|forbidden|403|insufficient permissions|permission denied/i.test(text)) {
          // Si minRows es 0, un error 403 puede ser esperado (usuario no tiene permisos para ver la lista)
          if (minRows === 0) {
            console.log(`[WAIT] ⚠️ Error de permisos detectado pero minRows=0, puede ser esperado: ${text}`);
            // Continuar y lanzar el error de "no se encontraron datos" que es más descriptivo
          } else {
            throw new Error(`Error de permisos detectado: ${text}. Esto puede ser esperado si el usuario no tiene permisos para ver esta lista.`);
          }
        }
      }
    }
    
    throw new Error(`No se encontraron filas ni cards después de esperar. URL: ${page.url()}. Se esperaban al menos ${minRows} elemento(s). ` +
      `Esto puede deberse a: 1) El usuario no tiene permisos para ver esta lista, 2) No hay datos en la base de datos, 3) Los datos no se crearon correctamente.`);
  }
  
  // 6.5 Verificar que hay al menos minRows elementos
  console.log(`[WAIT] ✅ ${foundTable ? 'Tabla' : 'Cards'} cargadas con ${rowCount} elemento(s) (mínimo requerido: ${minRows})`);
  if (rowCount < minRows) {
    throw new Error(`La ${foundTable ? 'tabla' : 'lista de cards'} tiene ${rowCount} elemento(s) pero se requieren al menos ${minRows}`);
  }
}

/**
 * Espera a que un modal/dialog aparezca
 */
export async function waitForModal(page: Page): Promise<void> {
  const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]').first();
  await expect(modal).toBeVisible({ timeout: 5000 });
}

/**
 * Espera a que un modal/dialog se cierre
 */
export async function waitForModalClose(page: Page): Promise<void> {
  const modal = page.locator('[role="dialog"], .modal, [data-testid="modal"]').first();
  await expect(modal).not.toBeVisible({ timeout: 5000 });
}

/**
 * Espera a que un loading spinner desaparezca
 */
export async function waitForLoadingComplete(page: Page): Promise<void> {
  // Esperar a que no haya spinners visibles
  const spinner = page.locator('[data-testid="loading"], .spinner, .loading').first();
  await expect(spinner).not.toBeVisible({ timeout: 10000 });
  
  // También esperar a que la red esté inactiva
  await page.waitForLoadState('networkidle');
}

/**
 * Espera a que un elemento aparezca y sea clickeable
 */
export async function waitForClickable(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector).first();
  await expect(element).toBeVisible();
  await expect(element).toBeEnabled();
}

/**
 * Espera a que un toast/notificación aparezca
 */
export async function waitForToast(page: Page, type: 'success' | 'error' | 'info' | 'warning' = 'success'): Promise<void> {
  // Intentar múltiples selectores para toasts
  const toastSelectors = [
    `[data-testid="toast-${type}"]`,
    `.toast-${type}`,
    `.toast`,
    `.notification`,
    `[role="alert"]`,
    `div:has-text(/éxito|success|error|fallo/i)`,
    // Selectores específicos del componente Toast
    `div.bg-green-50, div.bg-red-50, div.bg-yellow-50, div.bg-blue-50`,
    `div:has(> svg):has-text(/éxito|success|error|fallo/i)`,
  ];
  
  let toast = null;
  for (const selector of toastSelectors) {
    try {
      const locator = page.locator(selector).first();
      const isVisible = await locator.isVisible({ timeout: 2000 }).catch(() => false);
      if (isVisible) {
        // Verificar que el toast es del tipo correcto si es posible
        const text = (await locator.textContent().catch(() => '')) || '';
        if (type === 'success' && !text.match(/éxito|success|guardado|creado|actualizado/i)) {
          continue;
        }
        if (type === 'error' && !text.match(/error|fallo|incorrecto/i)) {
          continue;
        }
        toast = locator;
        console.log(`[WAIT] ✅ Toast encontrado con selector: ${selector}`);
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (!toast) {
    // Fallback: buscar cualquier toast visible
    toast = page.locator(`.toast, .notification, [role="alert"]`).first();
  }
  
  await expect(toast).toBeVisible({ timeout: 10000 });
  
  // Verificar que el toast contiene el tipo correcto si es posible
  if (type === 'success') {
    const text = (await toast.textContent().catch(() => '')) || '';
    if (!text.match(/éxito|success|guardado|creado|actualizado/i)) {
      console.warn(`[WAIT] ⚠️ Toast encontrado pero no parece ser de tipo success. Texto: ${text}`);
    }
  } else if (type === 'error') {
    const text = (await toast.textContent().catch(() => '')) || '';
    if (!text.match(/error|fallo|incorrecto/i)) {
      console.warn(`[WAIT] ⚠️ Toast encontrado pero no parece ser de tipo error. Texto: ${text}`);
    }
  }
}
