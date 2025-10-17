/**
 * Secure Credential Loader
 * 
 * This module provides secure loading of test credentials from environment variables
 * or local configuration files, with proper fallbacks and validation.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load credentials from environment variables
 */
function loadFromEnvironment() {
  return {
    ADMIN: {
      email: process.env.TEST_ADMIN_EMAIL,
      password: process.env.TEST_ADMIN_PASSWORD
    },
    ADMIN_SECONDARY: {
      email: process.env.TEST_ADMIN_SECONDARY_EMAIL,
      password: process.env.TEST_ADMIN_SECONDARY_PASSWORD
    },
    CLIENT: {
      email: process.env.TEST_CLIENT_EMAIL,
      password: process.env.TEST_CLIENT_PASSWORD
    },
    CLIENT_SECONDARY: {
      email: process.env.TEST_CLIENT_SECONDARY_EMAIL,
      password: process.env.TEST_CLIENT_SECONDARY_PASSWORD
    }
  };
}

/**
 * Load credentials from local configuration file
 */
async function loadFromLocalFile() {
  const localCredentialsPath = join(__dirname, 'credentials.local.js');
  
  if (existsSync(localCredentialsPath)) {
    try {
      const { TEST_CREDENTIALS } = await import('./credentials.local.js');
      return TEST_CREDENTIALS;
    } catch (error) {
      console.warn('Failed to load local credentials file:', error.message);
      return null;
    }
  }
  
  return null;
}

/**
 * Load .env.testing.local file if it exists
 */
function loadDotEnvLocal() {
  const envPath = join(process.cwd(), '.env.testing.local');
  
  if (existsSync(envPath)) {
    try {
      const envContent = readFileSync(envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
          }
        }
      });
      
      // Set environment variables
      Object.entries(envVars).forEach(([key, value]) => {
        if (!process.env[key]) {
          process.env[key] = value;
        }
      });
      
      return true;
    } catch (error) {
      console.warn('Failed to load .env.testing.local:', error.message);
      return false;
    }
  }
  
  return false;
}

/**
 * Validate that all required credentials are present
 */
function validateCredentials(credentials) {
  const required = ['ADMIN', 'CLIENT'];
  const errors = [];
  
  for (const role of required) {
    if (!credentials[role]) {
      errors.push(`Missing credentials for role: ${role}`);
      continue;
    }
    
    if (!credentials[role].email) {
      errors.push(`Missing email for role: ${role}`);
    }
    
    if (!credentials[role].password) {
      errors.push(`Missing password for role: ${role}`);
    }
  }
  
  return errors;
}

/**
 * Get test credentials with fallback hierarchy:
 * 1. Local credentials file (credentials.local.js)
 * 2. Environment variables (from .env.testing.local or system)
 * 3. Error if no valid credentials found
 */
export async function getTestCredentials() {
  // First, try to load .env.testing.local
  loadDotEnvLocal();
  
  // Try local file first (highest priority)
  let credentials = await loadFromLocalFile();
  
  // Fall back to environment variables
  if (!credentials) {
    credentials = loadFromEnvironment();
  }
  
  // Validate credentials
  const errors = validateCredentials(credentials);
  if (errors.length > 0) {
    const setupInstructions = `
Test credentials not configured properly. Please:

1. Copy .env.testing.example to .env.testing.local and update with real credentials
   OR
2. Copy tests/config/credentials.example.js to tests/config/credentials.local.js and update
   OR  
3. Set environment variables: TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, etc.

Errors found:
${errors.map(err => `  - ${err}`).join('\n')}

See tests/TESTING_GUIDE.md for setup instructions.
`;
    
    throw new Error(setupInstructions);
  }
  
  return credentials;
}

/**
 * Check if test credentials are available without throwing
 */
export async function areCredentialsAvailable() {
  try {
    await getTestCredentials();
    return true;
  } catch {
    return false;
  }
}

export default getTestCredentials;