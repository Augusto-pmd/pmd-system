// Cargar variables de entorno desde .env.local antes de la configuración
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production';
const isBuild = process.env.NODE_ENV === 'production' || process.argv.includes('build');

// Intentar cargar .env.local manualmente
const envLocalPath = path.join(__dirname, '.env.local');
const envFileExists = fs.existsSync(envLocalPath);

if (envFileExists) {
  try {
    const envFile = fs.readFileSync(envLocalPath, 'utf8');
    let loadedVars = [];
    
    envFile.split(/\r?\n/).forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const match = trimmedLine.match(/^([^=:#\s]+)\s*=\s*(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim().replace(/^["']|["']$/g, '');
          if (value && !process.env[key]) {
            process.env[key] = value;
            loadedVars.push(key);
          }
        }
      }
    });
    
    if (loadedVars.length > 0) {
      console.log(`✅ [CONFIG] Variables cargadas desde .env.local: ${loadedVars.join(', ')}`);
    }
  } catch (error) {
    console.warn('⚠️ [CONFIG] Error al leer .env.local:', error.message);
  }
} else {
  // Solo mostrar warning si:
  // 1. Estamos en desarrollo (no en build/producción)
  // 2. Y las variables críticas no están configuradas
  const hasRequiredEnvVars = !!process.env.NEXT_PUBLIC_API_URL;
  if (!isBuild && !hasRequiredEnvVars) {
    console.warn('⚠️ [CONFIG] Archivo .env.local no encontrado en:', envLocalPath);
    console.log('ℹ️  [CONFIG] En producción, las variables de entorno se configuran mediante Docker ENV o build args');
  }
}

// También intentar con dotenv como respaldo (solo si el archivo existe o estamos en desarrollo)
if (envFileExists || !isBuild) {
  try {
    const dotenv = require('dotenv');
    const result = dotenv.config({ path: envLocalPath, silent: true });
    if (result && !result.error && envFileExists) {
      console.log('✅ [CONFIG] dotenv cargado correctamente');
    }
  } catch (error) {
    // dotenv puede fallar, pero ya tenemos el método manual
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Habilitar output standalone para Docker
  output: 'standalone',
  images: {
    domains: [],
  },
  webpack: (config, { isServer, dev }) => {
    // Configurar cache de webpack para evitar errores de memoria
    if (dev) {
      // En desarrollo, deshabilitar completamente el PackFileCacheStrategy
      // que causa errores de "Array buffer allocation failed"
      if (config.cache) {
        // Usar FileSystemCacheStrategy en lugar de PackFileCacheStrategy
        config.cache = {
          type: 'filesystem',
          buildDependencies: {
            config: [__filename],
          },
          cacheDirectory: path.join(__dirname, '.next/cache/webpack'),
          // Deshabilitar compresión que causa problemas de memoria
          compression: false,
        };
      }
    }
    return config;
  },
}

// Validar variables de entorno en tiempo de build
// Nota: Next.js carga automáticamente las variables de .env.local en tiempo de ejecución,
// aunque no estén disponibles aquí en next.config.js (que se ejecuta en un contexto diferente)
if (process.env.NEXT_PUBLIC_API_URL) {
  console.log("✅ [BUILD] NEXT_PUBLIC_API_URL está definida:", process.env.NEXT_PUBLIC_API_URL);
} else {
  // Solo mostrar advertencia, no error, ya que Next.js cargará las variables automáticamente
  console.log("ℹ️  [BUILD] NEXT_PUBLIC_API_URL no detectada en next.config.js (normal en desarrollo)");
  console.log("ℹ️  [BUILD] Next.js cargará automáticamente las variables desde .env.local en tiempo de ejecución");
}

module.exports = nextConfig

