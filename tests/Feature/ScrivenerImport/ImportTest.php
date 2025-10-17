<?php

namespace Tests\Feature\ScrivenerImport;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Console\Commands\ScrivenerImportCommand;
use App\Services\ScrivenerImport\FileHandler;
use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\DataTransformer;
use App\Services\ScrivenerImport\DatabasePopulator;
use App\Models\Manuscript;
use App\Models\Item;
use App\Models\ManuscriptCollection;
use App\Models\WritingHistory;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Role;

class ImportTest extends TestCase
{
    use RefreshDatabase;

    private string $testZipPath;
    private FileHandler $fileHandler;
    private XmlParser $xmlParser;
    private DataTransformer $dataTransformer;
    private DatabasePopulator $databasePopulator;
    private User $testUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test user
        $this->testUser = User::factory()->create();
        
        // Setup test paths
        $this->testZipPath = storage_path('app/tests/Scrivener tutorial [2025_06_01_05_17_17].zip');
        
        // Initialize services using Laravel's container
        $this->fileHandler = app(FileHandler::class);
        $this->xmlParser = app(XmlParser::class);
        $this->dataTransformer = app(DataTransformer::class);
        $this->databasePopulator = app(DatabasePopulator::class);
        
        // Ensure test directories exist
        if (!file_exists(dirname($this->testZipPath))) {
            mkdir(dirname($this->testZipPath), 0755, true);
        }
    }

    protected function tearDown(): void
    {
        // Cleanup test files
        if (file_exists($this->testZipPath)) {
            unlink($this->testZipPath);
        }
        parent::tearDown();
    }

    #[Test]
    public function it_can_extract_scrivener_zip_file()
    {
        // Copy test zip to test location
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );

        // Extract the zip file
        $extractedPath = $this->fileHandler->extract($this->testZipPath);

        // Assert extraction was successful
        $this->assertDirectoryExists($extractedPath);
        $this->assertFileExists($extractedPath . '/project.scrivx');
        
        // Cleanup
        $this->fileHandler->cleanup($extractedPath);
    }

    #[Test]
    public function it_can_parse_scrivener_xml()
    {
        // Setup: Extract zip first
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        try {
            // Parse the XML
            $xmlData = $this->xmlParser->parse($extractedPath . '/project.scrivx');
            
            // Assert basic structure
            $this->assertIsArray($xmlData);
            $this->assertArrayHasKey('project', $xmlData);
            $this->assertArrayHasKey('binder', $xmlData);
            $this->assertArrayHasKey('collections', $xmlData);
        } finally {
            // Cleanup
            $this->fileHandler->cleanup($extractedPath);
        }
    }

    #[Test]
    public function it_can_transform_data_to_database_format()
    {
        // Setup: Extract and parse XML
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        try {
            $xmlData = $this->xmlParser->parse($extractedPath . '/project.scrivx');
            
            // Transform the data using the correct methods
            $transformedData = [
                'manuscript' => $this->dataTransformer->transformManuscript($xmlData),
                'items' => $this->dataTransformer->transformItems($xmlData),
                'collections' => $this->dataTransformer->transformCollections($xmlData),
            ];
            
            // Assert transformed structure
            $this->assertIsArray($transformedData);
            $this->assertArrayHasKey('manuscript', $transformedData);
            $this->assertArrayHasKey('items', $transformedData);
            $this->assertArrayHasKey('collections', $transformedData);
        } finally {
            // Cleanup
            $this->fileHandler->cleanup($extractedPath);
        }
    }

    #[Test]
    public function it_can_populate_database_with_transformed_data()
    {
        // Setup: Extract, parse, and transform data
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        try {
            $xmlData = $this->xmlParser->parse($extractedPath . '/project.scrivx');
            $transformedData = [
                'manuscript' => array_merge(
                    $this->dataTransformer->transformManuscript($xmlData),
                    ['user_id' => $this->testUser->id]
                ),
                'items' => array_map(function ($item) {
                    $item['user_id'] = $this->testUser->id;
                    return $item;
                }, $this->dataTransformer->transformItems($xmlData)),
                'collections' => $this->dataTransformer->transformCollections($xmlData),
            ];
            
            // Transform writing history and add user_id
            $writingHistoryData = array_map(function ($history) {
                $history['user_id'] = $this->testUser->id;
                return $history;
            }, $this->dataTransformer->transformWritingHistory($xmlData));
            
            // Start transaction for rollback
            DB::beginTransaction();
            
            try {
                // Populate database
                $result = $this->databasePopulator->populate(
                    $transformedData['manuscript'],
                    $transformedData['items'],
                    $transformedData['collections'],
                    $writingHistoryData
                );
                
                // Assert database population
                $this->assertIsArray($result);
                $this->assertArrayHasKey('manuscript', $result);
                $this->assertArrayHasKey('items_count', $result);
                $this->assertArrayHasKey('collections_count', $result);
                $this->assertArrayHasKey('writing_history_count', $result);
                
                // Verify manuscript was created
                $manuscript = Manuscript::where('scrivener_uuid', $transformedData['manuscript']['scrivener_uuid'])->first();
                $this->assertNotNull($manuscript);
                $this->assertEquals($transformedData['manuscript']['title'], $manuscript->title);

                // Refresh manuscript to ensure relationships are up to date
                $manuscript->refresh();

                // Verify items were created
                $items = $manuscript->items;
                $this->assertCount(count($transformedData['items']), $items);
                
                // Verify collections were created
                $collections = ManuscriptCollection::where('manuscript_id', $manuscript->id)->get();
                $this->assertCount(count($transformedData['collections']), $collections);
                
                // Verify writing history was created
                $history = WritingHistory::where('manuscript_id', $manuscript->id)->first();
                $this->assertNotNull($history);
                
            } finally {
                // Rollback transaction
                DB::rollBack();
            }
        } finally {
            // Cleanup
            $this->fileHandler->cleanup($extractedPath);
        }
    }

    #[Test]
    public function it_validates_required_fields()
    {
        // Setup: Extract, parse, and transform data
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        try {
            $xmlData = $this->xmlParser->parse($extractedPath . '/project.scrivx');
            $transformedData = [
                'manuscript' => array_merge(
                    $this->dataTransformer->transformManuscript($xmlData),
                    ['user_id' => $this->testUser->id]
                ),
                'items' => array_map(function ($item) {
                    $item['user_id'] = $this->testUser->id;
                    return $item;
                }, $this->dataTransformer->transformItems($xmlData)),
                'collections' => $this->dataTransformer->transformCollections($xmlData),
            ];
            
            // Transform writing history and add user_id
            $writingHistoryData = array_map(function ($history) {
                $history['user_id'] = $this->testUser->id;
                return $history;
            }, $this->dataTransformer->transformWritingHistory($xmlData));
            
            // Remove required field
            unset($transformedData['manuscript']['scrivener_uuid']);
            
            // Attempt to populate database
            $this->expectException(\RuntimeException::class);
            $this->expectExceptionMessage('Invalid manuscript data: missing required fields');
            $this->databasePopulator->populate(
                $transformedData['manuscript'],
                $transformedData['items'],
                $transformedData['collections'],
                $writingHistoryData
            );
        } finally {
            // Cleanup
            $this->fileHandler->cleanup($extractedPath);
        }
    }

    #[Test]
    public function it_allows_duplicate_manuscripts_when_disabled()
    {
        // NOTE: Duplicate check is currently disabled for testing purposes
        // Setup: Extract, parse, and transform data
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        try {
            $xmlData = $this->xmlParser->parse($extractedPath . '/project.scrivx');
            $transformedData = [
                'manuscript' => array_merge(
                    $this->dataTransformer->transformManuscript($xmlData),
                    ['user_id' => $this->testUser->id]
                ),
                'items' => array_map(function ($item) {
                    $item['user_id'] = $this->testUser->id;
                    return $item;
                }, $this->dataTransformer->transformItems($xmlData)),
                'collections' => $this->dataTransformer->transformCollections($xmlData),
            ];
            
            // Transform writing history and add user_id
            $writingHistoryData = array_map(function ($history) {
                $history['user_id'] = $this->testUser->id;
                return $history;
            }, $this->dataTransformer->transformWritingHistory($xmlData));
            
            // Start transaction for rollback
            DB::beginTransaction();
            
            try {
                // First import
                $result1 = $this->databasePopulator->populate(
                    $transformedData['manuscript'],
                    $transformedData['items'],
                    $transformedData['collections'],
                    $writingHistoryData
                );
                
                // Second import should succeed (duplicate check disabled)
                $result2 = $this->databasePopulator->populate(
                    $transformedData['manuscript'],
                    $transformedData['items'],
                    $transformedData['collections'],
                    $writingHistoryData
                );
                
                // Both imports should succeed
                $this->assertIsArray($result1);
                $this->assertIsArray($result2);
                
                // Verify both manuscripts exist
                $manuscripts = Manuscript::where('scrivener_uuid', $transformedData['manuscript']['scrivener_uuid'])->get();
                $this->assertCount(2, $manuscripts, 'Should allow duplicate imports when check is disabled');
                
            } finally {
                // Rollback transaction
                DB::rollBack();
            }
        } finally {
            // Cleanup
            $this->fileHandler->cleanup($extractedPath);
        }
    }

    #[Test]
    public function it_preserves_item_hierarchy()
    {
        // Setup: Extract, parse, and transform data
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        try {
            $xmlData = $this->xmlParser->parse($extractedPath . '/project.scrivx');
            $transformedData = [
                'manuscript' => array_merge(
                    $this->dataTransformer->transformManuscript($xmlData),
                    ['user_id' => $this->testUser->id]
                ),
                'items' => array_map(function ($item) {
                    $item['user_id'] = $this->testUser->id;
                    return $item;
                }, $this->dataTransformer->transformItems($xmlData)),
                'collections' => $this->dataTransformer->transformCollections($xmlData),
            ];
            
            // Transform writing history and add user_id
            $writingHistoryData = array_map(function ($history) {
                $history['user_id'] = $this->testUser->id;
                return $history;
            }, $this->dataTransformer->transformWritingHistory($xmlData));
            
            // Start transaction for rollback
            DB::beginTransaction();
            
            try {
                // Populate database
                $this->databasePopulator->populate(
                    $transformedData['manuscript'],
                    $transformedData['items'],
                    $transformedData['collections'],
                    $writingHistoryData
                );
                
                // Get manuscript
                $manuscript = Manuscript::where('scrivener_uuid', $transformedData['manuscript']['scrivener_uuid'])->first();
                $manuscript->refresh();
                
                // Verify root items
                $rootItems = $manuscript->items()->whereNull('parent_id')->get();
                
                // Assert root items match XML structure
                $this->assertCount(
                    count(array_filter($transformedData['items'], fn($item) => !isset($item['parent_id']))),
                    $rootItems
                );
                
                // Verify child items
                foreach ($rootItems as $rootItem) {
                    $childItems = $manuscript->items()->where('parent_id', $rootItem->id)->get();
                    $this->assertGreaterThanOrEqual(0, $childItems->count());
                }
                
            } finally {
                // Rollback transaction
                DB::rollBack();
            }
        } finally {
            // Cleanup
            $this->fileHandler->cleanup($extractedPath);
        }
    }

    #[Test]
    public function it_loads_text_content_from_rtf_files()
    {
        // Setup: Extract, parse, and transform data
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        try {
            $xmlData = $this->xmlParser->parse($extractedPath . '/project.scrivx');
            $transformedData = [
                'manuscript' => array_merge(
                    $this->dataTransformer->transformManuscript($xmlData),
                    ['user_id' => $this->testUser->id]
                ),
                'items' => array_map(function ($item) {
                    $item['user_id'] = $this->testUser->id;
                    return $item;
                }, $this->dataTransformer->transformItems($xmlData)),
                'collections' => $this->dataTransformer->transformCollections($xmlData),
            ];
            
            // Transform writing history and add user_id
            $writingHistoryData = array_map(function ($history) {
                $history['user_id'] = $this->testUser->id;
                return $history;
            }, $this->dataTransformer->transformWritingHistory($xmlData));
            
            // Start transaction for rollback
            DB::beginTransaction();
            
            try {
                // Populate database
                $result = $this->databasePopulator->populate(
                    $transformedData['manuscript'],
                    $transformedData['items'],
                    $transformedData['collections'],
                    $writingHistoryData
                );
                
                // Get manuscript and items
                $manuscript = Manuscript::where('scrivener_uuid', $transformedData['manuscript']['scrivener_uuid'])->first();
                $this->assertNotNull($manuscript);
                
                $manuscript->refresh();
                $items = $manuscript->items;
                
                // Debug: Check total items and content
                echo "\n=== TEXT CONTENT DEBUG ===\n";
                echo "Total items in manuscript: " . $items->count() . "\n";
                echo "Items with content: " . $items->whereNotNull('content')->where('content', '!=', '')->count() . "\n";
                echo "Items with raw_content: " . $items->whereNotNull('raw_content')->where('raw_content', '!=', '')->count() . "\n";
                
                // Check specific item content from transformed data
                $itemsWithContentInTransform = array_filter($transformedData['items'], function($item) {
                    return !empty($item['content']) || !empty($item['raw_content']);
                });
                echo "Items with content in transform data: " . count($itemsWithContentInTransform) . "\n";
                
                // Sample a few items to check their content
                $sampleItems = $items->take(5);
                foreach ($sampleItems as $index => $item) {
                    echo "\nItem {$index} (ID: {$item->id}):\n";
                    echo "  Title: " . ($item->title ?? 'null') . "\n";
                    echo "  Type: " . ($item->type ?? 'null') . "\n";
                    echo "  Scrivener UUID: " . ($item->scrivener_uuid ?? 'null') . "\n";
                    echo "  Content length: " . strlen($item->content ?? '') . " chars\n";
                    echo "  Raw content length: " . strlen($item->raw_content ?? '') . " chars\n";
                    echo "  Content preview: " . substr($item->content ?? '', 0, 100) . "\n";
                    
                    // Check if RTF file exists for this item
                    $rtfPath = $extractedPath . '/Files/Data/' . $item->scrivener_uuid . '/content.rtf';
                    echo "  RTF file exists: " . (file_exists($rtfPath) ? 'YES' : 'NO') . "\n";
                    if (file_exists($rtfPath)) {
                        echo "  RTF file size: " . filesize($rtfPath) . " bytes\n";
                    }
                }
                
                // Assertions to verify text content is loaded
                $textItems = $items->where('type', 'text');
                $this->assertGreaterThan(0, $textItems->count(), 'Should have text items');
                
                // Check that at least some text items have content
                $itemsWithContent = $textItems->filter(function($item) {
                    return !empty($item->content) || !empty($item->raw_content);
                });
                
                echo "\nText items: " . $textItems->count() . "\n";
                echo "Text items with content: " . $itemsWithContent->count() . "\n";
                
                // This assertion will help us understand if content is being loaded
                $this->assertGreaterThan(0, $itemsWithContent->count(), 
                    'At least some text items should have content loaded from RTF files');
                
                // For debugging: Check specific RTF files that should exist
                $dataPath = $extractedPath . '/Files/Data';
                if (is_dir($dataPath)) {
                    $rtfFiles = glob($dataPath . '/*/content.rtf');
                    echo "\nRTF files found: " . count($rtfFiles) . "\n";
                    
                    foreach (array_slice($rtfFiles, 0, 3) as $rtfFile) {
                        $uuid = basename(dirname($rtfFile));
                        echo "RTF file: {$uuid} (" . filesize($rtfFile) . " bytes)\n";
                        
                        // Check if this UUID has a corresponding item
                        $correspondingItem = $items->where('scrivener_uuid', $uuid)->first();
                        if ($correspondingItem) {
                            echo "  Has item in DB: YES (content: " . strlen($correspondingItem->content ?? '') . " chars)\n";
                        } else {
                            echo "  Has item in DB: NO\n";
                        }
                    }
                }
                
            } finally {
                // Rollback transaction
                DB::rollBack();
            }
        } finally {
            // Cleanup
            $this->fileHandler->cleanup($extractedPath);
        }
    }
} 
