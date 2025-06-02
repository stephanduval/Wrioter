<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use ZipArchive;
use Illuminate\Support\Str;
use App\Services\ScrivenerImport\XmlParser;

class ScrivenerImportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scrivener:import 
                            {filepath : The path to the .scrivx or .zip file to import (use quotes if path contains spaces)}
                            {--validate-only : Only validate the file without importing}
                            {--force : Force import even if validation fails}
                            {--keep-extracted : Keep the extracted files after import (for debugging)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import a Scrivener project file into the system';

    /**
     * Path to the extracted files
     */
    protected ?string $extractedPath = null;

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get the filepath and normalize it
        $filePath = trim($this->argument('filepath'));
        
        // If the path is relative, make it absolute from the current working directory
        if (!str_starts_with($filePath, '/')) {
            $filePath = getcwd() . '/' . $filePath;
        }
        
        $validateOnly = $this->option('validate-only');
        $force = $this->option('force');
        $keepExtracted = $this->option('keep-extracted');

        $this->info('Starting Scrivener import process...');
        $this->info('File path: ' . $filePath);
        
        try {
            // Step 1: Validate file exists and is readable
            if (!file_exists($filePath)) {
                throw new \Exception("File not found: {$filePath}");
            }

            if (!is_readable($filePath)) {
                throw new \Exception("File is not readable: {$filePath}");
            }

            $this->info('File validation passed.');

            // Step 2: Extract the .scrivx file if it's a zip
            $scrivxPath = $filePath;
            if (strtolower(pathinfo($filePath, PATHINFO_EXTENSION)) === 'zip') {
                $this->info('Extracting zip file...');
                $scrivxPath = $this->extractZipFile($filePath);
            }

            // Step 3: Parse the XML
            $this->info('Parsing Scrivener XML...');
            try {
                $parser = new XmlParser($scrivxPath);
                $parsedData = $parser->parse();
                
                $this->info('Successfully parsed Scrivener project:');
                $this->info('- Title: ' . $parsedData['project']['title']);
                $this->info('- Created: ' . $parsedData['project']['created']);
                $this->info('- Modified: ' . $parsedData['project']['modified']);
                $this->info('- Document Count: ' . count($parsedData['binder']['items']));
                $this->info('- Research Items: ' . count($parsedData['research']['items']));
            } catch (\Exception $e) {
                throw new \Exception("Failed to parse Scrivener XML: " . $e->getMessage());
            }

            // Step 4: Transform data
            $this->info('Transforming data...');
            // TODO: Implement data transformation

            // Step 5: Import to database
            if (!$validateOnly) {
                $this->info('Importing to database...');
                // TODO: Implement database import
            }

            // Cleanup extracted files if not keeping them
            if (!$keepExtracted && $this->extractedPath) {
                $this->cleanupExtractedFiles();
            }

            $this->info('Import completed successfully!');
            return Command::SUCCESS;

        } catch (\Exception $e) {
            // Cleanup on error
            if ($this->extractedPath) {
                $this->cleanupExtractedFiles();
            }

            $this->error('Import failed: ' . $e->getMessage());
            Log::error('Scrivener import failed', [
                'file' => $filePath,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return Command::FAILURE;
        }
    }

    /**
     * Extract the zip file and return the path to the .scrivx file
     */
    protected function extractZipFile(string $zipPath): string
    {
        // Create a unique temporary directory
        $this->extractedPath = storage_path('app/temp/scrivener-import-' . Str::random(16));
        if (!file_exists($this->extractedPath)) {
            mkdir($this->extractedPath, 0755, true);
        }

        $zip = new ZipArchive();
        $result = $zip->open($zipPath);

        if ($result !== true) {
            throw new \Exception("Failed to open zip file: " . $this->getZipErrorMessage($result));
        }

        // Extract the zip file
        $zip->extractTo($this->extractedPath);
        $zip->close();

        // Find the .scrivx file
        $scrivxFile = $this->findScrivxFile($this->extractedPath);
        if (!$scrivxFile) {
            throw new \Exception("No .scrivx file found in the zip archive");
        }

        $this->info('Successfully extracted to: ' . $this->extractedPath);
        $this->info('Found .scrivx file: ' . $scrivxFile);

        return $scrivxFile;
    }

    /**
     * Find the .scrivx file in the extracted directory
     */
    protected function findScrivxFile(string $directory): ?string
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && strtolower($file->getExtension()) === 'scrivx') {
                return $file->getPathname();
            }
        }

        return null;
    }

    /**
     * Clean up extracted files
     */
    protected function cleanupExtractedFiles(): void
    {
        if ($this->extractedPath && file_exists($this->extractedPath)) {
            $this->info('Cleaning up extracted files...');
            $this->deleteDirectory($this->extractedPath);
        }
    }

    /**
     * Recursively delete a directory
     */
    protected function deleteDirectory(string $directory): void
    {
        if (!file_exists($directory)) {
            return;
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($files as $file) {
            if ($file->isDir()) {
                rmdir($file->getPathname());
            } else {
                unlink($file->getPathname());
            }
        }

        rmdir($directory);
    }

    /**
     * Get a human-readable error message for ZipArchive errors
     */
    protected function getZipErrorMessage(int $errorCode): string
    {
        return match($errorCode) {
            ZipArchive::ER_EXISTS => 'File already exists',
            ZipArchive::ER_INCONS => 'Zip archive inconsistent',
            ZipArchive::ER_INVAL => 'Invalid argument',
            ZipArchive::ER_MEMORY => 'Memory allocation failure',
            ZipArchive::ER_NOENT => 'No such file',
            ZipArchive::ER_NOZIP => 'Not a zip archive',
            ZipArchive::ER_OPEN => 'Cannot open file',
            ZipArchive::ER_READ => 'Read error',
            ZipArchive::ER_SEEK => 'Seek error',
            default => 'Unknown error (' . $errorCode . ')'
        };
    }

    /**
     * Display a progress bar for long-running operations
     */
    protected function showProgress($total, $current, $message = 'Processing...')
    {
        $this->output->write("\r");
        $this->output->write($message . ' ' . $current . '/' . $total);
        if ($current === $total) {
            $this->output->write("\n");
        }
    }
} 
