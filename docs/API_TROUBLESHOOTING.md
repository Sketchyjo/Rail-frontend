# API Endpoint Troubleshooting Guide

## Current Error Status

### 1. Portfolio Overview Endpoint
**Endpoint:** `/api/v1/portfolio/overview`  
**Status:** ❌ **404 Not Found**  
**Error:** `"404 page not found"`

#### What This Means
The backend server doesn't have this endpoint implemented yet. The endpoint exists in the API documentation but hasn't been deployed to your development server.

#### Frontend Handling
The app gracefully handles this by:
- ✅ Showing placeholder values (`$---`, `---%`)
- ✅ Not spamming retry attempts (stops after detecting 404)
- ✅ Not showing error banners (users won't see anything broken)
- ✅ UI remains fully functional

#### To Fix (Backend)
You need to implement the portfolio endpoint on your backend server:

```go
// Example Go handler
func (h *Handler) GetPortfolioOverview(c *gin.Context) {
    userID := c.GetString("user_id")
    
    portfolio := &entities.PortfolioOverview{
        TotalPortfolio:     "1250.75",
        BuyingPower:        "500.00",
        PositionsValue:     "750.75",
        PerformanceLast30d: 2.35,
        Currency:           "USD",
        LastUpdated:        time.Now().Format(time.RFC3339),
    }
    
    c.JSON(http.StatusOK, portfolio)
}

// Register route
router.GET("/api/v1/portfolio/overview", authMiddleware, h.GetPortfolioOverview)
```

---

### 2. Wallet Addresses Endpoint
**Endpoint:** `/api/v1/wallet/addresses?chain=SOL-DEVNET`  
**Status:** ❌ **401 Unauthorized**  
**Error:** `{"error": "Invalid token"}`

#### What This Means
The endpoint exists but the authentication token is either:
1. Missing from the request
2. Expired
3. Invalid/malformed
4. User is not logged in

#### Frontend Handling
The app handles this by:
- ✅ Showing QR shimmer skeleton (keeps UI functional)
- ✅ Displaying helpful error message about authentication
- ✅ Not retrying 401 errors (prevents spam)
- ✅ Buttons remain visible but disabled

#### To Fix

**Option 1: Check Authentication Flow**
```typescript
// Make sure user is logged in before accessing deposit screen
if (!isAuthenticated) {
  router.replace('/signin');
  return;
}
```

**Option 2: Verify Token Storage**
```typescript
// Check if token exists
import { useAuthStore } from '@/stores/authStore';

const accessToken = useAuthStore.getState().accessToken;
console.log('Access Token:', accessToken ? 'Present' : 'Missing');
```

**Option 3: Backend Token Validation**
```go
// Ensure backend accepts the token format
func authMiddleware(c *gin.Context) {
    authHeader := c.GetHeader("Authorization")
    if authHeader == "" {
        c.JSON(401, gin.H{"error": "Missing authorization header"})
        c.Abort()
        return
    }
    
    tokenString := strings.TrimPrefix(authHeader, "Bearer ")
    // Validate token...
}
```

---

## Error Handling Strategy

### Automatic Retry Logic

#### Portfolio Endpoint
```typescript
retry: (failureCount, error: any) => {
  // Don't retry on 404 (endpoint doesn't exist)
  if (error?.error?.code === 'HTTP_404') {
    return false;
  }
  // Retry twice for other errors
  return failureCount < 2;
}
```

#### Wallet Addresses Endpoint
```typescript
retry: (failureCount, error: any) => {
  // Don't retry on 401 (auth error) or 404 (not found)
  const errorCode = error?.error?.code;
  if (errorCode === 'HTTP_401' || errorCode === 'HTTP_404') {
    return false;
  }
  // Retry once for other errors
  return failureCount < 1;
}
```

### Why This Approach?
1. **Prevents API spam** - No infinite retries on permanent failures
2. **Saves bandwidth** - Stops immediately for known errors
3. **Better UX** - Users don't see repeated loading states
4. **Debuggable** - Clear error messages in console

---

## Testing Endpoints

### Manual Testing with cURL

#### Test Portfolio Endpoint
```bash
# Replace with your actual JWT token
JWT_TOKEN="your_jwt_token_here"

curl -X GET "http://localhost:8080/api/v1/portfolio/overview" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"
```

**Expected Success Response:**
```json
{
  "totalPortfolio": "1250.75",
  "buyingPower": "500.00",
  "positionsValue": "750.75",
  "performanceLast30d": 2.35,
  "currency": "USD",
  "lastUpdated": "2025-10-24T00:31:31Z"
}
```

#### Test Wallet Addresses Endpoint
```bash
JWT_TOKEN="your_jwt_token_here"

curl -X GET "http://localhost:8080/api/v1/wallet/addresses?chain=SOL-DEVNET" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"
```

**Expected Success Response:**
```json
{
  "wallets": [
    {
      "chain": "SOL-DEVNET",
      "address": "8gVkP2aGZxK4u3Hj9JkMPVz7eQQaQ2W5FnE4cTdR3xYq",
      "status": "live"
    }
  ]
}
```

---

## Common Issues & Solutions

### Issue 1: "404 page not found"
**Cause:** Backend endpoint not implemented  
**Solution:** Implement the endpoint on backend server  
**Frontend:** Already handles gracefully with placeholders

### Issue 2: "Invalid token"
**Cause:** Token expired, missing, or invalid  
**Solution:**
```typescript
// Check token expiry
const { refreshSession } = useAuthStore.getState();
await refreshSession();
```

### Issue 3: CORS errors
**Cause:** Backend not allowing requests from app  
**Solution:** Configure CORS on backend
```go
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"*"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{"Authorization", "Content-Type"},
    ExposeHeaders:    []string{"Content-Length"},
    AllowCredentials: true,
}))
```

### Issue 4: Network timeout
**Cause:** Backend server slow or unreachable  
**Solution:** Check if backend is running
```bash
# Test if server is reachable
curl http://localhost:8080/health
```

---

## Debugging Steps

### 1. Check Backend Server Status
```bash
# Is the server running?
curl http://localhost:8080/health

# Check specific endpoints
curl http://localhost:8080/api/v1/portfolio/overview
curl http://localhost:8080/api/v1/wallet/addresses
```

### 2. Verify Authentication
```typescript
// In your app
import { useAuthStore } from '@/stores/authStore';

// Check auth state
const { isAuthenticated, accessToken, user } = useAuthStore();
console.log('Authenticated:', isAuthenticated);
console.log('Token:', accessToken ? 'Present' : 'Missing');
console.log('User:', user);
```

### 3. Check Network Logs
```typescript
// Enable detailed logging in api/client.ts
if (__DEV__) {
  console.log('[API Request]', config.method, config.url);
  console.log('[Headers]', config.headers);
  console.log('[Data]', config.data);
}
```

### 4. Test with Mock Data
If backend isn't ready, temporarily return mock data:

```typescript
// api/services/portfolio.service.ts
async getPortfolioOverview(): Promise<PortfolioOverview> {
  // TODO: Remove when backend is ready
  if (process.env.EXPO_PUBLIC_USE_MOCK === 'true') {
    return {
      totalPortfolio: "1250.75",
      buyingPower: "500.00",
      positionsValue: "750.75",
      performanceLast30d: 2.35,
      currency: "USD",
      lastUpdated: new Date().toISOString(),
    };
  }
  
  return apiClient.get<ApiResponse<PortfolioOverview>>(PORTFOLIO_ENDPOINTS.OVERVIEW);
}
```

---

## Production Readiness Checklist

Before deploying to production, ensure:

- [ ] All endpoints return expected responses
- [ ] Authentication works correctly
- [ ] Token refresh mechanism functional
- [ ] Error responses follow consistent format
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Request/response logging enabled
- [ ] Health check endpoint available
- [ ] All testnet endpoints mapped correctly
- [ ] Frontend error handling tested
- [ ] Retry logic verified
- [ ] Timeout values appropriate

---

## Quick Reference

### Current API Base URL
```
Development: http://localhost:8080/api
Production: https://api.stack.com
```

### Required Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Accept: application/json
```

### Expected Response Format
```json
{
  "data": { /* actual response */ }
}
```

### Error Response Format
```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": { /* optional extra info */ }
}
```

---

## Next Steps

1. **Implement Missing Backend Endpoints**
   - Portfolio overview: `/api/v1/portfolio/overview`
   - Verify response format matches types

2. **Fix Authentication**
   - Debug token validation on backend
   - Check token storage on frontend
   - Verify token refresh flow

3. **Test Integration**
   - Use cURL to test endpoints
   - Verify app receives correct data
   - Check error handling works

4. **Monitor in Production**
   - Set up error tracking (Sentry)
   - Monitor API response times
   - Track authentication failures
   - Alert on high error rates

---

## Support

If endpoints continue failing:
1. Check backend logs for detailed errors
2. Verify database connections
3. Test with Postman/Insomnia
4. Review backend implementation against docs
5. Ensure versions match between frontend and backend

**Remember:** The frontend is already handling errors gracefully. Focus on implementing/fixing the backend endpoints.
