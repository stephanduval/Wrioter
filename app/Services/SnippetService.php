<?php

namespace App\Services;

use App\Models\Item;
use App\Models\ManuscriptItem;
use App\Models\SnippetReference;
use App\Models\SnippetMarker;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SnippetService
{
    protected SnippetPositionResolver $positionResolver;

    public function __construct(SnippetPositionResolver $positionResolver)
    {
        $this->positionResolver = $positionResolver;
    }

    /**
     * Create a new snippet collection item.
     */
    public function createCollection(int $manuscriptId, string $title, ?int $parentId = null): Item
    {
        $item = Item::create([
            'user_id' => Auth::id(),
            'type' => 'snippet_collection',
            'title' => $title,
            'content' => '',
            'parent_id' => $parentId,
        ]);

        // Attach to manuscript via pivot table (same pattern as ItemController::store)
        $maxOrder = ManuscriptItem::where('manuscript_id', $manuscriptId)
            ->max('order_index') ?? 0;

        ManuscriptItem::create([
            'manuscript_id' => $manuscriptId,
            'item_id' => $item->id,
            'order_index' => $maxOrder + 1,
            'is_independent' => false,
        ]);

        return $item;
    }

    /**
     * Create a new snippet reference in a collection.
     */
    public function createSnippet(
        Item $collection,
        Item $sourceItem,
        array $positionData,
        string $selectedText,
        ?string $anchorBefore = null,
        ?string $anchorAfter = null
    ): SnippetReference {
        if (!$collection->isSnippetCollection()) {
            throw new \InvalidArgumentException('Target item is not a snippet collection');
        }

        // Get next order index
        $maxOrder = $collection->snippetReferences()->max('order_index') ?? 0;

        // Create the snippet reference
        $snippet = SnippetReference::create([
            'collection_item_id' => $collection->id,
            'source_item_id' => $sourceItem->id,
            'position_data' => $positionData,
            'anchor_text_before' => $anchorBefore ? Str::limit($anchorBefore, 100, '') : null,
            'anchor_text_after' => $anchorAfter ? Str::limit($anchorAfter, 100, '') : null,
            'reference_text' => $selectedText,
            'current_text' => $selectedText,
            'content_hash' => hash('sha256', $selectedText),
            'status' => 'active',
            'last_verified_at' => now(),
            'order_index' => $maxOrder + 1,
        ]);

        // Create position marker
        $markerId = SnippetMarker::generateMarkerId();
        $snippet->markers()->create([
            'marker_id' => $markerId,
            'position_snapshot' => $positionData,
        ]);

        return $snippet;
    }

    /**
     * Verify a single snippet's position and update its text.
     */
    public function verifySnippet(SnippetReference $snippet): array
    {
        if (!$snippet->source_item_id) {
            // Source was deleted, mark as ghost if not already
            if (!$snippet->isGhost()) {
                $snippet->markAsGhost();
            }
            return [
                'status' => 'ghost',
                'message' => 'Source item was deleted',
            ];
        }

        $sourceItem = $snippet->sourceItem;
        if (!$sourceItem) {
            $snippet->markAsGhost();
            return [
                'status' => 'ghost',
                'message' => 'Source item not found',
            ];
        }

        // Try to find current text at the position
        $currentText = $this->positionResolver->getTextAtPosition(
            $sourceItem->content ?? '',
            $snippet->position_data,
            $snippet->anchor_text_before,
            $snippet->anchor_text_after,
            $snippet->reference_text
        );

        if ($currentText === null) {
            // Text not found - could be deleted from source
            $snippet->markAsGhost();
            return [
                'status' => 'ghost',
                'message' => 'Referenced text no longer exists in source',
            ];
        }

        // Update the snippet with current text
        $snippet->update([
            'current_text' => $currentText,
            'reference_text' => $currentText,
            'content_hash' => hash('sha256', $currentText),
            'last_verified_at' => now(),
            'status' => 'active',
        ]);

        return [
            'status' => 'active',
            'text' => $currentText,
            'changed' => $currentText !== $snippet->getOriginal('reference_text'),
        ];
    }

    /**
     * Verify all snippets in a collection.
     */
    public function verifyCollection(Item $collection): array
    {
        if (!$collection->isSnippetCollection()) {
            throw new \InvalidArgumentException('Item is not a snippet collection');
        }

        $results = [
            'total' => 0,
            'active' => 0,
            'ghost' => 0,
            'changed' => 0,
        ];

        $snippets = $collection->snippetReferences()->get();
        $results['total'] = $snippets->count();

        foreach ($snippets as $snippet) {
            $result = $this->verifySnippet($snippet);

            if ($result['status'] === 'active') {
                $results['active']++;
                if ($result['changed'] ?? false) {
                    $results['changed']++;
                }
            } else {
                $results['ghost']++;
            }
        }

        return $results;
    }

    /**
     * Handle source item content update - update all referencing snippets.
     */
    public function handleSourceUpdate(Item $sourceItem): void
    {
        $snippets = SnippetReference::where('source_item_id', $sourceItem->id)
            ->where('status', 'active')
            ->get();

        foreach ($snippets as $snippet) {
            $this->verifySnippet($snippet);
        }
    }

    /**
     * Handle source item deletion - mark all referencing snippets as ghosts.
     */
    public function handleSourceDeletion(Item $sourceItem): void
    {
        SnippetReference::where('source_item_id', $sourceItem->id)
            ->where('status', '!=', 'ghost')
            ->update([
                'status' => 'ghost',
                'became_ghost_at' => now(),
            ]);
    }

    /**
     * Clear all ghost snippets from a collection.
     */
    public function clearGhosts(Item $collection): int
    {
        if (!$collection->isSnippetCollection()) {
            throw new \InvalidArgumentException('Item is not a snippet collection');
        }

        return $collection->snippetReferences()
            ->where('status', 'ghost')
            ->delete();
    }

    /**
     * Reorder snippets within a collection.
     */
    public function reorderSnippets(Item $collection, array $snippetIds): void
    {
        if (!$collection->isSnippetCollection()) {
            throw new \InvalidArgumentException('Item is not a snippet collection');
        }

        DB::transaction(function () use ($collection, $snippetIds) {
            foreach ($snippetIds as $index => $snippetId) {
                SnippetReference::where('id', $snippetId)
                    ->where('collection_item_id', $collection->id)
                    ->update(['order_index' => $index]);
            }
        });
    }

    /**
     * Get all snippet collections for a user.
     */
    public function getCollections(?int $manuscriptId = null): Collection
    {
        $query = Item::where('user_id', Auth::id())
            ->where('type', 'snippet_collection')
            ->withCount(['snippetReferences', 'snippetReferences as ghost_count' => function ($q) {
                $q->where('status', 'ghost');
            }])
            ->orderBy('title');

        if ($manuscriptId) {
            $query->whereHas('manuscriptItems', function ($q) use ($manuscriptId) {
                $q->where('manuscript_id', $manuscriptId);
            });
        }

        return $query->get();
    }

    /**
     * Get a collection with its snippets.
     */
    public function getCollectionWithSnippets(Item $collection): array
    {
        if (!$collection->isSnippetCollection()) {
            throw new \InvalidArgumentException('Item is not a snippet collection');
        }

        $snippets = $collection->snippetReferences()
            ->with('sourceItem:id,title,parent_id')
            ->orderBy('order_index')
            ->get();

        return [
            'collection' => $collection,
            'snippets' => $snippets,
            'stats' => [
                'total' => $snippets->count(),
                'active' => $snippets->where('status', 'active')->count(),
                'ghost' => $snippets->where('status', 'ghost')->count(),
            ],
        ];
    }
}
