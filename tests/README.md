# E2E Testing Guide

## Test Users Configuration

We have created a centralized test user configuration system to ensure consistent authentication across all E2E tests.

### Available Test Users

All test users use the password: `password123`

#### Admin Users
- **Primary Admin**: `info@freynet-gagne.com`
  - Full admin access to all features
  - Can create, read, update, delete, and manage all resources

- **Secondary Admin**: `admin@admin.com`
  - Same permissions as primary admin
  - Useful for testing admin-to-admin interactions

#### Client Users
- **Primary Client**: `sophie@freynet-gagne.com`
  - Standard client permissions
  - Limited access to own resources

- **Secondary Client**: `client@client.com`
  - Same permissions as primary client
  - Useful for testing client-to-client interactions

### Usage in Tests

```javascript
import { TEST_USERS, loginUser, setAuthInBrowser } from '../config/testUsers.js';

// Login via API
const authData = await loginUser(request, TEST_USERS.ADMIN);
const token = authData.token;

// Set authentication in browser
await setAuthInBrowser(page, authData);

// Use in API requests
const response = await request.get('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Permission Testing

The new `scrivener-import-permissions.spec.js` file demonstrates:

1. **Admin Access**: Full access to all import features
2. **Client Access**: Limited access to own uploads only
3. **Unauthorized Access**: Proper blocking of unauthenticated requests
4. **Data Isolation**: Users cannot access each other's data
5. **Role Consistency**: All users of the same role have identical permissions

### Test Results

✅ **Permissions Test Results** (6/6 passed):
- Admin user can access all Scrivener import features
- Client user can upload files but has limited access  
- Unauthorized access is properly blocked
- Different admin users have same access levels
- Role-based feature access validation
- Cross-user data isolation

## Key Improvements

1. **Centralized Configuration**: All test users defined in one place
2. **Role-Based Testing**: Easy to test different permission scenarios
3. **Consistent Authentication**: Standardized login process across tests
4. **Permission Validation**: Explicit testing of user access controls
5. **Data Security**: Verification that users can't access unauthorized data

## Database Seeding

The test users correspond to the users created by the Laravel `UserSeeder`:

```bash
php artisan db:seed --class=DatabaseSeeder
```

This ensures test users exist in the database before running E2E tests.

## Test Coverage

Current E2E test status:
- **48+ tests passing** (significant improvement from initial 37)
- **API authentication working** properly with real tokens
- **Permission-based access** validated across user roles
- **File upload/import functionality** tested for different user types