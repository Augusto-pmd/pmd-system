#!/usr/bin/env node

/**
 * Script de prueba para verificar que el endpoint de login funciona correctamente
 * 
 * Uso:
 *   npm run test:login
 * 
 * Requisitos:
 *   - Archivo .env.local con NEXT_PUBLIC_API_URL configurado
 *   - O variable de entorno NEXT_PUBLIC_API_URL
 */

const fs = require('fs');
const path = require('path');

// Leer .env.local si existe
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    });
  }
}

// Cargar variables de entorno desde .env.local
loadEnvLocal();

// Obtener la URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pmd-backend-8d4a.onrender.com';

// Construir la URL completa del endpoint
// Nota: API_URL es la base sin /api (ej: https://pmd-backend-8d4a.onrender.com)
// El endpoint completo será: ${API_URL}/api/auth/login
const baseUrl = API_URL.replace(/\/$/, '');
const loginUrl = `${baseUrl}/api/auth/login`;

// Credenciales de prueba
const testCredentials = {
  email: "test@example.com",
  password: "password123"
};

console.log('═══════════════════════════════════════════════════════');
console.log('  PMD Frontend - Login Endpoint Test');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log(`🔗 Endpoint: ${loginUrl}`);
console.log(`📧 Email: ${testCredentials.email}`);
console.log(`🔒 Password: ${testCredentials.password.replace(/./g, '*')}`);
console.log('');

// Realizar la petición
fetch(loginUrl, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testCredentials)
})
  .then(async (response) => {
    const status = response.status;
    const statusText = response.statusText;
    
    console.log(`📊 Status: ${status} ${statusText}`);
    console.log('');

    // Intentar leer el body
    let responseData;
    try {
      const text = await response.text();
      if (text) {
        try {
          responseData = JSON.parse(text);
        } catch {
          responseData = text;
        }
      }
    } catch (err) {
      responseData = null;
    }

    // Evaluar el resultado
    if (status === 200 || status === 201) {
      console.log('✅ ÉXITO: El endpoint responde correctamente');
      console.log('');
      if (responseData) {
        console.log('📦 Respuesta:');
        if (typeof responseData === 'object') {
          console.log(JSON.stringify(responseData, null, 2));
        } else {
          console.log(responseData);
        }
      }
      console.log('');
      console.log('✅ El login funciona correctamente desde el frontend');
      process.exit(0);
    } else if (status === 401) {
      console.log('⚠️  ADVERTENCIA: Credenciales inválidas (esto es esperado con credenciales de prueba)');
      console.log('');
      if (responseData) {
        console.log('📦 Respuesta:');
        if (typeof responseData === 'object') {
          console.log(JSON.stringify(responseData, null, 2));
        } else {
          console.log(responseData);
        }
      }
      console.log('');
      console.log('✅ El endpoint está funcionando (401 es una respuesta válida para credenciales incorrectas)');
      process.exit(0);
    } else if (status === 404) {
      console.log('❌ ERROR: Endpoint no encontrado (404)');
      console.log('');
      if (responseData) {
        console.log('📦 Respuesta:');
        if (typeof responseData === 'object') {
          console.log(JSON.stringify(responseData, null, 2));
        } else {
          console.log(responseData);
        }
      }
      console.log('');
      console.log('❌ El endpoint /api/auth/login no está disponible en el backend');
      console.log('   Verifica que:');
      console.log('   1. El backend esté corriendo');
      console.log('   2. El AuthModule esté correctamente configurado');
      console.log('   3. La URL base sea correcta');
      process.exit(1);
    } else if (status >= 500) {
      console.log('❌ ERROR: Error del servidor (5xx)');
      console.log('');
      if (responseData) {
        console.log('📦 Respuesta:');
        if (typeof responseData === 'object') {
          console.log(JSON.stringify(responseData, null, 2));
        } else {
          console.log(responseData);
        }
      }
      console.log('');
      console.log('❌ El backend está devolviendo un error del servidor');
      process.exit(1);
    } else {
      console.log(`⚠️  RESPUESTA INESPERADA: ${status}`);
      console.log('');
      if (responseData) {
        console.log('📦 Respuesta:');
        if (typeof responseData === 'object') {
          console.log(JSON.stringify(responseData, null, 2));
        } else {
          console.log(responseData);
        }
      }
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ ERROR: No se pudo conectar al endpoint');
    console.error('');
    console.error('Detalles del error:');
    console.error(`   ${error.message}`);
    console.error('');
    console.error('Posibles causas:');
    console.error('   1. El backend no está corriendo');
    console.error('   2. La URL es incorrecta');
    console.error('   3. Problemas de red o CORS');
    console.error('   4. El endpoint no existe');
    console.error('');
    console.error(`   URL intentada: ${loginUrl}`);
    process.exit(1);
  });

