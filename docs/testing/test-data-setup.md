# Test Data Setup Guide

This guide explains how to set up and use test data for the manuscript selection functionality.

## Overview

The test data setup provides consistent, reliable data for testing the "Select Manuscript" button functionality across different test scenarios and environments.

## Test Data Structure

### Location
- **Fixtures**: `/tests/fixtures/manuscript-data.json`
- **Helpers**: `/tests/support/manuscript-helpers.js`
- **Configuration**: `/tests/config/manuscript-test-config.js`

### Data Types

#### Manuscripts
```json
{
  "id": 1,
  "title": "The Great Novel",
  "manuscript_type": "standard",
  "description": "A compelling story about adventure and discovery",
  "user_id": 1,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

#### Users
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "info@freynet-gagne.com",
  "role": "admin",
  "permissions": ["read", "write", "delete"],
  "subjects": ["manuscripts", "users", "admin"]
}
```

#### API Responses
```json
{
  "manuscripts_list_success": {
    "status": 200,
    "data": {
      "data": [...]
    }
  }
}
```

## Using Test Data

### In Test Files

```javascript
import { ManuscriptTestHelpers } from '../support/manuscript-helpers.js';

// Get test data
const testData = ManuscriptTestHelpers.getTestData();
const manuscripts = testData.manuscripts;
const users = testData.users;

// Get specific data
const adminUser = ManuscriptTestHelpers.getTestUserByRole('admin');
const standardManuscripts = ManuscriptTestHelpers.getManuscriptsByType('standard');
```

### Mock API Responses

```javascript
// Mock successful API response
await helpers.mockManuscriptApi('manuscripts_list_success');

// Mock with custom data
await helpers.mockManuscriptApiWithData(customManuscripts);

// Mock API error
await helpers.mockManuscriptApiError(500, 'Server Error');
```

### Generate Test Data

```javascript
// Generate multiple test manuscripts
const testManuscripts = ManuscriptTestHelpers.generateTestManuscripts(10);

// Generate single manuscript
const manuscript = TEST_DATA_GENERATORS.manuscript({
  title: 'Custom Title',
  manuscript_type: 'scrivener'
});
```

## Test Environment Setup

### Database Setup
```bash
# Fresh test database with seed data
yarn db:fresh:test

# Check test data
yarn schema:text:test
```

### Environment Variables
```env
# Test environment settings
APP_ENV=testing
DB_DATABASE=wrioter_test
DB_USERNAME=wrioter_test
DB_PASSWORD=WrioterTest123!@#
```

## Test Scenarios

### Basic Functionality
```javascript
const scenario = ManuscriptTestHelpers.getTestScenario('basic_functionality');
// Expected: Button shows alert on click
```

### Empty State
```javascript
const scenario = ManuscriptTestHelpers.getTestScenario('empty_state');
// Expected: Shows "No manuscripts found" message
```

### Error Handling
```javascript
const scenario = ManuscriptTestHelpers.getTestScenario('error_handling');
// Expected: Shows error message with retry option
```

### Performance Testing
```javascript
const scenario = ManuscriptTestHelpers.getTestScenario('performance_test');
// Expected: Loads within 2 seconds with 50 manuscripts
```

## Helper Functions

### Basic Helpers
```javascript
const helpers = new ManuscriptTestHelpers(page, request);

// Wait for button
await helpers.waitForSelectManuscriptButton();

// Click button
await helpers.clickSelectManuscriptButton();

// Handle alert
await helpers.handleAlertDialog('Expected message');

// Verify styling
const styling = await helpers.verifyButtonStyling();
```

### API Helpers
```javascript
// Mock different response types
await helpers.mockManuscriptApi('manuscripts_list_success');
await helpers.mockManuscriptApi('manuscripts_list_empty');
await helpers.mockManuscriptApi('manuscripts_list_error');

// Mock with delays
await helpers.mockSlowManuscriptApi(3000);

// Mock network errors
await helpers.mockManuscriptApiNetworkError();
```

### Performance Helpers
```javascript
const performanceHelpers = new PerformanceTestHelpers(page);

// Measure button response time
const responseTime = await performanceHelpers.measureButtonResponse();

// Check memory usage
const memoryInfo = await performanceHelpers.measureMemoryUsage();

// Get all metrics
const metrics = performanceHelpers.getMetrics();
```

## Configuration

