<?php

/**
 * Import Failure Debugging Script
 * 
 * This script provides detailed debugging information for specific
 * import failures and helps identify root causes.
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Bootstrap Laravel
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Manuscript;
use App\Models\Item;

class ImportFailureDebugger
{
    private string $projectPath;
    private ?Manuscript $manuscript = null;

    public function __construct(string $projectPath)
    {
        $this->projectPath = $projectPath;
    }

    /**
     * Debug specific items for a manuscript
     */
    public function debugManuscript(int $manuscriptId, array $itemFilters = []): void
    {
        $this->manuscript = Manuscript::find($manuscriptId);
        
        if (!$this->manuscript) {
            throw new InvalidArgumentException("Manuscript not found: {$manuscriptId}");
        }

        echo "Debugging Import Issues for Manuscript: {$this->manuscript->title}\n";
        echo "Project Path: {$this->projectPath}\n";
        echo str_repeat("=", 80) . "\n";

        $items = Item::whereIn('id', $this->manuscript->items()->pluck('items.id'))->get();
        
        if (!empty($itemFilters)) {
            $items = $items->filter(function($item) use ($itemFilters) {
                foreach ($itemFilters as $filter) {
                    if (stripos($item->title, $filter) !== false || 
                        stripos($item->scrivener_uuid, $filter) !== false) {
                        return true;
                    }
                }
                return false;
            });
        }

        foreach ($items as $item) {
            $this->debugItem($item);
        }
    }

    /**
     * Debug a specific item in detail
     */
    public function debugItem(Item $item): void
    {
        echo "\n" . str_repeat("-", 60) . "\n";
        echo "DEBUGGING ITEM: {$item->title}\n";
        echo str_repeat("-", 60) . "\n";
        
        $debug = [
            'basic_info' => $this->getBasicItemInfo($item),
            'original_file' => $this->analyzeOriginalFile($item),
            'database_content' => $this->analyzeDatabaseContent($item),
            'comparison' => $this->compareOriginalWithDatabase($item),
            'potential_issues' => $this->identifyPotentialIssues($item)
        ];

        $this->printItemDebugInfo($debug);
    }

    /**
     * Get basic item information
     */
    private function getBasicItemInfo(Item $item): array
    {
        return [
            'id' => $item->id,
            'title' => $item->title,
            'uuid' => $item->scrivener_uuid,
            'type' => $item->type,
            'folder_type' => $item->folder_type,
            'content_format' => $item->content_format,
            'word_count' => $item->word_count,
            'character_count' => $item->character_count,
            'created_at' => $item->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $item->updated_at?->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Analyze the original RTF file
     */
    private function analyzeOriginalFile(Item $item): array
    {
        $uuid = $item->scrivener_uuid;
        $rtfPath = $this->projectPath . '/Files/Data/' . $uuid . '/content.rtf';
        
        $analysis = [
            'file_path' => $rtfPath,
            'exists' => file_exists($rtfPath),
            'readable' => false,
            'size' => 0,
            'content_preview' => '',
            'encoding' => 'Unknown',
            'has_rtf_header' => false,
            'control_word_count' => 0,
            'issues' => []
        ];

        if ($analysis['exists']) {
            $analysis['readable'] = is_readable($rtfPath);
            
            if ($analysis['readable']) {
                $content = file_get_contents($rtfPath);
                if ($content !== false) {
                    $analysis['size'] = strlen($content);
                    $analysis['content_preview'] = substr($content, 0, 200);
                    $analysis['encoding'] = mb_detect_encoding($content) ?: 'Unknown';
                    $analysis['has_rtf_header'] = str_starts_with($content, '{\\rtf');
                    $analysis['control_word_count'] = substr_count($content, '\\');
                    
                    // Check for common issues
                    if (!$analysis['has_rtf_header']) {
                        $analysis['issues'][] = 'Invalid or missing RTF header';
                    }
                    
                    if ($analysis['size'] > 65000) {
                        $analysis['issues'][] = 'File size exceeds 65KB database limit';
                    }
                    
                    if (strpos($content, '\\pict') !== false) {
                        $analysis['issues'][] = 'Contains embedded images';
                    }
                    
                    if (!in_array($analysis['encoding'], ['UTF-8', 'ASCII'])) {
                        $analysis['issues'][] = 'Non-standard encoding: ' . $analysis['encoding'];
                    }
                } else {
                    $analysis['issues'][] = 'Cannot read file content';
                }
            } else {
                $analysis['issues'][] = 'File is not readable';
            }
        } else {
            $analysis['issues'][] = 'Original RTF file does not exist';
        }

        return $analysis;
    }

    /**
     * Analyze database content
     */
    private function analyzeDatabaseContent(Item $item): array
    {
        return [
            'has_content' => !empty($item->content),
            'content_size' => strlen($item->content ?? ''),
            'content_preview' => substr($item->content ?? '', 0, 200),
            'has_raw_content' => !empty($item->raw_content),
            'raw_content_size' => strlen($item->raw_content ?? ''),
            'raw_content_preview' => substr($item->raw_content ?? '', 0, 200),
            'has_content_markdown' => !empty($item->content_markdown),
            'content_markdown_size' => strlen($item->content_markdown ?? ''),
            'format_metadata' => $item->format_metadata,
            'rtf_header_in_raw' => !empty($item->raw_content) && str_starts_with($item->raw_content, '{\\rtf'),
            'content_is_truncated' => !empty($item->content) && str_contains($item->content, '[Content truncated')
        ];
    }

    /**
     * Compare original file with database content
     */
    private function compareOriginalWithDatabase(Item $item): array
    {
        $original = $this->analyzeOriginalFile($item);
        $database = $this->analyzeDatabaseContent($item);
        
        $comparison = [
            'files_match' => false,
            'size_difference' => 0,
            'similarity_score' => 0.0,
            'content_preserved' => false,
            'issues' => []
        ];

        if ($original['exists'] && $original['readable']) {
            $originalContent = file_get_contents($original['file_path']);
            
            if ($originalContent !== false && $database['has_raw_content']) {
                $comparison['files_match'] = $originalContent === $item->raw_content;
                $comparison['size_difference'] = abs($original['size'] - $database['raw_content_size']);
                $comparison['similarity_score'] = $this->calculateSimilarity($originalContent, $item->raw_content);
                $comparison['content_preserved'] = $comparison['similarity_score'] > 0.95;
                
                if (!$comparison['files_match']) {
                    if ($comparison['size_difference'] > 0) {
                        $comparison['issues'][] = "Size difference: {$comparison['size_difference']} bytes";
                    }
                    
                    if ($comparison['similarity_score'] < 0.8) {
                        $comparison['issues'][] = 'Low content similarity: ' . round($comparison['similarity_score'] * 100, 1) . '%';
                    }
                }
            } elseif (!$database['has_raw_content']) {
                $comparison['issues'][] = 'No raw content stored in database';
            }
        } else {
            $comparison['issues'][] = 'Cannot compare - original file issues';
        }

        return $comparison;
    }

    /**
     * Identify potential issues and root causes
     */
    private function identifyPotentialIssues(Item $item): array
    {
        $original = $this->analyzeOriginalFile($item);
        $database = $this->analyzeDatabaseContent($item);
        $comparison = $this->compareOriginalWithDatabase($item);
        
        $issues = [
            'critical' => [],
            'warnings' => [],
            'info' => [],
            'root_causes' => [],
            'recommendations' => []
        ];

        // Critical issues
        if (!$original['exists']) {
            $issues['critical'][] = 'Original RTF file missing from Scrivener project';
            $issues['root_causes'][] = 'File may have been deleted or project structure corrupted';
            $issues['recommendations'][] = 'Check Scrivener project integrity and re-export if necessary';
        } elseif (!$database['has_raw_content'] && $original['size'] > 0) {
            $issues['critical'][] = 'Content not preserved during import';
            $issues['root_causes'][] = 'DatabasePopulator failed to store raw_content field';
            $issues['recommendations'][] = 'Check Item model fillable fields and database schema';
        }

        // Warnings
        if ($comparison['similarity_score'] < 0.8 && $comparison['similarity_score'] > 0) {
            $issues['warnings'][] = 'Content similarity below 80%';
            $issues['root_causes'][] = 'Content transformation or encoding issues during import';
            $issues['recommendations'][] = 'Review RtfConverter and DataTransformer logic';
        }

        if ($original['size'] > 65000 && !$database['content_is_truncated']) {
            $issues['warnings'][] = 'Large file not properly truncated in content field';
            $issues['root_causes'][] = 'Large file handling logic not working correctly';
            $issues['recommendations'][] = 'Check DatabasePopulator size handling code';
        }

        // Info
        if (!$original['has_rtf_header']) {
            $issues['info'][] = 'Original file has invalid RTF header';
        }

        if (count($original['issues']) > 0) {
            $issues['info'] = array_merge($issues['info'], $original['issues']);
        }

        return $issues;
    }

    /**
     * Print detailed debug information
     */
    private function printItemDebugInfo(array $debug): void
    {
        // Basic Info
        echo "📋 BASIC INFORMATION\n";
        foreach ($debug['basic_info'] as $key => $value) {
            echo "  {$key}: " . ($value ?? 'NULL') . "\n";
        }

        // Original File Analysis
        echo "\n📄 ORIGINAL FILE ANALYSIS\n";
        $original = $debug['original_file'];
        echo "  File Path: {$original['file_path']}\n";
        echo "  Exists: " . ($original['exists'] ? 'Yes' : 'No') . "\n";
        echo "  Readable: " . ($original['readable'] ? 'Yes' : 'No') . "\n";
        echo "  Size: " . $this->formatBytes($original['size']) . "\n";
        echo "  Encoding: {$original['encoding']}\n";
        echo "  Has RTF Header: " . ($original['has_rtf_header'] ? 'Yes' : 'No') . "\n";
        echo "  Control Words: {$original['control_word_count']}\n";
        if (!empty($original['content_preview'])) {
            echo "  Preview: " . substr($original['content_preview'], 0, 100) . "...\n";
        }

        // Database Content Analysis
        echo "\n💾 DATABASE CONTENT ANALYSIS\n";
        $db = $debug['database_content'];
        echo "  Has Content: " . ($db['has_content'] ? 'Yes' : 'No') . "\n";
        echo "  Content Size: " . $this->formatBytes($db['content_size']) . "\n";
        echo "  Has Raw Content: " . ($db['has_raw_content'] ? 'Yes' : 'No') . "\n";
        echo "  Raw Content Size: " . $this->formatBytes($db['raw_content_size']) . "\n";
        echo "  Has Markdown: " . ($db['has_content_markdown'] ? 'Yes' : 'No') . "\n";
        echo "  RTF Header in Raw: " . ($db['rtf_header_in_raw'] ? 'Yes' : 'No') . "\n";
        echo "  Content Truncated: " . ($db['content_is_truncated'] ? 'Yes' : 'No') . "\n";

        // Comparison Results
        echo "\n🔍 COMPARISON RESULTS\n";
        $comp = $debug['comparison'];
        echo "  Files Match: " . ($comp['files_match'] ? 'Yes' : 'No') . "\n";
        echo "  Size Difference: " . $this->formatBytes($comp['size_difference']) . "\n";
        echo "  Similarity Score: " . round($comp['similarity_score'] * 100, 1) . "%\n";
        echo "  Content Preserved: " . ($comp['content_preserved'] ? 'Yes' : 'No') . "\n";

        // Issues and Recommendations
        $issues = $debug['potential_issues'];
        
        if (!empty($issues['critical'])) {
            echo "\n🔴 CRITICAL ISSUES\n";
            foreach ($issues['critical'] as $issue) {
                echo "  • {$issue}\n";
            }
        }

        if (!empty($issues['warnings'])) {
            echo "\n🟡 WARNINGS\n";
            foreach ($issues['warnings'] as $warning) {
                echo "  • {$warning}\n";
            }
        }

        if (!empty($issues['root_causes'])) {
            echo "\n🔬 POTENTIAL ROOT CAUSES\n";
            foreach ($issues['root_causes'] as $cause) {
                echo "  • {$cause}\n";
            }
        }

        if (!empty($issues['recommendations'])) {
            echo "\n💡 RECOMMENDATIONS\n";
            foreach ($issues['recommendations'] as $rec) {
                echo "  • {$rec}\n";
            }
        }
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
        
        if ($str1 === $str2) {
            return 1.0;
        }
        
        // Use sampling for performance on large files
        $sample1 = substr($str1, 0, 2000);
        $sample2 = substr($str2, 0, 2000);
        
        $maxLen = max(strlen($sample1), strlen($sample2));
        if ($maxLen === 0) return 1.0;
        
        $distance = levenshtein($sample1, $sample2);
        return max(0.0, 1.0 - ($distance / $maxLen));
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
     * Search for items with specific issues
     */
    public function findItemsWithIssues(int $manuscriptId, array $issueTypes = []): array
    {
        $this->manuscript = Manuscript::find($manuscriptId);
        $items = Item::whereIn('id', $this->manuscript->items()->pluck('items.id'))->get();
        
        $problematicItems = [];
        
        foreach ($items as $item) {
            $original = $this->analyzeOriginalFile($item);
            $database = $this->analyzeDatabaseContent($item);
            $comparison = $this->compareOriginalWithDatabase($item);
            
            $hasIssues = false;
            $itemIssues = [];
            
            // Check for specific issue types
            if (empty($issueTypes) || in_array('missing_files', $issueTypes)) {
                if (!$original['exists']) {
                    $hasIssues = true;
                    $itemIssues[] = 'missing_original_file';
                }
            }
            
            if (empty($issueTypes) || in_array('content_loss', $issueTypes)) {
                if ($original['size'] > 0 && !$database['has_raw_content']) {
                    $hasIssues = true;
                    $itemIssues[] = 'content_not_preserved';
                }
            }
            
            if (empty($issueTypes) || in_array('low_similarity', $issueTypes)) {
                if ($comparison['similarity_score'] < 0.8 && $comparison['similarity_score'] > 0) {
                    $hasIssues = true;
                    $itemIssues[] = 'low_similarity';
                }
            }
            
            if ($hasIssues) {
                $problematicItems[] = [
                    'item' => $item,
                    'issues' => $itemIssues,
                    'similarity' => $comparison['similarity_score']
                ];
            }
        }
        
        return $problematicItems;
    }
}

// Script execution
if ($argc < 3) {
    echo "Usage: php debug_import_failures.php <manuscript_id> <scrivener_project_path> [item_filter...]\n";
    echo "Examples:\n";
    echo "  php debug_import_failures.php 1 '/path/to/project.scriv'\n";
    echo "  php debug_import_failures.php 1 '/path/to/project.scriv' 'Problem Item'\n";
    echo "  php debug_import_failures.php 1 '/path/to/project.scriv' --find-issues content_loss\n";
    exit(1);
}

$manuscriptId = (int) $argv[1];
$projectPath = $argv[2];
$itemFilters = array_slice($argv, 3);

try {
    $debugger = new ImportFailureDebugger($projectPath);
    
    // Check if we're looking for specific issue types
    if (!empty($itemFilters) && $itemFilters[0] === '--find-issues') {
        $issueTypes = array_slice($itemFilters, 1);
        echo "Searching for items with issues: " . implode(', ', $issueTypes) . "\n";
        
        $problematicItems = $debugger->findItemsWithIssues($manuscriptId, $issueTypes);
        
        if (empty($problematicItems)) {
            echo "No items found with the specified issues.\n";
        } else {
            echo "Found " . count($problematicItems) . " items with issues:\n\n";
            foreach ($problematicItems as $itemData) {
                echo "• {$itemData['item']->title} - Issues: " . implode(', ', $itemData['issues']) . "\n";
            }
        }
    } else {
        // Debug specific items or all items
        $debugger->debugManuscript($manuscriptId, $itemFilters);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}