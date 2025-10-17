<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Jobs\ProcessScrivenerImport;
use App\Models\ScrivenerImport;
use Illuminate\Support\Facades\Storage;

// Get first user
$user = User::first();
if (!$user) {
    echo "No user found. Creating one...\n";
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'name' => 'Test User'
    ]);
}

echo "Using user: " . $user->email . "\n";

// Create import record
$import = ScrivenerImport::create([
    'user_id' => $user->id,
    'filename' => 'Colette Graphic Novel.zip',
    'status' => 'pending',
    'storage_path' => 'test',
    'progress' => 0,
]);

// Copy file to storage
$sourcePath = '/home/rogers/Code/Wrioter/Scrivener Zip Files/Colette Graphic Novel [2025_06_01_05_14_50].zip';
$destPath = 'scrivener/temp/test-' . uniqid() . '.zip';
Storage::put($destPath, file_get_contents($sourcePath));

$import->storage_path = $destPath;
$import->save();

// Process synchronously
echo "Processing import...\n";
$job = new ProcessScrivenerImport($import);

// Get dependencies from container
$fileHandler = app(\App\Services\ScrivenerImport\FileHandler::class);
$xmlParser = app(\App\Services\ScrivenerImport\XmlParser::class);
$dataTransformer = app(\App\Services\ScrivenerImport\DataTransformer::class);
$databasePopulator = app(\App\Services\ScrivenerImport\DatabasePopulator::class);

$job->handle($fileHandler, $xmlParser, $dataTransformer, $databasePopulator);

$import->refresh();
echo "Import completed with status: " . $import->status . "\n";

if ($import->status === 'failed') {
    echo "Error: " . ($import->error_message ?? 'Unknown error') . "\n";
} else {
    echo "Import successful!\n";
    echo "Manuscript ID: " . ($import->results['manuscript_id'] ?? 'Not found') . "\n";
}