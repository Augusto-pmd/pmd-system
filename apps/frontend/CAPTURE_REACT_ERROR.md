# Script para Capturar Error React #31

## Instrucciones

1. **Abrir el navegador** en: http://localhost:3007/login
2. **Abrir la consola del navegador** (F12 → Console)
3. **Copiar y pegar** el siguiente script completo:

```javascript
// === SCRIPT DE CAPTURA DE ERROR REACT #31 ===

console.log("=== INICIANDO TEST DE CAPTURA DE ERROR REACT #31 ===\n");

// Configurar captura de errores ANTES de cualquier acción
window.addEventListener('error', (event) => {
  console.error("\n=== ERROR CAPTURADO (window.error) ===");
  console.error("Mensaje:", event.message);
  console.error("Archivo:", event.filename);
  console.error("Línea:", event.lineno);
  console.error("Columna:", event.colno);
  console.error("Stack:", event.error?.stack);
  console.error("Error completo:", event.error);
  console.error("Evento completo:", event);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("\n=== PROMISE REJECTION CAPTURADO ===");
  console.error("Razón:", event.reason);
  console.error("Stack:", event.reason?.stack);
});

// Interceptar console.error para capturar errores de React
const originalConsoleError = console.error;
console.error = function(...args) {
  const errorString = args.map(arg => String(arg)).join(' ');
  if (errorString.includes('object with keys') || errorString.includes('React error #31')) {
    console.log("\n=== ERROR REACT #31 DETECTADO EN CONSOLE.ERROR ===");
    console.error("Argumentos completos:", args);
    console.error("Stack trace completo:");
    console.trace();
  }
  originalConsoleError.apply(console, args);
};

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
  console.log("localStorage actualizado con role como objeto:", JSON.parse(localStorage.getItem("pmd-auth-storage")));
  
  // Paso 3: Simular rehidratación
  console.log("\n3. Recargando página para simular rehidratación...");
  console.log("(El error React #31 debería aparecer ahora cuando React intente renderizar)");
  setTimeout(() => {
    location.reload();
  }, 1000);
})
.catch(err => {
  console.error("Error en login:", err);
});
```

## Qué capturar

Cuando aparezca el error, copiar y mostrar:

1. **Mensaje completo del error**
2. **Stack trace completo** (incluyendo archivos y líneas)
3. **Componente que falla** (si está en el stack)
4. **Valor del objeto {id, name}** que causa el problema
5. **Archivo y línea exacta** donde falla

## Nota

Este script:
- Configura listeners de errores ANTES de hacer cualquier acción
- Intercepta console.error para capturar errores de React
- Simula el escenario exacto que causa el error #31
- Recarga la página para forzar la rehidratación del store

