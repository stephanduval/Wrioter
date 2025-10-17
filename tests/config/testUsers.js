/**
 * Test Users Configuration
 * 
 * This file contains predefined test users that match the database seeder.
 * Use these users in E2E tests to test different permission levels and scenarios.
 * 
 * Credentials are loaded securely from environment variables or local config files.
 * See credentialLoader.js for credential management.
 */

import { getTestCredentials } from './credentialLoader.js';

// Cache for loaded credentials
let _cachedCredentials = null;

/**
 * Get test credentials (cached)
 */
async function getCredentials() {
  if (!_cachedCredentials) {
    _cachedCredentials = await getTestCredentials();
  }
  return _cachedCredentials;
}

/**
 * Create test user configuration with secure credentials
 */
async function createTestUsers() {
  const credentials = await getCredentials();
  
  return {
    ADMIN: {
      name: 'Administrator',
      email: credentials.ADMIN.email,
      password: credentials.ADMIN.password,
      role: 'Admin',
      permissions: [
        'create', 'read', 'update', 'delete', 'manage'
      ],
      subjects: ['admin', 'client', 'all', 'projects', 'messages', 'manuscripts'],
      description: 'Full admin access to all features'
    },
    
    ADMIN_SECONDARY: {
      name: 'Admin User',
      email: credentials.ADMIN_SECONDARY?.email || credentials.ADMIN.email,
      password: credentials.ADMIN_SECONDARY?.password || credentials.ADMIN.password,
      role: 'Admin',
      permissions: [
        'create', 'read', 'update', 'delete', 'manage'
      ],
      subjects: ['admin', 'client', 'all', 'projects', 'messages', 'manuscripts'],
      description: 'Secondary admin user for testing admin functionality'
    },
    
    CLIENT: {
      name: 'Sophie',
      email: credentials.CLIENT.email,
      password: credentials.CLIENT.password,
      role: 'Client',
      permissions: [
        'read', 'update' // Clients typically have limited permissions
      ],
      subjects: ['client', 'projects', 'messages', 'manuscripts'],
      description: 'Standard client user with limited permissions'
    },
    
    CLIENT_SECONDARY: {
      name: 'Client User',
      email: credentials.CLIENT_SECONDARY?.email || credentials.CLIENT.email,
      password: credentials.CLIENT_SECONDARY?.password || credentials.CLIENT.password,
      role: 'Client',
      permissions: [
        'read', 'update'
      ],
      subjects: ['client', 'projects', 'messages', 'manuscripts'],
      description: 'Secondary client user for testing client functionality'
    }
  };
}

// Export async function to get TEST_USERS
export async function getTEST_USERS() {
  return await createTestUsers();
}

// For backward compatibility, export a getter that throws helpful error
export const TEST_USERS = new Proxy({}, {
  get() {
    throw new Error(`
TEST_USERS is now async. Please use:

import { getTEST_USERS } from '../config/testUsers.js';
const TEST_USERS = await getTEST_USERS();

Or use the helper functions like getTestUser() directly.
`);
  }
});

/**
 * Helper function to get user by role
 * @param {string} role - 'admin' or 'client'
 * @returns {Promise<Object>} User object
 */
export async function getUserByRole(role) {
  const testUsers = await getTEST_USERS();
  switch (role.toLowerCase()) {
    case 'admin':
      return testUsers.ADMIN;
    case 'client':
      return testUsers.CLIENT;
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}

/**
 * Helper function to get all users of a specific role
 * @param {string} role - 'admin' or 'client'
 * @returns {Promise<Array>} Array of user objects
 */
export async function getUsersByRole(role) {
  const testUsers = await getTEST_USERS();
  return Object.values(testUsers).filter(user => 
    user.role.toLowerCase() === role.toLowerCase()
  );
}

/**
 * Login helper for Playwright tests
 * @param {Object} request - Playwright request context
 * @param {Object} user - User object from TEST_USERS
 * @returns {Promise<Object>} Login response with token
 */
export async function loginUser(request, user) {
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: user.email,
      password: user.password
    }
  });
  
  if (loginResponse.status() !== 200) {
    throw new Error(`Login failed for user ${user.email}: ${loginResponse.status()}`);
  }
  
  const loginData = await loginResponse.json();
  
  return {
    user: {
      email: loginData.userData.email,
      name: loginData.userData.fullName,
      id: loginData.userData.id,
      role: loginData.userData.role,
      token: loginData.accessToken
    },
    token: loginData.accessToken,
    userData: loginData.userData,
    abilityRules: loginData.abilityRules
  };
}

/**
 * Set authentication in browser localStorage
 * @param {Object} page - Playwright page context
 * @param {Object} authData - Authentication data from loginUser()
 */
export async function setAuthInBrowser(page, authData) {
  await page.addInitScript((auth) => {
    window.localStorage.setItem('accessToken', auth.token);
    window.localStorage.setItem('user', JSON.stringify(auth.userData));
  }, authData);
}

/**
 * Quick helper to get a test user by type
 * @param {string} userType - 'ADMIN', 'CLIENT', 'ADMIN_SECONDARY', 'CLIENT_SECONDARY'
 * @returns {Promise<Object>} User object
 */
export async function getTestUser(userType) {
  const testUsers = await getTEST_USERS();
  if (!testUsers[userType]) {
    throw new Error(`Unknown user type: ${userType}. Available: ${Object.keys(testUsers).join(', ')}`);
  }
  return testUsers[userType];
}

/**
 * Test scenarios for different user combinations
 * 
 * Note: These are descriptive scenarios. Use getTestUser() to get actual user objects.
 */
export const TEST_SCENARIOS = {
  ADMIN_SCRIVENER_IMPORT: {
    userType: 'ADMIN',
    description: 'Admin user testing Scrivener import functionality',
    expectedOutcome: 'Should have full access to import and manage files'
  },
  
  CLIENT_SCRIVENER_IMPORT: {
    userType: 'CLIENT',
    description: 'Client user testing Scrivener import functionality',
    expectedOutcome: 'Should be able to import files but with limited management options'
  },
  
  UNAUTHORIZED_ACCESS: {
    userType: null,
    description: 'Testing unauthorized access to protected features',
    expectedOutcome: 'Should be redirected to login or receive 401 errors'
  }
};

// Export helper function as default
export default getTestUser;