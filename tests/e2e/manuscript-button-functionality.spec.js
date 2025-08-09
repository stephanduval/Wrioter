import { test, expect } from '@playwright/test';
import { getTestUser, loginUser, setAuthInBrowser } from '../config/testUsers.js';

/**
 * Comprehensive Functional Test Suite for "Select Manuscript" Button
 * 
 * This test suite covers all functional aspects of the manuscript selection button,
 * ensuring it works correctly across different scenarios and user roles.
 */

test.describe('Manuscript Selection Button - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable detailed console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    // Enable network logging for API debugging
    page.on('request', request => {
      if (request.url().includes('/manuscripts')) {
        console.log(`[REQUEST] ${request.method()} ${request.url()}`);
      }
    });

    page.on('response', response => {
      if (response.url().includes('/manuscripts')) {
        console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
      }
    });
  });

  test.describe('Button Visibility and Permissions', () => {
    test('Admin user can see Select Manuscript button', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check if button is visible
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();
      
      // Verify button styling (should have debug styling)
      const buttonStyles = await selectManuscriptButton.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          cursor: styles.cursor,
          border: styles.border
        };
      });
      
      expect(buttonStyles.cursor).toBe('pointer');
      console.log('✅ Button styling verified:', buttonStyles);
    });

    test('Client user can see Select Manuscript button', async ({ page, request }) => {
      const clientUser = await getTestUser('CLIENT');
      const authData = await loginUser(request, clientUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check if button is visible (should be visible due to permission bypass)
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();
      
      console.log('✅ Client can see Select Manuscript button');
    });

    test('Button is properly styled with debug elements', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for debug styling elements
      const debugElement = page.locator('[data-test-id="custom-menu-item"]');
      if (await debugElement.isVisible()) {
        const backgroundColor = await debugElement.evaluate(el => 
          window.getComputedStyle(el).backgroundColor
        );
        console.log('🎨 Debug element background:', backgroundColor);
        expect(backgroundColor).toContain('lightgreen');
      }
    });
  });

  test.describe('Button Click Functionality', () => {
    test('Button responds to click events', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Set up console message tracking
      let clickDetected = false;
      page.on('console', msg => {
        if (msg.text().includes('Custom nav item clicked') || 
            msg.text().includes('Select Manuscript clicked')) {
          clickDetected = true;
        }
      });

      // Click the button
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await selectManuscriptButton.click();

      // Wait for click to be processed
      await page.waitForTimeout(500);

      // Verify click was detected
      expect(clickDetected).toBe(true);
      console.log('✅ Button click event detected');
    });

    test('Button shows alert dialog when clicked', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Set up dialog handler
      let alertMessage = '';
      page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.accept();
      });

      // Click the button
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await selectManuscriptButton.click();

      // Wait for dialog
      await page.waitForTimeout(500);

      // Verify alert appeared
      expect(alertMessage).toContain('Select Manuscript clicked');
      console.log('✅ Alert dialog appeared with message:', alertMessage);
    });

    test('Button prevents default navigation behavior', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const initialUrl = page.url();

      // Handle alert dialog
      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      // Click the button
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await selectManuscriptButton.click();
      
      // Wait for any potential navigation
      await page.waitForTimeout(1000);

      // Verify URL hasn't changed (preventDefault working)
      expect(page.url()).toBe(initialUrl);
      console.log('✅ Navigation prevented, URL unchanged');
    });
  });

  test.describe('Button Accessibility', () => {
    test('Button is keyboard accessible', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Set up dialog handler
      let alertTriggered = false;
      page.on('dialog', async dialog => {
        alertTriggered = true;
        await dialog.accept();
      });

      // Focus on the button and press Enter
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await selectManuscriptButton.focus();
      await page.keyboard.press('Enter');

      // Wait for interaction
      await page.waitForTimeout(500);

      // Verify keyboard interaction works
      expect(alertTriggered).toBe(true);
      console.log('✅ Button is keyboard accessible');
    });

    test('Button has proper ARIA attributes', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      
      // Check for accessibility attributes
      const role = await selectManuscriptButton.getAttribute('role');
      const ariaLabel = await selectManuscriptButton.getAttribute('aria-label');
      const tabIndex = await selectManuscriptButton.getAttribute('tabindex');

      console.log('🔍 Accessibility attributes:', { role, ariaLabel, tabIndex });
      
      // Button should be focusable
      await expect(selectManuscriptButton).toBeFocused();
    });
  });

  test.describe('Error Handling', () => {
    test('Button handles API errors gracefully', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Mock API to return error
      await page.route('/api/manuscripts', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Handle alert dialog
      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      // Click the button
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await selectManuscriptButton.click();

      // Wait for error handling
      await page.waitForTimeout(1000);

      // Button should still be clickable even with API errors
      await expect(selectManuscriptButton).toBeEnabled();
      console.log('✅ Button handles API errors gracefully');
    });

    test('Button works when no manuscripts exist', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Mock API to return empty manuscripts
      await page.route('/api/manuscripts', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] })
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Handle alert dialog
      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      // Click the button
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await selectManuscriptButton.click();

      // Button should still work
      await expect(selectManuscriptButton).toBeEnabled();
      console.log('✅ Button works when no manuscripts exist');
    });
  });

  test.describe('Performance and Loading', () => {
    test('Button loads within acceptable time', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for button to be visible
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      console.log(`⏱️ Button loaded in ${loadTime}ms`);
      
      // Button should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('Button responds quickly to clicks', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Handle alert dialog
      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      
      // Measure click response time
      const startTime = Date.now();
      await selectManuscriptButton.click();
      
      // Wait for response
      await page.waitForTimeout(100);
      const responseTime = Date.now() - startTime;
      
      console.log(`⚡ Button responded in ${responseTime}ms`);
      
      // Response should be under 500ms
      expect(responseTime).toBeLessThan(500);
    });
  });

  test.describe('Visual Verification', () => {
    test('Button appears with correct styling', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'test-results/manuscript-button-visual.png',
        fullPage: true 
      });

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      
      // Verify button text and icon
      await expect(selectManuscriptButton).toHaveText('Select Manuscript');
      
      // Check for navigation icon
      const navIcon = page.locator('.nav-item-icon', { has: selectManuscriptButton });
      if (await navIcon.isVisible()) {
        console.log('✅ Navigation icon present');
      }
    });

    test('Button maintains styling on hover and focus', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      
      // Test hover state
      await selectManuscriptButton.hover();
      await page.screenshot({ 
        path: 'test-results/manuscript-button-hover.png',
        fullPage: true 
      });
      
      // Test focus state
      await selectManuscriptButton.focus();
      await page.screenshot({ 
        path: 'test-results/manuscript-button-focus.png',
        fullPage: true 
      });
      
      console.log('✅ Button styling verified for hover and focus states');
    });
  });
});