describe('Scrivener Import - Full Workflow Test', () => {
  it('tests complete upload to completion workflow', () => {
    cy.log('🧪 Testing complete Scrivener import workflow with unique file...')
    
    // Login first
    cy.request({
      method: 'POST',
      url: '/api/login',
      body: {
        email: 'info@freynet-gagne.com',
        password: 'password123'
      },
      failOnStatusCode: false
    }).then((loginResponse) => {
      
      if (loginResponse.status === 200 && loginResponse.body.access_token) {
        const token = loginResponse.body.access_token
        cy.log('✅ Authentication successful')
        
        // Create a unique filename by copying and renaming the test file
        const timestamp = Date.now()
        const uniqueFilename = `Scrivener-test-${timestamp}.zip`
        
        // Copy the test file to create a unique version
        cy.task('db:seed') // This also helps reset any conflicting data
        
        cy.fixture('Scrivener tutorial [2025_06_01_05_17_17].zip', 'binary')
          .then(Cypress.Blob.binaryStringToBlob)
          .then(blob => {
            const formData = new FormData()
            formData.append('file', blob, uniqueFilename)
            
            cy.log(`📁 Uploading file: ${uniqueFilename}`)
            
            cy.request({
              method: 'POST',
              url: '/api/scrivener/import',
              body: formData,
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'X-Requested-With': 'XMLHttpRequest'
              }
            }).then((uploadResponse) => {
              expect(uploadResponse.status).to.equal(200)
              expect(uploadResponse.body).to.have.property('import_id')
              
              const importId = uploadResponse.body.import_id
              cy.log(`✅ Upload successful! Import ID: ${importId}`)
              
              // Step 2: Monitor the import status until completion
              cy.log('⏳ Monitoring import status...')
              
              const checkStatus = (attempt = 1, maxAttempts = 30) => {
                cy.log(`📊 Status check attempt ${attempt}/${maxAttempts}`)
                
                cy.request({
                  method: 'GET',
                  url: '/api/scrivener/imports',
                  headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                }).then((statusResponse) => {
                  expect(statusResponse.status).to.equal(200)
                  
                  const imports = statusResponse.body
                  const ourImport = imports.find(imp => imp.id === importId)
                  
                  if (ourImport) {
                    cy.log(`📋 Import Status: ${ourImport.status}`)
                    cy.log(`📝 Current Step: ${ourImport.current_step}`)
                    
                    if (ourImport.status === 'completed') {
                      cy.log('🎉 IMPORT COMPLETED SUCCESSFULLY!')
                      expect(ourImport.manuscript_id).to.exist
                      cy.log(`📖 Manuscript ID: ${ourImport.manuscript_id}`)
                      
                      // Verify the manuscript was created
                      cy.request({
                        method: 'GET',
                        url: `/api/manuscripts/${ourImport.manuscript_id}`,
                        headers: {
                          'Accept': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        failOnStatusCode: false
                      }).then((manuscriptResponse) => {
                        if (manuscriptResponse.status === 200) {
                          cy.log('✅ MANUSCRIPT VERIFICATION SUCCESSFUL!')
                          cy.log(`📚 Manuscript Title: ${manuscriptResponse.body.title}`)
                        }
                      })
                      
                    } else if (ourImport.status === 'failed') {
                      cy.log(`❌ Import failed: ${ourImport.error_message}`)
                      throw new Error(`Import failed: ${ourImport.error_message}`)
                      
                    } else if (ourImport.status === 'processing' || ourImport.status === 'pending') {
                      if (attempt < maxAttempts) {
                        cy.wait(2000) // Wait 2 seconds between checks
                        checkStatus(attempt + 1, maxAttempts)
                      } else {
                        throw new Error(`Import still ${ourImport.status} after ${maxAttempts} attempts`)
                      }
                      
                    } else {
                      cy.log(`⚠️  Unknown status: ${ourImport.status}`)
                      if (attempt < maxAttempts) {
                        cy.wait(2000)
                        checkStatus(attempt + 1, maxAttempts)
                      }
                    }
                  } else {
                    throw new Error(`Import with ID ${importId} not found`)
                  }
                })
              }
              
              // Start status monitoring
              checkStatus()
            })
          })
          
      } else {
        throw new Error('Authentication failed')
      }
    })
  })
})