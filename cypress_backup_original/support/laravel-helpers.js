// Laravel-specific testing helpers

// Add to cypress/support/e2e.js
import './laravel-helpers'

// Create a test route that bypasses authentication for Cypress
Cypress.Commands.add('enableTestMode', () => {
  cy.request({
    method: 'POST',
    url: '/cypress/enable-test-mode',
    failOnStatusCode: false
  })
})

// Helper to check if we're in a Laravel app
Cypress.Commands.add('isLaravelApp', () => {
  return cy.request('/').then((response) => {
    return response.headers['x-powered-by']?.includes('PHP') || 
           response.body.includes('Laravel')
  })
})

// Quick authentication for testing
Cypress.Commands.add('quickAuth', () => {
  // Try multiple authentication approaches
  cy.window().then((win) => {
    // Method 1: Set localStorage token
    win.localStorage.setItem('accessToken', 'cypress-test-token')
    
    // Method 2: Set session data if available
    if (win.sessionStorage) {
      win.sessionStorage.setItem('auth_user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@cypress.com'
      }))
    }
    
    // Method 3: Set cookies
    cy.setCookie('cypress_auth', 'true')
  })
})