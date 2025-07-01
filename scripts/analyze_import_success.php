<?php

/**
 * Import Success/Failure Analysis Script
 * 
 * This script analyzes validation reports and provides human-readable
 * success/failure analysis with actionable recommendations.
 */

require_once __DIR__ . '/../vendor/autoload.php';

class ImportSuccessAnalyzer
{
    private array $data = [];
    private array $analysis = [];

    /**
     * Load validation report data
     */
    public function loadValidationReport(string $reportPath): void
    {
        if (!file_exists($reportPath)) {
            throw new InvalidArgumentException("Report file not found: {$reportPath}");
        }

        $extension = pathinfo($reportPath, PATHINFO_EXTENSION);
        
        if ($extension === 'json') {
            $this->loadJsonReport($reportPath);
        } elseif ($extension === 'csv') {
            $this->loadCsvReport($reportPath);
        } else {
            throw new InvalidArgumentException("Unsupported file format: {$extension}");
        }
    }

    /**
     * Load JSON validation report
     */
    private function loadJsonReport(string $jsonPath): void
    {
        $content = file_get_contents($jsonPath);
        $this->data = json_decode($content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException("Invalid JSON file: " . json_last_error_msg());
        }
    }

    /**
     * Load CSV validation report
     */
    private function loadCsvReport(string $csvPath): void
    {
        $handle = fopen($csvPath, 'r');
        if (!$handle) {
            throw new RuntimeException("Cannot open CSV file: {$csvPath}");
        }

        $headers = fgetcsv($handle);
        $items = [];
        
        while (($row = fgetcsv($handle)) !== false) {
            $items[] = array_combine($headers, $row);
        }
        
        fclose($handle);
        
        $this->data = [
            'detailed_results' => $items,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }

    /**
     * Perform comprehensive analysis
     */
    public function analyze(): array
    {
        echo "Analyzing import success/failure patterns...\n";
        echo str_repeat("=", 60) . "\n";

        $this->analysis = [
            'summary' => $this->analyzeSummary(),
            'patterns' => $this->analyzeFailurePatterns(),
            'recommendations' => $this->generateRecommendations(),
            'size_analysis' => $this->analyzeSizeHandling(),
            'content_quality' => $this->analyzeContentQuality(),
            'timestamp' => date('Y-m-d H:i:s')
        ];

        $this->printAnalysisReport();
        
        return $this->analysis;
    }

    /**
     * Analyze summary statistics
     */
    private function analyzeSummary(): array
    {
        $items = $this->data['detailed_results'] ?? [];
        
        $statusCounts = [
            'perfect' => 0,
            'good' => 0,
            'poor' => 0,
            'failed' => 0,
            'no_content_expected' => 0
        ];

        $totalSize = 0;
        $largeFiles = 0;
        $emptyFiles = 0;

        foreach ($items as $item) {
            $status = $item['Status'] ?? $item['status'] ?? 'unknown';
            if (isset($statusCounts[$status])) {
                $statusCounts[$status]++;
            } else {
                $statusCounts['failed']++;
            }

            $originalSize = (int) ($item['Original Size'] ?? $item['original_size'] ?? 0);
            $totalSize += $originalSize;
            
            if ($originalSize > 65000) {
                $largeFiles++;
            }
            
            if ($originalSize === 0) {
                $emptyFiles++;
            }
        }

        $totalItems = count($items);
        $successfulItems = $statusCounts['perfect'] + $statusCounts['good'] + $statusCounts['no_content_expected'];
        $successRate = $totalItems > 0 ? ($successfulItems / $totalItems) * 100 : 0;

        return [
            'total_items' => $totalItems,
            'successful_items' => $successfulItems,
            'failed_items' => $statusCounts['failed'] + $statusCounts['poor'],
            'success_rate' => $successRate,
            'status_breakdown' => $statusCounts,
            'total_content_size' => $totalSize,
            'average_file_size' => $totalItems > 0 ? $totalSize / $totalItems : 0,
            'large_files' => $largeFiles,
            'empty_files' => $emptyFiles
        ];
    }

    /**
     * Analyze failure patterns
     */
    private function analyzeFailurePatterns(): array
    {
        $items = $this->data['detailed_results'] ?? [];
        $patterns = [
            'missing_content' => 0,
            'invalid_rtf_header' => 0,
            'size_issues' => 0,
            'similarity_issues' => 0,
            'encoding_issues' => 0,
            'common_issues' => []
        ];

        $issueFrequency = [];

        foreach ($items as $item) {
            $status = $item['Status'] ?? $item['status'] ?? 'unknown';
            $issues = $item['Issues'] ?? $item['issues'] ?? '';
            
            if (in_array($status, ['failed', 'poor'])) {
                $issueList = is_string($issues) ? explode(';', $issues) : $issues;
                
                foreach ($issueList as $issue) {
                    $issue = trim($issue);
                    if (empty($issue)) continue;
                    
                    $issueFrequency[$issue] = ($issueFrequency[$issue] ?? 0) + 1;
                    
                    // Categorize issues
                    if (strpos($issue, 'content') !== false) {
                        $patterns['missing_content']++;
                    } elseif (strpos($issue, 'header') !== false) {
                        $patterns['invalid_rtf_header']++;
                    } elseif (strpos($issue, 'size') !== false) {
                        $patterns['size_issues']++;
                    } elseif (strpos($issue, 'similarity') !== false) {
                        $patterns['similarity_issues']++;
                    } elseif (strpos($issue, 'encoding') !== false) {
                        $patterns['encoding_issues']++;
                    }
                }
            }
        }

        // Sort by frequency and get top issues
        arsort($issueFrequency);
        $patterns['common_issues'] = array_slice($issueFrequency, 0, 10, true);

        return $patterns;
    }

    /**
     * Analyze size handling effectiveness
     */
    private function analyzeSizeHandling(): array
    {
        $items = $this->data['detailed_results'] ?? [];
        
        $sizeAnalysis = [
            'large_files_count' => 0,
            'large_files_handled_correctly' => 0,
            'size_truncation_issues' => 0,
            'size_categories' => [
                'small' => 0,      // < 1KB
                'medium' => 0,     // 1KB - 10KB
                'large' => 0,      // 10KB - 65KB
                'xlarge' => 0      // > 65KB
            ]
        ];

        foreach ($items as $item) {
            $originalSize = (int) ($item['Original Size'] ?? $item['original_size'] ?? 0);
            $importedSize = (int) ($item['Imported Size'] ?? $item['database_raw_size'] ?? 0);
            $contentSize = (int) ($item['Content Size'] ?? $item['database_content_size'] ?? 0);

            // Categorize by size
            if ($originalSize < 1024) {
                $sizeAnalysis['size_categories']['small']++;
            } elseif ($originalSize < 10240) {
                $sizeAnalysis['size_categories']['medium']++;
            } elseif ($originalSize < 65536) {
                $sizeAnalysis['size_categories']['large']++;
            } else {
                $sizeAnalysis['size_categories']['xlarge']++;
                $sizeAnalysis['large_files_count']++;
                
                // Check if large file was handled correctly
                if ($importedSize === $originalSize && $contentSize <= 65000) {
                    $sizeAnalysis['large_files_handled_correctly']++;
                } else {
                    $sizeAnalysis['size_truncation_issues']++;
                }
            }
        }

        return $sizeAnalysis;
    }

    /**
     * Analyze content quality
     */
    private function analyzeContentQuality(): array
    {
        $items = $this->data['detailed_results'] ?? [];
        
        $quality = [
            'perfect_matches' => 0,
            'high_similarity' => 0,
            'low_similarity' => 0,
            'average_similarity' => 0,
            'rtf_header_preservation' => 0
        ];

        $similarities = [];

        foreach ($items as $item) {
            $status = $item['Status'] ?? $item['status'] ?? 'unknown';
            $similarity = $item['Similarity %'] ?? $item['similarity'] ?? null;
            $details = $item['Details'] ?? $item['details'] ?? '';

            if ($status === 'perfect') {
                $quality['perfect_matches']++;
                $similarities[] = 100;
            } elseif (is_numeric($similarity)) {
                $simValue = (float) $similarity;
                $similarities[] = $simValue;
                
                if ($simValue > 95) {
                    $quality['high_similarity']++;
                } elseif ($simValue < 80) {
                    $quality['low_similarity']++;
                }
            }

            // Check RTF header preservation
            if (strpos($details, 'RTF header') !== false || strpos($details, 'rtf header') !== false) {
                $quality['rtf_header_preservation']++;
            }
        }

        if (!empty($similarities)) {
            $quality['average_similarity'] = array_sum($similarities) / count($similarities);
        }

        return $quality;
    }

    /**
     * Generate actionable recommendations
     */
    private function generateRecommendations(): array
    {
        $recommendations = [];
        $summary = $this->analysis['summary'] ?? $this->analyzeSummary();
        $patterns = $this->analysis['patterns'] ?? $this->analyzeFailurePatterns();

        // Success rate recommendations
        if ($summary['success_rate'] < 80) {
            $recommendations[] = [
                'priority' => 'high',
                'category' => 'overall',
                'issue' => 'Low success rate (' . round($summary['success_rate'], 1) . '%)',
                'recommendation' => 'Investigate root causes of import failures and improve data transformation pipeline'
            ];
        } elseif ($summary['success_rate'] > 95) {
            $recommendations[] = [
                'priority' => 'info',
                'category' => 'overall',
                'issue' => 'Excellent success rate (' . round($summary['success_rate'], 1) . '%)',
                'recommendation' => 'Import process is working well - consider this implementation as a baseline'
            ];
        }

        // Pattern-based recommendations
        if ($patterns['missing_content'] > 0) {
            $recommendations[] = [
                'priority' => 'high',
                'category' => 'content',
                'issue' => $patterns['missing_content'] . ' items missing content',
                'recommendation' => 'Check RTF file reading and raw_content field storage in DatabasePopulator'
            ];
        }

        if ($patterns['invalid_rtf_header'] > 0) {
            $recommendations[] = [
                'priority' => 'medium',
                'category' => 'format',
                'issue' => $patterns['invalid_rtf_header'] . ' items with invalid RTF headers',
                'recommendation' => 'Validate RTF files before processing and add header correction logic'
            ];
        }

        if ($patterns['size_issues'] > 0) {
            $recommendations[] = [
                'priority' => 'medium',
                'category' => 'size',
                'issue' => $patterns['size_issues'] . ' items with size handling issues',
                'recommendation' => 'Review large file truncation logic and database field sizes'
            ];
        }

        // Size-specific recommendations
        $sizeAnalysis = $this->analysis['size_analysis'] ?? $this->analyzeSizeHandling();
        if ($sizeAnalysis['size_truncation_issues'] > 0) {
            $recommendations[] = [
                'priority' => 'medium',
                'category' => 'size',
                'issue' => $sizeAnalysis['size_truncation_issues'] . ' large files not handled correctly',
                'recommendation' => 'Fix large file truncation in DatabasePopulator to preserve full content in raw_content field'
            ];
        }

        return $recommendations;
    }

    /**
     * Print comprehensive analysis report
     */
    private function printAnalysisReport(): void
    {
        $summary = $this->analysis['summary'];
        $patterns = $this->analysis['patterns'];
        $recommendations = $this->analysis['recommendations'];
        $sizeAnalysis = $this->analysis['size_analysis'];
        $quality = $this->analysis['content_quality'];

        echo "\n" . str_repeat("=", 80) . "\n";
        echo "IMPORT SUCCESS/FAILURE ANALYSIS REPORT\n";
        echo str_repeat("=", 80) . "\n";
        
        // Summary section
        echo "\n📊 SUMMARY STATISTICS\n";
        echo str_repeat("-", 40) . "\n";
        echo "Total Items: {$summary['total_items']}\n";
        echo "Successful: {$summary['successful_items']} (" . round($summary['success_rate'], 1) . "%)\n";
        echo "Failed: {$summary['failed_items']}\n";
        echo "Perfect Matches: {$summary['status_breakdown']['perfect']}\n";
        echo "Good Matches: {$summary['status_breakdown']['good']}\n";
        echo "Poor Matches: {$summary['status_breakdown']['poor']}\n";
        echo "No Content Expected: {$summary['status_breakdown']['no_content_expected']}\n";
        
        // Content analysis
        echo "\n📄 CONTENT ANALYSIS\n";
        echo str_repeat("-", 40) . "\n";
        echo "Total Content Size: " . $this->formatBytes($summary['total_content_size']) . "\n";
        echo "Average File Size: " . $this->formatBytes($summary['average_file_size']) . "\n";
        echo "Large Files (>65KB): {$summary['large_files']}\n";
        echo "Empty Files: {$summary['empty_files']}\n";
        echo "Average Similarity: " . round($quality['average_similarity'], 1) . "%\n";
        
        // Size distribution
        echo "\n📏 SIZE DISTRIBUTION\n";
        echo str_repeat("-", 40) . "\n";
        echo "Small (<1KB): {$sizeAnalysis['size_categories']['small']}\n";
        echo "Medium (1-10KB): {$sizeAnalysis['size_categories']['medium']}\n";
        echo "Large (10-65KB): {$sizeAnalysis['size_categories']['large']}\n";
        echo "Extra Large (>65KB): {$sizeAnalysis['size_categories']['xlarge']}\n";
        
        // Failure patterns
        if (!empty($patterns['common_issues'])) {
            echo "\n⚠️  COMMON ISSUES\n";
            echo str_repeat("-", 40) . "\n";
            foreach ($patterns['common_issues'] as $issue => $count) {
                echo "• {$issue}: {$count} occurrences\n";
            }
        }
        
        // Recommendations
        if (!empty($recommendations)) {
            echo "\n💡 RECOMMENDATIONS\n";
            echo str_repeat("-", 40) . "\n";
            foreach ($recommendations as $rec) {
                $priorityIcon = match($rec['priority']) {
                    'high' => '🔴',
                    'medium' => '🟡',
                    'low' => '🟢',
                    default => 'ℹ️'
                };
                echo "{$priorityIcon} [{$rec['category']}] {$rec['issue']}\n";
                echo "   → {$rec['recommendation']}\n\n";
            }
        }
        
        echo str_repeat("=", 80) . "\n";
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
     * Export analysis to file
     */
    public function exportAnalysis(string $outputPath): void
    {
        file_put_contents($outputPath, json_encode($this->analysis, JSON_PRETTY_PRINT));
        echo "\nAnalysis exported to: {$outputPath}\n";
    }
}

// Script execution
if ($argc < 2) {
    echo "Usage: php analyze_import_success.php <validation_report_file> [output_file]\n";
    echo "Example: php analyze_import_success.php validation_report_1_2025-06-30_21-17-29.json\n";
    echo "         php analyze_import_success.php validation_detail_1_2025-06-30_21-17-29.csv\n";
    exit(1);
}

$reportFile = $argv[1];
$outputFile = $argv[2] ?? null;

try {
    $analyzer = new ImportSuccessAnalyzer();
    $analyzer->loadValidationReport($reportFile);
    $analysis = $analyzer->analyze();
    
    // Export analysis if output file specified
    if ($outputFile) {
        $analyzer->exportAnalysis($outputFile);
    } else {
        $timestamp = date('Y-m-d_H-i-s');
        $defaultOutput = __DIR__ . '/import_analysis_' . $timestamp . '.json';
        $analyzer->exportAnalysis($defaultOutput);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}