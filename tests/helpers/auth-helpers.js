// Playwright helper functions for authentication and common operations

/**
 * Login helper function
 * @param {import('@playwright/test').Page} page
 * @param {string} email
 * @param {string} password
 */
export async function login(page, email = 'test@example.com', password = 'password') {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(url => !url.includes('/login'));
}

/**
 * Upload file helper function
 * @param {import('@playwright/test').Page} page
 * @param {string} selector
 * @param {string} filePath
 */
export async function uploadFile(page, selector, filePath) {
  await page.locator(selector).setInputFiles(filePath);
}

/**
 * Wait for API request to complete
 * @param {import('@playwright/test').Page} page
 * @param {string} url
 * @param {string} method
 * @returns {Promise<import('@playwright/test').Response>}
 */
export async function waitForAPIRequest(page, url, method = 'POST') {
  return page.waitForResponse(response => 
    response.url().includes(url) && response.request().method() === method
  );
}

/**
 * Wait for import status polling (simplified version)
 * @param {import('@playwright/test').Page} page
 * @param {string} expectedStatus
 * @param {number} timeout
 */
export async function waitForImportStatus(page, expectedStatus, timeout = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const statusResponse = await page.request.get('/api/scrivener/imports', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (statusResponse.status() === 200) {
      const imports = await statusResponse.json();
      const latestImport = imports[0];
      
      if (latestImport && latestImport.status === expectedStatus) {
        return;
      } else if (latestImport && latestImport.status === 'failed') {
        throw new Error(`Import failed: ${latestImport.error_message}`);
      }
    }
    
    await page.waitForTimeout(2000);
  }
  
  throw new Error(`Import did not reach ${expectedStatus} status within ${timeout}ms`);
}

/**
 * Get CSRF token (if needed)
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string>}
 */
export async function getCsrfToken(page) {
  return page.locator('meta[name="csrf-token"]').getAttribute('content');
}

/**
 * Set authentication token in localStorage
 * @param {import('@playwright/test').Page} page
 * @param {string} token
 */
export async function setAuthToken(page, token) {
  await page.addInitScript((authToken) => {
    window.localStorage.setItem('accessToken', authToken);
  }, token);
}

/**
 * Quick authentication for testing
 * @param {import('@playwright/test').Page} page
 */
export async function quickAuth(page) {
  await page.addInitScript(() => {
    // Method 1: Set localStorage token
    window.localStorage.setItem('accessToken', 'cypress-test-token');
    
    // Method 2: Set session data if available
    if (window.sessionStorage) {
      window.sessionStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@playwright.com'
      }));
    }
  });
  
  // Method 3: Set cookies
  await page.context().addCookies([{
    name: 'playwright_auth',
    value: 'true',
    domain: new URL(page.url()).hostname,
    path: '/'
  }]);
}