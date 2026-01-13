// Script para capturar el error React #31
// Este script debe ejecutarse en la consola del navegador en http://localhost:3007/login

console.log("=== INICIANDO TEST DE CAPTURA DE ERROR REACT #31 ===\n");

// Paso 1: Simular login
console.log("1. Simulando login...");
fetch("http://localhost:3007/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@pmd.com",
    password: "Pmd2024DB"
  })
})
.then(r => r.json())
.then(data => {
  console.log("Login response:", data);
  
  // Paso 2: Simular seteo del usuario en el store con role como objeto
  console.log("\n2. Simulando seteo del usuario en localStorage con role como objeto...");
  window.localStorage.setItem("pmd-auth-storage", JSON.stringify({
    state: {
      user: { id: "123", fullName: "Test User", role: { id: "999", name: "administration" } },
      token: "foo",
      isAuthenticated: true
    }
  }));
  console.log("localStorage actualizado con role como objeto");
  
  // Paso 3: Configurar captura de errores antes del reload
  console.log("\n3. Configurando captura de errores...");
  window.addEventListener('error', (event) => {
    console.error("\n=== ERROR CAPTURADO ===");
    console.error("Mensaje:", event.message);
    console.error("Archivo:", event.filename);
    console.error("Línea:", event.lineno);
    console.error("Columna:", event.colno);
    console.error("Stack:", event.error?.stack);
    console.error("Error completo:", event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error("\n=== PROMISE REJECTION CAPTURADO ===");
    console.error("Razón:", event.reason);
    console.error("Stack:", event.reason?.stack);
  });
  
  // Interceptar console.error para capturar errores de React
  const originalConsoleError = console.error;
  console.error = function(...args) {
    if (args.some(arg => typeof arg === 'string' && arg.includes('object with keys'))) {
      console.log("\n=== ERROR REACT #31 DETECTADO EN CONSOLE.ERROR ===");
      console.error(...args);
    }
    originalConsoleError.apply(console, args);
  };
  
  // Paso 4: Simular rehidratación
  console.log("\n4. Recargando página para simular rehidratación...");
  console.log("(El error debería aparecer ahora)");
  setTimeout(() => {
    location.reload();
  }, 1000);
});

