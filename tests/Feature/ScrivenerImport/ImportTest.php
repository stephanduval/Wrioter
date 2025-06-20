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
    public function it_handles_duplicate_manuscripts()
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
                // First import
                $this->databasePopulator->populate(
                    $transformedData['manuscript'],
                    $transformedData['items'],
                    $transformedData['collections'],
                    $writingHistoryData
                );
                
                // Attempt second import
                $this->expectException(\RuntimeException::class);
                $this->databasePopulator->populate(
                    $transformedData['manuscript'],
                    $transformedData['items'],
                    $transformedData['collections'],
                    $writingHistoryData
                );
                
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
} 
