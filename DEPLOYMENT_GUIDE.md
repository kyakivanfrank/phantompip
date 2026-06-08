# Phantompip Deployment & API Optimization Guide

## Overview of Optimizations

Your Phantompip project has been optimized with comprehensive API improvements to ensure reliable deployment. All API calls are now standardized, validated, and have consistent error handling.

## What Was Fixed

### 1. **Environment Variable Handling**
   - ✅ Fixed `useApi` hook to properly use `NEXT_PUBLIC_API_URL` 
   - ✅ Added validation that checks for missing/invalid environment variables
   - ✅ Environment validation runs on app startup and fails fast

**New file**: `lib/server/env-validation.ts`
- Validates `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `ENCRYPTION_KEY`, `SESSION_EXPIRY`
- Logs warnings and errors during startup
- Prevents silent failures in production

### 2. **Encryption & Crypto**
   - ✅ Added `ENCRYPTION_KEY` validation before encryption/decryption
   - ✅ Clear error messages if encryption fails
   - ✅ Proper error handling for invalid credentials

**Updated**: `lib/server/crypto.ts`
- Validates encryption key exists and is not empty
- Throws descriptive errors on encryption/decryption failure
- Validates input parameters (password, IV, authTag)

### 3. **Session Management**
   - ✅ Fixed `SESSION_EXPIRY` parsing to handle invalid values
   - ✅ Added session data validation
   - ✅ Proper cookie handling with secure flags in production

**Updated**: `lib/server/auth.ts`
- Validates SESSION_EXPIRY is a positive number
- Validates session data structure before returning
- Properly sets secure cookies in production

### 4. **Standardized API Responses**
   - ✅ All 14 API routes now return consistent format
   - ✅ Centralized error handling across all endpoints
   - ✅ Proper HTTP status codes (400, 401, 403, 404, 500, 503)

**New file**: `lib/server/api-response.ts`
- `successResponse()` - Returns standardized success response
- `errorResponse()` - Returns standardized error response
- `handleApiError()` - Catches and formats errors automatically
- `ApiError` - Type-safe error class

**Response Format**:
```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  message?: string,
  status: number
}
```

### 5. **Updated API Routes**
All 14 routes now use standardized error handling:

**Auth Routes**:
- `POST /api/auth/login` - Standardized responses
- `POST /api/auth/signup` - Consistent error handling
- `POST /api/auth/logout` - Uses new response format
- `GET /api/auth/me` - Better error messages

**MT5 Routes**:
- `POST /api/mt5/connect` - Proper encryption validation
- `GET /api/mt5/status` - Consistent response format

**Payment Routes**:
- `POST /api/payments/submit` - Removed try-catch nesting
- `GET /api/payments/list` - Clean error handling

**Admin Routes**:
- `GET /api/admin/users` - Consistent admin responses
- `GET /api/admin/mt5-vault` - Safe decryption error handling
- `GET /api/admin/payments/pending` - Proper filtering
- `POST /api/admin/payments/approve` - Fixed error handling
- `POST /api/admin/payments/reject` - Consistent responses
- `POST /api/admin/init` - Proper admin creation

### 6. **Configuration Documentation**
Created `.env.example` with complete documentation of all environment variables

## Deployment Checklist

### Before Deploying

1. **Copy and Configure Environment**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill Required Variables** (from `.env.example`):
   - `UPSTASH_REDIS_REST_URL` - Your Upstash Redis REST endpoint
   - `UPSTASH_REDIS_REST_TOKEN` - Your Upstash token
   - `ENCRYPTION_KEY` - Generate with: `openssl rand -base64 32`
   - `NEXT_PUBLIC_API_URL` - Your deployment domain (e.g., https://app.example.com)

3. **Verify Environment Variables**
   ```bash
   # Check all required vars are present
   echo $UPSTASH_REDIS_REST_URL
   echo $UPSTASH_REDIS_REST_TOKEN
   echo $ENCRYPTION_KEY
   echo $NEXT_PUBLIC_API_URL
   ```

4. **Test Locally First**
   ```bash
   npm run dev
   # Check server logs for environment validation output
   # You should see: "✅ Environment variables validated successfully"
   ```

### During Deployment

1. **Set Environment Variables in Deployment Platform**
   - Vercel: Settings → Environment Variables
   - Or use platform-specific secrets management

2. **Do NOT include these in code**:
   - `.env.local` - Git will ignore it, keep it local
   - Secrets should be in platform variables only

3. **Verify API URL**
   - Production: `NEXT_PUBLIC_API_URL=https://your-domain.com`
   - Make sure this matches your actual deployment domain

