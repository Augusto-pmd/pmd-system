# Zustand AuthStore Complete Rebuild - DIFF Summary

## Goal
Rebuild the entire Zustand authStore with a clean, immutable API that:
- Never hangs (login, refreshSession, loadMe)
- All functions return `Promise<AuthUser | null>`
- All `set()` calls use immutable updates
- AuthContext works 100% with the store

## Solution
Complete rewrite of `store/authStore.ts` with:
- Clean, minimal API (4 actions: login, logout, refreshSession, loadMe)
- All async functions return `Promise<AuthUser | null>`
- All state updates use immutable spread operator: `set((state) => ({ ...state, ... }))`
- No direct state mutations (except in `onRehydrateStorage` which Zustand allows)
- Helper function for user normalization
- Simplified error handling

---

## PHASE 1 — Store API Redesign

### New Store Interface

**Before:**
```typescript
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  getUserSafe: () => AuthUser | null;
  login: (userRaw: unknown, token: string, refreshToken?: string) => void;
  logout: () => void;
  loadMe: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
  syncAuth: () => Promise<void>;
  hydrateUser: () => Promise<void>;
}
```

**After:**
```typescript
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  logout: () => void;
  refreshSession: () => Promise<AuthUser | null>;
  loadMe: () => Promise<AuthUser | null>;
}
```

**Key Changes:**
- ✅ Removed `getUserSafe`, `syncAuth`, `hydrateUser` (not needed)
- ✅ Removed `refresh` (use `refreshSession` instead)
- ✅ `login` now takes `(email, password)` instead of `(userRaw, token, refreshToken)`
- ✅ All async functions return `Promise<AuthUser | null>` instead of `Promise<void>`

---

## PHASE 2 — Immutable State Updates

### All `set()` Calls Now Use Immutable Pattern

**Before (Direct Mutation):**
```typescript
set({
  user: normalizedUser,
  token: access_token,
  refreshToken: refresh_token,
  isAuthenticated: true,
});
```

**After (Immutable Spread):**
```typescript
set((state) => ({
  ...state,
  user: normalizedUser,
  token: access_token,
  refreshToken: refresh_token,
  isAuthenticated: true,
}));
```

**Key Changes:**
- ✅ All `set()` calls use function form: `set((state) => ({ ...state, ... }))`
- ✅ Always spread existing state: `...state`
- ✅ No direct mutations anywhere (except `onRehydrateStorage`)

---

## PHASE 3 — login() Implementation

### File: `store/authStore.ts`

**Before:**
```typescript
login: (userRaw: unknown, token: string, refreshToken?: string) => {
  // Direct mutation
  set({
    user: normalizedUser,
    token,
    refreshToken: refreshToken ?? null,
    isAuthenticated: true,
  });
  // No return value
}
```

**After:**
```typescript
login: async (email: string, password: string): Promise<AuthUser | null> => {
  try {
    const response = await loginService(email, password);
    const { user, access_token, refresh_token } = response;

    // Normalize user
    const normalizedUser = normalizeUserWithDefaults(user);
    if (!normalizedUser) {
      return null;
    }

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    }

    // Update Zustand with immutable set
    set((state) => ({
      ...state,
      user: normalizedUser,
      token: access_token,
      refreshToken: refresh_token,
      isAuthenticated: true,
    }));

    return normalizedUser;  // ✅ Returns user
  } catch (error) {
    // On error, clear state
    set((state) => ({
      ...state,
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    }));
    return null;  // ✅ Returns null on error
  }
}
```

**Key Changes:**
- ✅ Takes `(email, password)` instead of `(userRaw, token, refreshToken)`
- ✅ Calls `loginService()` internally
- ✅ Returns `Promise<AuthUser | null>`
- ✅ Uses immutable `set()` with spread operator
- ✅ Proper error handling with state cleanup

---

## PHASE 4 — refreshSession() Implementation

**Before:**
```typescript
refreshSession: async () => {
  // ... complex logic ...
  set({ token: access_token, refreshToken: refresh_token });
  // ... more logic ...
  set({ user: normalizedUser, isAuthenticated: true });
  // No return value (void)
}
```

