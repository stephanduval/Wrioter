# API Authentication

## Overview
Wrioter uses Laravel Sanctum for API authentication, providing token-based authentication for SPAs and mobile applications.

## Authentication Flow

### 1. Login
```
POST /api/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "client"
  },
  "token": "1|laravel_sanctum_token_here",
  "abilities": ["read", "write"]
}
```

### 2. Register
```
POST /api/register
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

### 3. Logout
```
POST /api/logout
```
Requires authentication. Revokes current token.

### 4. Logout All Devices
```
POST /api/logout-all
```
Revokes all tokens for the user.

## Using Authentication

### Bearer Token
Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

### Example with Axios
```javascript
// Set default header
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Per-request
axios.get('/api/manuscripts', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Example with cURL
```bash
curl -H "Authorization: Bearer {token}" \
     https://api.wrioter.com/api/manuscripts
```

## CSRF Protection

For web applications, CSRF protection is enabled:

1. Get CSRF cookie:
```
GET /sanctum/csrf-cookie
```

2. Include X-XSRF-TOKEN header in subsequent requests

## Password Reset

### Request Reset Link
```
POST /api/forgot-password
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password
```
POST /api/reset-password
```

**Request:**
```json
{
  "token": "reset_token",
  "email": "user@example.com",
  "password": "new_password",
  "password_confirmation": "new_password"
}
```

## Two-Factor Authentication

### Enable 2FA
```
POST /api/user/two-factor-authentication
```

### Disable 2FA
```
DELETE /api/user/two-factor-authentication
```

### Get Recovery Codes
```
GET /api/user/two-factor-recovery-codes
```

### Regenerate Recovery Codes
```
POST /api/user/two-factor-recovery-codes
```

## OAuth Providers

### Available Providers
- Google
- GitHub
- Microsoft

### OAuth Flow
1. Redirect to provider:
```
GET /api/auth/{provider}
```

2. Handle callback:
```
GET /api/auth/{provider}/callback
```

## Permissions & Abilities

Tokens can have specific abilities:

```php
// Creating token with abilities
$token = $user->createToken('token-name', ['manuscript:read', 'manuscript:write']);

// Checking abilities
if ($user->tokenCan('manuscript:write')) {
    // User can write manuscripts
}
```

### Available Abilities
- `manuscript:read` - View manuscripts
- `manuscript:write` - Create/edit manuscripts
- `manuscript:delete` - Delete manuscripts
- `admin:access` - Access admin panel
- `api:full-access` - Full API access

## Rate Limiting

Authentication endpoints have specific rate limits:
- Login: 5 attempts per minute
- Register: 3 attempts per minute
- Password reset: 3 attempts per hour

## Security Best Practices

1. **Token Storage**
   - Store tokens securely (HttpOnly cookies or secure storage)
   - Never store in localStorage for sensitive applications
   - Use secure storage on mobile apps

2. **Token Expiration**
   - Default expiration: 1 year
   - Configure in `config/sanctum.php`
   - Implement token refresh strategy

3. **HTTPS Only**
   - Always use HTTPS in production
   - Set `SESSION_SECURE_COOKIE=true` in production

4. **API Versioning**
   - Include version in headers or URL
   - Example: `/api/v1/manuscripts`

## Testing Authentication

### Test Credentials
Environment: `.env.testing`
- Email: `info@freynet-gagne.com`
- Password: `ChangeMe2024!`

### Testing with Postman
1. Set environment variable for token
2. Use `{{token}}` in Authorization header
3. Set Content-Type to `application/json`

### Testing in Code
```php
// Laravel test
$this->actingAs($user)
     ->get('/api/manuscripts')
     ->assertStatus(200);

// With Sanctum
Sanctum::actingAs($user, ['*']);
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check token is valid
   - Verify Authorization header format
   - Ensure token hasn't expired

2. **419 CSRF Token Mismatch**
   - Get fresh CSRF cookie
   - Include X-XSRF-TOKEN header
   - Check SESSION_DOMAIN setting

3. **429 Too Many Requests**
   - Implement exponential backoff
   - Check rate limit headers
   - Contact admin for increased limits

### Debug Headers
Enable debug mode to see additional headers:
- `X-Debug-Token-Valid`: Token validation status
- `X-Debug-User-ID`: Authenticated user ID
- `X-Debug-Abilities`: Token abilities