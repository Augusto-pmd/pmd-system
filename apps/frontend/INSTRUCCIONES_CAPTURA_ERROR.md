# Instrucciones para Capturar Error React #31

## Estado del Servidor
✅ **Servidor corriendo en:** http://localhost:3007
✅ **Puerto verificado:** 3007 está activo

## Pasos para Capturar el Error

### 1. Abrir el Navegador
Abrir manualmente: **http://localhost:3007/login**

### 2. Abrir la Consola del Navegador
- Presionar **F12** o **Ctrl+Shift+I**
- Ir a la pestaña **Console**

### 3. Ejecutar el Script de Captura

**OPCIÓN A: Copiar el script completo**
1. Abrir el archivo: `capture-error-script.js`
2. Copiar TODO el contenido
3. Pegar en la consola del navegador
4. Presionar Enter

**OPCIÓN B: Ejecutar paso a paso**

```javascript
// Paso 1: Configurar captura de errores
window.addEventListener('error', (event) => {
  console.error("=== ERROR CAPTURADO ===");
  console.error("Mensaje:", event.message);
  console.error("Archivo:", event.filename);
  console.error("Línea:", event.lineno);
  console.error("Stack:", event.error?.stack);
});

// Paso 2: Simular login
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
  
  // Paso 3: Simular seteo del usuario con role como objeto
  window.localStorage.setItem("pmd-auth-storage", JSON.stringify({
    state: {
      user: { id: "123", fullName: "Test User", role: { id: "999", name: "administration" } },
      token: "foo",
      isAuthenticated: true
    }
  }));
  
  // Paso 4: Recargar para simular rehidratación
  setTimeout(() => location.reload(), 1000);
});
```

### 4. Observar el Error

Cuando la página se recargue, React intentará renderizar y debería aparecer el error **React error #31** con el mensaje:
```
Objects are not valid as a React child (found: object with keys {id, name})
```

### 5. Capturar la Información Completa

Cuando aparezca el error, copiar y mostrar:

1. **Mensaje completo del error**
2. **Stack trace completo** (incluyendo todos los archivos y números de línea)
3. **Componente que falla** (buscar en el stack trace)
4. **Valor del objeto {id, name}** que causa el problema
5. **Archivo y línea exacta** donde falla (ej: `Sidebar.tsx:195`)

### 6. Información Adicional a Capturar

Si el script completo se ejecutó, los errores capturados estarán en:
```javascript
window.capturedReactErrors
```

Ejecutar en consola:
```javascript
console.log(JSON.stringify(window.capturedReactErrors, null, 2));
```

## Qué Buscar en el Error

El error debería mostrar algo como:

```
Error: Objects are not valid as a React child (found: object with keys {id, name})
    at render (Sidebar.tsx:195)
    at ...
```

O en el stack trace:
```
at String (Sidebar.tsx:195:45)
at ...
```

**Archivos a revisar en el stack trace:**
- `components/layout/Sidebar.tsx`
- `components/layout/Topbar.tsx`
- `components/layout/MainLayout.tsx`
- `components/auth/ProtectedRoute.tsx`
- Cualquier componente que renderice `user.role` o `user.name`

## Nota Importante

**NO CORREGIR NADA TODAVÍA**
Solo capturar el error real y mostrar el stacktrace completo con:
- Archivo real
- Número de línea real
- Componente involucrado
- Expresión JSX que rompe
- Valor {id, name} encontrado