### After Deployment

1. **Test API Endpoints**
   ```bash
   # Test login endpoint
   curl -X POST https://your-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"Test123!@#"}'
   
   # Response should be:
   # {
   #   "success": true,
   #   "data": { "user": {...} },
   #   "message": "Login successful",
   #   "status": 200
   # }
   ```

2. **Check Server Logs**
   - Look for environment validation confirmation
   - No warnings about missing variables
   - Check for any error traces

3. **Test Session Persistence**
   - Login and verify session cookie is set
   - Make authenticated request (GET /api/auth/me)
   - Verify session persists across requests

4. **Test Error Handling**
   - Send invalid data to endpoints
   - Verify consistent error response format
   - Check error messages are helpful

## API Response Format Reference

### Success Response
```json
{
  "success": true,
  "data": { /* your data */ },
  "message": "Operation successful",
  "status": 200
}
```

### Error Response
```json
{
  "success": false,
  "error": "Descriptive error message",
  "status": 400
}
```

## Common Deployment Issues & Solutions

### Issue: "ENCRYPTION_KEY environment variable is not set"
**Solution**: Generate and set ENCRYPTION_KEY in your environment variables
```bash
openssl rand -base64 32
```

### Issue: "Unauthorized" on authenticated routes
**Solution**: Verify NEXT_PUBLIC_API_URL matches your deployment domain and cookies are included with credentials

### Issue: "Session cookie not persisting"
**Solution**: Check secure flag is properly set - use `secure: true` in production, `secure: false` in development

### Issue: "Invalid session data structure"
**Solution**: Session cookie may be corrupted - clear browser cookies and login again

### Issue: Redis connection failing
**Solution**: Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct

## Files Modified/Created

### New Files
- `lib/server/env-validation.ts` - Environment validation
- `lib/server/api-response.ts` - Standardized response handlers
- `.env.example` - Configuration template

### Updated Files
- `lib/hooks/useApi.ts` - Fixed URL handling and error normalization
- `lib/server/crypto.ts` - Added encryption key validation
- `lib/server/auth.ts` - Added session validation
- `app/api/auth/login/route.ts` - Standardized responses
- `app/api/auth/signup/route.ts` - Standardized responses
- `app/api/auth/logout/route.ts` - Standardized responses
- `app/api/auth/me/route.ts` - Standardized responses
- `app/api/mt5/connect/route.ts` - Standardized responses
- `app/api/mt5/status/route.ts` - Standardized responses
- `app/api/payments/submit/route.ts` - Standardized responses
- `app/api/payments/list/route.ts` - Standardized responses
- `app/api/admin/users/route.ts` - Standardized responses
- `app/api/admin/mt5-vault/route.ts` - Standardized responses
- `app/api/admin/payments/approve/route.ts` - Standardized responses
- `app/api/admin/payments/reject/route.ts` - Standardized responses
- `app/api/admin/payments/pending/route.ts` - Standardized responses
- `app/api/admin/init/route.ts` - Standardized responses

## Monitoring & Debugging

### Check Environment Validation
The app logs validation results on startup. In your deployment platform logs, look for:
```
✅ Environment variables validated successfully
```

Or if there are issues:
```
❌ Environment Validation Failed:
  - ENCRYPTION_KEY not set
```

### Enable Debug Logging
Add to your code to see API response details:
```typescript
// In useApi.ts or client code
console.log('API Response:', responseData);
console.log('API Error:', error);
```

### Test Endpoints Manually
```bash
# Test unauthenticated endpoint
curl https://your-domain.com/api/auth/login

# Test authenticated endpoint (need session cookie)
curl -b "phantompip_session=xyz" https://your-domain.com/api/auth/me
```

## Support

If you encounter issues:
1. Check `.env.example` for required variables
2. Verify all environment variables are set in deployment
3. Check server logs for validation errors
4. Test API responses match expected format
5. Verify session cookies are being sent with credentials

All API calls now include `credentials: 'include'` by default, so cookies will be properly sent and received.