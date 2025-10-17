<?php

namespace App\Services\ScrivenerImport;

use Illuminate\Support\Facades\Log;

class FileScanner
{
    // File types to process as attachments
    private const ATTACHMENT_TYPES = [
        'pdf' => 'application/pdf',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'wav' => 'audio/wav',
        'mp3' => 'audio/mpeg',
        'mp4' => 'video/mp4',
    ];

    // Files that need special processing
    private const SPECIAL_FILES = [
        'content.rtf' => 'rtf',
        'content.styles' => 'styles',
        'content.comments' => 'comments',
        'synopsis.txt' => 'synopsis',
        'notes.rtf' => 'notes',
    ];

    // Manuscript-level files to store raw
    private const MANUSCRIPT_RAW_FILES = [
        'compile.xml' => 'compile',
        'styles.xml' => 'styles',
        'writing.history' => 'writing_history',
    ];

    // Additional project files (with variable names)
    private const PROJECT_FILES = [
        '.scrivx' => 'project_xml', // Main project file (name varies)
    ];

    /**
     * Scan item data folder for all files
     */
    public function scanItemFolder(string $folderPath, string $uuid): array
    {
        if (!is_dir($folderPath)) {
            return [];
        }

        $files = [];
        $entries = scandir($folderPath);

        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }

            $filePath = $folderPath . '/' . $entry;
            if (!is_file($filePath)) {
                continue;
            }

            $fileInfo = $this->analyzeFile($filePath, $entry);
            if ($fileInfo) {
                $files[] = $fileInfo;
            }
        }

        Log::debug('Scanned item folder', [
            'uuid' => $uuid,
            'path' => $folderPath,
            'files_found' => count($files),
        ]);

        return $files;
    }

    /**
     * Scan project folders for manuscript-level files
     */
    public function scanProjectFolders(string $projectPath): array
    {
        $files = [];

        // Scan for main project file (.scrivx)
        $files = array_merge($files, $this->scanForProjectFile($projectPath));

        // Scan Settings folder
        $settingsPath = $projectPath . '/Settings';
        if (is_dir($settingsPath)) {
            $files = array_merge($files, $this->scanFolder($settingsPath, 'settings'));
        }

        // Scan Files folder (top level only)
        $filesPath = $projectPath . '/Files';
        if (is_dir($filesPath)) {
            $entries = scandir($filesPath);
            foreach ($entries as $entry) {
                if ($entry === '.' || $entry === '..' || $entry === 'Data') {
                    continue;
                }
                $filePath = $filesPath . '/' . $entry;
                if (is_file($filePath)) {
                    $fileInfo = $this->analyzeProjectFile($filePath, $entry);
                    if ($fileInfo) {
                        $files[] = $fileInfo;
                    }
                }
            }
        }

        // Scan Snapshots folder
        $snapshotsPath = $projectPath . '/Snapshots';
        if (is_dir($snapshotsPath)) {
            $files = array_merge($files, $this->scanSnapshotsFolder($snapshotsPath));
        }

        return $files;
    }

    /**
     * Analyze a file and determine how to handle it
     */
    private function analyzeFile(string $filePath, string $fileName): ?array
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $fileSize = filesize($filePath);

        // Check if it's a special file
        if (isset(self::SPECIAL_FILES[$fileName])) {
            return [
                'type' => self::SPECIAL_FILES[$fileName],
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_size' => $fileSize,
                'process_type' => 'special',
            ];
        }

        // Check if it's an attachment type
        if (isset(self::ATTACHMENT_TYPES[$extension])) {
            return [
                'type' => $extension,
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_size' => $fileSize,
                'mime_type' => self::ATTACHMENT_TYPES[$extension],
                'process_type' => 'attachment',
            ];
        }

        // Unknown file type - log it
        Log::debug('Unknown file type in item folder', [
            'file_name' => $fileName,
            'extension' => $extension,
            'path' => $filePath,
        ]);

        return null;
    }

    /**
     * Analyze project-level file
     */
    private function analyzeProjectFile(string $filePath, string $fileName): ?array
    {
        if (isset(self::MANUSCRIPT_RAW_FILES[$fileName])) {
            return [
                'type' => self::MANUSCRIPT_RAW_FILES[$fileName],
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_size' => filesize($filePath),
                'process_type' => 'manuscript_raw',
            ];
        }

        return null;
    }

    /**
     * Scan regular folder
     */
    private function scanFolder(string $folderPath, string $folderType): array
    {
        $files = [];
        $entries = scandir($folderPath);

        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }

            $filePath = $folderPath . '/' . $entry;
            if (!is_file($filePath)) {
                continue;
            }

            if (isset(self::MANUSCRIPT_RAW_FILES[$entry])) {
                $files[] = [
                    'type' => self::MANUSCRIPT_RAW_FILES[$entry],
                    'file_name' => $entry,
                    'file_path' => $filePath,
                    'file_size' => filesize($filePath),
                    'process_type' => 'manuscript_raw',
                    'folder_type' => $folderType,
                ];
            }
        }

        return $files;
    }

    /**
     * Scan snapshots folder recursively
     */
    private function scanSnapshotsFolder(string $snapshotsPath): array
    {
        $files = [];
        
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($snapshotsPath, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $relativePath = str_replace($snapshotsPath . '/', '', $file->getPathname());
                $files[] = [
                    'type' => 'snapshot',
                    'file_name' => $file->getFilename(),
                    'file_path' => $file->getPathname(),
                    'file_size' => $file->getSize(),
                    'process_type' => 'manuscript_raw',
                    'relative_path' => $relativePath,
                ];
            }
        }

        return $files;
    }

    /**
     * Read file content safely
     */
    public function readFileContent(string $filePath, bool $isBinary = false): ?string
    {
        if (!file_exists($filePath) || !is_readable($filePath)) {
            return null;
        }

        $content = file_get_contents($filePath);
        if ($content === false) {
            return null;
        }

        // Base64 encode binary files
        if ($isBinary) {
            return base64_encode($content);
        }

        return $content;
    }

    /**
     * Scan for main project file (.scrivx)
     */
    private function scanForProjectFile(string $projectPath): array
    {
        $files = [];
        $entries = scandir($projectPath);

        foreach ($entries as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }

            $filePath = $projectPath . '/' . $entry;
            if (!is_file($filePath)) {
                continue;
            }

            // Check if it's a .scrivx file
            $extension = '.' . strtolower(pathinfo($entry, PATHINFO_EXTENSION));
            if (isset(self::PROJECT_FILES[$extension])) {
                $files[] = [
                    'type' => self::PROJECT_FILES[$extension],
                    'file_name' => $entry,
                    'file_path' => $filePath,
                    'file_size' => filesize($filePath),
                    'process_type' => 'manuscript_raw',
                    'folder_type' => 'project_root',
                ];

                Log::debug('Found project file', [
                    'file_name' => $entry,
                    'type' => self::PROJECT_FILES[$extension],
                    'path' => $filePath,
                ]);
            }
        }

        return $files;
    }

    /**
     * Determine if file is binary based on extension
     */
    public function isBinaryFile(string $fileName): bool
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        return isset(self::ATTACHMENT_TYPES[$extension]);
    }
}