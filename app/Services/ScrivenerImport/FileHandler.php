<?php

namespace App\Services\ScrivenerImport;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;
use RuntimeException;

class FileHandler
{
    private const REQUIRED_FILES = [
        'project.scrivx',
        'Files/Docs',
        'Files/Data',
    ];

    private const REQUIRED_DIRECTORIES = [
        'Files',
        'Files/Docs',
        'Files/Data',
        'Settings',
    ];

    /**
     * Find the .scrivx file in the extracted directory
     *
     * @param string $extractedPath Path to the extracted directory
     * @return string|null Path to the .scrivx file or null if not found
     */
    private function findScrivxFile(string $extractedPath): ?string
    {
        // First check for project.scrivx in root
        if (file_exists($extractedPath . '/project.scrivx')) {
            return $extractedPath . '/project.scrivx';
        }

        // Look for .scrivx files in root
        $files = glob($extractedPath . '/*.scrivx');
        if (!empty($files)) {
            return $files[0];
        }

        // Look for .scriv directories
        $scrivDirs = glob($extractedPath . '/*.scriv');
        foreach ($scrivDirs as $dir) {
            // Check for project.scrivx in .scriv directory
            if (file_exists($dir . '/project.scrivx')) {
                return $dir . '/project.scrivx';
            }
            // Look for .scrivx files in .scriv directory
            $files = glob($dir . '/*.scrivx');
            if (!empty($files)) {
                return $files[0];
            }
        }

        return null;
    }

    /**
     * Extract a .scrivx file to a temporary directory
     *
     * @param string $scrivxPath Path to the .scrivx file
     * @return string Path to the extracted directory
     * @throws RuntimeException if extraction fails
     */
    public function extract(string $scrivxPath): string
    {
        // Create a unique temporary directory
        $extractedPath = storage_path('app/temp/scrivener-import-' . Str::random(16));
        if (!file_exists($extractedPath)) {
            mkdir($extractedPath, 0755, true);
        }

        $zip = new ZipArchive();
        $result = $zip->open($scrivxPath);

        if ($result !== true) {
            throw new RuntimeException("Failed to open zip file: " . $this->getZipErrorMessage($result));
        }

        try {
            // Extract the zip file
            if (!$zip->extractTo($extractedPath)) {
                throw new RuntimeException("Failed to extract zip file");
            }

            // Find the .scrivx file
            $scrivxFile = $this->findScrivxFile($extractedPath);
            if (!$scrivxFile) {
                throw new RuntimeException("No .scrivx file found in the archive");
            }

            // If the .scrivx file is in a .scriv directory, move everything from that directory to the root
            $scrivDir = dirname($scrivxFile);
            if (str_ends_with($scrivDir, '.scriv')) {
                $files = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($scrivDir, \RecursiveDirectoryIterator::SKIP_DOTS),
                    \RecursiveIteratorIterator::SELF_FIRST
                );
                foreach ($files as $file) {
                    $targetPath = $extractedPath . '/' . $files->getSubPathName();
                    if ($file->isDir()) {
                        if (!file_exists($targetPath)) {
                            mkdir($targetPath, 0755, true);
                        }
                    } else {
                        if (!rename($file->getPathname(), $targetPath)) {
                            throw new RuntimeException("Failed to move file from .scriv directory: " . $file->getPathname());
                        }
                    }
                }
                // Remove the .scriv directory
                $this->deleteDirectory($scrivDir);
            }

            // If the .scrivx file is not in the root, move it there (if it still exists)
            if (dirname($scrivxFile) !== $extractedPath && file_exists($scrivxFile)) {
                $newPath = $extractedPath . '/project.scrivx';
                if (!rename($scrivxFile, $newPath)) {
                    throw new RuntimeException("Failed to move .scrivx file to root directory");
                }
                $scrivxFile = $newPath;
            }

            // After flattening, ensure .scrivx file at root is named project.scrivx
            $scrivxFilesAtRoot = glob($extractedPath . '/*.scrivx');
            if (count($scrivxFilesAtRoot) === 1 && basename($scrivxFilesAtRoot[0]) !== 'project.scrivx') {
                $newPath = $extractedPath . '/project.scrivx';
                if (!rename($scrivxFilesAtRoot[0], $newPath)) {
                    throw new RuntimeException("Failed to rename .scrivx file to project.scrivx");
                }
            }

            return $extractedPath;

        } finally {
            $zip->close();
        }
    }

    /**
     * Validate the extracted Scrivener project structure
     *
     * @param string $extractedPath Path to the extracted directory
     * @return bool True if valid, false otherwise
     */
    public function validate(string $extractedPath): bool
    {
        if (!file_exists($extractedPath)) {
            return false;
        }

        // Helper to validate a given path
        $validateAtPath = function ($basePath) {
            // Check for Files and Settings directories
            if (!is_dir($basePath . '/Files')) {
                return false;
            }
            if (!is_dir($basePath . '/Settings')) {
                return false;
            }
            // Check for at least one .scrivx file
            $scrivxFiles = glob($basePath . '/*.scrivx');
            if (empty($scrivxFiles)) {
                return false;
            }
            // Validate the first .scrivx file is readable and contains valid XML
            $scrivxPath = $scrivxFiles[0];
            if (!is_readable($scrivxPath)) {
                return false;
            }
            $content = file_get_contents($scrivxPath);
            if ($content === false) {
                return false;
            }
            if (!str_starts_with(trim($content), '<?xml')) {
                return false;
            }
            if (!str_contains($content, '<ScrivenerProject')) {
                return false;
            }
            return true;
        };

        // Try root first
        if ($validateAtPath($extractedPath)) {
            return true;
        }

        // Look for .scriv directories at any depth
        $scrivDirs = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($extractedPath, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );
        foreach ($iterator as $file) {
            if ($file->isDir() && str_ends_with($file->getFilename(), '.scriv')) {
                $scrivDirs[] = $file->getPathname();
            }
        }

        // If we found exactly one .scriv directory, validate it
        if (count($scrivDirs) === 1) {
            if ($validateAtPath($scrivDirs[0])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Clean up extracted files
     *
     * @param string $extractedPath Path to the extracted directory
     * @return void
     */
    public function cleanup(string $extractedPath): void
    {
        if (!file_exists($extractedPath)) {
            return;
        }

        $this->deleteDirectory($extractedPath);
    }

    /**
     * Recursively delete a directory
     *
     * @param string $directory Directory to delete
     * @return void
     */
    private function deleteDirectory(string $directory): void
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
     *
     * @param int $errorCode ZipArchive error code
     * @return string Human-readable error message
     */
    private function getZipErrorMessage(int $errorCode): string
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
} 
