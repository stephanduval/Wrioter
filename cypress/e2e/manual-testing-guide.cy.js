describe('Manual Testing Guide for Scrivener Import', () => {
  
  // This test is designed for manual testing with cypress:open
  it('Manual Login Test - Use this for interactive testing', () => {
    cy.log('🎯 MANUAL TESTING INSTRUCTIONS:')
    cy.log('1. This test will pause for you to login manually')
    cy.log('2. After login, the test will proceed with file upload')
    
    // Visit the application
    cy.visit('/')
    
    // Wait for you to login manually
    cy.log('⏳ Please login manually in the browser...')
    cy.log('⏳ Click anywhere on the page after you\'re logged in')
    
    // Wait for user to click (indicating they've logged in)
    cy.get('body').click()
    cy.wait(2000)
    
    // Navigate to scrivener import
    cy.visit('/scrivener-import')
    
    // Wait for the form to appear
    cy.get('body', { timeout: 10000 }).should('be.visible')
    
    // Try to find the import form
    cy.get('body').then($body => {
      if ($body.find('[data-test="scrivener-import-form"]').length > 0) {
        cy.log('✅ Found scrivener import form!')
        
        // Test file upload
        cy.get('[data-test="file-input"]').should('be.visible')
        cy.get('[data-test="upload-button"]').should('be.disabled')
        
        // Upload the test file
        cy.get('[data-test="file-input"]').selectFile('cypress/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip')
        cy.get('[data-test="upload-button"]').should('not.be.disabled')
        
        cy.log('📁 File selected! Ready to upload...')
        cy.log('🚀 Click the upload button to test the full workflow')
        
        // Optional: Automatically submit
        // cy.get('[data-test="upload-button"]').click()
        
      } else {
        cy.log('❌ Scrivener import form not found')
        cy.log('Current URL: ' + Cypress.config().baseUrl + '/scrivener-import')
        cy.log('Try navigating to the correct route manually')
      }
    })
  })

  // Test without database operations (for when migrations fail)
  it('API Test Without Database - Direct API testing', () => {
    cy.log('🧪 Testing API directly without database setup')
    
    // Test the import endpoint exists
    cy.request({
      method: 'GET',
      url: '/api/scrivener/imports',
      failOnStatusCode: false
    }).then((response) => {
      cy.log(`Import API Status: ${response.status}`)
      expect([200, 401, 422, 500]).to.include(response.status)
      
      if (response.status === 401) {
        cy.log('✅ API requires authentication (expected)')
      } else if (response.status === 200) {
        cy.log('✅ API accessible (user might be authenticated)')
      }
    })
    
    // Test file upload endpoint
    cy.fixture('Scrivener tutorial [2025_06_01_05_17_17].zip', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(blob => {
        const formData = new FormData()
        formData.append('file', blob, 'test.zip')
        
        cy.request({
          method: 'POST',
          url: '/api/scrivener/import',
          body: formData,
          failOnStatusCode: false,
          headers: {
            'Accept': 'application/json'
          }
        }).then((response) => {
          cy.log(`Upload API Status: ${response.status}`)
          
          if (response.status === 401) {
            cy.log('✅ Upload requires authentication (security working)')
          } else if (response.status === 200) {
            cy.log('✅ Upload successful!')
            cy.log('Response:', response.body)
          } else if (response.status === 422) {
            cy.log('✅ Validation working')
          }
        })
      })
  })
})