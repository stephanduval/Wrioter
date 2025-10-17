// Authentication helpers for Cypress testing

// Method 1: Direct API login and token storage
Cypress.Commands.add('loginViaAPI', (email = 'info@freynet-gagne.com', password = 'REPLACE_WITH_ACTUAL_PASSWORD') => {
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: {
      email,
      password
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200 && response.body.access_token) {
      // Store the token in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', response.body.access_token)
        win.localStorage.setItem('user', JSON.stringify(response.body.user || { email }))
      })
      // Set token in cookies if needed
      cy.setCookie('auth_token', response.body.access_token)
      return response.body.access_token
    } else {
      cy.log(`Login failed with status: ${response.status}`)
      return null
    }
  })
})

// Method 2: Laravel Sanctum token generation
Cypress.Commands.add('createTestUser', () => {
  cy.task('createUser').then((user) => {
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', user.token)
      win.localStorage.setItem('user', JSON.stringify(user))
    })
  })
})

// Method 3: Skip authentication for testing
Cypress.Commands.add('bypassAuth', () => {
  cy.window().then((win) => {
    // Set a fake token that your app recognizes as valid in testing
    win.localStorage.setItem('accessToken', 'cypress-test-token')
    win.localStorage.setItem('user', JSON.stringify({
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    }))
  })
})

// Method 4: Session-based login
Cypress.Commands.add('loginViaSession', (email = 'test@example.com', password = 'password') => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('form').submit()
    cy.url().should('not.contain', '/login')
  })
})
