import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Helper functions for manuscript testing
 */

// Load test data from fixtures
const testData = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'tests/fixtures/manuscript-data.json'),
    'utf8'
  )
);

export class ManuscriptTestHelpers {
  constructor(page, request) {
    this.page = page;
    this.request = request;
  }

  /**
   * Get test data for manuscripts
   */
  static getTestData() {
    return testData;
  }

  /**
   * Get specific manuscript by ID
   */
  static getManuscriptById(id) {
    return testData.manuscripts.find(m => m.id === id);
  }

  /**
   * Get manuscripts by user ID
   */
  static getManuscriptsByUserId(userId) {
    return testData.manuscripts.filter(m => m.user_id === userId);
  }

  /**
   * Get manuscripts by type
   */
  static getManuscriptsByType(type) {
    return testData.manuscripts.filter(m => m.manuscript_type === type);
  }

  /**
   * Get test user by role
   */
  static getTestUserByRole(role) {
    return testData.users.find(u => u.role === role);
  }

  /**
   * Get API response template
   */
  static getApiResponse(responseType) {
    return testData.api_responses[responseType];
  }

  /**
   * Get test scenario
   */
  static getTestScenario(scenarioName) {
    return testData.test_scenarios[scenarioName];
  }

  /**
   * Wait for the Select Manuscript button to be visible
   */
  async waitForSelectManuscriptButton(timeout = 5000) {
    const button = this.page.locator('text="Select Manuscript"').first();
    await expect(button).toBeVisible({ timeout });
    return button;
  }

  /**
   * Click the Select Manuscript button
   */
  async clickSelectManuscriptButton() {
    const button = await this.waitForSelectManuscriptButton();
    await button.click();
    return button;
  }

  /**
   * Wait for and handle alert dialog
   */
  async handleAlertDialog(expectedMessage = null) {
    return new Promise((resolve) => {
      this.page.on('dialog', async (dialog) => {
        const message = dialog.message();
        if (expectedMessage) {
          expect(message).toContain(expectedMessage);
        }
        await dialog.accept();
        resolve(message);
      });
    });
  }

