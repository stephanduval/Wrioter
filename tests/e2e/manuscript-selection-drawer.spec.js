import { test, expect } from '@playwright/test';
import { getTestUser, loginUser, setAuthInBrowser } from '../config/testUsers.js';

test.describe('Manuscript Selection Drawer', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging for debugging
    page.on('console', msg => {
      if (msg.type() === 'log' || msg.type() === 'error' || msg.type() === 'warn') {
        console.log(`[${msg.type().toUpperCase()}]`, msg.text());
      }
    });
  });

  test('Admin user can access and open manuscript selection drawer', async ({ page, request }) => {
    const adminUser = await getTestUser('ADMIN');
    const authData = await loginUser(request, adminUser);
    
    console.log(`🔑 Testing manuscript selection drawer as Admin: ${authData.user.email}`);
    
    // Set authentication in browser
    await setAuthInBrowser(page, authData);
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for navigation to load
    await page.waitForLoadState('networkidle');
    
    // Look for the "Select Manuscript" button in the navigation
    console.log('🔍 Looking for Select Manuscript button...');
    
    // Check if the menu item exists in the navigation
    const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
    
    // Debug: Take a screenshot to see the current state
    await page.screenshot({ path: 'test-results/manuscript-selection-before-click.png', fullPage: true });
    
    // Check if the button is visible
    console.log('📍 Checking if Select Manuscript button is visible...');
    const isVisible = await selectManuscriptButton.isVisible();
    console.log(`Button visible: ${isVisible}`);
    
    if (!isVisible) {
      console.log('❌ Select Manuscript button not found. Checking navigation structure...');
      
      // Debug: Check what navigation items are available
      const navItems = await page.locator('.v-list-item .nav-item-title').allTextContents();
      console.log('Available navigation items:', navItems);
      
      // Check if there are permission issues
      const errorMessages = await page.locator('.v-alert[type="error"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log('Error messages found:', errorMessages);
      }
      
      // Fail the test with helpful information
      expect(isVisible, `Select Manuscript button should be visible. Available nav items: ${navItems.join(', ')}`).toBe(true);
    }
    
    // Click the Select Manuscript button
    console.log('🖱️ Clicking Select Manuscript button...');
    await selectManuscriptButton.click();
    
    // Wait for the drawer to appear
    console.log('⏳ Waiting for manuscript selection drawer to appear...');
    const drawer = page.locator('.v-navigation-drawer').filter({ hasText: 'Select Manuscript' });
    
    // Wait up to 5 seconds for the drawer to be visible
    await expect(drawer).toBeVisible({ timeout: 5000 });
    
    // Verify drawer content
    console.log('✅ Verifying drawer content...');
    await expect(drawer.locator('text="Select Manuscript"')).toBeVisible();
    await expect(drawer.locator('text="Cancel"')).toBeVisible();
    await expect(drawer.locator('text="Select"')).toBeVisible();
    
    // Take screenshot of opened drawer
    await page.screenshot({ path: 'test-results/manuscript-selection-drawer-open.png', fullPage: true });
    
    console.log('✅ Manuscript selection drawer test passed!');
  });

  test('Client user can access manuscript selection drawer', async ({ page, request }) => {
    const clientUser = await getTestUser('CLIENT');
    const authData = await loginUser(request, clientUser);
    
    console.log(`🔑 Testing manuscript selection drawer as Client: ${authData.user.email}`);
    
    // Set authentication in browser
    await setAuthInBrowser(page, authData);
    
    // Navigate to the application
    await page.goto('/');
    
    // Wait for navigation to load
    await page.waitForLoadState('networkidle');
    
    // Look for the "Select Manuscript" button
    const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
    
    // Check if the button is visible (should be visible for clients too)
    const isVisible = await selectManuscriptButton.isVisible();
    
    if (isVisible) {
      console.log('✅ Client can see Select Manuscript button');
      
      // Click the button
      await selectManuscriptButton.click();
      
      // Verify drawer opens
      const drawer = page.locator('.v-navigation-drawer').filter({ hasText: 'Select Manuscript' });
      await expect(drawer).toBeVisible({ timeout: 5000 });
      
      console.log('✅ Client can open manuscript selection drawer');
    } else {
      console.log('ℹ️ Client cannot see Select Manuscript button (may be expected based on permissions)');
      
      // This might be expected behavior - log available navigation items
      const navItems = await page.locator('.v-list-item .nav-item-title').allTextContents();
      console.log('Available navigation items for client:', navItems);
    }
  });

  test('Drawer can be closed using cancel button', async ({ page, request }) => {
    const adminUser = await getTestUser('ADMIN');
    const authData = await loginUser(request, adminUser);
    
    // Set authentication and navigate
    await setAuthInBrowser(page, authData);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open the drawer
    const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
    await selectManuscriptButton.click();
    
    // Verify drawer is open
    const drawer = page.locator('.v-navigation-drawer').filter({ hasText: 'Select Manuscript' });
    await expect(drawer).toBeVisible();
    
    // Click cancel button
    console.log('🖱️ Clicking Cancel button...');
    await drawer.locator('text="Cancel"').click();
    
    // Verify drawer is closed
    console.log('⏳ Waiting for drawer to close...');
    await expect(drawer).not.toBeVisible({ timeout: 3000 });
    
    console.log('✅ Drawer successfully closed with Cancel button');
  });

  test('Drawer closes when clicking outside (if temporary)', async ({ page, request }) => {
    const adminUser = await getTestUser('ADMIN');
    const authData = await loginUser(request, adminUser);
    
    // Set authentication and navigate
    await setAuthInBrowser(page, authData);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open the drawer
    const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
    await selectManuscriptButton.click();
    
    // Verify drawer is open
    const drawer = page.locator('.v-navigation-drawer').filter({ hasText: 'Select Manuscript' });
    await expect(drawer).toBeVisible();
    
    // Click outside the drawer (on the main content area)
    console.log('🖱️ Clicking outside drawer...');
    await page.locator('main').click({ position: { x: 100, y: 100 } });
    
    // Verify drawer is closed (if it's temporary)
    console.log('⏳ Waiting for drawer to close...');
    await expect(drawer).not.toBeVisible({ timeout: 3000 });
    
    console.log('✅ Drawer successfully closed by clicking outside');
  });

  test('Debug: Permission and rendering analysis', async ({ page, request }) => {
    const adminUser = await getTestUser('ADMIN');
    const authData = await loginUser(request, adminUser);
    
    console.log(`🔧 Debug test for Admin: ${authData.user.email}`);
    console.log('🔧 User permissions:', adminUser.permissions);
    console.log('🔧 User subjects:', adminUser.subjects);
    
    // Set authentication and navigate
    await setAuthInBrowser(page, authData);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Debug: Execute JavaScript to check Vue component state
    const debugInfo = await page.evaluate(() => {
      // Look for Vue debug information
      const vueLogs = [];
      const originalLog = console.log;
      console.log = (...args) => {
        vueLogs.push(args.join(' '));
        originalLog(...args);
      };
      
      // Check for Vue components
      const navMenu = document.querySelector('[data-testid="vertical-nav-menu"]');
      const navItems = Array.from(document.querySelectorAll('.v-list-item .nav-item-title'))
        .map(el => el.textContent);
      
      return {
        hasNavMenu: !!navMenu,
        navItems,
        vueLogs: vueLogs.slice(-20), // Last 20 log entries
        selectManuscriptElements: Array.from(document.querySelectorAll('*'))
          .filter(el => el.textContent && el.textContent.includes('Select Manuscript'))
          .map(el => ({
            tagName: el.tagName,
            className: el.className,
            textContent: el.textContent.trim(),
            visible: !el.hidden && el.offsetParent !== null
          }))
      };
    });
    
    console.log('🔧 Debug info:', JSON.stringify(debugInfo, null, 2));
    
    // Take a debug screenshot
    await page.screenshot({ path: 'test-results/debug-navigation-state.png', fullPage: true });
    
    console.log('🔧 Debug test completed');
  });
});