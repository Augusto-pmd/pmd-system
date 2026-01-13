# Guía de Despliegue a Producción

## ✅ Respuesta Corta: **SÍ, los errores se resolverían**, pero necesitas estos ajustes:

---

## 🔧 Cambios Necesarios para Producción

### 1. **Backend - Variables de Entorno**

Crea un archivo `.env` en el backend con:

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://app.tudominio.com,https://www.tudominio.com
COOKIE_DOMAIN=.tudominio.com  # Solo si usas subdominios
JWT_SECRET=tu-secret-super-seguro
```

### 2. **Frontend - Variables de Entorno**

En tu plataforma de hosting (Vercel, Netlify, etc.), configura:

```
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api
```

### 3. **Configuración de Cookies**

Las cookies ya están configuradas para:
- ✅ `secure: true` en producción (requiere HTTPS)
- ✅ `httpOnly: true` (seguridad)
- ✅ `sameSite: 'none'` en producción (permite cross-site si es necesario)

---

## 🎯 Escenarios de Despliegue

### **Opción 1: Mismo Dominio** (MÁS FÁCIL)
```
Frontend: https://tudominio.com
Backend:  https://tudominio.com/api
```
✅ **Ventajas**: Cookies funcionan perfectamente, sin problemas de CORS
✅ **Configuración**: Solo necesitas un reverse proxy (nginx)

### **Opción 2: Subdominios** (RECOMENDADO)
```
Frontend: https://app.tudominio.com
Backend:  https://api.tudominio.com
```
✅ **Ventajas**: Separación clara, escalable
✅ **Configuración**: 
- CORS: `CORS_ORIGIN=https://app.tudominio.com`
- Cookie Domain: `.tudominio.com` (opcional, para compartir cookies)

### **Opción 3: Dominios Diferentes**
```
Frontend: https://app.com
Backend:  https://api.com
```
⚠️ **Requiere**: `sameSite: 'none'` y `secure: true` (ya configurado)
✅ **Funciona**: Pero necesita configuración cuidadosa de CORS

---

## 🚀 Pasos para Desplegar

### Backend (NestJS)

1. **Build para producción:**
   ```bash
   npm run build
   ```

2. **Configurar variables de entorno** en tu servidor

3. **Iniciar:**
   ```bash
   npm run start:prod
   ```

### Frontend (Next.js)

1. **Build:**
   ```bash
   npm run build
   ```

2. **Configurar `NEXT_PUBLIC_API_URL`** en tu plataforma

3. **Deploy** (Vercel/Netlify/etc.)

---

## ✅ Problemas que se RESUELVEN en Producción

1. **Cookies HTTP-only**: ✅ Ya configurado
2. **HTTPS**: ✅ Cookies funcionan con `secure: true`
3. **CORS**: ✅ Configurado dinámicamente según entorno
4. **Variables de entorno**: ✅ Se configuran en el servidor
5. **Mismo dominio/subdominio**: ✅ Cookies funcionan perfectamente

---

## ⚠️ Lo que DEBES verificar

1. ✅ **HTTPS activado** (requerido para cookies `secure`)
2. ✅ **CORS configurado** con el dominio correcto del frontend
3. ✅ **Variables de entorno** configuradas en producción
4. ✅ **Puertos/firewall** abiertos correctamente

---

## 🧪 Testing en Producción

Después del deploy, verifica:

1. **Login funciona**: `POST https://api.tudominio.com/api/auth/login`
2. **Cookie se establece**: Verifica en DevTools → Application → Cookies
3. **Dashboard accesible**: Debe funcionar sin redirecciones infinitas
4. **CORS funciona**: No debe haber errores de CORS en la consola

---

## 📝 Resumen

**SÍ, los errores se resolverían en producción** porque:
- ✅ HTTPS resuelve problemas de cookies
- ✅ Mismo dominio/subdominio facilita las cookies
- ✅ Variables de entorno se configuran correctamente
- ✅ CORS se configura dinámicamente

**Solo necesitas**:
- Configurar `CORS_ORIGIN` en el backend
- Configurar `NEXT_PUBLIC_API_URL` en el frontend
- Asegurar que ambos usen HTTPS


