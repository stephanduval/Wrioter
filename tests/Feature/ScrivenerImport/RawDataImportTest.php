<?php

namespace Tests\Feature\ScrivenerImport;

use Tests\TestCase;
use App\Models\User;
use App\Models\Manuscript;
use App\Models\Item;
use App\Models\ManuscriptRawFile;
use App\Models\ItemAttachment;
use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\DataTransformer;
use App\Services\ScrivenerImport\DatabasePopulator;
use App\Services\ScrivenerImport\RtfConverter;
use App\Services\ScrivenerImport\FileScanner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class RawDataImportTest extends TestCase
{
    use RefreshDatabase;

    private string $projectPath;
    private User $user;
    private XmlParser $xmlParser;
    private DataTransformer $dataTransformer;
    private DatabasePopulator $databasePopulator;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->projectPath = '/home/rogers/Code/Wrioter/Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17]/scrivener tutorial.scriv';
        
        // Create test user
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
        ]);
        
        // Initialize services
        $rtfConverter = new RtfConverter();
        $fileScanner = new FileScanner();
        $this->xmlParser = new XmlParser($rtfConverter, $fileScanner);
        $this->dataTransformer = new DataTransformer($rtfConverter);
        $this->databasePopulator = new DatabasePopulator($fileScanner);
    }

    /** @test */
    public function it_can_detect_and_parse_all_project_files()
    {
        $this->skipIfProjectNotExists();
        
        $xmlPath = $this->projectPath . '/scrivener tutorial.scrivx';
        $parsedData = $this->xmlParser->parse($xmlPath);
        
        // Verify project files are detected
        $this->assertArrayHasKey('project_files', $parsedData);
        $this->assertGreaterThan(0, count($parsedData['project_files']));
        
        // Verify specific file types are found
        $fileTypes = array_column($parsedData['project_files'], 'type');
        $this->assertContains('project_xml', $fileTypes, 'Should detect .scrivx file');
        $this->assertContains('compile', $fileTypes, 'Should detect compile.xml');
        $this->assertContains('styles', $fileTypes, 'Should detect styles.xml');
    }

    /** @test */
    public function it_can_transform_manuscript_raw_files_correctly()
    {
        $this->skipIfProjectNotExists();
        
        $xmlPath = $this->projectPath . '/scrivener tutorial.scrivx';
        $parsedData = $this->xmlParser->parse($xmlPath);
        
        $manuscriptRawFiles = $this->dataTransformer->transformManuscriptRawFiles($parsedData['project_files'] ?? []);
        
        $this->assertGreaterThan(0, count($manuscriptRawFiles));
        
        // Verify structure of transformed files
        foreach ($manuscriptRawFiles as $file) {
            $this->assertArrayHasKey('file_type', $file);
            $this->assertArrayHasKey('file_name', $file);
            $this->assertArrayHasKey('file_path', $file);
            $this->assertArrayHasKey('file_size', $file);
            $this->assertArrayHasKey('scrivener_path', $file);
            $this->assertArrayHasKey('metadata', $file);
            
            // Verify file path exists
            $this->assertFileExists($file['file_path']);
            
            // Verify file size is accurate
            $this->assertEquals(filesize($file['file_path']), $file['file_size']);
        }
    }

    /** @test */
    public function it_can_import_and_store_all_raw_files()
    {
        $this->skipIfProjectNotExists();
        
        DB::beginTransaction();
        
        try {
            // Parse and transform
            $xmlPath = $this->projectPath . '/scrivener tutorial.scrivx';
            $parsedData = $this->xmlParser->parse($xmlPath);
            
            $manuscriptData = $this->dataTransformer->transformManuscript($parsedData);
            $manuscriptData['user_id'] = $this->user->id;
            
            $manuscriptRawFiles = $this->dataTransformer->transformManuscriptRawFiles($parsedData['project_files'] ?? []);
            $itemsData = $this->dataTransformer->transformItems($parsedData);
            
            // Set user_id for items
            foreach ($itemsData as &$item) {
                $item['user_id'] = $this->user->id;
                $item['attachments'] = [];
            }
            unset($item);
            
            // Import
            $result = $this->databasePopulator->populate(
                $manuscriptData,
                $itemsData,
                [],
                [],
                $manuscriptRawFiles
            );
            
            // Verify import results
            $this->assertInstanceOf(Manuscript::class, $result['manuscript']);
            $this->assertEquals(count($itemsData), $result['items_count']);
            $this->assertEquals(count($manuscriptRawFiles), $result['raw_files_count']);
            
            // Verify manuscript raw files are stored
            $storedRawFiles = ManuscriptRawFile::where('manuscript_id', $result['manuscript']->id)->get();
            $this->assertEquals(count($manuscriptRawFiles), $storedRawFiles->count());
            
            // Verify each raw file
            foreach ($storedRawFiles as $storedFile) {
                $this->assertNotEmpty($storedFile->file_content);
                $this->assertEquals($storedFile->file_size, strlen($storedFile->file_content));
                
                // Find corresponding original file
                $originalFile = null;
                foreach ($manuscriptRawFiles as $original) {
                    if ($original['file_name'] === $storedFile->file_name) {
                        $originalFile = $original;
                        break;
                    }
                }
                
                $this->assertNotNull($originalFile, "Should find original file for {$storedFile->file_name}");
                $this->assertEquals($originalFile['file_size'], $storedFile->file_size);
            }
            
            DB::rollback();
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /** @test */
    public function it_preserves_scrivx_file_content_correctly()
    {
        $this->skipIfProjectNotExists();
        
        DB::beginTransaction();
        
        try {
            // Parse and import
            $xmlPath = $this->projectPath . '/scrivener tutorial.scrivx';
            $parsedData = $this->xmlParser->parse($xmlPath);
            
            $manuscriptData = $this->dataTransformer->transformManuscript($parsedData);
            $manuscriptData['user_id'] = $this->user->id;
            
            $manuscriptRawFiles = $this->dataTransformer->transformManuscriptRawFiles($parsedData['project_files'] ?? []);
            
            $result = $this->databasePopulator->populate(
                $manuscriptData,
                [],
                [],
                [],
                $manuscriptRawFiles
            );
            
            // Find and verify .scrivx file
            $scrivxFile = ManuscriptRawFile::where('manuscript_id', $result['manuscript']->id)
                ->where('file_type', 'project_xml')
                ->first();
            
            $this->assertNotNull($scrivxFile, 'Should store .scrivx file');
            $this->assertStringEndsWith('.scrivx', $scrivxFile->file_name);
            
            // Verify XML content
            $this->assertStringStartsWith('<?xml', $scrivxFile->file_content);
            $this->assertStringContainsString('<ScrivenerProject', $scrivxFile->file_content);
            $this->assertStringContainsString('Template="No"', $scrivxFile->file_content);
            
            // Verify content matches original file
            $originalContent = file_get_contents($xmlPath);
            $this->assertEquals($originalContent, $scrivxFile->file_content);
            
            DB::rollback();
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    /** @test */
    public function it_preserves_rtf_content_correctly()
    {
        $this->skipIfProjectNotExists();
        
        DB::beginTransaction();
        
        try {
            // Parse and import
            $xmlPath = $this->projectPath . '/scrivener tutorial.scrivx';
            $parsedData = $this->xmlParser->parse($xmlPath);
            
            $manuscriptData = $this->dataTransformer->transformManuscript($parsedData);
            $manuscriptData['user_id'] = $this->user->id;
            
            $itemsData = $this->dataTransformer->transformItems($parsedData);
            
            // Set user_id for items
            foreach ($itemsData as &$item) {
                $item['user_id'] = $this->user->id;
                $item['attachments'] = [];
            }
            unset($item);
            
            $result = $this->databasePopulator->populate(
                $manuscriptData,
                $itemsData,
                [],
                [],
                []
            );
            
            // Verify RTF content preservation
            $storedItems = Item::whereIn('id', $result['manuscript']->items()->pluck('items.id'))->get();
            
            $rtfItemsFound = 0;
            $largeFilesHandled = 0;
            
            foreach ($storedItems as $item) {
                if (!empty($item->raw_content)) {
                    if (str_starts_with($item->raw_content, '{\\rtf')) {
                        $rtfItemsFound++;
                        
                        // Verify RTF structure
                        $this->assertStringContainsString('\\rtf1', $item->raw_content);
                        $this->assertStringContainsString('}', $item->raw_content);
                        
                        // Check large file handling
                        if (strlen($item->raw_content) > 65000) {
                            $this->assertLessThanOrEqual(65000, strlen($item->content));
                            $largeFilesHandled++;
                        }
                    }
                }
            }
            
            $this->assertGreaterThan(50, $rtfItemsFound, 'Should find many RTF items');
            $this->assertGreaterThan(0, $largeFilesHandled, 'Should handle large files correctly');
            
            DB::rollback();
            
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    private function skipIfProjectNotExists(): void
    {
        if (!file_exists($this->projectPath)) {
            $this->markTestSkipped('Scrivener tutorial project not found at: ' . $this->projectPath);
        }
    }
}