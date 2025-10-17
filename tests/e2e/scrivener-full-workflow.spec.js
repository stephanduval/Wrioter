import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';
import { getTestUser, loginUser } from '../config/testUsers.js';

test.describe('Scrivener Import - Full Workflow Test', () => {
  test('tests complete upload to completion workflow', async ({ request }) => {
    console.log('🧪 Testing complete Scrivener import workflow with unique file...');
    
    // Login using secure credential system
    const adminUser = await getTestUser('ADMIN');
    const authData = await loginUser(request, adminUser);
    const token = authData.token;
    console.log('✅ Authentication successful');
    
    // Create a unique filename by copying and renaming the test file
    const timestamp = Date.now();
        const uniqueFilename = `Scrivener-test-${timestamp}.zip`;
        
        // Load the test file
        const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
        const fileBuffer = await fs.readFile(fixturePath);
        
        console.log(`📁 Uploading file: ${uniqueFilename}`);
        
        const uploadResponse = await request.post('/api/scrivener/import', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          multipart: {
            file: {
              name: uniqueFilename,
              mimeType: 'application/zip',
              buffer: fileBuffer
            }
          }
        });

        expect(uploadResponse.status()).toBe(200);
        const uploadBody = await uploadResponse.json();
        expect(uploadBody).toHaveProperty('import_id');
        
        const importId = uploadBody.import_id;
        console.log(`✅ Upload successful! Import ID: ${importId}`);
        
        // Step 2: Monitor the import status until completion
        console.log('⏳ Monitoring import status...');
        
        const checkStatus = async (attempt = 1, maxAttempts = 30) => {
          console.log(`📊 Status check attempt ${attempt}/${maxAttempts}`);
          
          const statusResponse = await request.get('/api/scrivener/imports', {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          expect(statusResponse.status()).toBe(200);
          
          const imports = await statusResponse.json();
          const ourImport = imports.find(imp => imp.id === importId);
          
          if (ourImport) {
            console.log(`📋 Import Status: ${ourImport.status}`);
            console.log(`📝 Current Step: ${ourImport.current_step}`);
            
            if (ourImport.status === 'completed') {
              console.log('🎉 IMPORT COMPLETED SUCCESSFULLY!');
              expect(ourImport.manuscript_id).toBeDefined();
              console.log(`📖 Manuscript ID: ${ourImport.manuscript_id}`);
              
              // Verify the manuscript was created
              const manuscriptResponse = await request.get(`/api/manuscripts/${ourImport.manuscript_id}`, {
                headers: {
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              });

              if (manuscriptResponse.status() === 200) {
                console.log('✅ MANUSCRIPT VERIFICATION SUCCESSFUL!');
                const manuscriptBody = await manuscriptResponse.json();
                console.log(`📚 Manuscript Title: ${manuscriptBody.title}`);
              }
              
            } else if (ourImport.status === 'failed') {
              console.log(`❌ Import failed: ${ourImport.error_message}`);
              throw new Error(`Import failed: ${ourImport.error_message}`);
              
            } else if (ourImport.status === 'processing' || ourImport.status === 'pending') {
              if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
                await checkStatus(attempt + 1, maxAttempts);
              } else {
                throw new Error(`Import still ${ourImport.status} after ${maxAttempts} attempts`);
              }
              
            } else {
              console.log(`⚠️  Unknown status: ${ourImport.status}`);
              if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await checkStatus(attempt + 1, maxAttempts);
              }
            }
          } else {
            throw new Error(`Import with ID ${importId} not found`);
          }
        };
        
        // Start status monitoring
        await checkStatus();
  });
});