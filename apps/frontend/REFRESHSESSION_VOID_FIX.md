# refreshSession() Void Return Type Fix - DIFF Summary

## Problem
TypeScript error: "An expression of type 'void' cannot be tested for truthiness" in `lib/api.ts` around line 104.

The code was checking `if (refreshResult)` where `refreshResult` was the return value of `refreshSession()`, which is declared to return `Promise<void>`. However, the implementation was returning values (`null`, user objects), creating a type mismatch.

## Solution
1. **Fixed `lib/api.ts`**: Removed the truthiness check on `refreshSession()` return value. Now it just awaits the function and handles success/failure via try/catch.
2. **Fixed `store/authStore.ts`**: Updated `refreshSession()` implementation to truly return `void` by:
   - Throwing errors instead of returning `null`
   - Removing all return statements
   - Re-throwing errors in catch block for proper error handling

## Changes Made

### File: `lib/api.ts`

**Before (lines 102-119):**
```typescript
try {
  const refreshResult = await useAuthStore.getState().refreshSession();
  if (refreshResult) {
    // Refresh exitoso, reintentar request original
    const newToken = useAuthStore.getState().token;
    if (newToken && originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
    }
    return api(originalRequest);
  } else {
    // Refresh falló, hacer logout
    useAuthStore.getState().logout();
    return Promise.reject(error);
  }
} catch (refreshError) {
  useAuthStore.getState().logout();
  return Promise.reject(refreshError);
}
```

**After (lines 102-115):**
```typescript
try {
  await useAuthStore.getState().refreshSession();
  
  // Después del refresh, reintentar el request original
  const newToken = useAuthStore.getState().token;
  if (newToken && originalRequest.headers) {
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
  }
  return api(originalRequest);
} catch (refreshError) {
  // Refresh falló, hacer logout
  useAuthStore.getState().logout();
  return Promise.reject(refreshError);
}
```

**Key Changes:**
- ✅ Removed `refreshResult` variable
- ✅ Removed `if (refreshResult)` truthiness check
- ✅ Simplified logic: if `refreshSession()` completes without throwing, retry the request
- ✅ If `refreshSession()` throws, catch block handles logout and error rejection

### File: `store/authStore.ts`

**Before (refreshSession implementation):**
```typescript
if (!response.ok) {
  return null; // Refresh falló
}

// ... later in code ...

if (!access_token) {
  return null; // No access token en respuesta
}

// ... later in code ...

return normalizedUser; // or return currentUser;

} catch (error: unknown) {
  if (typeof window === "undefined") {
    return null;
  }
  return null; // Refresh falló
}
```

**After (refreshSession implementation):**
```typescript
if (!response.ok) {
  throw new Error("Refresh token failed"); // Refresh falló
}

// ... later in code ...

if (!access_token) {
  throw new Error("No access token in refresh response"); // No access token en respuesta
}

// ... later in code ...

// No return - function is void
// (user is updated via set() call)

} catch (error: unknown) {
  // Re-throw error to be handled by caller
  throw error;
}
```

**Key Changes:**
- ✅ Changed `return null` to `throw new Error(...)` for error cases
- ✅ Removed all return statements that returned values
- ✅ Changed catch block to re-throw errors instead of returning `null`
- ✅ Function now truly returns `Promise<void>` as declared in the interface

## Verification

### Type Safety:
- ✅ `refreshSession()` now correctly returns `Promise<void>` (matches interface declaration)
- ✅ No truthiness checks on `void` return values
- ✅ Error handling via try/catch instead of return value checks

### Linter Status:
- ✅ No linter errors found in `lib/api.ts`
- ✅ No linter errors found in `store/authStore.ts`

### Usage Verification:
- ✅ `lib/api.ts` line 103: Correctly awaits `refreshSession()` without checking return value
- ✅ `store/authStore.ts` line 128: Correctly awaits `refreshSession()` without checking return value (inside `loadMe()`)

## Impact
This fix resolves the TypeScript compilation error and ensures type safety. The code now correctly handles `refreshSession()` as a `void` function that either succeeds (completes without throwing) or fails (throws an error), which is properly handled by try/catch blocks.

## Files Modified
1. `lib/api.ts` - Removed truthiness check on `refreshSession()` return value
2. `store/authStore.ts` - Updated `refreshSession()` to truly return `void` by throwing errors instead of returning values

## Error Handling Flow
1. **Success Case**: `refreshSession()` completes without throwing → retry original request with new token
2. **Failure Case**: `refreshSession()` throws error → catch block logs out user and rejects promise with error

---
**Status:** ✅ Fixed
**Date:** 2025-12-12

