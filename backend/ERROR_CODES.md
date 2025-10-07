# 📋 ERROR CODES REFERENCE

## Complete Error Code Catalog for Friends Pizza Hut Backend

This document provides a comprehensive reference for all error codes used in the application. Each error code represents a specific type of error and helps clients handle errors appropriately.

---

## 📚 Table of Contents

1. [Validation Errors (400)](#validation-errors-400)
2. [Authentication Errors (401)](#authentication-errors-401)
3. [Authorization Errors (403)](#authorization-errors-403)
4. [Resource Errors (404)](#resource-errors-404)
5. [Conflict Errors (409)](#conflict-errors-409)
6. [Rate Limiting (429)](#rate-limiting-429)
7. [Server Errors (500+)](#server-errors-500)
8. [Usage Examples](#usage-examples)

---

## Validation Errors (400)

### `VALIDATION_ERROR`
**HTTP Status**: 400 Bad Request

**Description**: General validation error when request data doesn't meet requirements

**Common Causes**:
- Missing required fields
- Invalid data format
- Field length violations
- Type mismatches

**Example Response**:
```json
{
  "status": "fail",
  "code": "VALIDATION_ERROR",
  "message": "Validation failed: Email is required, Password must be at least 6 characters",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/auth/register"
}
```

**How to Fix**:
- Check API documentation for required fields
- Ensure all data types are correct
- Validate data on client side before sending

---

### `INVALID_INPUT`
**HTTP Status**: 400 Bad Request

**Description**: Specific input value is invalid (e.g., malformed ObjectId, invalid format)

**Common Causes**:
- Invalid MongoDB ObjectId
- Malformed date format
- Invalid enum value
- Incorrect data structure

**Example Response**:
```json
{
  "status": "fail",
  "code": "INVALID_INPUT",
  "message": "Invalid id: abc123. Please provide a valid ID.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/orders/abc123"
}
```

**How to Fix**:
- Provide valid MongoDB ObjectId (24 hex characters)
- Check date format (ISO 8601)
- Use valid enum values
- Match expected data structure

---

### `MISSING_REQUIRED_FIELD`
**HTTP Status**: 400 Bad Request

**Description**: One or more required fields are missing from the request

**Common Causes**:
- Incomplete form submission
- Missing required headers
- Undefined required parameters

**Example Response**:
```json
{
  "status": "fail",
  "code": "MISSING_REQUIRED_FIELD",
  "message": "Missing required field: deliveryAddress",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/orders"
}
```

**How to Fix**:
- Include all required fields in request
- Check API documentation for required fields
- Ensure form validation is working

---

## Authentication Errors (401)

### `INVALID_TOKEN`
**HTTP Status**: 401 Unauthorized

**Description**: JWT token is invalid, malformed, or doesn't match expected format

**Common Causes**:
- Corrupted token
- Token from different system
- Manually modified token
- Missing parts of token

**Example Response**:
```json
{
  "status": "fail",
  "code": "INVALID_TOKEN",
  "message": "Invalid authentication token. Please login again.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/orders"
}
```

**How to Fix**:
- Clear stored token and login again
- Ensure token is sent correctly in Authorization header
- Format: `Authorization: Bearer <token>`

---

### `TOKEN_EXPIRED`
**HTTP Status**: 401 Unauthorized

**Description**: JWT token has expired and is no longer valid

**Common Causes**:
- User hasn't refreshed session
- Long period of inactivity
- Token TTL exceeded

**Example Response**:
```json
{
  "status": "fail",
  "code": "TOKEN_EXPIRED",
  "message": "Your session has expired. Please login again.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/profile"
}
```

**How to Fix**:
- Implement automatic token refresh
- Prompt user to login again
- Store token expiry time and refresh proactively

---

### `AUTHENTICATION_REQUIRED`
**HTTP Status**: 401 Unauthorized

**Description**: Endpoint requires authentication but no token was provided

**Common Causes**:
- Missing Authorization header
- User not logged in
- Token not stored/sent

**Example Response**:
```json
{
  "status": "fail",
  "code": "AUTHENTICATION_REQUIRED",
  "message": "Authentication required. Please login to access this resource.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/profile"
}
```

**How to Fix**:
- Login and obtain JWT token
- Include token in all protected requests
- Redirect to login page if on frontend

---

## Authorization Errors (403)

### `INSUFFICIENT_PERMISSIONS`
**HTTP Status**: 403 Forbidden

**Description**: User is authenticated but doesn't have permission for this action

**Common Causes**:
- Role-based access control (RBAC) violation
- Trying to access admin-only endpoints
- Trying to modify another user's resources

**Example Response**:
```json
{
  "status": "fail",
  "code": "INSUFFICIENT_PERMISSIONS",
  "message": "You don't have permission to perform this action. Admin access required.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

**How to Fix**:
- Ensure user has correct role (admin, delivery, user)
- Request permission from administrator
- Use appropriate user account

---

### `ACCESS_DENIED`
**HTTP Status**: 403 Forbidden

**Description**: Access to specific resource is denied

**Common Causes**:
- Account suspended/banned
- IP blocked
- Resource access restricted
- Policy violation

**Example Response**:
```json
{
  "status": "fail",
  "code": "ACCESS_DENIED",
  "message": "Access denied. Your account has been suspended.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/orders"
}
```

**How to Fix**:
- Contact support for account status
- Check account restrictions
- Verify IP is not blacklisted

---

## Resource Errors (404)

### `RESOURCE_NOT_FOUND`
**HTTP Status**: 404 Not Found

**Description**: Requested resource doesn't exist in database

**Common Causes**:
- Invalid resource ID
- Resource was deleted
- Typo in resource ID
- Wrong resource type

**Example Response**:
```json
{
  "status": "fail",
  "code": "RESOURCE_NOT_FOUND",
  "message": "Order not found with ID: 507f1f77bcf86cd799439011",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/orders/507f1f77bcf86cd799439011"
}
```

**How to Fix**:
- Verify resource ID is correct
- Check if resource was deleted
- Ensure using correct resource endpoint

---

### `ROUTE_NOT_FOUND`
**HTTP Status**: 404 Not Found

**Description**: API endpoint doesn't exist

**Common Causes**:
- Typo in URL
- API version mismatch
- Endpoint doesn't exist
- Wrong HTTP method

**Example Response**:
```json
{
  "status": "fail",
  "code": "ROUTE_NOT_FOUND",
  "message": "Route GET /api/v1/invalid-endpoint not found",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/invalid-endpoint"
}
```

**How to Fix**:
- Check API documentation for correct endpoints
- Verify API version (v1, v2, etc.)
- Ensure HTTP method is correct (GET, POST, etc.)

---

## Conflict Errors (409)

### `DUPLICATE_RESOURCE`
**HTTP Status**: 409 Conflict

**Description**: Resource already exists with same unique identifier

**Common Causes**:
- Duplicate email registration
- Duplicate phone number
- Duplicate coupon code
- Unique constraint violation

**Example Response**:
```json
{
  "status": "fail",
  "code": "DUPLICATE_RESOURCE",
  "message": "Duplicate field value: email = \"user@example.com\". Please use another value.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/auth/register"
}
```

**How to Fix**:
- Use different value for unique fields
- Check if user already exists
- Login instead of registering

---

### `RESOURCE_CONFLICT`
**HTTP Status**: 409 Conflict

**Description**: Operation conflicts with current resource state

**Common Causes**:
- Trying to cancel already delivered order
- Updating outdated resource version
- State transition not allowed
- Concurrent modification conflict

**Example Response**:
```json
{
  "status": "fail",
  "code": "RESOURCE_CONFLICT",
  "message": "Cannot cancel order. Order is already delivered.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/orders/507f1f77bcf86cd799439011/cancel"
}
```

**How to Fix**:
- Refresh resource state before operation
- Check if operation is allowed in current state
- Handle concurrent modifications

---

## Rate Limiting (429)

### `TOO_MANY_REQUESTS`
**HTTP Status**: 429 Too Many Requests

**Description**: Client has exceeded rate limit for this endpoint

**Common Causes**:
- Too many requests in short time
- Automated script/bot
- Failed retry loop
- DDoS attempt

**Example Response**:
```json
{
  "status": "fail",
  "code": "TOO_MANY_REQUESTS",
  "message": "Too many requests from this IP. Please try again after 15 minutes.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/auth/login"
}
```

**Headers**:
```
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1696680000
```

**Rate Limits**:
- General API: 100 requests / 15 minutes
- Auth routes: 5 requests / 15 minutes
- Payment routes: 10 requests / hour

**How to Fix**:
- Wait for rate limit window to reset
- Implement exponential backoff
- Cache responses when possible
- Reduce request frequency

---

## Server Errors (500+)

### `INTERNAL_SERVER_ERROR`
**HTTP Status**: 500 Internal Server Error

**Description**: Unexpected server error occurred

**Common Causes**:
- Programming error
- Unhandled exception
- System malfunction
- Configuration error

**Example Response**:
```json
{
  "status": "error",
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred. Our team has been notified.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/orders"
}
```

**How to Fix**:
- Retry request after brief delay
- Contact support if persists
- Check server status page
- Error is logged automatically

---

### `DATABASE_ERROR`
**HTTP Status**: 503 Service Unavailable

**Description**: Database is temporarily unavailable or connection failed

**Common Causes**:
- Database server down
- Connection timeout
- Network issue
- Maintenance mode

**Example Response**:
```json
{
  "status": "error",
  "code": "DATABASE_ERROR",
  "message": "Database temporarily unavailable. Please try again later.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/orders"
}
```

**How to Fix**:
- Retry request after 30 seconds
- Check health endpoint: GET /health/db
- Wait for maintenance to complete
- Contact support if prolonged

---

### `EXTERNAL_SERVICE_ERROR`
**HTTP Status**: 503 Service Unavailable

**Description**: External service (payment gateway, SMS, etc.) is unavailable

**Common Causes**:
- Payment gateway down
- SMS service unavailable
- Third-party API timeout
- Network connectivity issue

**Example Response**:
```json
{
  "status": "error",
  "code": "EXTERNAL_SERVICE_ERROR",
  "message": "Payment service temporarily unavailable. Please try again later.",
  "timestamp": "2025-10-07T10:30:00.000Z",
  "path": "/api/v1/payments"
}
```

**How to Fix**:
- Retry payment after delay
- Try alternative payment method
- Check service status page
- Contact support if urgent

---

## Usage Examples

### Frontend Error Handling

```javascript
// Axios interceptor for centralized error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { code, message } = error.response?.data || {};
    
    switch (code) {
      case 'TOKEN_EXPIRED':
        // Redirect to login
        redirectToLogin();
        break;
        
      case 'INSUFFICIENT_PERMISSIONS':
        // Show access denied page
        showAccessDenied();
        break;
        
      case 'TOO_MANY_REQUESTS':
        // Show rate limit message
        showRateLimitWarning();
        break;
        
      case 'VALIDATION_ERROR':
        // Show validation errors in form
        showValidationErrors(message);
        break;
        
      case 'RESOURCE_NOT_FOUND':
        // Show 404 page
        show404Page();
        break;
        
      default:
        // Show generic error
        showErrorToast(message);
    }
    
    return Promise.reject(error);
  }
);
```

### Backend Error Throwing

```javascript
import { ApiError, ERROR_CODES } from '../middlewares/errorHandler.js';

// Throw operational error
if (!order) {
  throw new ApiError(
    404,
    'Order not found',
    ERROR_CODES.RESOURCE_NOT_FOUND,
    true
  );
}

// Throw authentication error
if (!token) {
  throw new ApiError(
    401,
    'Authentication required',
    ERROR_CODES.AUTHENTICATION_REQUIRED,
    true
  );
}

// Throw authorization error
if (user.role !== 'admin') {
  throw new ApiError(
    403,
    'Admin access required',
    ERROR_CODES.INSUFFICIENT_PERMISSIONS,
    true
  );
}

// Throw validation error
if (!email || !password) {
  throw new ApiError(
    400,
    'Email and password are required',
    ERROR_CODES.VALIDATION_ERROR,
    true
  );
}
```

---

## Error Response Structure

All errors follow this consistent structure:

```typescript
interface ErrorResponse {
  status: 'fail' | 'error';  // fail = 4xx, error = 5xx
  code: string;               // Error code from ERROR_CODES
  message: string;            // Human-readable message
  timestamp: string;          // ISO 8601 timestamp
  path: string;               // Request path
  
  // Development mode only
  error?: {
    name: string;             // Error class name
    isOperational: boolean;   // Operational vs programming error
    stack?: string[];         // Stack trace (first 5 lines)
    details?: any;            // Additional error details
  };
  
  request?: {                 // Request context
    method: string;
    body: any;
    query: any;
    params: any;
  };
}
```

---

## Quick Reference Table

| Code | Status | Description | Retry? |
|------|--------|-------------|--------|
| `VALIDATION_ERROR` | 400 | Invalid input data | No |
| `INVALID_INPUT` | 400 | Malformed input value | No |
| `MISSING_REQUIRED_FIELD` | 400 | Required field missing | No |
| `INVALID_TOKEN` | 401 | Invalid JWT token | No |
| `TOKEN_EXPIRED` | 401 | Expired JWT token | No |
| `AUTHENTICATION_REQUIRED` | 401 | No token provided | No |
| `INSUFFICIENT_PERMISSIONS` | 403 | Lack of permissions | No |
| `ACCESS_DENIED` | 403 | Access forbidden | No |
| `RESOURCE_NOT_FOUND` | 404 | Resource doesn't exist | No |
| `ROUTE_NOT_FOUND` | 404 | Endpoint doesn't exist | No |
| `DUPLICATE_RESOURCE` | 409 | Duplicate unique value | No |
| `RESOURCE_CONFLICT` | 409 | State conflict | No |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded | Yes, after delay |
| `INTERNAL_SERVER_ERROR` | 500 | Server error | Yes |
| `DATABASE_ERROR` | 503 | Database unavailable | Yes |
| `EXTERNAL_SERVICE_ERROR` | 503 | External service down | Yes |

---

## Best Practices

1. **Always check error code first**, not just HTTP status
2. **Display user-friendly messages** based on error code
3. **Implement retry logic** for 5xx errors with exponential backoff
4. **Handle rate limits gracefully** - don't hammer the API
5. **Log errors on client side** for debugging
6. **Show specific validation errors** in forms
7. **Redirect on authentication errors** to login page
8. **Cache successful responses** to reduce API calls
9. **Implement global error handler** in frontend
10. **Monitor error rates** - spikes indicate issues

---

## Support

If you encounter errors not listed here or need assistance:

- **Check logs**: `logs/error-*.log`
- **Health check**: GET `/health/detailed`
- **Documentation**: `/api/docs`
- **Contact**: support@friendspizzahut.com

---

*Error Codes Documentation - Prompt 10 Implementation - October 7, 2025*
