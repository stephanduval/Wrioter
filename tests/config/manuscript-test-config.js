/**
 * Configuration for manuscript testing
 */

export const TEST_CONFIG = {
  // Test environment settings
  environment: {
    baseUrl: 'http://localhost:8000',
    testDatabase: 'wrioter_test',
    testMode: 'testing'
  },

  // Timeout settings
  timeouts: {
    buttonAppearance: 5000,
    drawerOpen: 3000,
    apiResponse: 10000,
    pageLoad: 15000,
    alertDialog: 2000
  },

  // Test user credentials
  users: {
    admin: {
      email: 'info@freynet-gagne.com',
      password: 'ChangeMe2024!',
      role: 'admin'
    },
    client: {
      email: 'client@client.com',
      password: 'ChangeMe2024!',
      role: 'client'
    },
    sophie: {
      email: 'sophie@freynet-gagne.com',
      password: 'ChangeMe2024!',
      role: 'client'
    }
  },

  // Selectors for UI elements
  selectors: {
    selectManuscriptButton: 'text="Select Manuscript"',
    customMenuItem: '[data-test-id="custom-menu-item"]',
    manuscriptDrawer: '.v-navigation-drawer',
    manuscriptList: '.v-list-item',
    drawerCancel: 'text="Cancel"',
    drawerSelect: 'text="Select"',
    loadingIndicator: '.v-progress-circular',
    errorAlert: '.v-alert[type="error"]',
    emptyState: 'text="No manuscripts found"'
  },

  // Expected UI states
  expectedStates: {
    buttonVisible: true,
    buttonClickable: true,
    hasCustomStyling: true,
    showsAlert: true,
    preventsNavigation: true
  },

  // API endpoints
  apiEndpoints: {
    manuscripts: '/api/manuscripts',
    manuscriptDetail: '/api/manuscripts/{id}',
    createManuscript: '/api/manuscripts',
    updateManuscript: '/api/manuscripts/{id}',
    deleteManuscript: '/api/manuscripts/{id}'
  },

  // Test data configuration
  testData: {
    maxManuscripts: 100,
    manuscriptTypes: ['standard', 'scrivener'],
    defaultManuscriptData: {
      title: 'Test Manuscript',
      manuscript_type: 'standard',
      description: 'Test description'
    }
  },

  // Performance benchmarks
  performance: {
    buttonLoadTime: 2000,        // Button should appear within 2 seconds
    buttonResponseTime: 500,     // Button should respond within 500ms
    drawerOpenTime: 200,         // Drawer should open within 200ms
    apiResponseTime: 1000,       // API should respond within 1 second
    pageLoadTime: 3000          // Page should load within 3 seconds
  },

  // Browser settings
  browser: {
    defaultViewport: { width: 1280, height: 720 },
    mobileViewport: { width: 375, height: 667 },
    tabletViewport: { width: 768, height: 1024 },
    desktopViewport: { width: 1920, height: 1080 }
  },

  // Screenshot settings
  screenshots: {
    onFailure: true,
    onSuccess: false,
    fullPage: true,
    path: 'test-results/'
  },

  // Debug settings
  debug: {
    enableConsoleLogging: true,
    enableNetworkLogging: true,
    enablePerformanceLogging: true,
    verboseMode: false
  },

  // Test categories
  categories: {
    functionality: {
      name: 'Functionality Tests',
      description: 'Basic button functionality and interactions',
      priority: 'high'
    },
    integration: {
      name: 'Integration Tests',
      description: 'Full workflow and component integration',
      priority: 'high'
    },
    regression: {
      name: 'Regression Tests',
      description: 'Prevent previously fixed issues from returning',
      priority: 'medium'
    },
    performance: {
      name: 'Performance Tests',
      description: 'Load times and responsiveness',
      priority: 'medium'
    },
    accessibility: {
      name: 'Accessibility Tests',
      description: 'Keyboard navigation and screen reader support',
      priority: 'medium'
    },
    visual: {
      name: 'Visual Tests',
      description: 'UI appearance and styling',
      priority: 'low'
    }
  },

  // Test environments
  environments: {
    development: {
      baseUrl: 'http://localhost:8000',
      database: 'wrioter_dev',
      debug: true
    },
    testing: {
      baseUrl: 'http://localhost:8000',
      database: 'wrioter_test',
      debug: true
    },
    staging: {
      baseUrl: 'https://staging.wrioter.com',
      database: 'wrioter_staging',
      debug: false
    },
    production: {
      baseUrl: 'https://wrioter.com',
      database: 'wrioter_production',
      debug: false
    }
  }
};

