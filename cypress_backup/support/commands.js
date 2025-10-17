// Custom Cypress commands for the Wrioter application

// Login command
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password') => {
  cy.visit('/login')
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/login')
})

// Upload file command
Cypress.Commands.add('uploadFile', (selector, filePath, fileName) => {
  cy.get(selector).selectFile(filePath, { fileName })
})

// Wait for API request to complete
Cypress.Commands.add('waitForUpload', () => {
  cy.intercept('POST', '/api/scrivener/import').as('uploadRequest')
  cy.wait('@uploadRequest')
})

// Wait for import status polling
Cypress.Commands.add('waitForImportStatus', (expectedStatus, timeout = 30000) => {
  cy.intercept('GET', '/api/scrivener/imports').as('statusCheck')
  
  const checkStatus = () => {
    cy.wait('@statusCheck', { timeout }).then((interception) => {
      const imports = interception.response.body
      const latestImport = imports[0]
      
      if (latestImport && latestImport.status === expectedStatus) {
        return
      } else if (latestImport && latestImport.status === 'failed') {
        throw new Error(`Import failed: ${latestImport.error_message}`)
      } else {
        cy.wait(2000)
        checkStatus()
      }
    })
  }
  
  checkStatus()
})

// Get CSRF token for API requests
Cypress.Commands.add('getCsrfToken', () => {
  return cy.get('meta[name="csrf-token"]').invoke('attr', 'content')
})

// Set authentication token in localStorage
Cypress.Commands.add('setAuthToken', (token) => {
  cy.window().then((win) => {
    win.localStorage.setItem('accessToken', token)
  })
})