# API URL UPDATE - COMPLETE DIFF SUMMARY

## Goal
Update the PMD frontend so ALL API requests use the correct backend URL: `https://pmd-backend-8d4a.onrender.com`

---

## PHASE 1 — Update lib/api.ts Base URL Configuration

### File: `lib/api.ts`

**Changes:**
1. **Updated fallback URL** - Changed from `https://pmd-backend-8d4a.onrender.com/api` to `https://pmd-backend-8d4a.onrender.com` (without `/api`)
2. **Updated example URL in error message** - Changed to match new format
3. **Maintained automatic `/api` addition** - The `getApiUrl()` function still adds `/api` automatically if not present
4. **Axios instance uses getApiUrl()** - Ensures consistent URL construction

**Before:**
```typescript
// Fallback para desarrollo/producción
const fallbackUrl = "https://pmd-backend-8d4a.onrender.com/api";
// ...
console.error("❌ [getApiUrl] Ejemplo: NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com/api");

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://pmd-backend-8d4a.onrender.com",
  // ...
});
```

**After:**
```typescript
// Fallback para desarrollo/producción
const fallbackUrl = "https://pmd-backend-8d4a.onrender.com";
// ... (getApiUrl() adds /api automatically)
console.error("❌ [getApiUrl] Ejemplo: NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com");

const api: AxiosInstance = axios.create({
  baseURL: baseURL, // Usa getApiUrl() que incluye /api automáticamente
  // ...
});
```

**Key Improvements:**
- ✅ Base URL is `https://pmd-backend-8d4a.onrender.com` (without `/api`)
- ✅ `/api` is added automatically by `getApiUrl()` function
- ✅ Environment variable format: `NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com`
- ✅ All API requests use the correct backend URL
- ✅ Backward compatible with existing endpoint calls

---

## PHASE 2 — Update Test Script

### File: `tests/test-login.js`

**Changes:**
1. **Updated fallback URL** - Changed from old URL to new URL
2. **Updated URL construction** - Now correctly adds `/api` prefix

**Before:**
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pmd-backend-l47d.onrender.com/api';
// ...
const loginUrl = `${API_URL.replace(/\/$/, '')}/auth/login`;
```

**After:**
```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pmd-backend-8d4a.onrender.com';
// ...
const baseUrl = API_URL.replace(/\/$/, '');
const loginUrl = `${baseUrl}/api/auth/login`;
```

**Key Improvements:**
- ✅ Uses correct backend URL
- ✅ Properly constructs URL with `/api` prefix
- ✅ Uses environment variable with fallback

---

## PHASE 3 — Update Next.js Config

### File: `next.config.js`

**Changes:**
1. **Updated example URL** - Changed to match new format (without `/api`)

**Before:**
```javascript
console.error("❌ [BUILD] Ejemplo: NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com/api");
```

**After:**
```javascript
console.error("❌ [BUILD] Ejemplo: NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com");
```

**Key Improvements:**
- ✅ Example matches new URL format
- ✅ Consistent with environment variable usage

---

## Summary of All Changes

### Files Modified:
1. ✅ `lib/api.ts` - Updated fallback URL and example message
2. ✅ `tests/test-login.js` - Updated fallback URL and URL construction
3. ✅ `next.config.js` - Updated example URL

### URL Format:
- **Environment Variable:** `NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com` (without `/api`)
- **Base URL Used:** `https://pmd-backend-8d4a.onrender.com` (without `/api`)
- **Final API URL:** `https://pmd-backend-8d4a.onrender.com/api` (with `/api` added automatically)

### How It Works:
1. `getApiUrl()` function checks `process.env.NEXT_PUBLIC_API_URL`
2. If not set, uses fallback: `https://pmd-backend-8d4a.onrender.com`
3. Automatically adds `/api` if not present: `https://pmd-backend-8d4a.onrender.com/api`
4. Axios instance uses this URL as `baseURL`
5. Endpoints are called like `api.post("/auth/login")` → Final URL: `https://pmd-backend-8d4a.onrender.com/api/auth/login`

### Key Guarantees:
- ✅ All API requests use `https://pmd-backend-8d4a.onrender.com`
- ✅ No hardcoded URLs in production code (only fallback)
- ✅ Environment variable support maintained
- ✅ Automatic `/api` prefix handling
- ✅ Backward compatible with existing endpoint calls

---

## Build Status
✅ **No linter errors found** in modified files:
- `lib/api.ts`
- `tests/test-login.js`
- `next.config.js`

---

## Environment Variable Configuration

### For Development (.env.local):
```bash
NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com
```

### For Production (Vercel/Render):
Set environment variable:
```
NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com
```

**Note:** Do NOT include `/api` in the environment variable. The code adds it automatically.

---

## Testing Checklist:
- [ ] Verify API requests go to `https://pmd-backend-8d4a.onrender.com/api/*`
- [ ] Test login endpoint: `POST /api/auth/login`
- [ ] Test refresh endpoint: `POST /api/auth/refresh`
- [ ] Test loadMe endpoint: `GET /api/users/me`
- [ ] Verify environment variable override works
- [ ] Verify fallback URL works when env var is not set
- [ ] Check browser network tab for correct URLs

---

## Migration Notes

### Before:
- Environment variable: `NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com/api`
- Hardcoded fallback: `https://pmd-backend-8d4a.onrender.com/api`

### After:
- Environment variable: `NEXT_PUBLIC_API_URL=https://pmd-backend-8d4a.onrender.com` (without `/api`)
- Hardcoded fallback: `https://pmd-backend-8d4a.onrender.com` (without `/api`)
- Code automatically adds `/api` prefix

**Action Required:** Update environment variables in:
- `.env.local` (development)
- Vercel dashboard (production)
- Render dashboard (if applicable)

---

**Date:** 2025-12-12
**Status:** ✅ COMPLETE - All API URLs updated to use correct backend

