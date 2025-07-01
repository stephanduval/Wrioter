<?php

/**
 * Scrivener Import Validation Script
 * 
 * This script validates that a Scrivener import was successful by comparing
 * the original RTF files with the imported database content.
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Manuscript;
use App\Models\Item;
use Illuminate\Support\Facades\DB;

class ScrivenerImportValidator
{
    private string $projectPath;
    private ?Manuscript $manuscript = null;
    private array $rtfAnalysis = [];
    private array $validationResults = [];

    public function __construct(string $projectPath)
    {
        $this->projectPath = $projectPath;
    }

    /**
     * Validate import for a specific manuscript
     */
    public function validateImport(int $manuscriptId): array
    {
        $this->manuscript = Manuscript::find($manuscriptId);
        
        if (!$this->manuscript) {
            throw new InvalidArgumentException("Manuscript not found: {$manuscriptId}");
        }

        if ($this->manuscript->manuscript_type !== 'scrivener') {
            throw new InvalidArgumentException("Manuscript is not a Scrivener import: {$manuscriptId}");
        }

        echo "Validating Scrivener import for manuscript: {$this->manuscript->title}\n";
        echo "Project path: {$this->projectPath}\n";
        echo str_repeat("=", 80) . "\n";

        // Step 1: Analyze original RTF files
        $this->analyzeOriginalFiles();

        // Step 2: Compare with database content
        $this->compareWithDatabase();

        // Step 3: Generate validation report
        return $this->generateValidationReport();
    }

    /**
     * Analyze original RTF files in the Scrivener project
     */
    private function analyzeOriginalFiles(): void
    {
        echo "Analyzing original RTF files...\n";
        
        $dataPath = $this->projectPath . '/Files/Data';
        if (!is_dir($dataPath)) {
            throw new RuntimeException("Data directory not found: {$dataPath}");
        }

        $folders = scandir($dataPath);
        $rtfCount = 0;

        foreach ($folders as $folder) {
            if ($folder === '.' || $folder === '..') continue;
            
            $folderPath = $dataPath . '/' . $folder;
            if (!is_dir($folderPath)) continue;
            
            $rtfPath = $folderPath . '/content.rtf';
            if (!file_exists($rtfPath)) continue;
            
            $rtfContent = file_get_contents($rtfPath);
            if ($rtfContent === false) continue;

            $this->rtfAnalysis[$folder] = [
                'uuid' => $folder,
                'file_path' => $rtfPath,
                'file_size' => strlen($rtfContent),
                'content' => $rtfContent,
                'content_preview' => $this->extractTextPreview($rtfContent),
                'encoding' => mb_detect_encoding($rtfContent) ?: 'Unknown',
                'is_valid_rtf' => str_starts_with($rtfContent, '{\\rtf'),
                'has_images' => strpos($rtfContent, '\\pict') !== false,
                'control_word_count' => substr_count($rtfContent, '\\'),
                'issues' => $this->identifyContentIssues($rtfContent)
            ];
            
            $rtfCount++;
        }

        echo "Analyzed {$rtfCount} RTF files\n";
    }

    /**
     * Compare original files with database content
     */
    private function compareWithDatabase(): void
    {
        echo "Comparing with database content...\n";
        
        $items = Item::whereIn('id', $this->manuscript->items()->pluck('items.id'))->get();
        
        echo "Found " . $items->count() . " items in database\n";
        
        $perfectMatches = 0;
        $goodMatches = 0;
        $poorMatches = 0;
        $noMatches = 0;

        foreach ($items as $item) {
            $uuid = $item->scrivener_uuid;
            
            if (!isset($this->rtfAnalysis[$uuid])) {
                $this->validationResults[$uuid] = [
                    'status' => 'no_original',
                    'item_title' => $item->title,
                    'issues' => ['No original RTF file found for this UUID']
                ];
                $noMatches++;
                continue;
            }

            $original = $this->rtfAnalysis[$uuid];
            $result = $this->compareItemWithOriginal($item, $original);
            
            $this->validationResults[$uuid] = $result;
            
            // Categorize results
            switch ($result['status']) {
                case 'perfect':
                    $perfectMatches++;
                    break;
                case 'good':
                    $goodMatches++;
                    break;
                case 'poor':
                    $poorMatches++;
                    break;
                default:
                    $noMatches++;
            }
        }

        echo "Comparison Results:\n";
        echo "  Perfect matches: {$perfectMatches}\n";
        echo "  Good matches: {$goodMatches}\n";
        echo "  Poor matches: {$poorMatches}\n";
        echo "  No matches: {$noMatches}\n";
        
        // Generate detailed item reports
        $this->printDetailedResults($perfectMatches, $goodMatches, $poorMatches, $noMatches);
    }

    /**
     * Print detailed results for each category
     */
    private function printDetailedResults(int $perfectMatches, int $goodMatches, int $poorMatches, int $noMatches): void
    {
        // Group results by status
        $categorized = [
            'perfect' => [],
            'good' => [],
            'poor' => [],
            'failed' => [],
            'no_content_expected' => []
        ];
        
        foreach ($this->validationResults as $result) {
            $status = $result['status'] ?? 'failed';
            if (!isset($categorized[$status])) {
                $categorized['failed'][] = $result;
            } else {
                $categorized[$status][] = $result;
            }
        }
        
        // Print perfect matches
        if (!empty($categorized['perfect'])) {
            echo "\n" . str_repeat("=", 60) . "\n";
            echo "PERFECT MATCHES ({$perfectMatches} items):\n";
            echo str_repeat("=", 60) . "\n";
            foreach ($categorized['perfect'] as $item) {
                echo "✓ {$item['item_title']}\n";
                echo "    Size: {$item['original_size']} → {$item['database_raw_size']} bytes\n";
                if (!empty($item['details'])) {
                    echo "    Details: " . implode(', ', $item['details']) . "\n";
                }
                echo "\n";
            }
        }
        
        // Print good matches
        if (!empty($categorized['good'])) {
            echo "\n" . str_repeat("=", 60) . "\n";
            echo "GOOD MATCHES ({$goodMatches} items):\n";
            echo str_repeat("=", 60) . "\n";
            foreach ($categorized['good'] as $item) {
                echo "○ {$item['item_title']}\n";
                echo "    Size: {$item['original_size']} → {$item['database_raw_size']} bytes\n";
                echo "    Similarity: " . round($item['similarity_score'] * 100, 1) . "%\n";
                if (!empty($item['details'])) {
                    echo "    Details: " . implode(', ', $item['details']) . "\n";
                }
                if (!empty($item['issues'])) {
                    echo "    Issues: " . implode(', ', $item['issues']) . "\n";
                }
                echo "\n";
            }
        }
        
        // Print poor matches
        if (!empty($categorized['poor'])) {
            echo "\n" . str_repeat("=", 60) . "\n";
            echo "POOR MATCHES ({$poorMatches} items):\n";
            echo str_repeat("=", 60) . "\n";
            foreach ($categorized['poor'] as $item) {
                echo "⚠ {$item['item_title']}\n";
                echo "    Size: {$item['original_size']} → {$item['database_raw_size']} bytes\n";
                echo "    Similarity: " . round($item['similarity_score'] * 100, 1) . "%\n";
                if (!empty($item['issues'])) {
                    echo "    Issues: " . implode(', ', $item['issues']) . "\n";
                }
                echo "\n";
            }
        }
        
        // Print failed matches
        if (!empty($categorized['failed']) || !empty($categorized['no_original'])) {
            $failedItems = array_merge($categorized['failed'], $categorized['no_original'] ?? []);
            echo "\n" . str_repeat("=", 60) . "\n";
            echo "FAILED MATCHES (" . count($failedItems) . " items):\n";
            echo str_repeat("=", 60) . "\n";
            foreach ($failedItems as $item) {
                echo "✗ {$item['item_title']}\n";
                if (isset($item['original_size'])) {
                    echo "    Size: {$item['original_size']} → {$item['database_raw_size']} bytes\n";
                }
                if (!empty($item['issues'])) {
                    echo "    Issues: " . implode(', ', $item['issues']) . "\n";
                }
                echo "\n";
            }
        }
        
        // Print no content expected
        if (!empty($categorized['no_content_expected'])) {
            echo "\n" . str_repeat("-", 60) . "\n";
            echo "NO CONTENT EXPECTED (" . count($categorized['no_content_expected']) . " items):\n";
            echo str_repeat("-", 60) . "\n";
            foreach ($categorized['no_content_expected'] as $item) {
                echo "○ {$item['item_title']} (folder/container item)\n";
            }
            echo "\n";
        }
    }
    
    /**
     * Compare individual item with original RTF
     */
    private function compareItemWithOriginal(Item $item, array $original): array
    {
        $result = [
            'status' => 'unknown',
            'item_title' => $item->title,
            'uuid' => $item->scrivener_uuid,
            'original_size' => $original['file_size'],
            'database_raw_size' => strlen($item->raw_content ?? ''),
            'database_content_size' => strlen($item->content ?? ''),
            'content_match' => false,
            'similarity_score' => 0.0,
            'issues' => [],
            'details' => []
        ];

        // Check if content is expected
        if (empty($original['content']) && empty($item->raw_content)) {
            $result['status'] = 'no_content_expected';
            $result['details'][] = 'No content in original or imported (folder/container item)';
            return $result;
        }
        
        // Check raw content preservation
        if (!empty($item->raw_content)) {
            $result['content_match'] = $original['content'] === $item->raw_content;
            $result['similarity_score'] = $this->calculateSimilarity($original['content'], $item->raw_content);
            
            if ($result['content_match']) {
                $result['status'] = 'perfect';
                $result['details'][] = 'Raw RTF content matches perfectly';
            } elseif ($result['similarity_score'] > 0.95) {
                $result['status'] = 'good';
                $result['details'][] = 'Raw RTF content has high similarity';
                $result['issues'][] = 'Minor differences in raw content';
            } elseif ($result['similarity_score'] > 0.8) {
                $result['status'] = 'poor';
                $result['issues'][] = 'Significant differences in raw content';
            } else {
                $result['status'] = 'failed';
                $result['issues'][] = 'Raw content has low similarity to original';
            }
        } else {
            if (!empty($original['content'])) {
                $result['issues'][] = 'No raw content stored in database but original had content';
                $result['status'] = 'failed';
            } else {
                $result['status'] = 'no_content_expected';
                $result['details'][] = 'No content expected (folder/container item)';
            }
        }

        // Check content field quality
        if (!empty($item->content)) {
            $textRatio = $this->calculateTextRatio($item->content);
            if ($textRatio > 0.8) {
                $result['details'][] = 'Content field contains readable text';
            } else {
                $result['issues'][] = 'Content field contains mostly non-text characters';
            }
        } else {
            $result['issues'][] = 'Content field is empty';
        }

        // Check markdown conversion
        if (!empty($item->content_markdown)) {
            $result['details'][] = 'Markdown conversion completed';
        } else {
            $result['issues'][] = 'No markdown content generated';
        }

        // Check size handling for large files
        if ($original['file_size'] > 65000) {
            if (strlen($item->content) < strlen($item->raw_content ?? '')) {
                $result['details'][] = 'Large file properly truncated in content field';
            } else {
                $result['issues'][] = 'Large file truncation may not be working correctly';
            }
        }

        return $result;
    }

    /**
     * Generate comprehensive validation report
     */
    private function generateValidationReport(): array
    {
        echo "\nGenerating validation report...\n";
        
        $report = [
            'manuscript' => [
                'id' => $this->manuscript->id,
                'title' => $this->manuscript->title,
                'scrivener_uuid' => $this->manuscript->scrivener_uuid,
                'imported_at' => $this->manuscript->imported_at,
            ],
            'summary' => [
                'total_original_files' => count($this->rtfAnalysis),
                'total_database_items' => count($this->validationResults),
                'perfect_matches' => 0,
                'good_matches' => 0,
                'poor_matches' => 0,
                'failed_matches' => 0,
                'issues_found' => 0,
            ],
            'detailed_results' => $this->validationResults,
            'recommendations' => [],
            'timestamp' => date('Y-m-d H:i:s')
        ];

        // Calculate summary statistics
        foreach ($this->validationResults as $result) {
            switch ($result['status']) {
                case 'perfect':
                    $report['summary']['perfect_matches']++;
                    break;
                case 'good':
                    $report['summary']['good_matches']++;
                    break;
                case 'poor':
                    $report['summary']['poor_matches']++;
                    break;
                default:
                    $report['summary']['failed_matches']++;
            }
            
            $report['summary']['issues_found'] += count($result['issues']);
        }

        // Generate recommendations
        $this->generateRecommendations($report);

        // Print summary
        $this->printReportSummary($report);

        return $report;
    }

    /**
     * Generate recommendations based on validation results
     */
    private function generateRecommendations(array &$report): void
    {
        $summary = $report['summary'];
        
        if ($summary['failed_matches'] > 0) {
            $report['recommendations'][] = "Fix {$summary['failed_matches']} items with failed content preservation";
        }
        
        if ($summary['poor_matches'] > 0) {
            $report['recommendations'][] = "Investigate {$summary['poor_matches']} items with poor content similarity";
        }
        
        if ($summary['issues_found'] > 0) {
            $report['recommendations'][] = "Address {$summary['issues_found']} total issues found during validation";
        }
        
        $successRate = ($summary['perfect_matches'] + $summary['good_matches']) / max(1, $summary['total_database_items']);
        
        if ($successRate < 0.8) {
            $report['recommendations'][] = "Import success rate is low (" . round($successRate * 100) . "%) - review import process";
        } elseif ($successRate > 0.95) {
            $report['recommendations'][] = "Import quality is excellent (" . round($successRate * 100) . "% success rate)";
        }
    }

    /**
     * Print report summary to console
     */
    private function printReportSummary(array $report): void
    {
        echo "\n" . str_repeat("=", 80) . "\n";
        echo "VALIDATION REPORT SUMMARY\n";
        echo str_repeat("=", 80) . "\n";
        
        $summary = $report['summary'];
        echo "Total Original Files: {$summary['total_original_files']}\n";
        echo "Total Database Items: {$summary['total_database_items']}\n";
        echo "Perfect Matches: {$summary['perfect_matches']}\n";
        echo "Good Matches: {$summary['good_matches']}\n";
        echo "Poor Matches: {$summary['poor_matches']}\n";
        echo "Failed Matches: {$summary['failed_matches']}\n";
        echo "Total Issues Found: {$summary['issues_found']}\n";
        
        $successRate = ($summary['perfect_matches'] + $summary['good_matches']) / max(1, $summary['total_database_items']);
        echo "Success Rate: " . round($successRate * 100, 1) . "%\n";
        
        if (!empty($report['recommendations'])) {
            echo "\nRECOMMENDATIONS:\n";
            foreach ($report['recommendations'] as $i => $recommendation) {
                echo ($i + 1) . ". {$recommendation}\n";
            }
        }
        
        echo "\n";
    }

    /**
     * Extract readable text preview from RTF
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
     * Identify potential content issues
     */
    private function identifyContentIssues(string $content): array
    {
        $issues = [];
        
        if (strlen($content) > 65000) {
            $issues[] = 'File size exceeds 65KB limit';
        }
        
        if (strpos($content, '\\pict') !== false) {
            $issues[] = 'Contains embedded images';
        }
        
        if (!str_starts_with($content, '{\\rtf')) {
            $issues[] = 'Invalid RTF header';
        }
        
        $encoding = mb_detect_encoding($content);
        if (!$encoding || !in_array($encoding, ['UTF-8', 'ASCII'])) {
            $issues[] = 'Unusual character encoding: ' . ($encoding ?: 'Unknown');
        }
        
        return $issues;
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

        // For exact comparison of RTF content, use string comparison
        if ($str1 === $str2) {
            return 1.0;
        }

        // For similarity, use a sampling approach for performance
        $sample1 = substr($str1, 0, 1000);
        $sample2 = substr($str2, 0, 1000);
        
        $maxLen = max(strlen($sample1), strlen($sample2));
        if ($maxLen === 0) return 1.0;
        
        $distance = levenshtein($sample1, $sample2);
        return 1.0 - ($distance / $maxLen);
    }

    /**
     * Calculate ratio of readable text characters
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
     * Export validation report to JSON file
     */
    public function exportReport(array $report, string $outputPath): void
    {
        file_put_contents($outputPath, json_encode($report, JSON_PRETTY_PRINT));
        echo "Validation report exported to: {$outputPath}\n";
    }
    
    /**
     * Export detailed results to CSV file
     */
    public function exportDetailedCsv(string $outputPath): void
    {
        $csvData = [];
        $csvData[] = ['Title', 'UUID', 'Status', 'Original Size', 'Imported Size', 'Content Size', 'Similarity %', 'Issues', 'Details'];
        
        foreach ($this->validationResults as $result) {
            $csvData[] = [
                $result['item_title'],
                $result['uuid'] ?? '',
                $result['status'],
                $result['original_size'] ?? 0,
                $result['database_raw_size'] ?? 0,
                $result['database_content_size'] ?? 0,
                isset($result['similarity_score']) ? round($result['similarity_score'] * 100, 1) : 'N/A',
                implode('; ', $result['issues'] ?? []),
                implode('; ', $result['details'] ?? [])
            ];
        }
        
        $csvFile = fopen($outputPath, 'w');
        foreach ($csvData as $row) {
            fputcsv($csvFile, $row);
        }
        fclose($csvFile);
        
        echo "Detailed CSV report exported to: {$outputPath}\n";
    }
}

