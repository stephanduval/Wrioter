<?php

/**
 * Test Scrivener Import Workflow
 * 
 * This script tests the complete import workflow and validates RTF content preservation.
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Manuscript;
use App\Models\Item;
use App\Services\ScrivenerImport\FileHandler;
use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\DataTransformer;
use App\Services\ScrivenerImport\DatabasePopulator;
use App\Services\ScrivenerImport\RtfConverter;
use App\Services\ScrivenerImport\FileScanner;
use Illuminate\Support\Facades\DB;

// Test parameters
$projectPath = '/home/rogers/Code/Wrioter/Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17]/scrivener tutorial.scriv';
$userEmail = 'info@freynet-gagne.com';

echo "Testing Scrivener Import Workflow\n";
echo str_repeat("=", 50) . "\n";

try {
    // Find or create test user
    $user = User::where('email', $userEmail)->first();
    if (!$user) {
        echo "Test user not found: {$userEmail}\n";
        exit(1);
    }
    
    echo "Test user: {$user->email} (ID: {$user->id})\n";
    
    // Check if project exists
    if (!file_exists($projectPath)) {
        echo "Project path not found: {$projectPath}\n";
        exit(1);
    }
    
    echo "Project path: {$projectPath}\n";
    
    // Initialize services
    $rtfConverter = new RtfConverter();
    $fileScanner = new FileScanner();
    $xmlParser = new XmlParser($rtfConverter, $fileScanner);
    $dataTransformer = new DataTransformer($rtfConverter);
    $databasePopulator = new DatabasePopulator($fileScanner);
    
    echo "Services initialized\n";
    
    // Step 1: Parse XML
    echo "\nStep 1: Parsing XML...\n";
    $xmlPath = $projectPath . '/scrivener tutorial.scrivx';
    $parsedData = $xmlParser->parse($xmlPath);
    
    echo "Parsed project: " . ($parsedData['project']['Title'] ?? 'Unknown') . "\n";
    echo "Binder items: " . count($parsedData['binder']['items']) . "\n";
    echo "Project files found: " . count($parsedData['project_files'] ?? []) . "\n";
    
    // Step 2: Transform data
    echo "\nStep 2: Transforming data...\n";
    $manuscriptData = $dataTransformer->transformManuscript($parsedData);
    $manuscriptData['user_id'] = $user->id;
    
    // Transform manuscript raw files
    $manuscriptRawFiles = $dataTransformer->transformManuscriptRawFiles($parsedData['project_files'] ?? []);
    
    $itemsData = $dataTransformer->transformItems($parsedData);
    $collectionsData = $dataTransformer->transformCollections($parsedData);
    $writingHistoryData = $dataTransformer->transformWritingHistory($parsedData);
    
    // Set user_id for all items and add attachments
    foreach ($itemsData as &$item) {
        $item['user_id'] = $user->id;
        
        // Add empty attachments array for this test
        $item['attachments'] = [];
    }
    unset($item);
    
    // Set user_id for writing history
    foreach ($writingHistoryData as &$history) {
        $history['user_id'] = $user->id;
    }
    unset($history);
    
    echo "Manuscript: " . $manuscriptData['title'] . "\n";
    echo "Items to import: " . count($itemsData) . "\n";
    echo "Collections: " . count($collectionsData) . "\n";
    echo "Manuscript raw files: " . count($manuscriptRawFiles) . "\n";
    
    // Step 3: Analyze RTF content preservation
    echo "\nStep 3: Analyzing RTF content...\n";
    $rtfContentItems = 0;
    $rawContentItems = 0;
    $largeItems = 0;
    
    foreach ($itemsData as $item) {
        if (!empty($item['raw_content'])) {
            $rawContentItems++;
            
            // Check if raw content is actual RTF
            if (str_starts_with($item['raw_content'], '{\\rtf')) {
                $rtfContentItems++;
            }
            
            // Check size
            if (strlen($item['raw_content']) > 65000) {
                $largeItems++;
            }
        }
    }
    
    echo "Items with raw content: {$rawContentItems}\n";
    echo "Items with RTF content: {$rtfContentItems}\n";
    echo "Large RTF items (>65KB): {$largeItems}\n";
    
    // Debug: Show sample raw content before import
    echo "\nDEBUG: Sample items before import:\n";
    $sampleCount = 0;
    foreach ($itemsData as $item) {
        if (!empty($item['raw_content']) && $sampleCount < 3) {
            echo "  Item: {$item['title']}\n";
            echo "    Raw content length: " . strlen($item['raw_content']) . "\n";
            echo "    Raw content preview: " . substr($item['raw_content'], 0, 50) . "...\n";
            $sampleCount++;
        }
    }
    
    // Step 4: Import to database
    echo "\nStep 4: Importing to database...\n";
    
    DB::beginTransaction();
    try {
        $result = $databasePopulator->populate(
            $manuscriptData,
            $itemsData,
            $collectionsData,
            $writingHistoryData,
            $manuscriptRawFiles
        );
        
        echo "Import successful!\n";
        echo "Manuscript ID: " . $result['manuscript']->id . "\n";
        echo "Items created: " . $result['items_count'] . "\n";
        echo "Raw files created: " . $result['raw_files_count'] . "\n";
        
        // Step 5: Validate imported content
        echo "\nStep 5: Validating imported content...\n";
        
        $manuscript = $result['manuscript'];
        $importedItems = Item::whereIn('id', $manuscript->items()->pluck('items.id'))->get();
        
        $validationResults = [
            'perfect_matches' => 0,
            'has_raw_content' => 0,
            'has_rtf_header' => 0,
            'size_handled_correctly' => 0,
            'item_details' => [],
            'successful_items' => [],
            'failed_items' => [],
            'issues' => []
        ];
        
        foreach ($importedItems as $item) {
            $itemResult = [
                'title' => $item->title,
                'uuid' => $item->scrivener_uuid,
                'status' => 'failed',
                'has_raw_content' => !empty($item->raw_content),
                'has_rtf_header' => false,
                'original_size' => 0,
                'imported_size' => strlen($item->raw_content ?? ''),
                'content_size' => strlen($item->content ?? ''),
                'is_perfect_match' => false,
                'is_large_file' => false,
                'size_handled_correctly' => false,
                'issues' => [],
                'details' => []
            ];
            
            // Find matching original item
            $originalItem = null;
            foreach ($itemsData as $original) {
                if ($original['scrivener_uuid'] === $item->scrivener_uuid) {
                    $originalItem = $original;
                    $itemResult['original_size'] = strlen($original['raw_content'] ?? '');
                    break;
                }
            }
            
            if (!$originalItem) {
                $itemResult['issues'][] = 'No original data found';
                $validationResults['failed_items'][] = $itemResult;
                continue;
            }
            
            // Check if item has content
            if (empty($item->raw_content)) {
                if (empty($originalItem['raw_content'])) {
                    $itemResult['status'] = 'no_content_expected';
                    $itemResult['details'][] = 'No content in original or imported';
                } else {
                    $itemResult['issues'][] = 'Raw content missing in database';
                }
            } else {
                $validationResults['has_raw_content']++;
                
                // Check RTF header
                if (str_starts_with($item->raw_content, '{\\rtf')) {
                    $itemResult['has_rtf_header'] = true;
                    $validationResults['has_rtf_header']++;
                    $itemResult['details'][] = 'Valid RTF header';
                } else {
                    $itemResult['issues'][] = 'Invalid or missing RTF header';
                }
                
                // Check if it's a large file
                $itemResult['is_large_file'] = strlen($item->raw_content) > 65000;
                if ($itemResult['is_large_file']) {
                    if (strlen($item->content) <= 65000) {
                        $itemResult['size_handled_correctly'] = true;
                        $validationResults['size_handled_correctly']++;
                        $itemResult['details'][] = 'Large file truncation handled correctly';
                    } else {
                        $itemResult['issues'][] = 'Large file not truncated in content field';
                    }
                }
                
                // Check for perfect match
                if ($originalItem['raw_content'] === $item->raw_content) {
                    $itemResult['is_perfect_match'] = true;
                    $validationResults['perfect_matches']++;
                    $itemResult['status'] = 'perfect';
                    $itemResult['details'][] = 'Perfect content match';
                } elseif (!empty($originalItem['raw_content'])) {
                    // Calculate similarity
                    $similarity = calculateContentSimilarity($originalItem['raw_content'], $item->raw_content);
                    $itemResult['similarity'] = $similarity;
                    
                    if ($similarity > 0.95) {
                        $itemResult['status'] = 'good';
                        $itemResult['details'][] = 'High content similarity (' . round($similarity * 100, 1) . '%)';
                    } elseif ($similarity > 0.8) {
                        $itemResult['status'] = 'poor';
                        $itemResult['issues'][] = 'Moderate content similarity (' . round($similarity * 100, 1) . '%)';
                    } else {
                        $itemResult['issues'][] = 'Low content similarity (' . round($similarity * 100, 1) . '%)';
                    }
                }
            }
            
            // Categorize item
            if (in_array($itemResult['status'], ['perfect', 'good', 'no_content_expected'])) {
                $validationResults['successful_items'][] = $itemResult;
            } else {
                $validationResults['failed_items'][] = $itemResult;
            }
            
            $validationResults['item_details'][] = $itemResult;
        }
        
        echo "Validation Results Summary:\n";
        echo "  Total items: " . count($validationResults['item_details']) . "\n";
        echo "  Successful items: " . count($validationResults['successful_items']) . "\n";
        echo "  Failed items: " . count($validationResults['failed_items']) . "\n";
        echo "  Items with raw content: " . $validationResults['has_raw_content'] . "\n";
        echo "  Items with RTF headers: " . $validationResults['has_rtf_header'] . "\n";
        echo "  Large files handled correctly: " . $validationResults['size_handled_correctly'] . "\n";
        echo "  Perfect content matches: " . $validationResults['perfect_matches'] . "\n";
        
        // Show successful items
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "SUCCESSFUL IMPORTS (" . count($validationResults['successful_items']) . " items):\n";
        echo str_repeat("=", 60) . "\n";
        foreach ($validationResults['successful_items'] as $item) {
            $statusIcon = $item['status'] === 'perfect' ? '✓' : '○';
            echo "{$statusIcon} {$item['title']}\n";
            echo "    Status: {$item['status']}\n";
            echo "    Size: {$item['original_size']} → {$item['imported_size']} bytes\n";
            if (!empty($item['details'])) {
                echo "    Details: " . implode(', ', $item['details']) . "\n";
            }
            echo "\n";
        }
        
        // Show failed items
        if (!empty($validationResults['failed_items'])) {
            echo "\n" . str_repeat("=", 60) . "\n";
            echo "FAILED IMPORTS (" . count($validationResults['failed_items']) . " items):\n";
            echo str_repeat("=", 60) . "\n";
            foreach ($validationResults['failed_items'] as $item) {
                echo "✗ {$item['title']}\n";
                echo "    Status: {$item['status']}\n";
                echo "    Size: {$item['original_size']} → {$item['imported_size']} bytes\n";
                if (!empty($item['issues'])) {
                    echo "    Issues: " . implode(', ', $item['issues']) . "\n";
                }
                if (isset($item['similarity'])) {
                    echo "    Similarity: " . round($item['similarity'] * 100, 1) . "%\n";
                }
                echo "\n";
            }
        }
        
        // Calculate success rate
        $totalItems = $importedItems->count();
        $successRate = $totalItems > 0 ? ($validationResults['has_rtf_header'] / $totalItems) * 100 : 0;
        
        echo "\nSuccess Rate: " . round($successRate, 1) . "%\n";
        
        if ($successRate > 80) {
            echo "✓ Import quality is good!\n";
        } elseif ($successRate > 60) {
            echo "⚠ Import quality is acceptable but could be improved\n";
        } else {
            echo "✗ Import quality is poor - needs investigation\n";
        }
        
        // Test sample content
        echo "\nSample Content Analysis:\n";
        $sampleItem = $importedItems->where('raw_content', '!=', '')->first();
        
        if ($sampleItem) {
            echo "Sample item: " . $sampleItem->title . "\n";
            echo "Raw content size: " . strlen($sampleItem->raw_content) . " bytes\n";
            echo "Content size: " . strlen($sampleItem->content) . " bytes\n";
            echo "Has RTF header: " . (str_starts_with($sampleItem->raw_content, '{\\rtf') ? 'Yes' : 'No') . "\n";
            echo "Content preview: " . substr(strip_tags($sampleItem->content), 0, 100) . "...\n";
        }
        
        DB::rollback(); // Don't actually save to test database
        echo "\n✓ Test completed successfully (rolled back)\n";
        
    } catch (Exception $e) {
        DB::rollback();
        throw $e;
    }
    
} catch (Exception $e) {
    echo "\n✗ Test failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}

/**
 * Calculate similarity between two content strings
 */
function calculateContentSimilarity(string $str1, string $str2): float
{
    if (empty($str1) && empty($str2)) {
        return 1.0;
    }
    
    if (empty($str1) || empty($str2)) {
        return 0.0;
    }
    
    if ($str1 === $str2) {
        return 1.0;
    }
    
    // For large strings, use sampling for performance
    $sample1 = substr($str1, 0, 2000);
    $sample2 = substr($str2, 0, 2000);
    
    $maxLen = max(strlen($sample1), strlen($sample2));
    if ($maxLen === 0) return 1.0;
    
    $distance = levenshtein($sample1, $sample2);
    return max(0.0, 1.0 - ($distance / $maxLen));
}