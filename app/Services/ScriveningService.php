<?php

namespace App\Services;

use App\Models\Item;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ScriveningService
{
    /**
     * Get combined items from multiple folders and items for scrivening view
     *
     * @param array $selections Array of selection objects with 'type' and 'id'
     * @param string $viewMode The view mode for optimization
     * @param int $maxItems Maximum items to return (safety limit)
     * @return array
     */
    public function getContents(array $selections, string $viewMode = 'manuscript', int $maxItems = 500): array
    {
        $combinedItems = collect();
        $sources = collect();
        $scriveningOrder = 0;

        foreach ($selections as $selection) {
            $type = $selection['type'] ?? null;
            $id = $selection['id'] ?? null;

            if (!$type || !$id) {
                continue;
            }

            if ($type === 'folder') {
                // Load all items from folder
                $items = $this->loadFolderItems($id, $viewMode);
                $folder = Item::find($id);

                if ($folder && $items->isNotEmpty()) {
                    // Track source folder
                    $sources->push([
                        'id' => $folder->id,
                        'title' => $folder->title,
                        'item_count' => $items->count()
                    ]);

                    // Add folder metadata to items
                    $items = $items->map(function ($item) use ($folder, &$scriveningOrder) {
                        $item->source_folder_id = $folder->id;
                        $item->source_folder_title = $folder->title;
                        $item->original_order = $item->item_order;
                        $item->scrivening_order = $scriveningOrder++;
                        return $item;
                    });

                    $combinedItems = $combinedItems->concat($items);
                }
            } elseif ($type === 'item') {
                // Load single item
                $item = $this->loadSingleItem($id, $viewMode);

                if ($item) {
                    // Get parent folder info
                    $parentFolder = Item::find($item->parent_id);

                    $item->source_folder_id = $parentFolder?->id;
                    $item->source_folder_title = $parentFolder?->title ?? 'Root';
                    $item->original_order = $item->item_order;
                    $item->scrivening_order = $scriveningOrder++;

                    $combinedItems->push($item);

                    // Track source
                    if ($parentFolder) {
                        $existingSource = $sources->firstWhere('id', $parentFolder->id);
                        if ($existingSource) {
                            $existingSource['item_count']++;
                        } else {
                            $sources->push([
                                'id' => $parentFolder->id,
                                'title' => $parentFolder->title,
                                'item_count' => 1
                            ]);
                        }
                    }
                }
            }

            // Safety limit
            if ($combinedItems->count() >= $maxItems) {
                break;
            }
        }

        // Calculate total word count
        $totalWords = $combinedItems->sum('word_count') ?? 0;

        return [
            'items' => $combinedItems->toArray(),
            'metadata' => [
                'total_items' => $combinedItems->count(),
                'total_words' => $totalWords,
                'sources' => $sources->toArray()
            ]
        ];
    }

    /**
     * Load all items from a folder with view optimization
     *
     * @param int $folderId
     * @param string $viewMode
     * @return Collection
     */
    private function loadFolderItems(int $folderId, string $viewMode): Collection
    {
        // Verify user has access to this folder
        $folder = Item::where('id', $folderId)
            ->where('type', 'folder')
            ->where('user_id', Auth::id())
            ->first();

        if (!$folder) {
            return collect();
        }

        // Build query with view mode optimization
        $query = Item::where('parent_id', $folderId)
            ->where('user_id', Auth::id())
            ->orderBy('item_order', 'asc');

        return $this->applyViewModeOptimization($query, $viewMode)->get();
    }

    /**
     * Load a single item with view optimization
     *
     * @param int $itemId
     * @param string $viewMode
     * @return Item|null
     */
    private function loadSingleItem(int $itemId, string $viewMode): ?Item
    {
        // Verify user has access to this item
        $query = Item::where('id', $itemId)
            ->where('user_id', Auth::id());

        $item = $this->applyViewModeOptimization($query, $viewMode)->first();

        return $item;
    }

    /**
     * Apply view mode specific field selection
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $viewMode
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function applyViewModeOptimization($query, string $viewMode)
    {
        switch ($viewMode) {
            case 'manuscript':
                return $query->select([
                    'id', 'title', 'type', 'content', 'synopsis',
                    'word_count', 'item_order', 'metadata', 'parent_id',
                    'include_in_compile', 'updated_at', 'created_at'
                ]);

            case 'corkboard':
                return $query->select([
                    'id', 'title', 'type', 'synopsis', 'content',
                    'word_count', 'item_order', 'metadata', 'parent_id',
                    'include_in_compile', 'updated_at'
                ]);

            case 'outline':
                return $query->select([
                    'id', 'title', 'type', 'synopsis', 'parent_id',
                    'word_count', 'item_order', 'metadata',
                    'include_in_compile', 'updated_at', 'created_at'
                ]);

            default:
                return $query;
        }
    }

    /**
     * Generate excerpt from content
     *
     * @param string|null $content
     * @param int $maxLength
     * @return string|null
     */
    public function generateExcerpt(?string $content, int $maxLength = 360): ?string
    {
        if (!$content) {
            return null;
        }

        // Strip HTML tags
        $content = strip_tags($content);

        // Truncate at word boundary
        if (strlen($content) <= $maxLength) {
            return $content;
        }

        $excerpt = substr($content, 0, $maxLength);
        $lastSpace = strrpos($excerpt, ' ');

        if ($lastSpace !== false) {
            $excerpt = substr($excerpt, 0, $lastSpace);
        }

        return $excerpt . '...';
    }

    /**
     * Validate selection structure
     *
     * @param array $selections
     * @return bool
     */
    public function validateSelections(array $selections): bool
    {
        if (empty($selections)) {
            return false;
        }

        foreach ($selections as $selection) {
            if (!isset($selection['type']) || !isset($selection['id'])) {
                return false;
            }

            if (!in_array($selection['type'], ['folder', 'item'])) {
                return false;
            }

            if (!is_numeric($selection['id'])) {
                return false;
            }
        }

        return true;
    }
}
