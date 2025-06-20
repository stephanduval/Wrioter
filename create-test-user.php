<?php
// Quick script to create a test user for Cypress testing
// Run this with: php create-test-user.php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

try {
    $user = User::firstOrCreate([
        'email' => 'cypress@test.com'
    ], [
        'name' => 'Cypress Test User',
        'password' => bcrypt('cypress123'),
        'email_verified_at' => now()
    ]);

    if ($user->wasRecentlyCreated) {
        echo "✅ Test user created!\n";
    } else {
        echo "✅ Test user already exists!\n";
    }

    echo "📧 Email: cypress@test.com\n";
    echo "🔑 Password: cypress123\n";
    
    // Generate a token if using Sanctum
    if (method_exists($user, 'createToken')) {
        $token = $user->createToken('cypress-test')->plainTextToken;
        echo "🎟️  API Token: {$token}\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>