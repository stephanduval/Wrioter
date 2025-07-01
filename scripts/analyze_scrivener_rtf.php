<?php

/**
 * Scrivener RTF File Analysis Script
 * 
 * This script analyzes all RTF content files in a Scrivener project's Files/Data directory
 * and provides detailed information about each file for import validation.
 */

require_once __DIR__ . '/../vendor/autoload.php';

class ScrivenerRtfAnalyzer
{
    private string $dataPath;
    private array $results = [];
    
    public function __construct(string $scrivenerProjectPath)
    {
        $this->dataPath = $scrivenerProjectPath . '/Files/Data';
        
        if (!is_dir($this->dataPath)) {
            throw new InvalidArgumentException("Data directory not found: {$this->dataPath}");
        }
    }
    
    /**
     * Analyze all RTF files in the Scrivener project
     */
    public function analyze(): array
    {
        echo "Analyzing RTF files in: {$this->dataPath}\n";
        echo str_repeat("=", 80) . "\n";
        
        $folders = $this->getUuidFolders();
        $totalFiles = 0;
        $rtfFiles = 0;
        $totalSize = 0;
        
        foreach ($folders as $uuid => $folderPath) {
            $analysis = $this->analyzeUuidFolder($uuid, $folderPath);
            if ($analysis) {
                $this->results[$uuid] = $analysis;
                $totalFiles++;
                
                if ($analysis['has_rtf']) {
                    $rtfFiles++;
                    $totalSize += $analysis['rtf_size'];
                }
            }
        }
        
        // Print summary
        echo "\n" . str_repeat("=", 80) . "\n";
        echo "ANALYSIS SUMMARY\n";
        echo str_repeat("=", 80) . "\n";
        echo "Total UUID folders: " . count($folders) . "\n";
        echo "Folders with files: {$totalFiles}\n";
        echo "Folders with RTF content: {$rtfFiles}\n";
        echo "Total RTF content size: " . $this->formatBytes($totalSize) . "\n";
        echo "Average RTF file size: " . ($rtfFiles > 0 ? $this->formatBytes($totalSize / $rtfFiles) : '0') . "\n";
        
        // Show largest files
        $sortedBySize = $this->results;
        uasort($sortedBySize, fn($a, $b) => $b['rtf_size'] <=> $a['rtf_size']);
        
        echo "\nLARGEST RTF FILES:\n";
        echo str_repeat("-", 80) . "\n";
        $count = 0;
        foreach ($sortedBySize as $uuid => $data) {
            if ($data['has_rtf'] && $count < 10) {
                echo sprintf("%-36s | %10s | %s\n", 
                    $uuid, 
                    $this->formatBytes($data['rtf_size']),
                    substr($data['content_preview'], 0, 30) . '...'
                );
                $count++;
            }
        }
        
        return $this->results;
    }
    
    /**
     * Get all UUID folders in the Data directory
     */
    private function getUuidFolders(): array
    {
        $folders = [];
        $items = scandir($this->dataPath);
        
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            
            $folderPath = $this->dataPath . '/' . $item;
            if (is_dir($folderPath) && $this->isValidUuid($item)) {
                $folders[$item] = $folderPath;
            }
        }
        
