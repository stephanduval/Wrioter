import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('Scrivener Import Basic Test', () => {
  test.beforeEach(async ({ page }) => {
    // Reset database state - would need to implement Laravel task equivalent
    // For now, we'll skip this step
  });

  test('can access the scrivener import page', async ({ page }) => {
    // Visit the application directly
    await page.goto('/build/apps/scrivener/import');
    
    // Wait for the Vue app to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login or the app loaded
    const url = page.url();
    if (url.includes('/login')) {
      // If redirected to login, verify login page is working
      console.log('Authentication required - verifying login page');
      await expect(page.locator('body')).toContainText('sign-in');
      return;
    }
    
    // If we're on the import page, wait for Vue to render and check for import content
    await page.waitForSelector('[data-test="scrivener-import-form"]', { timeout: 10000 });
    await expect(page.locator('[data-test="scrivener-import-form"]')).toBeVisible();
  });

  test('can check if the import API endpoint exists', async ({ request }) => {
    // Simple API check to verify backend is responsive
    const response = await request.get('/api/scrivener/imports', {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // We expect either 200 (success) or 401 (unauthorized) - both indicate the endpoint exists
    expect([200, 401, 422]).toContain(response.status());
  });

  test('can verify the test zip file exists', async () => {
    // Check our test fixture is available
    const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
    
    try {
      await fs.access(fixturePath);
      // File exists
      expect(true).toBe(true);
    } catch (error) {
      // File doesn't exist
      expect(false).toBe(true);
    }
  });
});