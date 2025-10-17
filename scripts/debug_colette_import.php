<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Manuscript;
use App\Services\ScrivenerImport\FileHandler;
use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\DataTransformer;
use App\Services\ScrivenerImport\DatabasePopulator;
use App\Services\ScrivenerImport\RtfConverter;

// Check for existing Colette manuscript
echo "Checking for existing Colette manuscript...\n";
$existing = Manuscript::where('scrivener_uuid', 'F101AD8E-09AC-4698-9380-3580DC648872')->first();
if ($existing) {
    echo "Found existing manuscript: ID {$existing->id}, User {$existing->user_id}\n";
    echo "Deleting it...\n";
    $existing->delete();
}

// Get user
$user = User::first();
echo "Using user: {$user->id} - {$user->email}\n";

// Extract and parse
$fileHandler = new FileHandler();
$xmlParser = new XmlParser(new RtfConverter());
$dataTransformer = new DataTransformer(new RtfConverter());
$databasePopulator = new DatabasePopulator();

$zipPath = '/home/rogers/Code/Wrioter/Scrivener Zip Files/Colette Graphic Novel [2025_06_01_05_14_50].zip';

echo "Extracting ZIP...\n";
$extractedPath = $fileHandler->extract($zipPath);

echo "Project file should be at...\n";
$xmlPath = $extractedPath . '/project.scrivx';

echo "Parsing XML...\n";
$xmlData = $xmlParser->parse($xmlPath);

echo "Transforming data...\n";
$manuscriptData = $dataTransformer->transformManuscript($xmlData);
$manuscriptData['user_id'] = $user->id;

echo "Manuscript data:\n";
echo "  Title: {$manuscriptData['title']}\n";
echo "  UUID: {$manuscriptData['scrivener_uuid']}\n";
echo "  User ID: {$manuscriptData['user_id']}\n";

// Check again for duplicate
$dup = Manuscript::where('scrivener_uuid', $manuscriptData['scrivener_uuid'])
    ->where('user_id', $manuscriptData['user_id'])
    ->first();
    
if ($dup) {
    echo "ERROR: Found duplicate manuscript after extraction!\n";
    echo "  ID: {$dup->id}\n";
    echo "  Title: {$dup->title}\n";
    echo "  Created: {$dup->created_at}\n";
} else {
    echo "No duplicate found - proceeding with import...\n";
    
    // Transform items
    $itemsData = $dataTransformer->transformItems($xmlData);
    foreach ($itemsData as &$item) {
        $item['user_id'] = $user->id;
    }
    
    echo "Transformed " . count($itemsData) . " items\n";
    
    // Try to populate
    try {
        $collections = $dataTransformer->transformCollections($xmlData);
        $writingHistory = $dataTransformer->transformWritingHistory($xmlData);
        
        // Add user_id to writing history entries
        foreach ($writingHistory as &$history) {
            $history['user_id'] = $user->id;
        }
        
        $result = $databasePopulator->populate(
            $manuscriptData,
            $itemsData,
            $collections,
            $writingHistory
        );
        
        echo "Import successful!\n";
        echo "Manuscript ID: {$result['manuscript']->id}\n";
        echo "Items: {$result['items_count']}\n";
    } catch (\Exception $e) {
        echo "Import failed: " . $e->getMessage() . "\n";
        echo "Stack trace:\n";
        echo $e->getTraceAsString() . "\n";
    }
}

// Cleanup
$fileHandler->cleanup($extractedPath);