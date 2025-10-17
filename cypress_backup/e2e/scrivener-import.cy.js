describe('Scrivener Import E2E Tests', () => {
  beforeEach(() => {
    // Reset database state
    cy.task('db:seed')
    
    // Visit the application and authenticate
    cy.visit('/')
    cy.login() // Using custom command
    
    // Navigate to scrivener import page  
    cy.visit('/build/scrivener-import')
    cy.url().should('include', '/scrivener-import')
    
    // Wait for page to fully load
    cy.get('[data-test="scrivener-import-form"]').should('be.visible')
  })

  it('successfully uploads and imports a Scrivener zip file', () => {
    // Test file upload interface
    cy.get('[data-test="file-input"]').should('be.visible')
    cy.get('[data-test="upload-button"]').should('be.disabled')
    
    // Upload the test Scrivener zip file
    cy.get('[data-test="file-input"]').selectFile('cypress/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip')
    
    // Verify file is selected
    cy.get('[data-test="upload-button"]').should('not.be.disabled')
    
    // Set up intercepts to monitor API calls
    cy.intercept('POST', '/api/scrivener/import').as('uploadFile')
    cy.intercept('GET', '/api/scrivener/imports').as('getImports')
    
    // Submit the form
    cy.get('[data-test="upload-button"]').click()
    
    // Wait for upload to complete
    cy.wait('@uploadFile').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
      expect(interception.response.body).to.have.property('message')
      expect(interception.response.body).to.have.property('import_id')
    })
    
    // Check that upload progress was shown
    cy.get('[data-test="upload-progress"]').should('have.been.visible')
    
    // Verify success message appears
    cy.get('[data-test="import-status"]').should('contain', 'Upload successful')
    
    // Check that processing status is shown
    cy.get('[data-test="processing-status"]').should('be.visible')
    cy.get('[data-test="processing-status"]').should('contain', 'Processing')
    
    // Wait for the import to complete by polling
    cy.waitForImportStatus('completed', 60000)
    
    // Verify the import appears in recent imports table
    cy.get('[data-test="recent-imports-table"]').should('be.visible')
    cy.get('[data-test="recent-imports-table"] tbody tr').should('have.length.greaterThan', 0)
    
    // Check that the latest import shows as completed
    cy.get('[data-test="recent-imports-table"] tbody tr').first().within(() => {
      cy.get('[data-test="import-filename"]').should('contain', 'Scrivener tutorial')
      cy.get('[data-test="import-status"]').should('contain', 'completed')
      cy.get('[data-test="view-manuscript-button"]').should('be.visible')
    })
    
    // Click to view the created manuscript
    cy.get('[data-test="recent-imports-table"] tbody tr').first()
      .find('[data-test="view-manuscript-button"]').click()
    
    // Verify we're redirected to the manuscript view
    cy.url().should('include', '/manuscripts/')
    cy.get('[data-test="manuscript-title"]').should('be.visible')
  })

  it('shows progress during file upload', () => {
    // Upload a file to test progress indicator
    cy.get('[data-test="file-input"]').selectFile('cypress/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip')
    
    // Intercept upload with delay to see progress
    cy.intercept('POST', '/api/scrivener/import', (req) => {
      req.reply((res) => {
        // Simulate slow upload
        setTimeout(() => {
          res.send({ message: 'Upload successful', import_id: 1 })
        }, 2000)
      })
    }).as('slowUpload')
    
    cy.get('[data-test="upload-button"]').click()
    
    // Check progress elements appear
    cy.get('[data-test="upload-progress"]').should('be.visible')
    cy.get('[data-test="upload-progress"]').should('contain', '%')
    
    // Upload button should be disabled during upload
    cy.get('[data-test="upload-button"]').should('be.disabled')
    
    // File input should be disabled during upload
    cy.get('[data-test="file-input"]').should('be.disabled')
    
    cy.wait('@slowUpload')
  })

  it('handles invalid file types gracefully', () => {
    // Create a fake non-zip file
    cy.writeFile('cypress/fixtures/invalid-file.txt', 'This is not a zip file')
    
    // Try to upload invalid file
    cy.get('[data-test="file-input"]').selectFile('cypress/fixtures/invalid-file.txt')
    
    // Check error message appears
    cy.get('[data-test="file-error"]').should('be.visible')
    cy.get('[data-test="file-error"]').should('contain', 'invalid file type')
    
    // Upload button should remain disabled
    cy.get('[data-test="upload-button"]').should('be.disabled')
  })

  it('handles large files appropriately', () => {
    // Create a large fake file (this would be mocked in real scenario)
    cy.get('[data-test="file-input"]').then(($input) => {
      const largeFakeFile = new File(['x'.repeat(60 * 1024 * 1024)], 'large-file.zip', {
        type: 'application/zip'
      })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(largeFakeFile)
      $input[0].files = dataTransfer.files
      $input[0].dispatchEvent(new Event('change', { bubbles: true }))
    })
    
    // Check error message for file too large
    cy.get('[data-test="file-error"]').should('be.visible')
    cy.get('[data-test="file-error"]').should('contain', 'too large')
    
    // Upload button should be disabled
    cy.get('[data-test="upload-button"]').should('be.disabled')
  })

  it('shows real-time status updates during processing', () => {
    // Mock the processing flow with different statuses
    let callCount = 0
    cy.intercept('GET', '/api/scrivener/imports', (req) => {
      callCount++
      if (callCount === 1) {
        req.reply([{
          id: 1,
          filename: 'test.zip',
          status: 'pending',
          created_at: new Date().toISOString()
        }])
      } else if (callCount === 2) {
        req.reply([{
          id: 1,
          filename: 'test.zip',
          status: 'processing',
          current_step: 'Extracting files...',
          progress: 25,
          created_at: new Date().toISOString()
        }])
      } else if (callCount === 3) {
        req.reply([{
          id: 1,
          filename: 'test.zip',
          status: 'processing',
          current_step: 'Processing items...',
          progress: 75,
          created_at: new Date().toISOString()
        }])
      } else {
        req.reply([{
          id: 1,
          filename: 'test.zip',
          status: 'completed',
          manuscript_id: 1,
          created_at: new Date().toISOString()
        }])
      }
    }).as('statusUpdates')
    
    // Upload file
    cy.get('[data-test="file-input"]').selectFile('cypress/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip')
    cy.intercept('POST', '/api/scrivener/import', { message: 'Upload successful', import_id: 1 })
    cy.get('[data-test="upload-button"]').click()
    
    // Check different processing states
    cy.wait('@statusUpdates')
    cy.get('[data-test="recent-imports-table"]').should('contain', 'pending')
    
    cy.wait('@statusUpdates')
    cy.get('[data-test="recent-imports-table"]').should('contain', 'processing')
    cy.get('[data-test="recent-imports-table"]').should('contain', 'Extracting files')
    
    cy.wait('@statusUpdates')
    cy.get('[data-test="recent-imports-table"]').should('contain', 'Processing items')
    
    cy.wait('@statusUpdates')
    cy.get('[data-test="recent-imports-table"]').should('contain', 'completed')
  })

  it('handles network errors gracefully', () => {
    // Mock network error
    cy.intercept('POST', '/api/scrivener/import', { statusCode: 500, body: { error: 'Server error' } })
    
    cy.get('[data-test="file-input"]').selectFile('cypress/fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip')
    cy.get('[data-test="upload-button"]').click()
    
    // Check error message appears
    cy.get('[data-test="import-status"]').should('be.visible')
    cy.get('[data-test="import-status"]').should('contain', 'error')
    
    // Check that upload state is reset
    cy.get('[data-test="upload-button"]').should('not.be.disabled')
  })

  it('allows multiple concurrent imports to be tracked', () => {
    // Mock multiple imports in different states
    cy.intercept('GET', '/api/scrivener/imports', [
      {
        id: 1,
        filename: 'import1.zip',
        status: 'completed',
        manuscript_id: 1,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 2,
        filename: 'import2.zip',
        status: 'processing',
        current_step: 'Processing items...',
        progress: 50,
        created_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 3,
        filename: 'import3.zip',
        status: 'failed',
        error_message: 'Invalid file format',
        created_at: new Date(Date.now() - 900000).toISOString()
      }
    ])
    
    // Check that all imports are displayed
    cy.get('[data-test="recent-imports-table"] tbody tr').should('have.length', 3)
    
    // Check different statuses are shown correctly
    cy.get('[data-test="recent-imports-table"]').should('contain', 'completed')
    cy.get('[data-test="recent-imports-table"]').should('contain', 'processing')
    cy.get('[data-test="recent-imports-table"]').should('contain', 'failed')
    
    // Check that view manuscript button only appears for completed imports
    cy.get('[data-test="recent-imports-table"] tbody tr').eq(0).within(() => {
      cy.get('[data-test="view-manuscript-button"]').should('be.visible')
    })
    
    cy.get('[data-test="recent-imports-table"] tbody tr').eq(1).within(() => {
      cy.get('[data-test="view-manuscript-button"]').should('not.exist')
    })
  })
})