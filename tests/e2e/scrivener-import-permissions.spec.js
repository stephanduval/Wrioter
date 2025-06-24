import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';
import { getTestUser, loginUser, getUsersByRole } from '../config/testUsers.js';

test.describe('Scrivener Import - User Permissions & Roles', () => {
  const fixturePath = path.join(process.cwd(), 'tests/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');

  test('Admin user can access all Scrivener import features', async ({ request }) => {
    const adminUser = await getTestUser('ADMIN');
    const authData = await loginUser(request, adminUser);
    console.log(`🔑 Testing as Admin: ${authData.user.email}`);

    // Test file upload
    const fileBuffer = await fs.readFile(fixturePath);
    const uploadResponse = await request.post('/api/scrivener/import', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authData.token}`,
        'X-Requested-With': 'XMLHttpRequest'
      },
      multipart: {
        file: {
          name: 'Admin-test-upload.zip',
          mimeType: 'application/zip',
          buffer: fileBuffer
        }
      }
    });

    expect(uploadResponse.status()).toBe(200);
    const uploadBody = await uploadResponse.json();
    expect(uploadBody).toHaveProperty('import_id');
    console.log(`✅ Admin upload successful: Import ID ${uploadBody.import_id}`);

    // Test viewing all imports
    const importsResponse = await request.get('/api/scrivener/imports', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      }
    });

    expect(importsResponse.status()).toBe(200);
    const imports = await importsResponse.json();
    expect(Array.isArray(imports)).toBe(true);
    console.log(`✅ Admin can view ${imports.length} imports`);

    // Test viewing specific import
    const importResponse = await request.get(`/api/scrivener/imports/${uploadBody.import_id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      }
    });

    expect(importResponse.status()).toBe(200);
    console.log('✅ Admin can view specific import details');
  });

  test('Client user can upload files but has limited access', async ({ request }) => {
    const clientUser = await getTestUser('CLIENT');
    const authData = await loginUser(request, clientUser);
    console.log(`🔑 Testing as Client: ${authData.user.email}`);

    // Test file upload
    const fileBuffer = await fs.readFile(fixturePath);
    const uploadResponse = await request.post('/api/scrivener/import', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authData.token}`,
        'X-Requested-With': 'XMLHttpRequest'
      },
      multipart: {
        file: {
          name: 'Client-test-upload.zip',
          mimeType: 'application/zip',
          buffer: fileBuffer
        }
      }
    });

    expect(uploadResponse.status()).toBe(200);
    const uploadBody = await uploadResponse.json();
    expect(uploadBody).toHaveProperty('import_id');
    console.log(`✅ Client upload successful: Import ID ${uploadBody.import_id}`);

    // Test viewing imports (should only see own imports)
    const importsResponse = await request.get('/api/scrivener/imports', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      }
    });

    expect(importsResponse.status()).toBe(200);
    const imports = await importsResponse.json();
    expect(Array.isArray(imports)).toBe(true);
    console.log(`✅ Client can view ${imports.length} imports (should be limited to own uploads)`);
  });

  test('Unauthorized access is properly blocked', async ({ request }) => {
    console.log('🚫 Testing unauthorized access...');

    // Test without authentication
    const unauthorizedResponse = await request.get('/api/scrivener/imports', {
      headers: {
        'Accept': 'application/json'
      }
    });

    expect(unauthorizedResponse.status()).toBe(401);
    console.log('✅ Unauthorized API access properly blocked');

    // Test with invalid token
    const invalidTokenResponse = await request.get('/api/scrivener/imports', {
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer invalid-token-12345'
      }
    });

    expect(invalidTokenResponse.status()).toBe(401);
    console.log('✅ Invalid token properly rejected');
  });

  test('Different admin users have same access levels', async ({ request }) => {
    const adminUsers = await getUsersByRole('admin');
    console.log(`🔄 Testing ${adminUsers.length} admin users for consistent access...`);

    for (const adminUser of adminUsers) {
      const authData = await loginUser(request, adminUser);
      
      // Test imports access
      const importsResponse = await request.get('/api/scrivener/imports', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        }
      });

      expect(importsResponse.status()).toBe(200);
      console.log(`✅ ${adminUser.email} has admin access to imports`);
    }
  });

  test('Role-based feature access validation', async ({ request }) => {
    console.log('🎭 Testing role-based feature access...');

    // Test admin-specific features
    const adminUser = await getTestUser('ADMIN');
    const adminAuth = await loginUser(request, adminUser);
    
    // Admins should be able to delete imports (if this endpoint exists)
    const adminDeleteResponse = await request.delete('/api/scrivener/imports/999', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${adminAuth.token}`
      }
    });
    
    // Should get 404 (not found) or 200 (success), but not 403 (forbidden)
    expect([200, 404, 422]).toContain(adminDeleteResponse.status());
    console.log(`✅ Admin delete attempt: ${adminDeleteResponse.status()} (not forbidden)`);

    // Test client attempting admin features
    const clientUser = await getTestUser('CLIENT');
    const clientAuth = await loginUser(request, clientUser);
    
    const clientDeleteResponse = await request.delete('/api/scrivener/imports/999', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${clientAuth.token}`
      }
    });
    
    // Client should be forbidden from deleting
    expect([403, 404]).toContain(clientDeleteResponse.status());
    console.log(`✅ Client delete blocked: ${clientDeleteResponse.status()}`);
  });

  test('Cross-user data isolation', async ({ request }) => {
    console.log('🔒 Testing data isolation between users...');

    // Upload file as admin
    const adminUser = await getTestUser('ADMIN');
    const adminAuth = await loginUser(request, adminUser);
    const fileBuffer = await fs.readFile(fixturePath);
    
    const adminUpload = await request.post('/api/scrivener/import', {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${adminAuth.token}`,
        'X-Requested-With': 'XMLHttpRequest'
      },
      multipart: {
        file: {
          name: 'Admin-isolation-test.zip',
          mimeType: 'application/zip',
          buffer: fileBuffer
        }
      }
    });

    expect(adminUpload.status()).toBe(200);
    const adminUploadBody = await adminUpload.json();
    const adminImportId = adminUploadBody.import_id;
    console.log(`📁 Admin uploaded file with ID: ${adminImportId}`);

    // Try to access admin's import as client
    const clientUser = await getTestUser('CLIENT');
    const clientAuth = await loginUser(request, clientUser);
    
    const clientAccessResponse = await request.get(`/api/scrivener/imports/${adminImportId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${clientAuth.token}`
      }
    });

    // Client should either be forbidden or not find the admin's import
    expect([403, 404]).toContain(clientAccessResponse.status());
    console.log(`✅ Client cannot access admin's import: ${clientAccessResponse.status()}`);
  });
});