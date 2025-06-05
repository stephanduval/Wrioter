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
            // Create temporary files
            $tempDir = sys_get_temp_dir();
            $rtfFile = tempnam($tempDir, 'rtf_');
            $mdFile = tempnam($tempDir, 'md_');

            // Write RTF content to temporary file
            file_put_contents($rtfFile, $rtf);

            // Run pandoc conversion
            $process = new Process([
                $this->pandocPath,
                '--from', 'rtf',
                '--to', 'markdown',
                '--wrap=none',
                '--standalone',
                '--extract-media=' . dirname($mdFile),
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
            @unlink($rtfFile);
            @unlink($mdFile);

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
     * Fallback conversion when pandoc is not available
     *
     * @param string $rtf RTF content
     * @return string Basic markdown content
     */
    public function fallbackConversion(string $rtf): string
    {
        // Remove RTF control words and groups
        $text = preg_replace('/\\\\(?:[a-z]+|\d+)(?:\s|$)/i', '', $rtf);
        // Remove RTF groups
        $text = preg_replace('/\{[^}]*\}/', '', $text);
        // Convert basic formatting
        $text = preg_replace('/\\\\b\s(.*?)\\\\b0\s/s', '**$1** ', $text);
        $text = preg_replace('/\\\\i\s(.*?)\\\\i0\s/s', '*$1* ', $text);
        // Clean up extra spaces and newlines
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);
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
