#!/usr/bin/env node

/**
 * Script para redeploy automático en Vercel usando la API REST
 * 
 * Uso:
 *   VERCEL_API_TOKEN=tu_token node vercel-redeploy.js
 *   o
 *   npm run redeploy
 */

const VERCEL_API_URL = "https://api.vercel.com/v13/deployments";
const GITHUB_REPO = "Augusto-pmd/pmd-frontend";
const PROJECT_NAME = "pmd-frontend";

// Verificar que existe el token
const token = process.env.VERCEL_API_TOKEN;

if (!token) {
  console.error("❌ Error: VERCEL_API_TOKEN no está definido");
  console.error("   Por favor, configura la variable de entorno:");
  console.error("   export VERCEL_API_TOKEN=tu_token");
  console.error("   o agrégalo a tu archivo .env.local");
  process.exit(1);
}

// Función para hacer sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Función para obtener el estado del deployment
async function getDeploymentStatus(deploymentId) {
  try {
    const response = await fetch(`${VERCEL_API_URL}/${deploymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener el estado del deployment:", error.message);
    return null;
  }
}

// Función principal
async function redeploy() {
  console.log("🚀 Iniciando redeploy en Vercel...\n");

  try {
    // Crear el deployment
    const response = await fetch(VERCEL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: PROJECT_NAME,
        gitSource: {
          type: "github",
          repo: GITHUB_REPO,
          ref: "main",
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Error al crear deployment: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`
      );
    }

    const deployment = await response.json();
    const deploymentId = deployment.id || deployment.uid;

    if (!deploymentId) {
      throw new Error("No se recibió el ID del deployment");
    }

    console.log("✅ Redeploy iniciado…");
    console.log(`📦 Deployment ID: ${deploymentId}\n`);
    console.log("⏳ Monitoreando estado del deployment...\n");

    // Monitorear el estado del deployment
    let status = "BUILDING";
    let lastStatus = "";
    let attempts = 0;
    const maxAttempts = 300; // Máximo 10 minutos (300 * 2 segundos)

    while (status !== "READY" && status !== "ERROR" && attempts < maxAttempts) {
      const deploymentData = await getDeploymentStatus(deploymentId);

      if (deploymentData) {
        status = deploymentData.readyState || deploymentData.state || status;
        const currentStatus = deploymentData.readyState || deploymentData.state || "UNKNOWN";

        if (currentStatus !== lastStatus) {
          console.log(`📊 Estado: ${currentStatus}`);
          lastStatus = currentStatus;

          if (deploymentData.url) {
            console.log(`🔗 URL: ${deploymentData.url}`);
          }
        }

        if (status === "READY") {
          console.log("\n✅ Deployment completado exitosamente!");
          if (deploymentData.url) {
            console.log(`🌐 URL del deployment: ${deploymentData.url}`);
          }
          process.exit(0);
        }

        if (status === "ERROR") {
          console.log("\n❌ Deployment falló");
          if (deploymentData.error) {
            console.log(`Error: ${JSON.stringify(deploymentData.error, null, 2)}`);
          }
          process.exit(1);
        }
      }

      await sleep(2000); // Esperar 2 segundos
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.log("\n⏱️  Tiempo de espera agotado. El deployment puede estar aún en proceso.");
      console.log(`🔗 Verifica el estado en: https://vercel.com/dashboard`);
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Error durante el redeploy:", error.message);
    process.exit(1);
  }
}

// Ejecutar
redeploy();

