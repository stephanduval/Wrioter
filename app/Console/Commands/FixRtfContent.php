<?php

namespace App\Console\Commands;

use App\Models\Item;
use App\Services\ScrivenerImport\RtfConverter;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FixRtfContent extends Command
{
    protected $signature = 'scrivener:fix-rtf {--dry-run : Show what would be changed without making changes}';
    protected $description = 'Fix RTF content conversion for items with incorrect text extraction';

    private RtfConverter $rtfConverter;

    public function __construct(RtfConverter $rtfConverter)
    {
        parent::__construct();
        $this->rtfConverter = $rtfConverter;
    }

    public function handle(): int
    {
        $this->info('Scanning for items with incorrect RTF content conversion...');

        // Find items that likely have failed RTF conversion
        // These would have content that's just numbers, dashes, or very short
        $items = Item::whereNotNull('raw_content')
            ->where(function ($query) {
                $query->where('content', 'LIKE', '%-%')
                    ->orWhere('content', 'REGEXP', '^[-0-9\\s]+$')
                    ->orWhereRaw('LENGTH(content) < 10 AND LENGTH(raw_content) > 100');
            })
            ->get();

        $this->info("Found {$items->count()} items that may need RTF content reprocessing.");

        if ($items->isEmpty()) {
            $this->info('No items found that need reprocessing.');
            return 0;
        }

        $fixed = 0;
        $errors = 0;

        foreach ($items as $item) {
            $this->line("Processing Item ID: {$item->id}");
            $this->line("Current content: " . substr($item->content ?: '', 0, 100));

            try {
                // Re-extract text from RTF using the improved converter
                $newContent = $this->rtfConverter->fallbackConversion($item->raw_content);

                if (!empty($newContent) && $newContent !== $item->content) {
                    $this->line("New content: " . substr($newContent, 0, 100));

                    if ($this->option('dry-run')) {
                        $this->info("  [DRY RUN] Would update content");
                        $fixed++;
                    } else {
                        // Calculate word and character counts
                        $plainText = strip_tags($newContent);
                        $wordCount = str_word_count($plainText);
                        $charCount = mb_strlen($plainText);

                        // Update the item
                        $item->update([
                            'content' => $newContent,
                            'word_count' => $wordCount,
                            'character_count' => $charCount,
                        ]);

                        $this->info("  ✓ Updated (Words: {$wordCount}, Characters: {$charCount})");
                        $fixed++;
                    }
                } else {
                    $this->warn("  ⚠ No improvement found for this item");
                }

            } catch (\Exception $e) {
                $this->error("  ✗ Error processing item: " . $e->getMessage());
                Log::error("Failed to reprocess RTF content for item {$item->id}", [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                $errors++;
            }

            $this->newLine();
        }

        if ($this->option('dry-run')) {
            $this->info("DRY RUN COMPLETE:");
            $this->info("  Items that would be fixed: {$fixed}");
            $this->info("  Items with errors: {$errors}");
            $this->info("Run without --dry-run to apply changes.");
        } else {
            $this->info("PROCESSING COMPLETE:");
            $this->info("  Items fixed: {$fixed}");
            $this->info("  Items with errors: {$errors}");
        }

        return 0;
    }
}