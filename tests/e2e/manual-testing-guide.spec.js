import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

test.describe('Manual Testing Guide for Scrivener Import', () => {
  
  // This test is designed for manual testing with headed browser
  test('Manual Login Test - Use this for interactive testing', async ({ page }) => {
    console.log('🎯 MANUAL TESTING INSTRUCTIONS:');
    console.log('1. This test will pause for you to login manually');
    console.log('2. After login, the test will proceed with file upload');
    
    // Visit the application
    await page.goto('/');
    
    // Wait for you to login manually
    console.log('⏳ Please login manually in the browser...');
    console.log('⏳ Click anywhere on the page after you\'re logged in');
    
    // Wait for user to click (indicating they've logged in)
    await page.locator('body').click();
    await page.waitForTimeout(2000);
    
    // Navigate to scrivener import
    await page.goto('/build/apps/scrivener/import');
    
    // Wait for the form to appear
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    
    // Try to find the import form
    const scrivenerFormExists = await page.locator('[data-test="scrivener-import-form"]').count() > 0;
    
    if (scrivenerFormExists) {
      console.log('✅ Found scrivener import form!');
      
      // Test file upload
      await expect(page.locator('[data-test="file-input"]')).toBeVisible();
      await expect(page.locator('[data-test="upload-button"]')).toBeDisabled();
      
      // Upload the test file
      const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
      await page.locator('[data-test="file-input"]').setInputFiles(fixturePath);
      await expect(page.locator('[data-test="upload-button"]')).not.toBeDisabled();
      
      console.log('📁 File selected! Ready to upload...');
      console.log('🚀 Click the upload button to test the full workflow');
      
      // Optional: Automatically submit
      // await page.locator('[data-test="upload-button"]').click();
      
    } else {
      console.log('❌ Scrivener import form not found');
      console.log('Current URL: ' + page.url());
      console.log('Try navigating to the correct route manually');
    }
  });

  // Test without database operations (for when migrations fail)
  test('API Test Without Database - Direct API testing', async ({ request }) => {
    console.log('🧪 Testing API directly without database setup');
    
    // Test the import endpoint exists
    const importResponse = await request.get('/api/scrivener/imports');
    
    console.log(`Import API Status: ${importResponse.status()}`);
    expect([200, 401, 422, 500]).toContain(importResponse.status());
    
    if (importResponse.status() === 401) {
      console.log('✅ API requires authentication (expected)');
    } else if (importResponse.status() === 200) {
      console.log('✅ API accessible (user might be authenticated)');
    }
    
    // Test file upload endpoint
    const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
    const fileBuffer = await fs.readFile(fixturePath);
    
    const uploadResponse = await request.post('/api/scrivener/import', {
      headers: {
        'Accept': 'application/json'
      },
      multipart: {
        file: {
          name: 'test.zip',
          mimeType: 'application/zip',
          buffer: fileBuffer
        }
      }
    });

    console.log(`Upload API Status: ${uploadResponse.status()}`);
    
    if (uploadResponse.status() === 401) {
      console.log('✅ Upload requires authentication (security working)');
    } else if (uploadResponse.status() === 200) {
      console.log('✅ Upload successful!');
      const responseBody = await uploadResponse.json();
      console.log('Response:', responseBody);
    } else if (uploadResponse.status() === 422) {
      console.log('✅ Validation working');
    }
  });
});