        return $folders;
    }
    
    /**
     * Analyze a single UUID folder
     */
    private function analyzeUuidFolder(string $uuid, string $folderPath): ?array
    {
        $files = scandir($folderPath);
        $analysis = [
            'uuid' => $uuid,
            'folder_path' => $folderPath,
            'has_rtf' => false,
            'has_synopsis' => false,
            'has_notes' => false,
            'has_comments' => false,
            'has_media' => false,
            'file_count' => count($files) - 2, // Exclude . and ..
            'rtf_size' => 0,
            'rtf_lines' => 0,
            'content_preview' => '',
            'rtf_encoding' => '',
            'files' => []
        ];
        
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') continue;
            
            $filePath = $folderPath . '/' . $file;
            $fileSize = filesize($filePath);
            $analysis['files'][] = [
                'name' => $file,
                'size' => $fileSize,
                'size_formatted' => $this->formatBytes($fileSize)
            ];
            
            // Analyze specific file types
            switch ($file) {
                case 'content.rtf':
                    $analysis['has_rtf'] = true;
                    $analysis['rtf_size'] = $fileSize;
                    $this->analyzeRtfFile($filePath, $analysis);
                    break;
                    
                case 'synopsis.txt':
                    $analysis['has_synopsis'] = true;
                    break;
                    
                case 'notes.rtf':
                    $analysis['has_notes'] = true;
                    break;
                    
                case 'content.comments':
                    $analysis['has_comments'] = true;
                    break;
                    
                default:
                    if (preg_match('/\.(pdf|jpg|jpeg|png|gif|wav|mp3|mp4)$/i', $file)) {
                        $analysis['has_media'] = true;
                    }
                    break;
            }
        }
        
        // Only return analysis if folder has any files
        return $analysis['file_count'] > 0 ? $analysis : null;
    }
    
    /**
     * Analyze RTF file content
     */
    private function analyzeRtfFile(string $filePath, array &$analysis): void
    {
        $content = file_get_contents($filePath);
        if ($content === false) {
            return;
        }
        
        $analysis['rtf_lines'] = substr_count($content, "\n") + 1;
        
        // Detect encoding
        $analysis['rtf_encoding'] = mb_detect_encoding($content, ['UTF-8', 'ASCII', 'ISO-8859-1', 'Windows-1252']) ?: 'Unknown';
        
        // Extract preview text (remove RTF codes for preview)
        $preview = $this->extractTextPreview($content);
        $analysis['content_preview'] = $preview;
        
        // Check for potential issues
        $analysis['rtf_issues'] = [];
        
        if (strlen($content) > 65000) {
            $analysis['rtf_issues'][] = 'File larger than 65KB (may be truncated in database)';
        }
        
        if (strpos($content, '\\pict') !== false) {
            $analysis['rtf_issues'][] = 'Contains embedded images';
        }
        
        if (!str_starts_with($content, '{\\rtf')) {
            $analysis['rtf_issues'][] = 'Invalid RTF header';
        }
        
        // Count RTF control words
        $analysis['rtf_control_words'] = substr_count($content, '\\');
    }
    
    /**
     * Extract readable text preview from RTF content
     */
    private function extractTextPreview(string $rtfContent, int $maxLength = 200): string
    {
        // Basic RTF text extraction (simplified)
        $text = $rtfContent;
        
        // Remove RTF control sequences
        $text = preg_replace('/\\\\[a-z]+\d*\s?/', '', $text);
        $text = preg_replace('/[{}]/', '', $text);
        $text = preg_replace('/\\\\./', '', $text);
        
        // Clean up whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);
        
        // Return preview
        return strlen($text) > $maxLength ? substr($text, 0, $maxLength) . '...' : $text;
    }
    
    /**
     * Check if string is a valid UUID format
     */
    private function isValidUuid(string $uuid): bool
    {
        return preg_match('/^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i', $uuid) === 1;
    }
    
    /**
     * Format bytes to human readable format
     */
    private function formatBytes(int $bytes): string
    {
        if ($bytes === 0) return '0 B';
        
        $units = ['B', 'KB', 'MB', 'GB'];
        $factor = floor((strlen($bytes) - 1) / 3);
        
        return sprintf("%.2f %s", $bytes / (1024 ** $factor), $units[$factor]);
    }
    
    /**
     * Export results to JSON file
     */
    public function exportToJson(string $outputPath): void
    {
        $data = [
            'timestamp' => date('Y-m-d H:i:s'),
            'data_path' => $this->dataPath,
            'total_items' => count($this->results),
            'results' => $this->results
        ];
        
        file_put_contents($outputPath, json_encode($data, JSON_PRETTY_PRINT));
        echo "\nResults exported to: {$outputPath}\n";
    }
}

// Script execution
if ($argc < 2) {
    echo "Usage: php analyze_scrivener_rtf.php <scrivener_project_path>\n";
    echo "Example: php analyze_scrivener_rtf.php '/home/rogers/Code/Wrioter/Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17]/scrivener tutorial.scriv'\n";
    exit(1);
}

$projectPath = $argv[1];

try {
    $analyzer = new ScrivenerRtfAnalyzer($projectPath);
    $results = $analyzer->analyze();
    
    // Export results
    $outputFile = __DIR__ . '/rtf_analysis_' . date('Y-m-d_H-i-s') . '.json';
    $analyzer->exportToJson($outputFile);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}