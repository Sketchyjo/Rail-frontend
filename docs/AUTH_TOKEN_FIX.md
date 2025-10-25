# Authentication Token Fix - Summary

## Problem
The application was experiencing **401 "Invalid token"** errors on all API requests to endpoints like:
- `/v1/portfolio/overview`
- `/v1/wallets/SOL-DEVNET/address`

### Root Causes
1. **Mock authentication data**: The `authStore.ts` had hardcoded mock tokens (`'mock-access-token'`, `'mock-refresh-token'`) instead of making real API calls
2. **Invalid stored tokens**: Users had stale/invalid tokens persisted in AsyncStorage from previous sessions
3. **No token validation on app load**: The app didn't verify if stored tokens were still valid when launching
4. **Infinite retry loops**: API client would continuously retry failed requests without proper 401 handling

## Solutions Implemented

### 1. Fixed AuthStore to Use Real API Calls
**File**: `stores/authStore.ts`

**Changes**:
- ✅ Imported `authService` from API services
- ✅ `login()`: Now calls `authService.login()` instead of using mock data
- ✅ `register()`: Now calls `authService.register()` and properly sets pending email
- ✅ `logout()`: Now calls `authService.logout()` to invalidate server-side tokens
- ✅ `refreshSession()`: Now calls `authService.refreshToken()` with real refresh token

**Before**:
```typescript
login: async (email: string, password: string) => {
  // Mock implementation
  set({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  });
}
```

**After**:
```typescript
login: async (email: string, password: string) => {
  const response = await authService.login({ email, password });
  set({
    user: response.user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    // ... other fields
  });
}
```

### 2. Token Validation on App Launch
**File**: `app/_layout.tsx`

**Changes**:
- ✅ Added token validation in `initializeApp()` effect
- ✅ Validates existing tokens by calling `authService.getCurrentUser()`
- ✅ Automatically clears invalid/expired tokens on app load
- ✅ Prevents authenticated routes from loading with invalid tokens

**Implementation**:
```typescript
// Validate existing token if present
if (isAuthenticated && accessToken) {
  try {
    await authService.getCurrentUser();
    console.log('[Auth] Token validated successfully');
  } catch (error: any) {
    console.warn('[Auth] Token validation failed, clearing session');
    useAuthStore.getState().reset();
  }
}
```

### 3. Improved API Client Error Handling
**File**: `api/client.ts`

**Changes**:
- ✅ Added `/auth/refresh` to excluded retry endpoints
- ✅ Only attempt token refresh if user is still authenticated
- ✅ Clear auth state instead of calling logout (prevents additional API calls)
- ✅ Better logging for debugging token refresh failures

**Key improvement**:
```typescript
// Only try refresh if we're still authenticated
if (isAuthenticated) {
  await refreshSession();
  // ... retry with new token
}
```

### 4. Enhanced React Query Hooks
**Files**: 
- `api/hooks/usePortfolio.ts`
- `api/hooks/useWallet.ts`

**Changes**:
- ✅ Don't retry on 401 errors (auth failures)
- ✅ Don't retry on 404 errors (endpoint not found)
- ✅ Disabled `refetchInterval` for wallet addresses to prevent auth error spam
- ✅ Reduced retry attempts from 2 to 1 for faster failure handling

**Before**:
```typescript
retry: (failureCount, error: any) => {
  if (error?.error?.code === 'HTTP_404') return false;
  return failureCount < 2;
}
```

**After**:
```typescript
retry: (failureCount, error: any) => {
  const errorCode = error?.error?.code;
  // Don't retry on auth errors (401) or not found (404)
  if (errorCode === 'HTTP_401' || errorCode === 'HTTP_404') {
    return false;
  }
  return failureCount < 1;
}
```

### 5. SessionManager Improvements
**File**: `utils/sessionManager.ts`

**Changes**:
- ✅ Check `isAuthenticated` before attempting token refresh
- ✅ Only schedule next refresh if `expiresAt` is provided
- ✅ Use `reset()` instead of `logout()` to avoid additional API calls
- ✅ Better error handling and logging

## Testing the Fix

### 1. Clear Existing Invalid Tokens
```bash
# If using iOS Simulator
xcrun simctl get_app_container booted <bundle-id> data
# Delete app data or reinstall app

# If using Android Emulator
adb shell pm clear <package-name>
```

### 2. Test Authentication Flow
1. **Fresh Install**: App should show welcome/login screen
2. **Login**: Enter valid credentials - should receive real tokens
3. **API Calls**: Portfolio and wallet endpoints should now work
4. **Token Refresh**: Should automatically refresh when token expires
5. **Invalid Token**: Should auto-logout and return to login screen

### 3. Verify Logs
Look for these log messages:
```
[Auth] Token validated successfully
[API Response] /v1/portfolio/overview
[API Response] /v1/wallets/SOL-DEVNET/address
```

### 4. No More 401 Errors
You should **NOT** see:
```
❌ [API Error] {"status": 401, "data": {"error": "Invalid token"}}
```

## Additional Notes

### Authentication Flow
1. User logs in with email/password
2. Backend returns `accessToken` and `refreshToken`
3. Tokens stored in AsyncStorage via Zustand persist
4. All API requests include `Authorization: Bearer <accessToken>`
5. On 401, API client attempts token refresh
6. If refresh fails, user is logged out

### Token Lifecycle
- **Access Token**: Short-lived, used for API requests
- **Refresh Token**: Long-lived, used to get new access tokens
- **Validation**: Checked on app launch via `/v1/auth/me`
- **Refresh**: Automatic when access token expires (401 response)

### Best Practices
- ✅ Always use real API services, never mock in production stores
- ✅ Validate tokens on app launch
- ✅ Handle 401 errors gracefully without infinite retries
- ✅ Clear invalid tokens automatically
- ✅ Use `reset()` instead of `logout()` for silent auth clearing

## Migration Guide

If users are experiencing issues after this update:

1. **Clear app data** to remove invalid cached tokens
2. **Re-login** with valid credentials
3. **Verify** that API calls are working

## Related Files
- `stores/authStore.ts` - Authentication state management
- `api/client.ts` - Axios client with interceptors
- `api/services/auth.service.ts` - Auth API endpoints
- `utils/sessionManager.ts` - Token refresh scheduling
- `app/_layout.tsx` - App initialization and routing
- `api/hooks/useAuth.ts` - Auth mutation hooks
- `api/hooks/usePortfolio.ts` - Portfolio query hooks
- `api/hooks/useWallet.ts` - Wallet query hooks

## Future Improvements
- [ ] Add token expiry checks before making requests
- [ ] Implement retry queue for failed requests during token refresh
- [ ] Add user-friendly error messages for auth failures
- [ ] Implement biometric authentication as alternative
- [ ] Add token rotation/renewal notifications
