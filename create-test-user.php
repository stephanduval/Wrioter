<?php
// Quick script to create a test user for Cypress testing
// Run this with: php create-test-user.php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

try {
    // Generate secure random password or use environment variable
    $testPassword = env('TEST_USER_PASSWORD', bin2hex(random_bytes(8)));
    
    $user = User::firstOrCreate([
        'email' => 'cypress@test.com'
    ], [
        'name' => 'Cypress Test User',
        'password' => bcrypt($testPassword),
        'email_verified_at' => now()
    ]);

    if ($user->wasRecentlyCreated) {
        echo "✅ Test user created!\n";
        echo "🔑 Generated Password: {$testPassword}\n";
        echo "⚠️  IMPORTANT: Store this password securely - it will not be shown again!\n";
    } else {
        echo "✅ Test user already exists!\n";
        echo "ℹ️  Password is stored in environment or was previously generated\n";
    }

    echo "📧 Email: cypress@test.com\n";
    
    // Generate a token if using Sanctum
    if (method_exists($user, 'createToken')) {
        $token = $user->createToken('cypress-test')->plainTextToken;
        echo "🎟️  API Token: {$token}\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>