  /**
   * Check if button has custom styling
   */
  async verifyButtonStyling() {
    const button = await this.waitForSelectManuscriptButton();
    
    // Check for debug styling
    const style = await button.getAttribute('style');
    const computedStyle = await button.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        cursor: styles.cursor,
        backgroundColor: styles.backgroundColor,
        border: styles.border
      };
    });

    return {
      hasInlineStyles: style && style.includes('lightgreen'),
      computedStyles: computedStyle
    };
  }

  /**
   * Mock API responses
   */
  async mockManuscriptApi(responseType = 'manuscripts_list_success') {
    const response = ManuscriptTestHelpers.getApiResponse(responseType);
    
    await this.page.route('/api/manuscripts', route => {
      route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: JSON.stringify(response.data || response.error)
      });
    });
  }

  /**
   * Mock API with custom data
   */
  async mockManuscriptApiWithData(manuscripts) {
    await this.page.route('/api/manuscripts', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: manuscripts })
      });
    });
  }

  /**
   * Mock API with delay
   */
  async mockSlowManuscriptApi(delay = 3000) {
    await this.page.route('/api/manuscripts', async route => {
      await new Promise(resolve => setTimeout(resolve, delay));
      const response = ManuscriptTestHelpers.getApiResponse('manuscripts_list_success');
      route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: JSON.stringify(response.data)
      });
    });
  }

  /**
   * Mock API with error
   */
  async mockManuscriptApiError(status = 500, message = 'Internal Server Error') {
    await this.page.route('/api/manuscripts', route => {
      route.fulfill({
        status: status,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message } })
      });
    });
  }

  /**
   * Mock API with network error
   */
  async mockManuscriptApiNetworkError() {
    await this.page.route('/api/manuscripts', route => {
      route.abort('internetdisconnected');
    });
  }

  /**
   * Wait for manuscript drawer to open
   */
  async waitForManuscriptDrawer(timeout = 5000) {
    const drawer = this.page.locator('.v-navigation-drawer').filter({ hasText: 'Select Manuscript' });
    await expect(drawer).toBeVisible({ timeout });
    return drawer;
  }

  /**
   * Wait for manuscript drawer to close
   */
  async waitForManuscriptDrawerClose(timeout = 3000) {
    const drawer = this.page.locator('.v-navigation-drawer').filter({ hasText: 'Select Manuscript' });
    await expect(drawer).not.toBeVisible({ timeout });
  }

  /**
   * Select manuscript from drawer
   */
  async selectManuscriptFromDrawer(manuscriptTitle) {
    const drawer = await this.waitForManuscriptDrawer();
    
    // Find manuscript item
    const manuscriptItem = drawer.locator('.v-list-item').filter({ hasText: manuscriptTitle });
    await manuscriptItem.click();
    
    // Click select button
    const selectButton = drawer.locator('text="Select"');
    await selectButton.click();
  }

  /**
   * Cancel manuscript selection
   */
  async cancelManuscriptSelection() {
    const drawer = await this.waitForManuscriptDrawer();
    const cancelButton = drawer.locator('text="Cancel"');
    await cancelButton.click();
  }

  /**
   * Check console for specific messages
   */
  async checkConsoleMessages(expectedMessages) {
    const consoleMessages = [];
    
    this.page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // Wait for messages to accumulate
    await this.page.waitForTimeout(1000);

    for (const expectedMessage of expectedMessages) {
      const found = consoleMessages.some(msg => msg.includes(expectedMessage));
      expect(found).toBe(true);
    }

    return consoleMessages;
  }

  /**
   * Monitor network requests
   */
  async monitorNetworkRequests() {
    const requests = [];
    const responses = [];

    this.page.on('request', request => {
      if (request.url().includes('/api/manuscripts')) {
        requests.push({
          method: request.method(),
          url: request.url(),
          headers: request.headers(),
          timestamp: Date.now()
        });
      }
    });

    this.page.on('response', response => {
      if (response.url().includes('/api/manuscripts')) {
        responses.push({
          status: response.status(),
          url: response.url(),
          headers: response.headers(),
          timestamp: Date.now()
        });
      }
    });

    return { requests, responses };
  }

  /**
   * Check Pinia store state
   */
  async checkManuscriptStoreState() {
    return await this.page.evaluate(() => {
      const app = document.querySelector('#app').__vue_app__;
      if (app && app.config.globalProperties.$pinia) {
        const pinia = app.config.globalProperties.$pinia;
        const manuscriptStore = pinia.state.value.manuscript;
        return {
          hasStore: !!manuscriptStore,
          manuscripts: manuscriptStore?.manuscripts || [],
          selectedManuscriptId: manuscriptStore?.selectedManuscriptId,
          loading: manuscriptStore?.loading,
          error: manuscriptStore?.error
        };
      }
      return { hasStore: false };
    });
  }

  /**
   * Generate test manuscripts
   */
  static generateTestManuscripts(count = 10) {
    const manuscripts = [];
    
    for (let i = 1; i <= count; i++) {
      manuscripts.push({
        id: i,
        title: `Test Manuscript ${i}`,
        manuscript_type: i % 2 === 0 ? 'scrivener' : 'standard',
        description: `Description for test manuscript ${i}`,
        user_id: 1,
        created_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        updated_at: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString()
      });
    }
    
    return manuscripts;
  }

  /**
   * Create test manuscript via API
   */
  async createTestManuscript(authData, manuscriptData = {}) {
    const defaultData = {
      title: 'Test Manuscript',
      manuscript_type: 'standard',
      description: 'Test description'
    };

    const data = { ...defaultData, ...manuscriptData };

    return await this.request.post('/api/manuscripts', {
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json'
      },
      data: data
    });
  }

  /**
   * Delete test manuscript via API
   */
  async deleteTestManuscript(authData, manuscriptId) {
    return await this.request.delete(`/api/manuscripts/${manuscriptId}`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`
      }
    });
  }

  /**
   * Take screenshot with timestamp
   */
  async takeTimestampedScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results/${name}-${timestamp}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    return filename;
  }

  /**
   * Measure performance
   */
  async measurePerformance(action, actionName = 'action') {
    const startTime = Date.now();
    await action();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ ${actionName} took ${duration}ms`);
    return duration;
  }

  /**
   * Check accessibility
   */
  async checkAccessibility() {
    const accessibilityTree = await this.page.accessibility.snapshot();
    
    // Find manuscript-related elements
    const findInTree = (node, searchText) => {
      if (node.name && node.name.includes(searchText)) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findInTree(child, searchText);
          if (found) return found;
        }
      }
      return null;
    };

    const manuscriptButton = findInTree(accessibilityTree, 'Select Manuscript');
    
    return {
      tree: accessibilityTree,
      manuscriptButton: manuscriptButton,
      hasManuscriptButton: !!manuscriptButton
    };
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    // Tab to the button
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    
    // Find focused element
    const focusedElement = await this.page.evaluate(() => {
      const active = document.activeElement;
      return {
        tagName: active.tagName,
        textContent: active.textContent,
        className: active.className
      };
    });

    // Press Enter to activate
    await this.page.keyboard.press('Enter');
    
    return focusedElement;
  }

  /**
   * Test different viewport sizes
   */
  async testViewportSizes(sizes = [
    { width: 320, height: 568, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' }
  ]) {
    const results = [];
    
    for (const size of sizes) {
      await this.page.setViewportSize(size);
      
      const button = await this.waitForSelectManuscriptButton();
      const isVisible = await button.isVisible();
      
      if (isVisible) {
        await this.takeTimestampedScreenshot(`viewport-${size.name}`);
      }
      
      results.push({
        ...size,
        buttonVisible: isVisible
      });
    }
    
    return results;
  }

  /**
   * Cleanup test data
   */
  async cleanup() {
    // Close any open dialogs
    this.page.on('dialog', async dialog => {
      await dialog.dismiss();
    });

    // Clear local storage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Reset API routes
    await this.page.unroute('/api/manuscripts');
  }
}

