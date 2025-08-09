import { test, expect } from '@playwright/test';
import { getTestUser, loginUser, setAuthInBrowser } from '../config/testUsers.js';

/**
 * Performance Testing Suite for Manuscript Selection Button
 * 
 * This suite measures and monitors performance aspects of the manuscript
 * selection button to ensure optimal user experience.
 */

test.describe('Manuscript Button - Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Store performance metrics
      window.performanceMetrics = {
        navigationStart: 0,
        loadEventEnd: 0,
        domContentLoadedEventEnd: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        buttonClickStart: 0,
        buttonClickEnd: 0
      };

      // Monitor navigation timing
      window.addEventListener('load', () => {
        const timing = performance.timing;
        window.performanceMetrics.navigationStart = timing.navigationStart;
        window.performanceMetrics.loadEventEnd = timing.loadEventEnd;
        window.performanceMetrics.domContentLoadedEventEnd = timing.domContentLoadedEventEnd;
      });

      // Monitor paint timing
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            window.performanceMetrics.firstPaint = entry.startTime;
          }
          if (entry.name === 'first-contentful-paint') {
            window.performanceMetrics.firstContentfulPaint = entry.startTime;
          }
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    });
  });

  test.describe('Page Load Performance', () => {
    test('Button appears within acceptable time on initial page load', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      const startTime = Date.now();
      await page.goto('/');
      
      // Wait for button to be visible
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();
      
      const buttonLoadTime = Date.now() - startTime;
      
      console.log(`📊 Button loaded in ${buttonLoadTime}ms`);
      
      // Button should appear within 3 seconds
      expect(buttonLoadTime).toBeLessThan(3000);
      
      // Get detailed performance metrics
      const metrics = await page.evaluate(() => window.performanceMetrics);
      const domContentLoaded = metrics.domContentLoadedEventEnd - metrics.navigationStart;
      const pageLoad = metrics.loadEventEnd - metrics.navigationStart;
      
      console.log(`📊 DOM Content Loaded: ${domContentLoaded}ms`);
      console.log(`📊 Page Load Complete: ${pageLoad}ms`);
      
      // Performance benchmarks
      expect(domContentLoaded).toBeLessThan(2000); // DOM ready in under 2 seconds
      expect(pageLoad).toBeLessThan(5000); // Full page load in under 5 seconds
    });

    test('Button loads quickly with slow network conditions', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Simulate slow network (3G)
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/');
      
      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();
      
      const buttonLoadTime = Date.now() - startTime;
      
      console.log(`📊 Button loaded on slow network in ${buttonLoadTime}ms`);
      
      // Should still load reasonably fast even on slow network
      expect(buttonLoadTime).toBeLessThan(10000);
    });
  });

  test.describe('Button Interaction Performance', () => {
    test('Button responds to clicks within acceptable time', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Handle alert dialog
      let alertShown = false;
      page.on('dialog', async dialog => {
        alertShown = true;
        await dialog.accept();
      });

      // Measure click response time
      const startTime = Date.now();
      await selectManuscriptButton.click();
      
      // Wait for response
      await page.waitForTimeout(500);
      
      const responseTime = Date.now() - startTime;
      
      console.log(`📊 Button responded to click in ${responseTime}ms`);
      
      // Should respond within 200ms
      expect(responseTime).toBeLessThan(200);
      expect(alertShown).toBe(true);
    });

    test('Button handles rapid clicks without performance degradation', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Handle alert dialogs
      let alertCount = 0;
      page.on('dialog', async dialog => {
        alertCount++;
        await dialog.accept();
      });

      // Measure performance of rapid clicks
      const clickCount = 10;
      const startTime = Date.now();
      
      for (let i = 0; i < clickCount; i++) {
        await selectManuscriptButton.click();
        await page.waitForTimeout(50); // Small delay between clicks
      }
      
      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / clickCount;
      
      console.log(`📊 Average click response time: ${averageTime}ms`);
      console.log(`📊 Total alerts shown: ${alertCount}`);
      
      // Average response time should remain consistent
      expect(averageTime).toBeLessThan(100);
      expect(alertCount).toBe(clickCount);
    });
  });

  test.describe('Memory Usage', () => {
    test('Button interactions do not cause memory leaks', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Measure initial memory usage
      const initialMemory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize
          };
        }
        return null;
      });

      if (initialMemory) {
        console.log(`📊 Initial memory usage: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB`);

        // Handle dialogs
        page.on('dialog', async dialog => {
          await dialog.accept();
        });

        // Perform many interactions
        for (let i = 0; i < 50; i++) {
          await selectManuscriptButton.click();
          await page.waitForTimeout(10);
        }

        // Force garbage collection if available
        await page.evaluate(() => {
          if (window.gc) {
            window.gc();
          }
        });

        // Measure final memory usage
        const finalMemory = await page.evaluate(() => {
          if (performance.memory) {
            return {
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize
            };
          }
          return null;
        });

        if (finalMemory) {
          const memoryIncrease = finalMemory.used - initialMemory.used;
          console.log(`📊 Final memory usage: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB`);
          console.log(`📊 Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

          // Memory increase should be minimal (less than 10MB)
          expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        }
      }
    });
  });

  test.describe('API Performance', () => {
    test('Button functionality with API latency', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Mock API with various latencies
      const latencies = [100, 500, 1000, 2000];
      
      for (const latency of latencies) {
        await page.route('/api/manuscripts', async route => {
          await new Promise(resolve => setTimeout(resolve, latency));
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: [
                { id: 1, title: 'Test Manuscript', manuscript_type: 'standard' }
              ]
            })
          });
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
        await expect(selectManuscriptButton).toBeVisible();

        // Handle alert
        page.on('dialog', async dialog => {
          await dialog.accept();
        });

        // Test button remains responsive despite API latency
        const startTime = Date.now();
        await selectManuscriptButton.click();
        await page.waitForTimeout(200);
        const responseTime = Date.now() - startTime;

        console.log(`📊 Button response with ${latency}ms API latency: ${responseTime}ms`);

        // Button should remain responsive regardless of API latency
        expect(responseTime).toBeLessThan(300);
      }
    });
  });

  test.describe('Rendering Performance', () => {
    test('Button renders without causing layout thrashing', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Monitor layout shifts
      await page.addInitScript(() => {
        let layoutShifts = [];
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              layoutShifts.push({
                value: entry.value,
                time: entry.startTime
              });
            }
          }
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
        
        window.getLayoutShifts = () => layoutShifts;
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Check for layout shifts
      const layoutShifts = await page.evaluate(() => window.getLayoutShifts());
      const totalShift = layoutShifts.reduce((sum, shift) => sum + shift.value, 0);

      console.log(`📊 Total layout shift: ${totalShift}`);
      console.log(`📊 Layout shift events: ${layoutShifts.length}`);

      // Cumulative Layout Shift should be minimal
      expect(totalShift).toBeLessThan(0.1);
    });

    test('Button re-renders efficiently on state changes', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Measure render time for different states
      const states = ['hover', 'focus', 'active'];
      
      for (const state of states) {
        const startTime = performance.now();
        
        switch (state) {
          case 'hover':
            await selectManuscriptButton.hover();
            break;
          case 'focus':
            await selectManuscriptButton.focus();
            break;
          case 'active':
            await selectManuscriptButton.click({ noWaitAfter: true });
            break;
        }
        
        // Wait for state change to complete
        await page.waitForTimeout(100);
        
        const renderTime = performance.now() - startTime;
        console.log(`📊 ${state} state render time: ${renderTime}ms`);
        
        // State changes should render quickly
        expect(renderTime).toBeLessThan(50);
      }
    });
  });

  test.describe('Scroll Performance', () => {
    test('Button remains performant during scrolling', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Add content to make page scrollable
      await page.evaluate(() => {
        const content = document.createElement('div');
        content.style.height = '3000px';
        content.style.background = 'linear-gradient(to bottom, #f0f0f0, #e0e0e0)';
        document.body.appendChild(content);
      });

      // Measure scroll performance
      const startTime = Date.now();
      
      // Scroll down and up rapidly
      for (let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(50);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(50);
      }
      
      const scrollTime = Date.now() - startTime;
      console.log(`📊 Scroll performance test completed in ${scrollTime}ms`);

      // Button should remain clickable after scrolling
      await expect(selectManuscriptButton).toBeVisible();
      
      // Handle alert
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const clickStartTime = Date.now();
      await selectManuscriptButton.click();
      const clickTime = Date.now() - clickStartTime;
      
      console.log(`📊 Button click after scrolling: ${clickTime}ms`);
      
      // Click should still be responsive
      expect(clickTime).toBeLessThan(200);
    });
  });

  test.describe('Concurrent Operations', () => {
    test('Button handles concurrent interactions', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Handle dialogs
      let alertCount = 0;
      page.on('dialog', async dialog => {
        alertCount++;
        await dialog.accept();
      });

      // Simulate concurrent operations
      const startTime = Date.now();
      
      // Multiple rapid interactions
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(selectManuscriptButton.click());
        promises.push(selectManuscriptButton.hover());
        promises.push(selectManuscriptButton.focus());
      }
      
      await Promise.all(promises);
      
      const totalTime = Date.now() - startTime;
      console.log(`📊 Concurrent operations completed in ${totalTime}ms`);
      console.log(`📊 Alerts triggered: ${alertCount}`);

      // Should handle concurrent operations efficiently
      expect(totalTime).toBeLessThan(1000);
      expect(alertCount).toBeGreaterThan(0);
    });
  });

  test.describe('Performance Monitoring', () => {
    test('Button performance metrics are within acceptable ranges', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      
      // Enable performance monitoring
      await page.addInitScript(() => {
        window.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          window.performanceEntries = window.performanceEntries || [];
          window.performanceEntries.push(...entries);
        });
        
        window.performanceObserver.observe({ 
          entryTypes: ['navigation', 'resource', 'paint', 'layout-shift'] 
        });
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Get performance entries
      const performanceEntries = await page.evaluate(() => window.performanceEntries || []);
      
      // Analyze performance metrics
      const navigationEntries = performanceEntries.filter(entry => entry.entryType === 'navigation');
      const resourceEntries = performanceEntries.filter(entry => entry.entryType === 'resource');
      const paintEntries = performanceEntries.filter(entry => entry.entryType === 'paint');
      
      console.log(`📊 Navigation entries: ${navigationEntries.length}`);
      console.log(`📊 Resource entries: ${resourceEntries.length}`);
      console.log(`📊 Paint entries: ${paintEntries.length}`);

      // Performance assertions
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        console.log(`📊 DOM Content Loaded: ${nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart}ms`);
        console.log(`📊 Load Event: ${nav.loadEventEnd - nav.loadEventStart}ms`);
      }

      // Find first contentful paint
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        console.log(`📊 First Contentful Paint: ${fcp.startTime}ms`);
        expect(fcp.startTime).toBeLessThan(2000);
      }
    });
  });

  test.describe('Resource Usage', () => {
    test('Button functionality uses minimal resources', async ({ page, request }) => {
      const adminUser = await getTestUser('ADMIN');
      const authData = await loginUser(request, adminUser);
      
      await setAuthInBrowser(page, authData);
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const selectManuscriptButton = page.locator('text="Select Manuscript"').first();
      await expect(selectManuscriptButton).toBeVisible();

      // Monitor resource usage
      const resources = await page.evaluate(() => {
        const resourceEntries = performance.getEntriesByType('resource');
        return resourceEntries.map(entry => ({
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize || 0,
          type: entry.initiatorType
        }));
      });

      // Calculate total resource usage
      const totalSize = resources.reduce((sum, resource) => sum + resource.size, 0);
      const totalDuration = resources.reduce((sum, resource) => sum + resource.duration, 0);

      console.log(`📊 Total resources loaded: ${resources.length}`);
      console.log(`📊 Total transfer size: ${(totalSize / 1024).toFixed(2)}KB`);
      console.log(`📊 Total load duration: ${totalDuration.toFixed(2)}ms`);

      // Resource usage should be reasonable
      expect(totalSize).toBeLessThan(5 * 1024 * 1024); // Less than 5MB
      expect(resources.length).toBeLessThan(100); // Less than 100 resources
    });
  });
});