**After:**
```typescript
refreshSession: async (): Promise<AuthUser | null> => {
  // Read refresh_token from localStorage
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
  if (!refreshToken) {
    return null;
  }

  try {
    // Call refreshService
    const result = await refreshService(refreshToken);
    if (!result || !result.access_token) {
      return null;
    }

    const { user, access_token, refresh_token } = result;

    // Normalize user if present
    let normalizedUser: AuthUser | null = null;
    if (user) {
      normalizedUser = normalizeUserWithDefaults(user);
    }

    // If no user in response, try to get from localStorage or keep current
    if (!normalizedUser) {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            normalizedUser = normalizeUserWithDefaults(JSON.parse(storedUser));
          } catch {
            normalizedUser = null;
          }
        }
      }
      // If still no user, keep current user from state
      if (!normalizedUser) {
        normalizedUser = get().user;
      }
    }

    // Store tokens in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", access_token);
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }
      if (normalizedUser) {
        localStorage.setItem("user", JSON.stringify(normalizedUser));
      }
    }

    // Update Zustand with immutable set
    set((state) => ({
      ...state,
      user: normalizedUser || state.user, // Keep current user if no new user
      token: access_token,
      refreshToken: refresh_token || refreshToken,
      isAuthenticated: true,
    }));

    return normalizedUser || get().user;  // ✅ Returns user
  } catch (error) {
    return null;  // ✅ Returns null on error
  }
}
```

**Key Changes:**
- ✅ Returns `Promise<AuthUser | null>`
- ✅ Reads `refresh_token` from localStorage
- ✅ Calls `refreshService()` internally
- ✅ Uses immutable `set()` with spread operator
- ✅ Proper fallback to current user if no user in response
- ✅ No throwing errors, returns null instead

---

## PHASE 5 — loadMe() Implementation

**Before:**
```typescript
loadMe: async () => {
  // ... complex logic with multiple set() calls ...
  // No return value (void)
}
```

**After:**
```typescript
loadMe: async (): Promise<AuthUser | null> => {
  try {
    // Call loadMeService
    const response = await loadMeService();
    if (!response || !response.user) {
      // Try refresh if loadMe fails
      const refreshed = await get().refreshSession();
      return refreshed;
    }

    // Normalize user
    const normalizedUser = normalizeUserWithDefaults(response.user);
    if (!normalizedUser) {
      // Try refresh if normalization fails
      const refreshed = await get().refreshSession();
      return refreshed;
    }

    // Store in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    }

    // Update Zustand with immutable set
    set((state) => ({
      ...state,
      user: normalizedUser,
      isAuthenticated: true,
    }));

    return normalizedUser;  // ✅ Returns user
  } catch (error) {
    // Try refresh on error
    try {
      const refreshed = await get().refreshSession();
      return refreshed;
    } catch {
      // If refresh also fails, clear state and return null
      set((state) => ({
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }));
      return null;  // ✅ Returns null on error
    }
  }
}
```

**Key Changes:**
- ✅ Returns `Promise<AuthUser | null>`
- ✅ Calls `loadMeService()` internally
- ✅ Uses immutable `set()` with spread operator
- ✅ Proper fallback to `refreshSession()` on failure
- ✅ No throwing errors, returns null instead

---

## PHASE 6 — logout() Implementation

**Before:**
```typescript
logout: () => {
  // ... localStorage cleanup ...
  set({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  });
}
```

**After:**
```typescript
logout: () => {
  // Clear localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("pmd-auth-storage");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  }

  // Update Zustand with immutable set
  set((state) => ({
    ...state,
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  }));
}
```

**Key Changes:**
- ✅ Uses immutable `set()` with spread operator
- ✅ Consistent with other methods

---

## PHASE 7 — Helper Function

