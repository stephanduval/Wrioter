// Debug function to check authentication state
// Run this in the browser console to check auth status

function debugAuth() {
  console.log('=== AUTH DEBUG ===');
  
  // Check localStorage
  const token = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('userData');
  const abilityRules = localStorage.getItem('abilityRules');
  
  console.log('📱 LocalStorage State:');
  console.log('  - accessToken:', token ? `✅ Present (${token.substring(0, 20)}...)` : '❌ Missing');
  console.log('  - userData:', userData ? '✅ Present' : '❌ Missing');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('    User:', user);
    } catch (e) {
      console.log('    ❌ Failed to parse userData');
    }
  }
  console.log('  - abilityRules:', abilityRules ? '✅ Present' : '❌ Missing');
  if (abilityRules) {
    try {
      const rules = JSON.parse(abilityRules);
      console.log('    Rules count:', rules.length);
      console.log('    Rules:', rules);
    } catch (e) {
      console.log('    ❌ Failed to parse abilityRules');
    }
  }
  
  // Check cookies
  console.log('\n🍪 Cookies:');
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken' || name === 'XSRF-TOKEN') {
      console.log(`  - ${name}:`, value ? '✅ Present' : '❌ Missing');
    }
  });
  
  console.log('\n📍 Current URL:', window.location.href);
  console.log('=================\n');
  
  return {
    hasToken: !!token,
    hasUserData: !!userData,
    hasAbilityRules: !!abilityRules
  };
}

// Function to manually set auth data for testing
function setTestAuth() {
  // Test admin user
  const testData = {
    accessToken: 'test-token-12345',
    userData: {
      id: 1,
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin'
    },
    abilityRules: [
      { action: 'manage', subject: 'all' },
      { action: 'read', subject: 'admin' },
      { action: 'read', subject: 'manuscripts' },
      { action: 'create', subject: 'manuscripts' }
    ]
  };
  
  localStorage.setItem('accessToken', testData.accessToken);
  localStorage.setItem('userData', JSON.stringify(testData.userData));
  localStorage.setItem('abilityRules', JSON.stringify(testData.abilityRules));
  
  console.log('✅ Test auth data set. Refresh the page to see changes.');
  return testData;
}

// Function to clear auth
function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userData');
  localStorage.removeItem('abilityRules');
  console.log('🗑️ Auth data cleared. Refresh the page.');
}

// Auto-run debug on load
console.log('Auth Debug Functions Available:');
console.log('  - debugAuth()     : Check current auth state');
console.log('  - setTestAuth()   : Set test auth data');
console.log('  - clearAuth()     : Clear all auth data');
console.log('');
debugAuth();