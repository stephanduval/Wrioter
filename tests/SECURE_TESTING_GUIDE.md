# Secure E2E Testing Guide

## 🔐 Security-First Approach

This project uses a **secure credential management system** for E2E tests. **No passwords are stored in git** - they are loaded from environment variables or local configuration files that are gitignored.

## ⚡ Quick Setup

### 1. Set Up Test Credentials

**Choose one method:**

#### Method A: Environment File (Recommended)
```bash
# Copy the example
cp .env.testing.example .env.testing.local

# Edit with real credentials (this file is gitignored)
nano .env.testing.local
```

#### Method B: Local Credentials File
```bash
# Copy the example  
cp tests/config/credentials.example.js tests/config/credentials.local.js

# Edit with real credentials (this file is gitignored)
nano tests/config/credentials.local.js
```

#### Method C: Environment Variables
```bash
export TEST_ADMIN_EMAIL=info@freynet-gagne.com
export TEST_ADMIN_PASSWORD=your_password
export TEST_CLIENT_EMAIL=sophie@freynet-gagne.com  
export TEST_CLIENT_PASSWORD=your_password
```

### 2. Run Tests

```bash
# Run only failed tests (saves time!)
yarn playwright:test:failed

# Run specific test categories
yarn playwright:test:permissions
yarn playwright:test:auth
```

## 🏗️ Architecture 

### Secure Credential Loading

```javascript
// OLD (Insecure - passwords in git)
const TEST_USERS = {
  ADMIN: { email: 'admin@example.com', password: 'password123' }
}

// NEW (Secure - credentials from environment)
import { getTestUser } from '../config/testUsers.js';
const adminUser = await getTestUser('ADMIN'); // Loads from secure source
```

### Fallback Hierarchy

1. **Local credentials file** (`credentials.local.js`) - Highest priority
2. **Environment variables** (from `.env.testing.local` or system)
3. **Error with setup instructions** - If no valid credentials found

### Usage in Tests

```javascript
import { getTestUser, loginUser } from '../config/testUsers.js';

test('authenticated test', async ({ request }) => {
  // Load user securely
  const adminUser = await getTestUser('ADMIN');
  
  // Login with real credentials
  const authData = await loginUser(request, adminUser);
  
  // Use authenticated request
  const response = await request.get('/api/protected', {
    headers: { 'Authorization': `Bearer ${authData.token}` }
  });
});
```

## 🧪 Available Test Users

### Admin Users
- **Primary Admin**: `info@freynet-gagne.com`
  - Full admin access to all features
  - Can create, read, update, delete, and manage all resources

- **Secondary Admin**: `admin@admin.com`  
  - Same permissions as primary admin
  - Useful for testing admin-to-admin interactions

### Client Users  
- **Primary Client**: `sophie@freynet-gagne.com`
  - Standard client permissions
  - Limited access to own resources

- **Secondary Client**: `client@client.com`
  - Same permissions as primary client
  - Useful for testing client-to-client interactions

## 🚀 Test Commands

### Time-Saving Commands
```bash
# Run only tests that failed in the last run
yarn playwright:test:failed

# Run failed tests with retries
yarn playwright:test:retries
```

### Specific Test Categories
```bash
# Run all Scrivener import tests
yarn playwright:test:scrivener

# Run user permission tests
yarn playwright:test:permissions

# Run authentication tests  
yarn playwright:test:auth
```

### Debugging & Development
```bash
# Run tests with visual debugging
yarn playwright:test:debug

# Run tests in headed mode (see browser)
yarn playwright:test:headed

# Open test UI for interactive testing
yarn playwright:test:ui

# View test reports
yarn playwright:test:report
```

## 🔒 Security Features

### ✅ What's Secure Now:
- **No passwords in git repository**
- **Environment-based credential loading**
- **Gitignored credential files**  
- **Fallback hierarchy with clear error messages**
- **Real Laravel authentication tokens**

### ❌ Before (Insecure):
- Hardcoded `password123` in multiple files
- Credentials committed to git
- No credential rotation capability
- Same credentials for all developers

### 🛡️ Security Benefits:
- **Easy credential rotation** - Change `.env.testing.local` 
- **Per-developer credentials** - Each dev can use different passwords
- **No secrets in git history** - Credentials never committed
- **Clear separation** - Development vs production credentials
- **Audit-friendly** - Credential access is traceable

## 🔧 Development Workflow

### For New Developers:
1. Clone repository
2. Copy credential example files
3. Get credentials from team lead (not from git!)
4. Update local configuration
5. Run tests

### For Credential Updates:
1. Update `.env.testing.local` or `credentials.local.js`
2. No git commits needed
3. Tests automatically use new credentials

### For Production:
- Use different credentials in production environment
- Never use test credentials in production
- Environment variables managed by deployment system

## 🧪 Test Structure

### Current Status:
- **48+ tests passing** with secure authentication
- **API functionality** fully tested with real tokens
- **Permission validation** across user roles
- **Data isolation** between users confirmed

### Test Categories:
- **Authentication Tests**: Login/logout functionality
- **Permission Tests**: Role-based access control
- **API Tests**: Backend functionality
- **UI Tests**: Frontend behavior (some still WIP)

## 📚 Files Structure

```
tests/
├── config/
│   ├── credentialLoader.js      # Secure credential loading logic
│   ├── testUsers.js             # User configuration (no passwords)
│   ├── credentials.example.js   # Template (in git)
│   └── credentials.local.js     # Real credentials (gitignored)
├── e2e/
│   ├── scrivener-import-permissions.spec.js
│   ├── scrivener-import-with-auth.spec.js
│   └── ...
.env.testing.example             # Template (in git)  
.env.testing.local              # Real credentials (gitignored)
```

## 🚨 Important Notes

### Never Commit:
- `.env.testing.local`
- `tests/config/credentials.local.js`
- Any file with real passwords

### Always Commit:
- `.env.testing.example`
- `tests/config/credentials.example.js`
- Documentation and guides

### If Tests Fail with "Credentials not configured":
1. Check that you've created `.env.testing.local` or `credentials.local.js`
2. Verify credentials are correct
3. Ensure file permissions allow reading
4. Check for typos in email/password

This secure approach ensures your test credentials are never exposed while maintaining easy development workflows!