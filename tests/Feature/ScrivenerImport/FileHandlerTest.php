<?php

namespace Tests\Feature\ScrivenerImport;

use Tests\TestCase;
use App\Services\ScrivenerImport\FileHandler;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use PHPUnit\Framework\Attributes\Test;

class FileHandlerTest extends TestCase
{
    private string $testZipPath;
    private string $extractPath;
    private FileHandler $fileHandler;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup test paths
        $this->testZipPath = storage_path('app/tests/test_scrivener.zip');
        $this->extractPath = storage_path('app/tests/extracted');
        
        // Initialize service
        $this->fileHandler = new FileHandler();
        
        // Ensure test directories exist
        if (!file_exists(dirname($this->testZipPath))) {
            mkdir(dirname($this->testZipPath), 0755, true);
        }
        if (!file_exists($this->extractPath)) {
            mkdir($this->extractPath, 0755, true);
        }
    }

    protected function tearDown(): void
    {
        // Cleanup test files
        if (file_exists($this->testZipPath)) {
            unlink($this->testZipPath);
        }
        if (file_exists($this->extractPath)) {
            $this->fileHandler->cleanup($this->extractPath);
        }
        parent::tearDown();
    }

    #[Test]
    public function it_validates_zip_file_exists()
    {
        $this->expectException(\RuntimeException::class);
        $this->fileHandler->extract('nonexistent.zip');
    }

    #[Test]
    public function it_validates_zip_file_is_valid()
    {
        // Create an invalid zip file
        file_put_contents($this->testZipPath, 'not a zip file');
        
        $this->expectException(\RuntimeException::class);
        $this->fileHandler->extract($this->testZipPath);
    }

    #[Test]
    public function it_validates_zip_contains_required_files()
    {
        // Create a valid zip but without required files
        $zip = new ZipArchive();
        $zip->open($this->testZipPath, ZipArchive::CREATE);
        $zip->addFromString('test.txt', 'test content');
        $zip->close();
        
        $this->expectException(\RuntimeException::class);
        $this->fileHandler->extract($this->testZipPath);
    }

    #[Test]
    public function it_creates_extraction_directory_if_not_exists()
    {
        // Remove extraction directory if it exists
        if (file_exists($this->extractPath)) {
            $this->fileHandler->cleanup($this->extractPath);
        }
        
        // Copy test zip
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        
        // Extract
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        $this->assertDirectoryExists($extractedPath);
        $this->assertFileExists($extractedPath . '/project.scrivx');
        
        // Cleanup
        $this->fileHandler->cleanup($extractedPath);
    }

    #[Test]
    public function it_cleans_up_extraction_directory()
    {
        // Copy test zip
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        
        // Extract
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        // Verify files were extracted
        $this->assertDirectoryExists($extractedPath);
        $this->assertFileExists($extractedPath . '/project.scrivx');
        
        // Cleanup
        $this->fileHandler->cleanup($extractedPath);
        
        // Verify cleanup
        $this->assertDirectoryDoesNotExist($extractedPath);
    }

    #[Test]
    public function it_validates_extracted_project_structure()
    {
        // Copy test zip
        copy(
            base_path('Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17].zip'),
            $this->testZipPath
        );
        
        // Extract
        $extractedPath = $this->fileHandler->extract($this->testZipPath);
        
        // Validate structure
        $isValid = $this->fileHandler->validate($extractedPath);
        $this->assertTrue($isValid);
        
        // Cleanup
        $this->fileHandler->cleanup($extractedPath);
    }

    #[Test]
    public function it_handles_large_zip_files()
    {
        // Create a large zip file (100MB)
        $zip = new ZipArchive();
        $zip->open($this->testZipPath, ZipArchive::CREATE);
        
        // Add a smaller test file to avoid memory issues
        $largeContent = str_repeat('test content', 10000); // ~100KB
        for ($i = 0; $i < 5; $i++) {
            $zip->addFromString("large_file_{$i}.txt", $largeContent);
        }
        $zip->close();
        
        // Set memory limit
        $originalMemoryLimit = ini_get('memory_limit');
        ini_set('memory_limit', '256M');
        
        try {
            // Attempt extraction
            $this->expectException(\RuntimeException::class); // Should fail due to missing required files
            $extractedPath = $this->fileHandler->extract($this->testZipPath);
            
        } finally {
            // Restore memory limit
            ini_set('memory_limit', $originalMemoryLimit);
        }
    }
} 
