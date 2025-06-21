// Cypress support file for E2E tests

// Import commands
import './commands'
import './auth-commands'
import './laravel-helpers'

// Disable uncaught exception handling for now
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the test from failing on uncaught exceptions
  // This is useful for third-party libraries that might throw errors
  return false
})