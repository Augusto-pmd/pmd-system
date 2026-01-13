#!/usr/bin/env node

/**
 * Script para automatizar el redeploy del backend PMD en Render
 * 
 * Uso:
 *   RENDER_API_KEY=tu_api_key node deploy-render.js
 *   O configurar la variable de entorno en el sistema
 */

const https = require('https');

// Configuración
const RENDER_API_KEY = process.env.RENDER_API_KEY || '';
const SERVICE_ID = 'pmd-backend-l47d'; // ID del servicio en Render
const RENDER_API_BASE = 'api.render.com';

if (!RENDER_API_KEY) {
  console.error('❌ Error: RENDER_API_KEY no está configurada');
  console.error('');
  console.error('Configura la API key de una de estas formas:');
  console.error('  1. Variable de entorno: $env:RENDER_API_KEY="tu_key" (PowerShell)');
  console.error('  2. Variable de entorno: export RENDER_API_KEY="tu_key" (Bash)');
  console.error('  3. O edita este script y agrega: const RENDER_API_KEY = "tu_key";');
  console.error('');
  console.error('Para obtener tu API key:');
  console.error('  1. Ve a https://dashboard.render.com');
  console.error('  2. Account Settings > API Keys');
  console.error('  3. Crea una nueva API key o usa una existente');
  process.exit(1);
}

/**
 * Realiza una petición HTTPS a la API de Render
 */
function renderApiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: RENDER_API_BASE,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${JSON.stringify(parsed, null, 2)}`));
          }
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

/**
 * Obtiene el estado de un deploy
 */
async function getDeployStatus(deployId) {
  try {
    const response = await renderApiRequest(
      'GET',
      `/v1/deploys/${deployId}`
    );
    return response;
  } catch (error) {
    throw new Error(`Error obteniendo estado del deploy: ${error.message}`);
  }
}

/**
 * Inicia un nuevo deploy con limpieza de cache
 */
async function triggerDeploy() {
  console.log('🚀 Iniciando deploy en Render...');
  console.log(`   Servicio: ${SERVICE_ID}`);
  console.log(`   Clear cache: true`);
  console.log('');

  try {
    const response = await renderApiRequest(
      'POST',
      `/v1/services/${SERVICE_ID}/deploys`,
      {
        clearCache: true
      }
    );

    return response;
  } catch (error) {
    throw new Error(`Error iniciando deploy: ${error.message}`);
  }
}

/**
 * Monitorea el estado del deploy hasta que termine
 */
async function monitorDeploy(deployId) {
  console.log(`📊 Monitoreando deploy: ${deployId}`);
  console.log('');

  const maxAttempts = 60; // 5 minutos máximo (5s * 60)
  let attempts = 0;
  let lastStatus = '';

  while (attempts < maxAttempts) {
    try {
      const deploy = await getDeployStatus(deployId);
      const status = deploy.deploy?.status || deploy.status || 'unknown';
      const finished = deploy.deploy?.finishedAt || deploy.finishedAt;

      // Solo mostrar si cambió el estado
      if (status !== lastStatus) {
        const statusEmoji = {
          'created': '🆕',
          'build_in_progress': '🔨',
          'update_in_progress': '⚙️',
          'live': '✅',
          'deactivated': '⏸️',
          'build_failed': '❌',
          'update_failed': '❌',
          'canceled': '🚫',
        };

        const emoji = statusEmoji[status] || '⏳';
        console.log(`${emoji} Estado: ${status}`);

        if (deploy.deploy?.commit?.message || deploy.commit?.message) {
          const commitMsg = deploy.deploy?.commit?.message || deploy.commit?.message;
          console.log(`   Commit: ${commitMsg.substring(0, 60)}...`);
        }

        lastStatus = status;
      }

      // Si terminó (exitoso o fallido)
      if (finished || status === 'live' || status === 'build_failed' || status === 'update_failed' || status === 'canceled') {
        console.log('');
        if (status === 'live') {
          console.log('✅ Deploy completado exitosamente!');
          console.log(`   URL: https://pmd-backend-l47d.onrender.com`);
        } else if (status === 'build_failed' || status === 'update_failed') {
          console.log('❌ Deploy falló');
          console.log('   Revisa los logs en Render Dashboard para más detalles');
        } else if (status === 'canceled') {
          console.log('🚫 Deploy cancelado');
        }
        return status;
      }

      // Esperar 5 segundos antes del siguiente check
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;

    } catch (error) {
      console.error(`⚠️  Error obteniendo estado: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
  }

  console.log('');
  console.log('⏱️  Tiempo máximo de espera alcanzado');
  console.log('   El deploy puede estar aún en progreso. Revisa el dashboard de Render.');
  return 'timeout';
}

/**
 * Función principal
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  PMD Backend - Render Deploy Automation');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  try {
    // 1. Iniciar deploy
    const deployResponse = await triggerDeploy();
    const deployId = deployResponse.deploy?.id || deployResponse.id;

    if (!deployId) {
      throw new Error('No se recibió un ID de deploy válido');
    }

    console.log(`✅ Deploy iniciado`);
    console.log(`   Deploy ID: ${deployId}`);
    console.log('');

    // 2. Monitorear progreso
    const finalStatus = await monitorDeploy(deployId);

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Estado final: ${finalStatus}`);
    console.log('═══════════════════════════════════════════════════════');

    // Exit code basado en el resultado
    if (finalStatus === 'live') {
      process.exit(0);
    } else {
      process.exit(1);
    }

  } catch (error) {
    console.error('');
    console.error('❌ Error fatal:');
    console.error(`   ${error.message}`);
    console.error('');
    process.exit(1);
  }
}

// Ejecutar
main();