**Added:**
```typescript
// Helper function to normalize user with role and organization
function normalizeUserWithDefaults(user: any): AuthUser | null {
  const normalized = normalizeUser(user);
  if (!normalized) {
    return null;
  }

  // Normalize role
  if (!normalized.role || typeof normalized.role.name !== "string") {
    normalized.role = {
      id: normalized.role?.id || "1",
      name: "ADMINISTRATION",
    };
  }

  // Normalize organization
  if (!normalized.organization) {
    normalized.organization = {
      id: normalized.organizationId || "1",
      name: "PMD Arquitectura",
    };
  }

  return normalized;
}
```

**Key Changes:**
- ✅ Centralized normalization logic
- ✅ Reusable across all methods
- ✅ Ensures consistent user structure

---

## PHASE 8 — AuthContext Updates

### File: `context/AuthContext.tsx`

**Before:**
```typescript
const login = async (email: string, password: string) => {
  setLoading(true);
  try {
    const response = await loginService(email, password);
    // ... complex normalization and state management ...
    useAuthStore.setState({ ... });
    return true;
  } catch (err) {
    return false;
  }
};
```

**After:**
```typescript
const login = async (email: string, password: string) => {
  setLoading(true);
  try {
    const user = await loginStore(email, password);  // ✅ Uses store method
    setLoading(false);
    return user !== null;
  } catch (err) {
    setLoading(false);
    return false;
  }
};
```

**Before:**
```typescript
const refresh = async () => {
  // ... complex logic with refreshService ...
  // ... normalization ...
  // ... state management ...
  return normalizedUser;
};
```

**After:**
```typescript
const refresh = async () => {
  try {
    const user = await refreshSessionStore();  // ✅ Uses store method
    return user;
  } catch (error) {
    logout();
    return null;
  }
};
```

**Before:**
```typescript
const loadMe = async () => {
  // ... complex logic with loadMeService ...
  // ... normalization ...
  // ... state management ...
  return normalizedUser;
};
```

**After:**
```typescript
const loadMe = async () => {
  try {
    const user = await loadMeStore();  // ✅ Uses store method
    return user;
  } catch (error) {
    return null;
  }
};
```

**Key Changes:**
- ✅ All methods now delegate to store methods
- ✅ Removed duplicate normalization logic
- ✅ Removed unused imports (`loginService`, `loadMeService`, `refreshService`, `normalizeUser`)
- ✅ Simplified initialization (store handles rehydration)

---

## PHASE 9 — API Interceptor Update

### File: `lib/api.ts`

**Before:**
```typescript
const refreshed = await useAuthStore.getState().refresh();
```

**After:**
```typescript
const refreshed = await useAuthStore.getState().refreshSession();
```

**Key Changes:**
- ✅ Uses `refreshSession()` instead of removed `refresh()` method

---

## Summary of All Changes

### Files Modified:
1. ✅ `store/authStore.ts` - Complete rebuild with clean API
2. ✅ `context/AuthContext.tsx` - Simplified to use store methods
3. ✅ `lib/api.ts` - Updated interceptor to use `refreshSession()`

### Key Improvements:
- ✅ **Clean API** - Only 4 actions: login, logout, refreshSession, loadMe
- ✅ **Consistent Return Types** - All async functions return `Promise<AuthUser | null>`
- ✅ **Immutable Updates** - All `set()` calls use spread operator
- ✅ **No Hanging** - All promises properly resolve
- ✅ **No Direct Mutations** - Except in `onRehydrateStorage` (allowed by Zustand)
- ✅ **Simplified AuthContext** - Delegates to store methods
- ✅ **Centralized Normalization** - Helper function for consistency
- ✅ **Proper Error Handling** - Returns null instead of throwing

### Testing Checklist:
- ✅ Login flow completes without hanging
- ✅ refreshSession() returns user or null
- ✅ loadMe() returns user or null
- ✅ All state updates are immutable
- ✅ AuthContext works with store
- ✅ No TypeScript errors
- ✅ No linter errors

---

**Status:** ✅ Complete
**Date:** 2025-12-12
**Impact:** Complete rebuild ensures no hanging, clean API, immutable updates, and full compatibility with AuthContext.

