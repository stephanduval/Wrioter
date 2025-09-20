<?php

namespace App\Services\ScrivenerImport;

use Illuminate\Support\Facades\Log;
use RuntimeException;
use Symfony\Component\Process\Process;

class RtfConverter
{
    private string $pandocPath;
    private bool $isPandocAvailable;

    public function __construct()
    {
        $this->pandocPath = trim(shell_exec('which pandoc') ?: '');
        $this->isPandocAvailable = !empty($this->pandocPath);
        
        if (!$this->isPandocAvailable) {
            Log::warning('Pandoc not found. RTF conversion will be limited to basic text extraction.');
        }
    }

    /**
     * Convert RTF content to Markdown
     *
     * @param string $rtf RTF content
     * @return string Markdown content
     */
    public function convert(string $rtf): string
    {
        if (empty($rtf)) {
            return '';
        }

        if (!$this->isPandocAvailable) {
            return $this->fallbackConversion($rtf);
        }

        try {
            // Create temporary directory for media extraction
            $tempDir = sys_get_temp_dir() . '/rtf_converter_' . uniqid();
            if (!file_exists($tempDir)) {
                mkdir($tempDir, 0755, true);
            }
            
            // Create temporary files
            $rtfFile = $tempDir . '/input.rtf';
            $mdFile = $tempDir . '/output.md';
            $mediaDir = $tempDir . '/media';

            // Write RTF content to temporary file
            file_put_contents($rtfFile, $rtf);

            // Run pandoc conversion with explicit media directory
            $process = new Process([
                $this->pandocPath,
                '--from', 'rtf',
                '--to', 'markdown',
                '--wrap=none',
                '--standalone',
                '--extract-media=' . $mediaDir,
                $rtfFile,
                '-o', $mdFile
            ]);

            $process->setTimeout(30);
            $process->run();

            if (!$process->isSuccessful()) {
                Log::warning('Pandoc conversion failed, falling back to basic conversion', [
                    'error' => $process->getErrorOutput(),
                    'exit_code' => $process->getExitCode()
                ]);
                return $this->fallbackConversion($rtf);
            }

            // Read converted content
            $markdown = file_get_contents($mdFile);

            // Cleanup temporary files
            $this->cleanupTempDir($tempDir);

            // Post-process the markdown
            return $this->postProcessMarkdown($markdown);

        } catch (\Exception $e) {
            Log::error('RTF conversion failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->fallbackConversion($rtf);
        }
    }

    /**
     * Process media files and update markdown references
     *
     * @param string $markdown The markdown content
     * @param string $mediaDir The directory containing media files
     * @return string Updated markdown content
     */
    private function processMediaFiles(string $markdown, string $mediaDir): string
    {
        // Get all media files
        $mediaFiles = glob($mediaDir . '/*');
        
        // For each media file, update the markdown
        foreach ($mediaFiles as $mediaFile) {
            $fileName = basename($mediaFile);
            $mediaType = mime_content_type($mediaFile);
            
            // If it's an image, update the markdown to include it
            if (strpos($mediaType, 'image/') === 0) {
                // Convert image to base64
                $imageData = base64_encode(file_get_contents($mediaFile));
                $base64Image = 'data:' . $mediaType . ';base64,' . $imageData;
                
                // Replace any image references with base64 data
                $markdown = str_replace(
                    '![' . $fileName . '](' . $fileName . ')',
                    '![Image](' . $base64Image . ')',
                    $markdown
                );
            }
        }
        
        return $markdown;
    }

    /**
     * Clean up temporary directory and its contents
     *
     * @param string $dir Directory to clean up
     */
    private function cleanupTempDir(string $dir): void
    {
        if (!file_exists($dir)) {
            return;
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($files as $file) {
            if ($file->isDir()) {
                rmdir($file->getPathname());
            } else {
                unlink($file->getPathname());
            }
        }

        rmdir($dir);
    }

    /**
     * Fallback conversion when pandoc is not available
     *
     * @param string $rtf RTF content
     * @return string Basic markdown content
     */
    public function fallbackConversion(string $rtf): string
    {
        // Return empty string if input is empty
        if (empty($rtf)) {
            return '';
        }

        $text = $rtf;

        // Step 1: Remove RTF header and document setup
        $text = preg_replace('/^{\\\rtf1[^}]*}/', '', $text);
        $text = preg_replace('/^{\\\rtf1[^{]*{/', '{', $text);

        // Step 2: Remove font table, color table, and style definitions
        $text = preg_replace('/{\\\fonttbl[^}]*(?:{[^}]*}[^}]*)*}/s', '', $text);
        $text = preg_replace('/{\\\colortbl[^}]*}/s', '', $text);
        $text = preg_replace('/{\\\stylesheet[^}]*(?:{[^}]*}[^}]*)*}/s', '', $text);
        $text = preg_replace('/{\\\info[^}]*(?:{[^}]*}[^}]*)*}/s', '', $text);

        // Step 3: Remove page layout and section definitions
        $text = preg_replace('/\\\paperw\d+/', '', $text);
        $text = preg_replace('/\\\paperh\d+/', '', $text);
        $text = preg_replace('/\\\marg[lrtb]\d+/', '', $text);
        $text = preg_replace('/\\\sectd[^\\\\{]*/', '', $text);
        $text = preg_replace('/\\\pard[^\\\\{]*/', '', $text);

        // Step 4: Handle Unicode characters specifically
        $text = preg_replace_callback('/\\\u(\d+)\\\?\'[0-9a-fA-F]{2}/', function($matches) {
            $unicode = intval($matches[1]);
            if ($unicode > 0) {
                return mb_chr($unicode, 'UTF-8');
            }
            return '';
        }, $text);

        // Step 5: Handle common RTF escape sequences
        $replacements = [
            '\\\'92' => "'",      // Right single quote
            '\\\'93' => '"',      // Left double quote
            '\\\'94' => '"',      // Right double quote
            '\\\'96' => '–',      // En dash
            '\\\'97' => '—',      // Em dash
            '\\\'85' => '…',      // Ellipsis
            '\\~' => ' ',         // Non-breaking space
            '\\_' => '_',         // Underscore
            '\\{' => '{',         // Left brace
            '\\}' => '}',         // Right brace
            '\\\\' => '\\',       // Backslash
            '\\par' => "\n\n",    // Paragraph break
            '\\line' => "\n",     // Line break
            '\\tab' => "\t",      // Tab
            '\\bullet' => '•',    // Bullet
        ];

        foreach ($replacements as $search => $replace) {
            $text = str_replace($search, $replace, $text);
        }

        // Step 6: Remove Scrivener-specific annotations and markup
        $text = preg_replace('/<\$Scr_[^>]*>/', '', $text);
        $text = preg_replace('/<!?\$Scr_[^>]*>/', '', $text);

        // Step 7: Extract actual text content using a more sophisticated approach
        // Look for text within RTF formatting groups, preserving the actual readable content
        $extractedText = '';

        // Use a more nuanced approach to extract text from RTF
        // This regex finds text that appears after RTF formatting codes
        if (preg_match_all('/(?:\\\[a-z]+\d*\s*)*([^\\\\{}]+)(?=[\\\{}]|$)/i', $text, $matches)) {
            $textParts = [];
            foreach ($matches[1] as $part) {
                $part = trim($part);
                if (!empty($part) && !preg_match('/^[\d\s\-]+$/', $part)) {
                    $textParts[] = $part;
                }
            }
            $extractedText = implode(' ', $textParts);
        }

        // Step 8: If the sophisticated extraction didn't work, try a simpler approach
        if (empty($extractedText) || strlen($extractedText) < 10) {
            // Remove all RTF control words and formatting
            $simpleText = $text;

            // Remove control words
            $simpleText = preg_replace('/\\\[a-z]+\d*\s*/i', ' ', $simpleText);
            $simpleText = preg_replace('/\\\[^a-zA-Z0-9\s]/', '', $simpleText);

            // Remove braces
            $simpleText = str_replace(['{', '}'], '', $simpleText);

            // Clean up
            $simpleText = preg_replace('/\s+/', ' ', $simpleText);
            $simpleText = trim($simpleText);

            if (!empty($simpleText) && !preg_match('/^[\d\s\-]+$/', $simpleText)) {
                $extractedText = $simpleText;
            }
        }

        // Step 9: Clean up the extracted text
        if (!empty($extractedText)) {
            // Remove any remaining control sequences
            $extractedText = preg_replace('/\\\[a-z]+\d*/i', '', $extractedText);

            // Fix spacing
            $extractedText = preg_replace('/\s+/', ' ', $extractedText);
            $extractedText = preg_replace('/\n\s*\n\s*/', "\n\n", $extractedText);
            $extractedText = trim($extractedText);
        }

        // Step 10: Final validation
        if (empty($extractedText) || preg_match('/^[\d\s\-]+$/', $extractedText)) {
            return '';
        }

        return $extractedText;
    }

    /**
     * Post-process the markdown output
     *
     * @param string $markdown Raw markdown from pandoc
     * @return string Processed markdown
     */
    private function postProcessMarkdown(string $markdown): string
    {
        // Remove YAML front matter
        $markdown = preg_replace('/^---\s*\n.*?\n---\s*\n/s', '', $markdown);

        // Fix common pandoc conversion issues
        $markdown = str_replace('\\_', '_', $markdown); // Fix escaped underscores
        $markdown = str_replace('\\*', '*', $markdown); // Fix escaped asterisks
        
        // Convert HTML entities
        $markdown = html_entity_decode($markdown, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Fix list formatting
        $markdown = preg_replace('/^\s*[-*+]\s+/m', '- ', $markdown);
        
        // Fix heading levels (Scrivener uses different heading levels)
        $markdown = preg_replace('/^#{4,}/m', '###', $markdown);
        
        // Fix blockquote formatting
        $markdown = preg_replace('/^\s*>\s+/m', '> ', $markdown);
        
        // Fix code block formatting
        $markdown = preg_replace('/```\s*\n\s*```/m', '', $markdown);
        
        // Remove extra blank lines
        $markdown = preg_replace('/\n{3,}/', "\n\n", $markdown);
        
        return trim($markdown);
    }

    /**
     * Check if pandoc is available
     *
     * @return bool
     */
    public function isPandocAvailable(): bool
    {
        return $this->isPandocAvailable;
    }
} 