/**
 * Test data validation helpers
 */
export class TestDataValidator {
  static validateManuscript(manuscript) {
    const required = ['id', 'title', 'manuscript_type', 'user_id'];
    
    for (const field of required) {
      if (!manuscript[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (!['standard', 'scrivener'].includes(manuscript.manuscript_type)) {
      throw new Error(`Invalid manuscript_type: ${manuscript.manuscript_type}`);
    }
    
    return true;
  }

  static validateUser(user) {
    const required = ['id', 'email', 'role'];
    
    for (const field of required) {
      if (!user[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (!['admin', 'client'].includes(user.role)) {
      throw new Error(`Invalid role: ${user.role}`);
    }
    
    return true;
  }

  static validateApiResponse(response, expectedStatus) {
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    
    return true;
  }
}

/**
 * Performance testing helpers
 */
export class PerformanceTestHelpers {
  constructor(page) {
    this.page = page;
    this.metrics = [];
  }

  async startMetrics() {
    await this.page.evaluate(() => {
      window.performanceMetrics = {
        navigationStart: performance.timing.navigationStart,
        loadEventEnd: performance.timing.loadEventEnd,
        domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd
      };
    });
  }

  async measureButtonResponse() {
    const startTime = await this.page.evaluate(() => performance.now());
    
    // Click button
    const button = this.page.locator('text="Select Manuscript"').first();
    await button.click();
    
    // Wait for response
    await this.page.waitForTimeout(100);
    
    const endTime = await this.page.evaluate(() => performance.now());
    const responseTime = endTime - startTime;
    
    this.metrics.push({
      name: 'button_response_time',
      value: responseTime,
      timestamp: Date.now()
    });
    
    return responseTime;
  }

  async measureMemoryUsage() {
    const memoryInfo = await this.page.evaluate(() => {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });

    if (memoryInfo) {
      this.metrics.push({
        name: 'memory_usage',
        value: memoryInfo,
        timestamp: Date.now()
      });
    }

    return memoryInfo;
  }

  getMetrics() {
    return this.metrics;
  }
}

export default ManuscriptTestHelpers;