### Test Configuration
```javascript
import { TEST_CONFIG } from '../config/manuscript-test-config.js';

// Timeouts
const buttonTimeout = TEST_CONFIG.timeouts.buttonAppearance;
const apiTimeout = TEST_CONFIG.timeouts.apiResponse;

// Selectors
const buttonSelector = TEST_CONFIG.selectors.selectManuscriptButton;
const drawerSelector = TEST_CONFIG.selectors.manuscriptDrawer;

// Performance benchmarks
const maxLoadTime = TEST_CONFIG.performance.buttonLoadTime;
const maxResponseTime = TEST_CONFIG.performance.buttonResponseTime;
```

### Browser Configuration
```javascript
import { BROWSER_CONFIGS } from '../config/manuscript-test-config.js';

// Different browser configs
const defaultConfig = BROWSER_CONFIGS.default;
const debugConfig = BROWSER_CONFIGS.debug;
const mobileConfig = BROWSER_CONFIGS.mobile;
```

## Test Patterns

### Button Visibility Pattern
```javascript
import { TEST_PATTERNS } from '../config/manuscript-test-config.js';

const isVisible = await TEST_PATTERNS.buttonVisibility(page, helpers);
```

### Button Click Pattern
```javascript
const alertMessage = await TEST_PATTERNS.buttonClick(page, helpers);
```

### API Integration Pattern
```javascript
const result = await TEST_PATTERNS.apiIntegration(page, helpers, 'success');
```

### Performance Measurement Pattern
```javascript
const duration = await TEST_PATTERNS.performanceMeasurement(page, helpers, async () => {
  await helpers.clickSelectManuscriptButton();
});
```

## Data Validation

### Validate Test Data
```javascript
import { TestDataValidator } from '../support/manuscript-helpers.js';

// Validate manuscript data
TestDataValidator.validateManuscript(manuscript);

// Validate user data
TestDataValidator.validateUser(user);

// Validate API response
TestDataValidator.validateApiResponse(response, 200);
```

## Cleanup

### Test Cleanup
```javascript
// Automatic cleanup after each test
await helpers.cleanup();

// Manual cleanup
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Reset API routes
await page.unroute('/api/manuscripts');
```

## Best Practices

### 1. Use Consistent Data
- Always use the same test data structure
- Validate data before using in tests
- Keep test data minimal but representative

### 2. Mock External Dependencies
- Mock API responses for predictable behavior
- Use different response types for different scenarios
- Test both success and error cases

### 3. Performance Considerations
- Generate large datasets only when needed
- Clean up test data after each test
- Monitor memory usage during tests

### 4. Error Handling
- Test with various error scenarios
- Validate error messages and recovery options
- Ensure tests clean up properly on failure

## Troubleshooting

### Common Issues

#### Test Data Not Loading
```bash
# Check if fixture file exists
ls -la tests/fixtures/manuscript-data.json

# Verify JSON syntax
cat tests/fixtures/manuscript-data.json | jq '.'
```

#### API Mocking Not Working
```javascript
// Check if route is properly mocked
await page.route('/api/manuscripts', route => {
  console.log('API route intercepted');
  route.continue();
});
```

#### Performance Issues
```javascript
// Monitor test execution time
const startTime = Date.now();
await helpers.clickSelectManuscriptButton();
const duration = Date.now() - startTime;
console.log(`Operation took ${duration}ms`);
```

### Debug Helpers
```javascript
// Enable debug mode
const helpers = new ManuscriptTestHelpers(page, request);
helpers.enableDebugMode();

// Check test data
const testData = ManuscriptTestHelpers.getTestData();
console.log('Available manuscripts:', testData.manuscripts.length);

// Monitor network requests
const { requests, responses } = await helpers.monitorNetworkRequests();
```

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Run manuscript tests with test data
  run: |
    yarn db:fresh:test
    yarn test:manuscript
```

### Test Data in CI
- Use consistent test database
- Seed with known test data
- Reset between test runs

## Extending Test Data

### Adding New Manuscripts
```javascript
// Add to manuscript-data.json
{
  "id": 999,
  "title": "New Test Manuscript",
  "manuscript_type": "standard",
  // ... other fields
}
```

### Adding New Test Scenarios
```javascript
// Add to test_scenarios section
"new_scenario": {
  "name": "New Test Scenario",
  "description": "Description of scenario",
  "expected_behavior": "Expected behavior"
}
```

### Creating Custom Helpers
```javascript
// Extend ManuscriptTestHelpers
class CustomManuscriptHelpers extends ManuscriptTestHelpers {
  async customTestMethod() {
    // Custom test logic
  }
}
```

---

*This guide is part of the Wrioter project testing documentation. Last updated: 2025-07-08*