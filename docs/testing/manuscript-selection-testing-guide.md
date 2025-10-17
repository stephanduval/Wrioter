# Manuscript Selection Testing Guide

This comprehensive guide covers all aspects of testing the "Select Manuscript" button functionality, from manual testing to automated test execution.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Manual Testing](#manual-testing)
3. [Automated Testing](#automated-testing)
4. [Test Data Setup](#test-data-setup)
5. [Troubleshooting](#troubleshooting)
6. [Continuous Integration](#continuous-integration)
7. [Performance Testing](#performance-testing)
8. [Accessibility Testing](#accessibility-testing)

## Quick Start

### Prerequisites
- Test environment running (`yarn dev:test:all`)
- Test database with seed data (`yarn db:fresh:test`)
- Playwright and Vitest installed

### Run All Tests
```bash
# Run all manuscript-related tests
yarn playwright:test:manuscript

# Run specific test suites
yarn playwright:test tests/e2e/manuscript-button-functionality.spec.js
yarn playwright:test tests/e2e/manuscript-button-integration.spec.js
yarn playwright:test tests/regression/manuscript-button-regression.spec.js

# Run unit tests
yarn test:unit tests/unit/manuscript-selection.spec.js
```

### Expected Results
- ✅ Button is visible and clickable
- ✅ Button shows alert when clicked (current implementation)
- ✅ Button has proper styling (green background, red border)
- ✅ Button works for all user roles

## Manual Testing

### Basic Functionality Test

1. **Setup Test Environment**
   ```bash
   yarn dev:test:all
   yarn db:fresh:test
   ```

2. **Login as Admin User**
   - Navigate to `http://localhost:8000`
   - Email: `info@freynet-gagne.com`
   - Password: `ChangeMe2024!`

3. **Verify Button Appearance**
   - Look for "Select Manuscript" in the left navigation
   - Button should have green background and red border
   - Button should display navigation icon

4. **Test Button Click**
   - Click the "Select Manuscript" button
   - Should show alert: "Select Manuscript clicked! This is a custom navigation item."
   - URL should not change (preventDefault working)

5. **Test Different User Roles**
   - Test with client user: `client@client.com` / `ChangeMe2024!`
   - Button should be visible for all roles (permission bypass)

### Visual Verification Checklist

- [ ] Button text is "Select Manuscript"
- [ ] Button has navigation icon (bx-navigation)
- [ ] Button has green background (debug styling)
- [ ] Button has red border (debug styling)
- [ ] Button cursor changes to pointer on hover
- [ ] Button is properly positioned in navigation menu
- [ ] Button maintains styling across different screen sizes

### Interaction Testing

- [ ] Button responds to mouse clicks
- [ ] Button responds to keyboard navigation (Tab + Enter)
- [ ] Button prevents default navigation behavior
- [ ] Button shows console debug messages
- [ ] Button works consistently across multiple clicks

## Automated Testing

### Test Structure Overview

```
tests/
├── e2e/
│   ├── manuscript-button-functionality.spec.js    # Comprehensive functional tests
│   ├── manuscript-button-integration.spec.js      # End-to-end workflow tests
│   └── manuscript-selection-drawer.spec.js        # Existing drawer tests
├── unit/
│   └── manuscript-selection.spec.js               # Component unit tests
└── regression/
    └── manuscript-button-regression.spec.js       # Regression prevention tests
```

### Test Categories

#### 1. Functional Tests (`manuscript-button-functionality.spec.js`)
- **Button Visibility**: Ensures button appears for all user roles
- **Click Handling**: Verifies click events are properly handled
- **Styling**: Confirms custom styling is applied correctly
- **Accessibility**: Tests keyboard navigation and screen reader support
- **Error Handling**: Tests behavior with API errors and edge cases
- **Performance**: Measures load times and response times

#### 2. Integration Tests (`manuscript-button-integration.spec.js`)
- **Complete Workflow**: Tests full button → drawer → selection flow
- **API Integration**: Tests manuscript loading and selection
- **State Management**: Verifies Pinia store integration
- **Navigation**: Tests routing to manuscript views
- **Mobile/Responsive**: Tests functionality across device sizes
- **Error Scenarios**: Tests network failures and empty states

#### 3. Unit Tests (`manuscript-selection.spec.js`)
- **Component Isolation**: Tests individual Vue components
- **Store Logic**: Tests Pinia store functions
- **Event Handling**: Tests component event emissions
- **Props/State**: Tests component props and state changes
- **Mocking**: Tests with mocked dependencies

#### 4. Regression Tests (`manuscript-button-regression.spec.js`)
- **Historical Issues**: Prevents previously fixed bugs from returning
- **Component Existence**: Ensures components aren't accidentally removed
- **API Compatibility**: Verifies API endpoints remain functional
- **Performance Benchmarks**: Prevents performance degradation
- **Browser Compatibility**: Tests across different browsers

### Running Specific Test Categories

```bash
# Run all functional tests
yarn playwright:test tests/e2e/manuscript-button-functionality.spec.js

# Run specific test groups
yarn playwright:test tests/e2e/manuscript-button-functionality.spec.js -g "Button Visibility"
yarn playwright:test tests/e2e/manuscript-button-functionality.spec.js -g "Click Handling"

# Run integration tests
yarn playwright:test tests/e2e/manuscript-button-integration.spec.js

# Run unit tests
yarn vitest tests/unit/manuscript-selection.spec.js

# Run regression tests
yarn playwright:test tests/regression/manuscript-button-regression.spec.js
```

### Test Configuration

#### Playwright Configuration
```javascript
// playwright.config.js
export default {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
};
```

## Test Data Setup

### Required Test Data

#### Users
- **Admin User**: `info@freynet-gagne.com` / `ChangeMe2024!`
- **Client User**: `client@client.com` / `ChangeMe2024!`

#### Manuscripts (for full workflow testing)
```sql
INSERT INTO manuscripts (title, manuscript_type, user_id, created_at, updated_at) VALUES
('Test Manuscript 1', 'standard', 1, NOW(), NOW()),
('Test Scrivener Project', 'scrivener', 1, NOW(), NOW()),
('Client Manuscript', 'standard', 2, NOW(), NOW());
```

#### Permissions
- Admin users: Full access to all manuscripts
- Client users: Access to own manuscripts only

### Setting Up Test Data

```bash
# Fresh test database with seed data
yarn db:fresh:test

# Or manually seed specific data
php artisan db:seed --class=ManuscriptSeeder --env=testing
```

### Test Data Helpers

Create test data programmatically:

```javascript
// In test files
const createTestManuscript = async (request, authData) => {
  return await request.post('/api/manuscripts', {
    headers: {
      'Authorization': `Bearer ${authData.token}`
    },
    data: {
      title: 'Test Manuscript',
      manuscript_type: 'standard',
      description: 'Test description'
    }
  });
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Button Not Visible
**Symptoms**: Select Manuscript button doesn't appear
**Causes**: 
- Menu configuration missing
- Permission issues
- Vue component not loaded

**Solutions**:
```bash
# Check menu configuration
grep -r "menu.selectManuscript" resources/ts/navigation/

# Check component registration
grep -r "VerticalNavLink" resources/ts/@layouts/

# Verify test environment
yarn dev:test:all
```

#### 2. Button Click Not Working
**Symptoms**: Button visible but click doesn't trigger handler
**Causes**:
- Event handler not bound
- Custom flag not set
- JavaScript errors

**Solutions**:
```javascript
// Check console for errors
console.log('Custom item clicked:', props.item.title);

// Verify custom flag
if (props.item.custom) {
  // Handle custom click
}
```

#### 3. Tests Failing
**Symptoms**: Automated tests report failures
**Common Causes**:
- Test environment not running
- Database not seeded
- Timing issues

**Solutions**:
```bash
# Restart test environment
yarn dev:test:all

# Reset test database
yarn db:fresh:test

# Run tests with debug output
yarn playwright:test --headed --debug
```

#### 4. Styling Issues
**Symptoms**: Button doesn't have expected styling
**Causes**:
- CSS not loaded
- Style conflicts
- Vuetify theme issues

**Solutions**:
```bash
# Check for CSS compilation errors
yarn dev:test

# Verify Vue component styles
grep -r "lightgreen" resources/ts/@layouts/
```

### Debug Tools

#### Browser Console
```javascript
// Check Vue component state
document.querySelector('#app').__vue_app__.config.globalProperties.$pinia.state.value

// Check component props
$0.__vueParentComponent.props
```

#### Network Tab
- Monitor API calls to `/api/manuscripts`
- Check for 404 or 500 errors
- Verify authentication headers

#### Vue DevTools
- Inspect component hierarchy
- Check Pinia store state
- Monitor component events

### Log Analysis

#### Application Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Test environment logs
tail -f storage/logs/testing.log
```

#### Console Logs
Look for these debug messages:
- `🖱️ Custom nav item clicked`
- `🚀 Select Manuscript clicked`
- `📍 Checking if Select Manuscript button is visible`

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Manuscript Button Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'yarn'
    
    - name: Install dependencies
      run: yarn install
    
    - name: Setup test database
      run: |
        yarn db:fresh:test
    
    - name: Run manuscript tests
      run: |
        yarn playwright:test:manuscript
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: test-results/
```

### Pre-commit Hooks

```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
echo "Running manuscript button tests..."
yarn playwright:test tests/regression/manuscript-button-regression.spec.js
```

## Performance Testing

### Load Time Benchmarks
- Button should appear within 5 seconds
- Click response should be under 500ms
- Page load should complete in under 3 seconds

### Performance Test Script
```javascript
// In tests
const startTime = Date.now();
await page.goto('/');
await page.waitForLoadState('networkidle');
const loadTime = Date.now() - startTime;
expect(loadTime).toBeLessThan(5000);
```

### Memory Usage
Monitor memory usage during manuscript selection:

```javascript
// Check memory usage
const memoryUsage = await page.evaluate(() => performance.memory);
console.log('Memory usage:', memoryUsage);
```

## Accessibility Testing

### WCAG Compliance
- Button must be keyboard accessible
- Button must have proper ARIA labels
- Button must work with screen readers

### Accessibility Test Examples
```javascript
// Keyboard navigation test
await page.keyboard.press('Tab');
await page.keyboard.press('Enter');

// Screen reader test
const accessibilityTree = await page.accessibility.snapshot();
```

### Manual Accessibility Testing
1. Navigate using only keyboard
2. Test with screen reader (NVDA, JAWS, VoiceOver)
3. Test with high contrast mode
4. Test with zoom levels up to 200%

## Best Practices

### Test Writing Guidelines
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Include cleanup in afterEach hooks
4. Use meaningful assertions
5. Add timeout handling for async operations

### Maintenance
1. Update tests when requirements change
2. Review test coverage regularly
3. Remove obsolete tests
4. Update documentation with changes

### Monitoring
1. Track test execution times
2. Monitor test failure rates
3. Set up alerts for regression failures
4. Review test reports regularly

## Reference

### Useful Commands
```bash
# Test commands
yarn playwright:test:manuscript
yarn playwright:test:ui
yarn playwright:test:headed
yarn playwright:test:debug

# Development commands
yarn dev:test:all
yarn db:fresh:test
yarn schema:text:test

# Debugging commands
yarn playwright:test --reporter=html
yarn playwright show-report
```

### File Locations
- Navigation config: `resources/ts/navigation/vertical/Freynet-Gagné-menu.ts`
- Button component: `resources/ts/@layouts/components/VerticalNavLink.vue`
- Drawer component: `resources/ts/components/dialogs/ManuscriptSelectionDrawer.vue`
- Store: `resources/ts/stores/manuscript.ts`

### Environment Variables
```env
# Testing environment
APP_ENV=testing
DB_CONNECTION=mysql
DB_DATABASE=wrioter_test
DB_USERNAME=wrioter_test
DB_PASSWORD=WrioterTest123!@#
```

---

*This guide is maintained as part of the Wrioter project documentation. Last updated: 2025-07-08*