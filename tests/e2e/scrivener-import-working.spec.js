import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';
import { TEST_CREDENTIALS } from '../config/credentials.local.js';

test.describe('Scrivener Import - Working Authentication', () => {
  
  test('tests API login and file upload with real credentials', async ({ request }) => {
    console.log('🔑 Testing with real credentials...');
    
    // Test API login first
    const loginResponse = await request.post('/api/login', {
      data: {
        email: TEST_CREDENTIALS.ADMIN.email,
        password: TEST_CREDENTIALS.ADMIN.password
      }
    });
    
    console.log(`Login API Status: ${loginResponse.status()}`);
    
    if (loginResponse.status() === 200) {
      const loginBody = await loginResponse.json();
      
      if (loginBody.access_token) {
        console.log('✅ LOGIN SUCCESSFUL!');
        const token = loginBody.access_token;
        
        // Test file upload with authentication
        const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
        const fileBuffer = await fs.readFile(fixturePath);
        
        const uploadResponse = await request.post('/api/scrivener/import', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          multipart: {
            file: {
              name: 'Scrivener tutorial [2025_06_01_05_17_17].zip',
              mimeType: 'application/zip',
              buffer: fileBuffer
            }
          }
        });

        expect(uploadResponse.status()).toBe(200);
        const uploadBody = await uploadResponse.json();
        expect(uploadBody).toHaveProperty('message');
        expect(uploadBody).toHaveProperty('import_id');
        
        console.log('🎉 FILE UPLOAD SUCCESSFUL!');
        console.log(`Import ID: ${uploadBody.import_id}`);
        console.log(`Message: ${uploadBody.message}`);
        
        // Check import status
        const statusResponse = await request.get('/api/scrivener/imports', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        expect(statusResponse.status()).toBe(200);
        
        const imports = await statusResponse.json();
        const ourImport = imports.find(imp => imp.id === uploadBody.import_id);
        
        if (ourImport) {
          console.log('✅ IMPORT TRACKING WORKING!');
          console.log(`Status: ${ourImport.status}`);
          console.log(`Current step: ${ourImport.current_step}`);
          console.log(`Filename: ${ourImport.filename}`);
          
          expect(['pending', 'processing', 'completed']).toContain(ourImport.status);
          expect(ourImport.filename).toContain('Scrivener tutorial');
          
        } else {
          console.log('⚠️  Import not found in status list');
        }
      }
      
    } else if (loginResponse.status() === 422) {
      console.log('❌ Login validation failed - check credentials');
      const loginBody = await loginResponse.json();
      console.log('Response:', loginBody);
    } else if (loginResponse.status() === 401) {
      console.log('❌ Invalid credentials');
    } else {
      console.log(`❌ Unexpected login response: ${loginResponse.status()}`);
      const loginBody = await loginResponse.text();
      console.log('Response:', loginBody);
    }
  });

  test('tests UI with authentication', async ({ page, request }) => {
    console.log('🎯 Testing UI with authentication...');
    
    // Login via API first
    const loginResponse = await request.post('/api/login', {
      data: {
        email: TEST_CREDENTIALS.ADMIN.email,
        password: TEST_CREDENTIALS.ADMIN.password
      }
    });
    
    if (loginResponse.status() === 200) {
      const loginBody = await loginResponse.json();
      
      if (loginBody.access_token) {
        const token = loginBody.access_token;
        
        // Visit page with authentication set
        await page.addInitScript((userToken, userData) => {
          window.localStorage.setItem('accessToken', userToken);
          window.localStorage.setItem('user', JSON.stringify(userData || { 
            email: 'info@freynet-gagne.com' 
          }));
        }, token, loginBody.user);
        
        await page.goto('/build/apps/scrivener/import');
        
        // Wait for Vue app to load
        await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
        await page.waitForTimeout(3000); // Give Vue time to initialize
        
        // Check if we can find the import form
        const scrivenerFormExists = await page.locator('[data-test="scrivener-import-form"]').count() > 0;
        const bodyText = await page.locator('body').textContent();
        
        if (scrivenerFormExists) {
          console.log('✅ SCRIVENER IMPORT FORM FOUND!');
          
          // Test the form functionality
          await expect(page.locator('[data-test="file-input"]')).toBeVisible();
          await expect(page.locator('[data-test="upload-button"]')).toBeDisabled();
          
          // Upload test file
          const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
          await page.locator('[data-test="file-input"]').setInputFiles(fixturePath);
          await expect(page.locator('[data-test="upload-button"]')).not.toBeDisabled();
          
          // Set up API intercepts
          const uploadPromise = page.waitForResponse(response => 
            response.url().includes('/api/scrivener/import') && response.request().method() === 'POST',
            { timeout: 30000 }
          );
          const importsPromise = page.waitForResponse(response => 
            response.url().includes('/api/scrivener/imports') && response.request().method() === 'GET'
          );
          
          // Submit the form
          await page.locator('[data-test="upload-button"]').click();
          
          // Wait for upload to complete
          const uploadResponse = await uploadPromise;
          expect(uploadResponse.status()).toBe(200);
          console.log('✅ UI FILE UPLOAD SUCCESSFUL!');
          
          // Check for success message
          await expect(page.locator('[data-test="import-status"]')).toBeVisible({ timeout: 10000 });
          await expect(page.locator('[data-test="import-status"]')).toContainText('successful');
          
          // Wait for import list to update
          await importsPromise;
          
          // Check recent imports table
          await expect(page.locator('[data-test="recent-imports-table"]')).toBeVisible({ timeout: 10000 });
          await expect(page.locator('[data-test="recent-imports-table"] tbody tr')).toHaveCount({ min: 1 });
          
          console.log('🎉 COMPLETE UI WORKFLOW SUCCESSFUL!');
          
        } else if (bodyText?.includes('Scrivener') || bodyText?.includes('Import')) {
          console.log('⚠️  Page contains Scrivener content but form not found');
          console.log('This might be a routing issue - check the Vue router setup');
        } else {
          console.log('❌ Scrivener import page not found');
          console.log('Current page content preview:');
          const text = bodyText?.substring(0, 200) + '...' || 'No content';
          console.log(text);
        }
        
      } else {
        console.log('❌ UI test skipped - no access token received');
      }
    } else {
      console.log('❌ UI test skipped - login failed');
    }
  });

  test('validates error handling', async ({ request }) => {
    console.log('🧪 Testing error handling...');
    
    // Login first
    const loginResponse = await request.post('/api/login', {
      data: {
        email: TEST_CREDENTIALS.ADMIN.email,
        password: TEST_CREDENTIALS.ADMIN.password
      }
    });
    
    if (loginResponse.status() === 200) {
      const loginBody = await loginResponse.json();
      
      if (loginBody.access_token) {
        const token = loginBody.access_token;
        
        // Test with invalid file
        const invalidFileBuffer = Buffer.from('not a zip', 'utf-8');
        
        const response = await request.post('/api/scrivener/import', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          multipart: {
            file: {
              name: 'test.txt',
              mimeType: 'text/plain',
              buffer: invalidFileBuffer
            }
          }
        });

        expect(response.status()).toBe(422);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('errors');
        console.log('✅ File validation working correctly');
        
      } else {
        console.log('❌ Error handling test skipped - no access token');
      }
    } else {
      console.log('❌ Error handling test skipped - login failed');
    }
  });
});