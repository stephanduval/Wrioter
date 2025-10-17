const { defineConfig } = require('cypress')
const { exec } = require('child_process')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    video: false,
    screenshot: false,
    setupNodeEvents(on, config) {
      // Database tasks
      on('task', {
        'db:seed'() {
          return new Promise((resolve, reject) => {
            exec('php artisan migrate:fresh --seed --env=testing', (error, stdout, stderr) => {
              if (error) {
                console.error('Database seed failed:', error)
                reject(error)
              } else {
                console.log('Database seeded successfully')
                resolve(stdout)
              }
            })
          })
        },
        
        'createUser'() {
          return new Promise((resolve, reject) => {
            // Create a test user and return with token
            const command = `php artisan tinker --env=testing --execute="
              \\$user = \\App\\Models\\User::firstOrCreate([
                'email' => 'cypress@test.com'
              ], [
                'name' => 'Cypress Test User',
                'password' => bcrypt('cypress123'),
                'email_verified_at' => now()
              ]);
              \\$token = \\$user->createToken('cypress-test')->plainTextToken;
              echo json_encode(['id' => \\$user->id, 'name' => \\$user->name, 'email' => \\$user->email, 'token' => \\$token]);
            "`
            
            exec(command, (error, stdout, stderr) => {
              if (error) {
                console.error('User creation failed:', error)
                reject(error)
              } else {
                try {
                  const result = JSON.parse(stdout.trim())
                  console.log('Test user created:', result.email)
                  resolve(result)
                } catch (parseError) {
                  console.log('Raw output:', stdout)
                  reject(parseError)
                }
              }
            })
          })
        },
        
        'queue:work'() {
          return new Promise((resolve) => {
            // Start queue worker for processing imports
            const worker = exec('php artisan queue:work --env=testing --stop-when-empty --timeout=60')
            worker.on('close', () => resolve(null))
            setTimeout(() => {
              worker.kill()
              resolve(null)
            }, 30000) // Kill after 30 seconds
          })
        }
      })
    },
  },
})