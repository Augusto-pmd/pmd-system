// === SCRIPT COMPLETO PARA CAPTURAR ERROR REACT #31 ===
// Copiar y pegar TODO este script en la consola del navegador en http://localhost:3007/login

(function() {
  console.log("=== INICIANDO TEST DE CAPTURA DE ERROR REACT #31 ===\n");

  // ============================================
  // CONFIGURAR CAPTURA DE ERRORES PRIMERO
  // ============================================
  
  const capturedErrors = [];
  
  // Capturar errores de window
  window.addEventListener('error', (event) => {
    const errorInfo = {
      type: 'window.error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      error: event.error,
      timestamp: new Date().toISOString()
    };
    capturedErrors.push(errorInfo);
    
    console.error("\n=== ERROR CAPTURADO (window.error) ===");
    console.error("Tipo:", errorInfo.type);
    console.error("Mensaje:", errorInfo.message);
    console.error("Archivo:", errorInfo.filename);
    console.error("Línea:", errorInfo.lineno);
    console.error("Columna:", errorInfo.colno);
    console.error("Stack completo:", errorInfo.stack);
    console.error("Error objeto:", errorInfo.error);
    console.error("Timestamp:", errorInfo.timestamp);
  });

  // Capturar promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorInfo = {
      type: 'unhandledrejection',
      reason: event.reason,
      stack: event.reason?.stack,
      timestamp: new Date().toISOString()
    };
    capturedErrors.push(errorInfo);
    
    console.error("\n=== PROMISE REJECTION CAPTURADO ===");
    console.error("Razón:", errorInfo.reason);
    console.error("Stack:", errorInfo.stack);
    console.error("Timestamp:", errorInfo.timestamp);
  });

  // Interceptar console.error para capturar errores de React
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const errorString = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    if (errorString.includes('object with keys') || 
        errorString.includes('React error #31') ||
        errorString.includes('Objects are not valid as a React child')) {
      const errorInfo = {
        type: 'console.error (React)',
        args: args,
        stringified: errorString,
        stack: new Error().stack,
        timestamp: new Date().toISOString()
      };
      capturedErrors.push(errorInfo);
      
      console.log("\n=== ERROR REACT #31 DETECTADO EN CONSOLE.ERROR ===");
      console.error("Argumentos completos:", args);
      console.error("String completo:", errorString);
      console.error("Stack trace:");
      console.trace();
    }
    originalConsoleError.apply(console, args);
  };

  // ============================================
  // PASO 1: SIMULAR LOGIN
  // ============================================
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
    console.log("✓ Login response recibida:", data);
    
    // ============================================
    // PASO 2: SIMULAR SETEO DEL USUARIO CON ROLE COMO OBJETO
    // ============================================
    console.log("\n2. Simulando seteo del usuario en localStorage con role como objeto...");
    const corruptedUser = {
      state: {
        user: { 
          id: "123", 
          fullName: "Test User", 
          role: { id: "999", name: "administration" }  // ← ROLE COMO OBJETO (esto causa el error)
        },
        token: "foo",
        refreshToken: "bar",
        isAuthenticated: true
      }
    };
    
    window.localStorage.setItem("pmd-auth-storage", JSON.stringify(corruptedUser));
    console.log("✓ localStorage actualizado con role como objeto");
    console.log("Valor guardado:", JSON.parse(localStorage.getItem("pmd-auth-storage")));
    
    // ============================================
    // PASO 3: SIMULAR REHIDRATACIÓN
    // ============================================
    console.log("\n3. Preparando recarga para simular rehidratación...");
    console.log("   (El error React #31 debería aparecer cuando React intente renderizar)");
    console.log("   Esperando 2 segundos antes de recargar...\n");
    
    setTimeout(() => {
      console.log(">>> RECARGANDO PÁGINA AHORA <<<");
      console.log(">>> Los errores capturados estarán en el array: window.capturedReactErrors <<<");
      window.capturedReactErrors = capturedErrors;
      location.reload();
    }, 2000);
  })
  .catch(err => {
    console.error("✗ Error en login:", err);
    console.error("Stack:", err.stack);
  });
})();

