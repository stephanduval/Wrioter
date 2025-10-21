import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('Scrivener Import E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Reset database state
    // Note: Would need Laravel task equivalent - skipping for now
    
    // Visit the application and authenticate
    await page.goto('/');
    // Would need to implement custom login command equivalent
    
    // Navigate to scrivener import page  
    await page.goto('/build/apps/scrivener/import');
    await expect(page).toHaveURL(/.*scrivener-import/);
    
    // Wait for page to fully load
    await expect(page.locator('[data-test="scrivener-import-form"]')).toBeVisible();
  });

  test('successfully uploads and imports a Scrivener zip file', async ({ page }) => {
    // Test file upload interface
    await expect(page.locator('[data-test="file-input"]')).toBeVisible();
    await expect(page.locator('[data-test="upload-button"]')).toBeDisabled();
    
    // Upload the test Scrivener zip file
    const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
    await page.locator('[data-test="file-input"]').setInputFiles(fixturePath);
    
    // Verify file is selected
    await expect(page.locator('[data-test="upload-button"]')).not.toBeDisabled();
    
    // Set up intercepts to monitor API calls
    const uploadPromise = page.waitForResponse(response => 
      response.url().includes('/api/scrivener/import') && response.request().method() === 'POST'
    );
    const importsPromise = page.waitForResponse(response => 
      response.url().includes('/api/scrivener/imports') && response.request().method() === 'GET'
    );
    
    // Submit the form
    await page.locator('[data-test="upload-button"]').click();
    
    // Wait for upload to complete
    const uploadResponse = await uploadPromise;
    expect(uploadResponse.status()).toBe(200);
    const uploadBody = await uploadResponse.json();
    expect(uploadBody).toHaveProperty('message');
    expect(uploadBody).toHaveProperty('import_id');
    
    // Check that upload progress was shown (commented out as toHaveBeenVisible doesn't exist in Playwright)
    // await expect(page.locator('[data-test="upload-progress"]')).toHaveBeenVisible();
    
    // Verify success message appears
    await expect(page.locator('[data-test="import-status"]')).toContainText('Upload successful');
    
    // Check that processing status is shown
    await expect(page.locator('[data-test="processing-status"]')).toBeVisible();
    await expect(page.locator('[data-test="processing-status"]')).toContainText('Processing');
    
    // Wait for the import to complete by polling (simplified - would need custom implementation)
    // await waitForImportStatus('completed', 60000);
    
    // Verify the import appears in recent imports table
    await expect(page.locator('[data-test="recent-imports-table"]')).toBeVisible();
    await expect(page.locator('[data-test="recent-imports-table"] tbody tr')).toHaveCount({ min: 1 });
    
    // Check that the latest import shows as completed
    const firstRow = page.locator('[data-test="recent-imports-table"] tbody tr').first();
    await expect(firstRow.locator('[data-test="import-filename"]')).toContainText('Scrivener tutorial');
    await expect(firstRow.locator('[data-test="import-status"]')).toContainText('completed');
    await expect(firstRow.locator('[data-test="view-manuscript-button"]')).toBeVisible();
    
    // Click to view the created manuscript
    await firstRow.locator('[data-test="view-manuscript-button"]').click();
    
    // Verify we're redirected to the manuscript view
    await expect(page).toHaveURL(/.*manuscripts\/.*/);
    await expect(page.locator('[data-test="manuscript-title"]')).toBeVisible();
  });

  test('shows progress during file upload', async ({ page }) => {
    // Upload a file to test progress indicator
    const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
    await page.locator('[data-test="file-input"]').setInputFiles(fixturePath);
    
    // Intercept upload with delay to see progress
    await page.route('/api/scrivener/import', async route => {
      // Simulate slow upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Upload successful', import_id: 1 })
      });
    });
    
    await page.locator('[data-test="upload-button"]').click();
    
    // Check progress elements appear
    await expect(page.locator('[data-test="upload-progress"]')).toBeVisible();
    await expect(page.locator('[data-test="upload-progress"]')).toContainText('%');
    
    // Upload button should be disabled during upload
    await expect(page.locator('[data-test="upload-button"]')).toBeDisabled();
    
    // File input should be disabled during upload
    await expect(page.locator('[data-test="file-input"]')).toBeDisabled();
  });

  test('handles invalid file types gracefully', async ({ page }) => {
    // Create a fake non-zip file
    const invalidFilePath = path.join(process.cwd(), 'tests/fixtures/invalid-file.txt');
    await fs.writeFile(invalidFilePath, 'This is not a zip file');
    
    // Try to upload invalid file
    await page.locator('[data-test="file-input"]').setInputFiles(invalidFilePath);
    
    // Check error message appears
    await expect(page.locator('[data-test="file-error"]')).toBeVisible();
    await expect(page.locator('[data-test="file-error"]')).toContainText('invalid file type');
    
    // Upload button should remain disabled
    await expect(page.locator('[data-test="upload-button"]')).toBeDisabled();
  });

  test('handles large files appropriately', async ({ page }) => {
    // Create a large fake file (this would be mocked in real scenario)
    const largeFakeFileContent = 'x'.repeat(60 * 1024 * 1024); // 60MB
    const largeFakeFilePath = path.join(process.cwd(), 'tests/fixtures/large-file.zip');
    await fs.writeFile(largeFakeFilePath, largeFakeFileContent);
    
    await page.locator('[data-test="file-input"]').setInputFiles(largeFakeFilePath);
    
    // Check error message for file too large
    await expect(page.locator('[data-test="file-error"]')).toBeVisible();
    await expect(page.locator('[data-test="file-error"]')).toContainText('too large');
    
    // Upload button should be disabled
    await expect(page.locator('[data-test="upload-button"]')).toBeDisabled();
    
    // Clean up
    await fs.unlink(largeFakeFilePath);
  });

  test('shows real-time status updates during processing', async ({ page }) => {
    // Mock the processing flow with different statuses
    let callCount = 0;
    
    await page.route('/api/scrivener/imports', async route => {
      callCount++;
      let responseData;
      
      if (callCount === 1) {
        responseData = [{
          id: 1,
          filename: 'test.zip',
          status: 'pending',
          created_at: new Date().toISOString()
        }];
      } else if (callCount === 2) {
        responseData = [{
          id: 1,
          filename: 'test.zip',
          status: 'processing',
          current_step: 'Extracting files...',
          progress: 25,
          created_at: new Date().toISOString()
        }];
      } else if (callCount === 3) {
        responseData = [{
          id: 1,
          filename: 'test.zip',
          status: 'processing',
          current_step: 'Processing items...',
          progress: 75,
          created_at: new Date().toISOString()
        }];
      } else {
        responseData = [{
          id: 1,
          filename: 'test.zip',
          status: 'completed',
          manuscript_id: 1,
          created_at: new Date().toISOString()
        }];
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData)
      });
    });
    
    // Upload file
    const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
    await page.locator('[data-test="file-input"]').setInputFiles(fixturePath);
    
    await page.route('/api/scrivener/import', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Upload successful', import_id: 1 })
      });
    });
    
    await page.locator('[data-test="upload-button"]').click();
    
    // Check different processing states
    await expect(page.locator('[data-test="recent-imports-table"]')).toContainText('pending');
    await expect(page.locator('[data-test="recent-imports-table"]')).toContainText('processing');
    await expect(page.locator('[data-test="recent-imports-table"]')).toContainText('Extracting files');
    await expect(page.locator('[data-test="recent-imports-table"]')).toContainText('Processing items');
    await expect(page.locator('[data-test="recent-imports-table"]')).toContainText('completed');
  });

  test('handles network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('/api/scrivener/import', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
    await page.locator('[data-test="file-input"]').setInputFiles(fixturePath);
    await page.locator('[data-test="upload-button"]').click();
    
    // Check error message appears
    await expect(page.locator('[data-test="import-status"]')).toBeVisible();
    await expect(page.locator('[data-test="import-status"]')).toContainText('error');
    
    // Check that upload state is reset
    await expect(page.locator('[data-test="upload-button"]')).not.toBeDisabled();
  });

  test('allows multiple concurrent imports to be tracked', async ({ page }) => {
    // Mock multiple imports in different states
    await page.route('/api/scrivener/imports', async route => {
      const mockData = [
        {
          id: 1,
          filename: 'import1.zip',
          status: 'completed',
          manuscript_id: 1,
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          filename: 'import2.zip',
          status: 'processing',
          current_step: 'Processing items...',
          progress: 50,
          created_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 3,
          filename: 'import3.zip',
          status: 'failed',
          error_message: 'Invalid file format',
          created_at: new Date(Date.now() - 900000).toISOString()
        }
      ];
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData)
      });
    });
    
    // Check that all imports are displayed
    await expect(page.locator('[data-test="recent-imports-table"] tbody tr')).toHaveCount(3);
    
    // Check different statuses are shown correctly
    await expect(page.locator('[data-test="recent-imports-table"]')).toContainText('completed');
    await expect(page.locator('[data-test="recent-imports-table"]')).toContainText('processing');
    await expect(page.locator('[data-test="recent-imports-table"]')).toContainText('failed');
    
    // Check that view manuscript button only appears for completed imports
    const firstRow = page.locator('[data-test="recent-imports-table"] tbody tr').nth(0);
    await expect(firstRow.locator('[data-test="view-manuscript-button"]')).toBeVisible();
    
    const secondRow = page.locator('[data-test="recent-imports-table"] tbody tr').nth(1);
    await expect(secondRow.locator('[data-test="view-manuscript-button"]')).not.toBeVisible();
  });
});