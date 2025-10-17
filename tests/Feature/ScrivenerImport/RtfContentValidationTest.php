<?php

namespace Tests\Feature\ScrivenerImport;

use Tests\TestCase;
use App\Models\User;
use App\Models\Manuscript;
use App\Models\Item;
use App\Jobs\ProcessScrivenerImport;
use App\Models\ScrivenerImport;
use App\Services\ScrivenerImport\FileHandler;
use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\DataTransformer;
use App\Services\ScrivenerImport\DatabasePopulator;
use App\Services\ScrivenerImport\RtfConverter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

/**
 * RTF Content Validation Test
 * 
 * This test validates that RTF content from Scrivener files is imported
 * correctly into the database without modification or corruption.
 */
class RtfContentValidationTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $testProjectPath;
    private array $rtfAnalysis;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
        
        // Set test project path
        $this->testProjectPath = '/home/rogers/Code/Wrioter/Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17]/scrivener tutorial.scriv';
        
        // Analyze RTF files before import
        $this->rtfAnalysis = $this->analyzeRtfFiles();
    }

    /**
     * Test that RTF content is preserved during import
     */
    public function test_rtf_content_preservation_during_import()
    {
        // Skip if test project doesn't exist
        if (!file_exists($this->testProjectPath)) {
            $this->markTestSkipped('Test Scrivener project not found at: ' . $this->testProjectPath);
        }

        // Create ZIP file for import
        $zipPath = $this->createTestZipFile();
        
        try {
            // Import the Scrivener project
            $uploadedFile = new UploadedFile($zipPath, 'test-project.zip', 'application/zip', null, true);
            
            $result = $this->processScrivenerImport($uploadedFile);
            
            $this->assertNotEmpty($result, 'Import should return results');
            $this->assertArrayHasKey('manuscript', $result, 'Import should return manuscript');
            
            $manuscript = $result['manuscript'];
            $this->assertInstanceOf(Manuscript::class, $manuscript);
            
            // Validate RTF content integrity
            $this->validateRtfContentIntegrity($manuscript);
            
        } finally {
            // Cleanup
            if (file_exists($zipPath)) {
                unlink($zipPath);
            }
        }
    }

    /**
     * Test RTF content comparison between files and database
     */
    public function test_rtf_database_content_comparison()
    {
        // Skip if no RTF analysis available
        if (empty($this->rtfAnalysis)) {
            $this->markTestSkipped('No RTF analysis data available');
        }

        // Import project first
        $zipPath = $this->createTestZipFile();
        
        try {
            $uploadedFile = new UploadedFile($zipPath, 'test-project.zip', 'application/zip', null, true);
            $result = $this->processScrivenerImport($uploadedFile);
            
            $manuscript = $result['manuscript'];
            
            // Compare each RTF file with its database counterpart
            $comparisonResults = $this->compareRtfWithDatabase($manuscript);
            
            // Validate comparison results
            $this->validateComparisonResults($comparisonResults);
            
        } finally {
            if (file_exists($zipPath)) {
                unlink($zipPath);
            }
        }
    }

    /**
     * Test RTF content size handling
     */
    public function test_rtf_content_size_handling()
    {
        if (empty($this->rtfAnalysis)) {
            $this->markTestSkipped('No RTF analysis data available');
        }

        // Find files larger than 65KB to test truncation handling
        $largeFiles = array_filter($this->rtfAnalysis, function($analysis) {
            return $analysis['has_rtf'] && $analysis['rtf_size'] > 65000;
        });

        if (empty($largeFiles)) {
            $this->markTestIncomplete('No large RTF files found to test size handling');
        }

        // Import and check large file handling
        $zipPath = $this->createTestZipFile();
        
        try {
            $uploadedFile = new UploadedFile($zipPath, 'test-project.zip', 'application/zip', null, true);
            $result = $this->processScrivenerImport($uploadedFile);
            
            $manuscript = $result['manuscript'];
            
            // Check that large files are handled properly
            foreach ($largeFiles as $uuid => $fileAnalysis) {
                $item = Item::where('scrivener_uuid', $uuid)->first();
                
                if ($item) {
                    // Content field should be truncated
                    $this->assertLessThanOrEqual(65000, strlen($item->content), 
                        "Content field should be truncated for item {$uuid}");
                    
                    // Raw content should contain full content
                    $this->assertNotEmpty($item->raw_content, 
                        "Raw content should be preserved for large item {$uuid}");
                    
                    // Raw content should be larger than regular content
                    $this->assertGreaterThan(strlen($item->content), strlen($item->raw_content),
                        "Raw content should be larger than truncated content for item {$uuid}");
                }
            }
            
        } finally {
            if (file_exists($zipPath)) {
                unlink($zipPath);
            }
        }
    }

    /**
     * Test RTF encoding preservation
     */
    public function test_rtf_encoding_preservation()
    {
        if (empty($this->rtfAnalysis)) {
            $this->markTestSkipped('No RTF analysis data available');
        }

        $zipPath = $this->createTestZipFile();
        
        try {
            $uploadedFile = new UploadedFile($zipPath, 'test-project.zip', 'application/zip', null, true);
            $result = $this->processScrivenerImport($uploadedFile);
            
            $manuscript = $result['manuscript'];
            
            // Check encoding preservation
            foreach ($this->rtfAnalysis as $uuid => $analysis) {
                if (!$analysis['has_rtf']) continue;
                
                $item = Item::where('scrivener_uuid', $uuid)->first();
                
                if ($item && !empty($item->raw_content)) {
                    // Raw content should be valid RTF
                    $this->assertStringStartsWith('{\\rtf', $item->raw_content,
                        "Raw content should start with RTF header for item {$uuid}");
                    
                    // Content should be readable text (not binary)
                    $textRatio = $this->calculateTextRatio($item->content);
                    $this->assertGreaterThan(0.7, $textRatio,
                        "Content should be mostly readable text for item {$uuid}");
                }
            }
            
        } finally {
            if (file_exists($zipPath)) {
                unlink($zipPath);
            }
        }
    }

    /**
     * Analyze RTF files in the test project
     */
    private function analyzeRtfFiles(): array
    {
        if (!file_exists($this->testProjectPath)) {
            return [];
        }

        $dataPath = $this->testProjectPath . '/Files/Data';
        if (!is_dir($dataPath)) {
            return [];
        }

        $analysis = [];
        $folders = scandir($dataPath);

        foreach ($folders as $folder) {
            if ($folder === '.' || $folder === '..') continue;
            
            $folderPath = $dataPath . '/' . $folder;
            if (!is_dir($folderPath)) continue;
            
            $rtfPath = $folderPath . '/content.rtf';
            if (!file_exists($rtfPath)) continue;
            
            $rtfContent = file_get_contents($rtfPath);
            if ($rtfContent === false) continue;
            
            $analysis[$folder] = [
                'uuid' => $folder,
                'has_rtf' => true,
                'rtf_size' => strlen($rtfContent),
                'rtf_content' => $rtfContent,
                'content_preview' => $this->extractTextPreview($rtfContent),
                'rtf_encoding' => mb_detect_encoding($rtfContent) ?: 'Unknown',
                'rtf_issues' => $this->identifyRtfIssues($rtfContent)
            ];
        }

        return $analysis;
    }

    /**
     * Extract text preview from RTF content
     */
    private function extractTextPreview(string $rtfContent, int $maxLength = 200): string
    {
        $text = $rtfContent;
        
        // Remove RTF control sequences
        $text = preg_replace('/\\\\[a-z]+\d*\s?/', '', $text);
        $text = preg_replace('/[{}]/', '', $text);
        $text = preg_replace('/\\\./', '', $text);
        
        // Clean up whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);
        
        return strlen($text) > $maxLength ? substr($text, 0, $maxLength) . '...' : $text;
    }

    /**
     * Identify potential RTF issues
     */
    private function identifyRtfIssues(string $rtfContent): array
    {
        $issues = [];
        
        if (strlen($rtfContent) > 65000) {
            $issues[] = 'File larger than 65KB (may be truncated in database)';
        }
        
        if (strpos($rtfContent, '\\pict') !== false) {
            $issues[] = 'Contains embedded images';
        }
        
        if (!str_starts_with($rtfContent, '{\\rtf')) {
            $issues[] = 'Invalid RTF header';
        }
        
        return $issues;
    }

    /**
     * Validate RTF content integrity after import
     */
    private function validateRtfContentIntegrity(Manuscript $manuscript): void
    {
        $items = Item::whereIn('id', $manuscript->items()->pluck('items.id'))->get();
        
        $validationResults = [];
        
        foreach ($items as $item) {
            $uuid = $item->scrivener_uuid;
            
            // Skip if we don't have analysis data for this UUID
            if (!isset($this->rtfAnalysis[$uuid])) {
                continue;
            }
            
            $originalAnalysis = $this->rtfAnalysis[$uuid];
            $validationResult = [
                'uuid' => $uuid,
                'title' => $item->title,
                'has_content' => !empty($item->content),
                'has_raw_content' => !empty($item->raw_content),
                'content_size_match' => false,
                'rtf_header_preserved' => false,
                'text_extraction_successful' => false,
                'issues' => []
            ];

            // Check content size
            if ($originalAnalysis['rtf_size'] <= 65000) {
                // Small files should have exact content match
                $expectedSize = $originalAnalysis['rtf_size'];
                $actualSize = strlen($item->raw_content ?: $item->content);
                $validationResult['content_size_match'] = abs($expectedSize - $actualSize) < 100; // Allow small variance
            } else {
                // Large files should have content truncated but raw_content preserved
                $validationResult['content_size_match'] = 
                    !empty($item->raw_content) && 
                    strlen($item->raw_content) > strlen($item->content);
            }

            // Check RTF header preservation
            if (!empty($item->raw_content)) {
                $validationResult['rtf_header_preserved'] = str_starts_with($item->raw_content, '{\\rtf');
            }

            // Check text extraction
            $textRatio = $this->calculateTextRatio($item->content);
            $validationResult['text_extraction_successful'] = $textRatio > 0.5;

            // Identify issues
            if (!$validationResult['content_size_match']) {
                $validationResult['issues'][] = 'Content size mismatch';
            }
            if (!$validationResult['rtf_header_preserved'] && !empty($item->raw_content)) {
                $validationResult['issues'][] = 'RTF header not preserved';
            }
            if (!$validationResult['text_extraction_successful']) {
                $validationResult['issues'][] = 'Text extraction failed';
            }

            $validationResults[] = $validationResult;
        }

        // Assert validation results
        $failedItems = array_filter($validationResults, function($result) {
            return !empty($result['issues']);
        });

        if (!empty($failedItems)) {
            $this->fail(
                'RTF content validation failed for ' . count($failedItems) . ' items:' . PHP_EOL .
                json_encode($failedItems, JSON_PRETTY_PRINT)
            );
        }

        $this->assertGreaterThan(0, count($validationResults), 'Should have validated at least one item');
    }

    /**
     * Compare RTF files with database content
     */
    private function compareRtfWithDatabase(Manuscript $manuscript): array
    {
        $items = Item::whereIn('id', $manuscript->items()->pluck('items.id'))->get();
        $comparisonResults = [];

        foreach ($items as $item) {
            $uuid = $item->scrivener_uuid;
            
            if (!isset($this->rtfAnalysis[$uuid])) {
                continue;
            }

            $originalRtf = $this->rtfAnalysis[$uuid]['rtf_content'];
            $databaseRtf = $item->raw_content ?: $item->content;

            $comparison = [
                'uuid' => $uuid,
                'title' => $item->title,
                'original_size' => strlen($originalRtf),
                'database_size' => strlen($databaseRtf),
                'size_difference' => abs(strlen($originalRtf) - strlen($databaseRtf)),
                'content_match' => $originalRtf === $databaseRtf,
                'similarity_score' => $this->calculateSimilarity($originalRtf, $databaseRtf),
                'issues' => []
            ];

            // Identify specific issues
            if (!$comparison['content_match']) {
                if ($comparison['size_difference'] > 100) {
                    $comparison['issues'][] = 'Significant size difference';
                }
                if ($comparison['similarity_score'] < 0.9) {
                    $comparison['issues'][] = 'Low content similarity';
                }
            }

            $comparisonResults[] = $comparison;
        }

        return $comparisonResults;
    }

    /**
     * Validate comparison results
     */
    private function validateComparisonResults(array $comparisonResults): void
    {
        $this->assertNotEmpty($comparisonResults, 'Should have comparison results');

        $failedComparisons = array_filter($comparisonResults, function($result) {
            return !empty($result['issues']) || $result['similarity_score'] < 0.8;
        });

        if (!empty($failedComparisons)) {
            Log::warning('RTF content comparison failures', $failedComparisons);
            
            // Log detailed comparison for debugging
            foreach ($failedComparisons as $failure) {
                Log::debug('Failed RTF comparison details', [
                    'uuid' => $failure['uuid'],
                    'title' => $failure['title'],
                    'issues' => $failure['issues'],
                    'similarity_score' => $failure['similarity_score']
                ]);
            }
            
            $this->fail(
                'RTF content comparison failed for ' . count($failedComparisons) . ' items. ' .
                'Check logs for detailed comparison results.'
            );
        }

        // Assert overall success metrics
        $averageSimilarity = array_sum(array_column($comparisonResults, 'similarity_score')) / count($comparisonResults);
        $this->assertGreaterThan(0.9, $averageSimilarity, 'Average similarity should be above 90%');
    }

    /**
     * Calculate text ratio (readable characters vs total)
     */
    private function calculateTextRatio(string $content): float
    {
        if (empty($content)) {
            return 0.0;
        }

        $readableChars = preg_replace('/[^a-zA-Z0-9\s\.\,\!\?\-\'\"]/', '', $content);
        return strlen($readableChars) / strlen($content);
    }

    /**
     * Calculate similarity between two strings
     */
    private function calculateSimilarity(string $str1, string $str2): float
    {
        if (empty($str1) && empty($str2)) {
            return 1.0;
        }
        
        if (empty($str1) || empty($str2)) {
            return 0.0;
        }

        $maxLen = max(strlen($str1), strlen($str2));
        $distance = levenshtein(
            substr($str1, 0, 1000), // Limit for performance
            substr($str2, 0, 1000)
        );

        return 1.0 - ($distance / min(1000, $maxLen));
    }

    /**
     * Create test ZIP file for import
     */
    private function createTestZipFile(): string
    {
        $zipPath = sys_get_temp_dir() . '/test_scrivener_' . uniqid() . '.zip';
        
        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE) !== true) {
            throw new \RuntimeException('Cannot create test ZIP file');
        }

        // Add the entire Scrivener project to ZIP
        $this->addDirectoryToZip($zip, $this->testProjectPath, basename($this->testProjectPath));
        
        $zip->close();
        
        return $zipPath;
    }

    /**
     * Process Scrivener import using the job components
     */
    private function processScrivenerImport(UploadedFile $uploadedFile): array
    {
        // Store the uploaded file
        $path = $uploadedFile->storeAs('scrivener/temp', 'test-' . uniqid() . '.zip');
        
        try {
            // Create import record
            $import = ScrivenerImport::create([
                'user_id' => $this->user->id,
                'filename' => $uploadedFile->getClientOriginalName(),
                'status' => 'pending',
                'storage_path' => $path,
                'progress' => 0,
            ]);
            
            // Process using the same logic as the job
            $fileHandler = new FileHandler();
            $rtfConverter = new RtfConverter();
            $xmlParser = new XmlParser($rtfConverter);
            $dataTransformer = new DataTransformer($rtfConverter);
            $databasePopulator = new DatabasePopulator();
            
            // Extract and parse
            $extractedPath = $fileHandler->extract($path);
            $xmlPath = $fileHandler->findProjectFile($extractedPath);
            $parsedData = $xmlParser->parse($xmlPath);
            
            // Transform data
            $manuscriptData = $dataTransformer->transformManuscript($parsedData);
            $manuscriptData['user_id'] = $this->user->id;
            
            $itemsData = $dataTransformer->transformItems($parsedData);
            $collectionsData = $dataTransformer->transformCollections($parsedData);
            $writingHistoryData = $dataTransformer->transformWritingHistory($parsedData);
            
            // Populate database
            $result = $databasePopulator->populate(
                $manuscriptData,
                $itemsData, 
                $collectionsData,
                $writingHistoryData
            );
            
            // Cleanup
            $fileHandler->cleanup($extractedPath);
            Storage::delete($path);
            
            return $result;
            
        } catch (\Exception $e) {
            Storage::delete($path);
            throw $e;
        }
    }
    
    /**
     * Recursively add directory to ZIP
     */
    private function addDirectoryToZip(\ZipArchive $zip, string $sourcePath, string $zipPath): void
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($sourcePath, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            $filePath = $file->getRealPath();
            $relativePath = $zipPath . '/' . substr($filePath, strlen($sourcePath) + 1);

            if ($file->isDir()) {
                $zip->addEmptyDir($relativePath);
            } else {
                $zip->addFile($filePath, $relativePath);
            }
        }
    }
}