// Test run configuration
export const TEST_RUN_CONFIG = {
  // Which tests to run
  enabledTests: {
    functional: true,
    integration: true,
    regression: true,
    performance: true,
    accessibility: true,
    visual: false // Usually disabled for CI
  },

  // Test execution settings
  execution: {
    parallel: true,
    retries: 2,
    timeout: 60000,
    slowTestThreshold: 10000
  },

  // Reporting settings
  reporting: {
    html: true,
    json: true,
    junit: false,
    allure: false
  }
};

// Browser configuration for different test types
export const BROWSER_CONFIGS = {
  default: {
    headless: true,
    viewport: TEST_CONFIG.browser.defaultViewport,
    ignoreHTTPSErrors: true,
    acceptDownloads: false
  },

  debug: {
    headless: false,
    viewport: TEST_CONFIG.browser.defaultViewport,
    ignoreHTTPSErrors: true,
    acceptDownloads: false,
    slowMo: 100
  },

  mobile: {
    headless: true,
    viewport: TEST_CONFIG.browser.mobileViewport,
    ignoreHTTPSErrors: true,
    acceptDownloads: false,
    hasTouch: true,
    isMobile: true
  },

  accessibility: {
    headless: true,
    viewport: TEST_CONFIG.browser.defaultViewport,
    ignoreHTTPSErrors: true,
    acceptDownloads: false,
    colorScheme: 'light',
    reducedMotion: 'reduce'
  }
};

// Test data generators
export const TEST_DATA_GENERATORS = {
  manuscript: (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    title: `Test Manuscript ${Date.now()}`,
    manuscript_type: 'standard',
    description: 'Generated test manuscript',
    user_id: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  user: (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    role: 'client',
    ...overrides
  }),

  apiResponse: (data, status = 200) => ({
    status,
    data: status < 400 ? { data } : undefined,
    error: status >= 400 ? { message: 'Test error' } : undefined
  })
};

// Common test patterns
export const TEST_PATTERNS = {
  // Pattern for testing button visibility
  buttonVisibility: async (page, helpers) => {
    const button = await helpers.waitForSelectManuscriptButton();
    return await button.isVisible();
  },

  // Pattern for testing button click
  buttonClick: async (page, helpers) => {
    const alertPromise = helpers.handleAlertDialog();
    await helpers.clickSelectManuscriptButton();
    return await alertPromise;
  },

  // Pattern for testing API integration
  apiIntegration: async (page, helpers, responseType = 'success') => {
    await helpers.mockManuscriptApi(`manuscripts_list_${responseType}`);
    await helpers.clickSelectManuscriptButton();
    
    if (responseType === 'success') {
      return await helpers.waitForManuscriptDrawer();
    } else {
      return await page.locator(TEST_CONFIG.selectors.errorAlert).isVisible();
    }
  },

  // Pattern for testing performance
  performanceMeasurement: async (page, helpers, action) => {
    const startTime = Date.now();
    await action();
    const endTime = Date.now();
    return endTime - startTime;
  }
};

// Error messages and expected text
export const EXPECTED_MESSAGES = {
  alerts: {
    selectManuscript: 'Select Manuscript clicked! This is a custom navigation item.',
    customClick: 'Custom nav item clicked'
  },

  console: {
    clickDetected: '🖱️ Custom nav item clicked: menu.selectManuscript',
    manuscriptClicked: '🚀 Select Manuscript clicked!',
    permissionBypass: '🔧 Select Manuscript found - bypassing permissions'
  },

  drawer: {
    title: 'Select Manuscript',
    loading: 'Loading manuscripts...',
    empty: 'No manuscripts found',
    error: 'Failed to load manuscripts'
  },

  buttons: {
    cancel: 'Cancel',
    select: 'Select'
  }
};

// Test utilities
export const TEST_UTILS = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  generateTimestamp: () => new Date().toISOString().replace(/[:.]/g, '-'),

  formatTestName: (name) => name.toLowerCase().replace(/\s+/g, '-'),

  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

export default TEST_CONFIG;