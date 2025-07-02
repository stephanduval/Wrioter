import { test, expect } from '@playwright/test';

test.describe('Manuscript Selection Button Debug (No Auth)', () => {
  test('Check browser console output for manuscript button debugging', async ({ page }) => {
    // Collect console messages
    const consoleMessages = [];
    
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push({
        type: msg.type(),
        text: text,
        timestamp: new Date().toISOString()
      });
      
      // Log to test output
      console.log(`[${msg.type().toUpperCase()}] ${text}`);
    });

    // Navigate to the application
    console.log('🚀 Navigating to application...');
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit more for Vue components to render
    await page.waitForTimeout(2000);
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'test-results/debug-page-state.png', fullPage: true });
    
    // Look for the Select Manuscript button
    console.log('🔍 Looking for Select Manuscript button...');
    const selectManuscriptButton = page.locator('text="Select Manuscript"');
    const isVisible = await selectManuscriptButton.isVisible();
    
    console.log(`📍 Select Manuscript button visible: ${isVisible}`);
    
    // Check for debug elements
    const debugElement = page.locator('[data-test-id="custom-menu-item"]');
    const hasDebugElement = await debugElement.isVisible();
    console.log(`🔧 Debug element visible: ${hasDebugElement}`);
    
    if (hasDebugElement) {
      const backgroundColor = await debugElement.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      console.log(`🎨 Debug element background color: ${backgroundColor}`);
    }
    
    // Get all navigation items for comparison
    const navItems = await page.locator('.v-list-item .nav-item-title').allTextContents();
    console.log('📋 All navigation items:', navItems);
    
    // Filter console messages for SELECT MANUSCRIPT
    const manuscriptMessages = consoleMessages.filter(msg => 
      msg.text.includes('SELECT MANUSCRIPT') || 
      msg.text.includes('menu.selectManuscript') ||
      msg.text.includes('Select Manuscript')
    );
    
    console.log('\n=== MANUSCRIPT-RELATED CONSOLE MESSAGES ===');
    manuscriptMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
    });
    
    // Check for permission-related messages
    const permissionMessages = consoleMessages.filter(msg =>
      msg.text.includes('hasPermission') ||
      msg.text.includes('FILTERED OUT') ||
      msg.text.includes('manuscripts')
    );
    
    console.log('\n=== PERMISSION-RELATED CONSOLE MESSAGES ===');
    permissionMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
    });
    
    // Check for template rendering messages
    const templateMessages = consoleMessages.filter(msg =>
      msg.text.includes('TEMPLATE ANALYSIS') ||
      msg.text.includes('Will render branch') ||
      msg.text.includes('CUSTOM ITEM FOUND')
    );
    
    console.log('\n=== TEMPLATE RENDERING CONSOLE MESSAGES ===');
    templateMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
    });
    
    // Try to click the button if it exists
    if (isVisible) {
      console.log('🖱️ Attempting to click Select Manuscript button...');
      
      // Check for click-related messages before clicking
      const beforeClickCount = consoleMessages.length;
      
      await selectManuscriptButton.click();
      
      // Wait for any new console messages
      await page.waitForTimeout(1000);
      
      // Check for new messages after click
      const clickMessages = consoleMessages.slice(beforeClickCount);
      
      console.log('\n=== CLICK-RELATED CONSOLE MESSAGES ===');
      clickMessages.forEach((msg, index) => {
        console.log(`${index + 1}. [${msg.type}] ${msg.text}`);
      });
      
      // Check if drawer appeared
      const drawer = page.locator('.v-navigation-drawer').filter({ hasText: 'Select Manuscript' });
      const drawerVisible = await drawer.isVisible();
      console.log(`📦 Drawer visible after click: ${drawerVisible}`);
    }
    
    // Final summary
    console.log('\n=== DEBUG SUMMARY ===');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Manuscript-related messages: ${manuscriptMessages.length}`);
    console.log(`Permission-related messages: ${permissionMessages.length}`);
    console.log(`Template-related messages: ${templateMessages.length}`);
    console.log(`Select Manuscript button visible: ${isVisible}`);
    console.log(`Debug element visible: ${hasDebugElement}`);
    
    // This test is for debugging purposes, so we don't fail on assertions
    // Just log everything for analysis
    console.log('\n✅ Debug test completed. Check console output above for analysis.');
  });
});