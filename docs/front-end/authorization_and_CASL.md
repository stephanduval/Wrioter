# Authorization and CASL Implementation

## Overview

The Wrioter application uses CASL (Code Access Security Layer) for managing permissions and authorization. CASL provides a flexible and powerful way to define and check user permissions across the application.

## File Structure

```
resources/ts/
├── plugins/
│   ├── casl/
│   │   ├── ability.ts        # Core CASL ability definitions
│   │   └── index.ts          # CASL plugin initialization
├── utils/
│   └── api.ts               # API utilities with auth interceptors
├── composables/
│   └── useApi.ts            # API composable with auth handling
└── layouts/
    └── plugins/
        └── casl.ts          # Navigation guards and CASL integration
```

## Core Components

### 1. Ability Definition (`ability.ts`)

```typescript
export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage'
export type Subjects = 'manuscripts' | 'projects' | 'admin' | 'messages' | 'all'

// Ability rules are defined as:
interface AbilityRule {
  action: Actions
  subject: Subjects
  conditions?: Record<string, any>
  fields?: string[]
  inverted?: boolean
}
```

### 2. Permission Subjects

The application defines several permission subjects:

- `manuscripts`: Access to manuscript operations
- `projects`: Access to project management
- `admin`: Administrative functions
- `messages`: Message handling
- `all`: Special subject for global permissions

### 3. Actions

Available actions for each subject:

- `create`: Create new resources
- `read`: View resources
- `update`: Modify existing resources
- `delete`: Remove resources
- `manage`: Full control over resources

## Implementation Details

### 1. Authentication Flow

1. User logs in through `AuthController@login`
2. Backend generates Sanctum token and user permissions
3. Frontend stores:
   - `accessToken` in localStorage
   - `userData` in localStorage
   - `abilityRules` in localStorage

### 2. Token Management

```typescript
// Token storage
localStorage.setItem('accessToken', token)
localStorage.setItem('userData', JSON.stringify(userData))
localStorage.setItem('abilityRules', JSON.stringify(abilityRules))

// Token usage in API calls
headers: {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Accept': 'application/json',
}
```

### 3. Route Protection

Routes are protected using navigation guards:

```typescript
router.beforeEach(to => {
  if (to.meta.public) return
  
  const isLoggedIn = !!(localStorage.getItem('accessToken'))
  
  if (to.meta.unauthenticatedOnly && isLoggedIn) 
    return '/'
    
  if (!canNavigate(to)) {
    return isLoggedIn 
      ? { name: 'not-authorized' }
      : { name: 'login', query: { to: to.path } }
  }
})
```

### 4. Permission Checking

```typescript
// In components
const ability = useAbility()

// Check permissions
if (ability.can('create', 'manuscripts')) {
  // Allow manuscript creation
}

// In navigation
{
  title: 'Import Scrivener',
  to: 'scrivener-import',
  action: 'create',
  subject: 'manuscripts',
}
```

## Best Practices

1. **Permission Definition**
   - Define permissions at the subject level
   - Use specific actions rather than 'manage' when possible
   - Document all permission requirements

2. **Token Security**
   - Never store tokens in cookies
   - Use localStorage for token storage
   - Include token in all API requests
   - Handle token expiration gracefully

3. **Route Protection**
   - Always define meta requirements for routes
   - Use public routes for unauthenticated access
   - Implement proper redirects for unauthorized access

4. **Error Handling**
   - Handle 401/403 responses consistently
   - Clear auth data on authentication failures
   - Redirect to login when necessary

## Adding New Permissions

To add new permissions:

1. Update the Subjects type in `ability.ts`:
```typescript
export type Subjects = 
  | 'manuscripts' 
  | 'projects' 
  | 'admin' 
  | 'messages' 
  | 'new-subject'  // Add new subject
  | 'all'
```

2. Define permissions in the backend:
```php
// In User model or Role seeder
$permissions = [
    ['action' => 'create', 'subject' => 'new-subject'],
    ['action' => 'read', 'subject' => 'new-subject'],
    // etc.
];
```

3. Update navigation guards:
```typescript
// In route meta
{
  meta: {
    action: 'create',
    subject: 'new-subject'
  }
}
```

## Common Issues and Solutions

1. **401 Unauthorized**
   - Check token presence in localStorage
   - Verify token format in Authorization header
   - Ensure backend token validation

2. **403 Forbidden**
   - Verify user permissions in abilityRules
   - Check subject/action combination
   - Review backend permission definitions

3. **Token Expiration**
   - Implement token refresh if needed
   - Handle 401 responses consistently
   - Clear auth data and redirect to login

## Security Considerations

1. **Token Security**
   - Tokens are stored in localStorage
   - All API requests include Authorization header
   - Tokens are validated on every request

2. **Permission Granularity**
   - Permissions are defined at subject level
   - Actions are specific to operations
   - Conditions can be added for fine-grained control

3. **Route Protection**
   - All routes require authentication by default
   - Public routes must be explicitly marked
   - Navigation guards enforce permissions

## Future Improvements

1. **Token Refresh**
   - Implement token refresh mechanism
   - Add refresh token support
   - Handle token expiration gracefully

2. **Permission Management**
   - Add UI for permission management
   - Implement role-based access control
   - Add permission inheritance

3. **Audit Logging**
   - Log permission changes
   - Track access attempts
   - Monitor token usage

## Related Files

- `app/Http/Controllers/AuthController.php`: Backend authentication
- `resources/ts/plugins/casl/ability.ts`: CASL ability definitions
- `resources/ts/utils/api.ts`: API utilities with auth
- `resources/ts/layouts/plugins/casl.ts`: Navigation guards

## Notes

- CASL permissions are checked on both frontend and backend
- Token-based authentication uses Laravel Sanctum
- All API routes are protected by auth:sanctum middleware
- Frontend routes are protected by navigation guards
- Permissions are loaded during login and stored in localStorage 
