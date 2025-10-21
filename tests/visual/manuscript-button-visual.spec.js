import { test, expect } from '@playwright/test';
import { getTestUser, loginUser, setAuthInBrowser } from '../config/testUsers.js';

/**
 * Visual Testing Suite for Manuscript Selection Button
 * 
 * This suite creates visual baselines and detects visual regressions
 * in the manuscript selection button and related components.
 */

test.describe('Manuscript Button - Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure consistent font loading
    await page.addInitScript(() => {
      // Wait for fonts to load
      document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
      });
    });
  });

  test.describe('Button Appearance', () => {
    test('Button has correct visual appearance - baseline', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for button to be visible
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Wait for any animations to complete
      await page.waitForTimeout(500);

      // Take baseline screenshot of the entire navigation
      await expect(page.locator('.layout-vertical-nav')).toHaveScreenshot('navigation-baseline.png');

      // Take focused screenshot of the button
      await selectManuscriptButton.scrollIntoViewIfNeeded();
      await expect(selectManuscriptButton.locator('..')).toHaveScreenshot('manuscript-button-baseline.png');
    });

    test('Button maintains appearance on hover', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Hover over button
      await selectManuscriptButton.hover();
      await page.waitForTimeout(200); // Wait for hover animation

      // Take hover state screenshot
      await expect(selectManuscriptButton.locator('..')).toHaveScreenshot('manuscript-button-hover.png');
    });

    test('Button maintains appearance on focus', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Focus on button
      await selectManuscriptButton.focus();
      await page.waitForTimeout(200); // Wait for focus animation

      // Take focus state screenshot
      await expect(selectManuscriptButton.locator('..')).toHaveScreenshot('manuscript-button-focus.png');
    });

    test('Button has correct debug styling', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Verify debug styling is present
      const backgroundColor = await selectManuscriptButton.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      expect(backgroundColor).toBe('rgb(144, 238, 144)'); // lightgreen
      
      // Take screenshot showing debug styling
      await expect(selectManuscriptButton.locator('..')).toHaveScreenshot('manuscript-button-debug-styling.png');
    });
  });

  test.describe('Responsive Design', () => {
    const viewports = [
      { width: 320, height: 568, name: 'mobile-portrait' },
      { width: 568, height: 320, name: 'mobile-landscape' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
      { width: 1280, height: 720, name: 'desktop-small' },
      { width: 1920, height: 1080, name: 'desktop-large' }
    ];

    for (const viewport of viewports) {
      test(`Button appears correctly on ${viewport.name}`, async ({ page, request }) => {
        const adminUser = await getTestUser('ADMIN');
        const authData = await loginUser(request, adminUser);
        
        await setAuthInBrowser(page, authData);
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
        await expect(selectManuscriptButton).toBeVisible();

        // Take viewport-specific screenshot
        await expect(page.locator('.layout-vertical-nav')).toHaveScreenshot(`navigation-${viewport.name}.png`);
      });
    }
  });

  test.describe('Dark Mode Support', () => {
    test('Button appears correctly in dark mode', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Take dark mode screenshot
      await expect(page.locator('.layout-vertical-nav')).toHaveScreenshot('navigation-dark-mode.png');
      await expect(selectManuscriptButton.locator('..')).toHaveScreenshot('manuscript-button-dark-mode.png');
    });
  });

  test.describe('High Contrast Mode', () => {
    test('Button remains visible in high contrast mode', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Enable high contrast mode
      await page.emulateMedia({ 
        colorScheme: 'light',
        forcedColors: 'active'
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Take high contrast screenshot
      await expect(page.locator('.layout-vertical-nav')).toHaveScreenshot('navigation-high-contrast.png');
    });
  });

  test.describe('Animation and Transitions', () => {
    test('Button animations work correctly', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Test hover animation
      await selectManuscriptButton.hover();
      await page.waitForTimeout(100);
      await expect(selectManuscriptButton.locator('..')).toHaveScreenshot('manuscript-button-hover-animation.png');

      // Test focus animation
      await selectManuscriptButton.focus();
      await page.waitForTimeout(100);
      await expect(selectManuscriptButton.locator('..')).toHaveScreenshot('manuscript-button-focus-animation.png');
    });

    test('Button works with reduced motion', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Enable reduced motion
      await page.emulateMedia({ 
        reducedMotion: 'reduce'
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Take reduced motion screenshot
      await expect(selectManuscriptButton.locator('..')).toHaveScreenshot('manuscript-button-reduced-motion.png');
    });
  });

  test.describe('Error States', () => {
    test('Button appears correctly when API fails', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Mock API failure
      await page.route('/api/manuscripts', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Take error state screenshot
      await expect(page.locator('.layout-vertical-nav')).toHaveScreenshot('navigation-api-error.png');
    });
  });

  test.describe('Loading States', () => {
    test('Button appears correctly during slow loading', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Mock slow API response
      await page.route('/api/manuscripts', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] })
        });
      });

      await page.goto('/');
      
      // Take screenshot during loading
      await page.waitForTimeout(500);
      await expect(page.locator('.layout-vertical-nav')).toHaveScreenshot('navigation-loading.png');
      
      await page.waitForLoadState('networkidle');
      
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();
    });
  });

  test.describe('Icon Verification', () => {
    test('Button displays correct navigation icon', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Check for icon presence
      const icon = page.locator('.nav-item-icon', { has: selectManuscriptButton });
      await expect(icon).toBeVisible();

      // Take icon screenshot
      await expect(icon).toHaveScreenshot('manuscript-button-icon.png');
    });
  });

  test.describe('Text Rendering', () => {
    test('Button text renders correctly', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Verify text content
      await expect(selectManuscriptButton).toHaveText('Select Manuscript');

      // Take text rendering screenshot
      await expect(selectManuscriptButton).toHaveScreenshot('manuscript-button-text.png');
    });

    test('Button text scales correctly with zoom', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Test different zoom levels
      const zoomLevels = [50, 100, 150, 200];
      
      for (const zoom of zoomLevels) {
        await page.setViewportSize({ width: 1280 * (100/zoom), height: 720 * (100/zoom) });
        await page.waitForTimeout(200);
        
        await expect(selectManuscriptButton.locator('..')).toHaveScreenshot(`manuscript-button-zoom-${zoom}.png`);
      }
    });
  });

  test.describe('Browser Compatibility', () => {
    test('Button renders consistently across browsers', async ({ page, request, browserName }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Take browser-specific screenshot
      await expect(selectManuscriptButton.locator('..')).toHaveScreenshot(`manuscript-button-${browserName}.png`);
    });
  });

  test.describe('Performance Visual Impact', () => {
    test('Button renders without layout shift', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Monitor layout shifts
      await page.addInitScript(() => {
        let cumulativeLayoutShift = 0;
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              cumulativeLayoutShift += entry.value;
            }
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        
        window.getCLS = () => cumulativeLayoutShift;
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Check cumulative layout shift
      const cls = await page.evaluate(() => window.getCLS());
      
      // CLS should be minimal (< 0.1 is good)
      expect(cls).toBeLessThan(0.1);
      
      // Take final screenshot
      await expect(page.locator('.layout-vertical-nav')).toHaveScreenshot('navigation-no-layout-shift.png');
    });
  });
});