// Script execution
if ($argc < 3) {
    echo "Usage: php validate_scrivener_import.php <manuscript_id> <scrivener_project_path> [output_file]\n";
    echo "Example: php validate_scrivener_import.php 1 '/home/rogers/Code/Wrioter/Scrivener Zip Files/Scrivener tutorial [2025_06_01_05_17_17]/scrivener tutorial.scriv'\n";
    exit(1);
}

$manuscriptId = (int) $argv[1];
$projectPath = $argv[2];
$outputFile = $argv[3] ?? null;

try {
    $validator = new ScrivenerImportValidator($projectPath);
    $report = $validator->validateImport($manuscriptId);
    
    // Export reports
    if ($outputFile) {
        $validator->exportReport($report, $outputFile);
        // Also generate CSV
        $csvFile = str_replace('.json', '.csv', $outputFile);
        $validator->exportDetailedCsv($csvFile);
    } else {
        $timestamp = date('Y-m-d_H-i-s');
        $defaultJsonOutput = __DIR__ . '/validation_report_' . $manuscriptId . '_' . $timestamp . '.json';
        $defaultCsvOutput = __DIR__ . '/validation_detail_' . $manuscriptId . '_' . $timestamp . '.csv';
        
        $validator->exportReport($report, $defaultJsonOutput);
        $validator->exportDetailedCsv($defaultCsvOutput);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}