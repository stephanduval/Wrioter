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
        // First, remove hex-encoded binary data (images, etc.)
        $text = preg_replace('/[0-9a-fA-F]{32,}/', '', $rtf);
        
        // Remove RTF picture data blocks
        $text = preg_replace('/\\\*\\\shppict.*?\}/', '', $text);
        $text = preg_replace('/\\\pict.*?\}/', '', $text);
        
        // Remove RTF groups with control words first (most complex structures)
        $text = preg_replace('/\{\\\\[^}]*\}/', '', $text);
        
        // Remove remaining RTF control words
        $text = preg_replace('/\\\\[a-z]+[0-9]*\s?/i', '', $text);
        $text = preg_replace('/\\\\[^a-z0-9]/i', '', $text);
        
        // Remove any remaining braces
        $text = str_replace(['{', '}'], '', $text);
        
        // Convert paragraph markers
        $text = preg_replace('/\\\\par\s*/', "\n", $text);
        
        // Clean up whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        $text = preg_replace('/\n\s*\n\s*\n/', "\n\n", $text);
        $text = trim($text);
        
        // If the result is still mostly non-text characters, return empty string
        if (strlen($text) > 0 && (strlen(preg_replace('/[a-zA-Z0-9\s\.\,\!\?\-]/', '', $text)) / strlen($text)) > 0.3) {
            return '';
        }
        
        return $text;
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
