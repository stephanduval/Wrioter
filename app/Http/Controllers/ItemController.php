<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Manuscript;
use App\Models\ManuscriptItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ItemController extends Controller
{
    /**
     * Create a new item in the manuscript.
     */
    public function store(Request $request, string $manuscriptId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'nullable|string',
                'content_markdown' => 'nullable|string',
                'content_format' => 'nullable|in:markdown,html',
                'synopsis' => 'nullable|string',
                'type' => 'nullable|string|max:50',
                'parent_id' => 'nullable|integer|exists:items,id',
                'metadata' => 'nullable|array',
            ]);

            // Calculate word and character counts
            $content = $validated['content'] ?? '';
            $plainText = strip_tags($content);
            $validated['word_count'] = str_word_count($plainText);
            $validated['character_count'] = mb_strlen($plainText);

            // Set user_id
            $validated['user_id'] = Auth::id();

            // Create the item
            $item = Item::create($validated);

            // Get the next order_index for the manuscript
            $maxOrder = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->max('order_index') ?? 0;

            // Attach item to manuscript
            ManuscriptItem::create([
                'manuscript_id' => $manuscriptId,
                'item_id' => $item->id,
                'order_index' => $maxOrder + 1,
                'is_independent' => false,
                'metadata' => $validated['metadata'] ?? null,
            ]);

            Log::info("ItemController::store - Created item {$item->id} in manuscript {$manuscriptId}");

            return response()->json([
                'data' => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'content' => $item->content,
                    'content_markdown' => $item->content_markdown,
                    'content_format' => $item->content_format,
                    'word_count' => $item->word_count,
                    'character_count' => $item->character_count,
                    'synopsis' => $item->synopsis,
                    'type' => $item->type,
                    'parent_id' => $item->parent_id,
                    'metadata' => $item->metadata,
                    'manuscript_id' => $manuscriptId,
                    'created_at' => $item->created_at->toISOString(),
                    'updated_at' => $item->updated_at->toISOString(),
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create item', [
                'manuscript_id' => $manuscriptId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to create item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified item.
     */
    public function show(Request $request, string $manuscriptId, string $itemId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Get the item through the manuscript relationship
            $manuscriptItem = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $itemId)
                ->with(['item' => function ($query) {
                    $query->select([
                        'items.id',
                        'items.title',
                        'items.content',
                        'items.content_markdown',
                        'items.content_format',
                        'items.word_count',
                        'items.character_count',
                        'items.synopsis',
                        'items.metadata',
                        'items.updated_at',
                        'items.created_at'
                    ]);
                }])
                ->firstOrFail();

            $item = $manuscriptItem->item;

            return response()->json([
                'data' => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'content' => $item->content,
                    'content_markdown' => $item->content_markdown,
                    'content_format' => $item->content_format,
                    'word_count' => $item->word_count,
                    'character_count' => $item->character_count,
                    'synopsis' => $item->synopsis,
                    'metadata' => $item->metadata,
                    'manuscript_id' => $manuscriptId,
                    'updated_at' => $item->updated_at->toISOString(),
                    'created_at' => $item->created_at->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch item', [
                'manuscript_id' => $manuscriptId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified item.
     */
    public function update(Request $request, string $manuscriptId, string $itemId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Get the item through the manuscript relationship
            $manuscriptItem = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $itemId)
                ->firstOrFail();

            $item = Item::findOrFail($itemId);

            Log::info("ItemController::update - Updating item {$itemId}", $request->all());

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'content' => 'sometimes|string',
                'content_markdown' => 'sometimes|string',
                'content_format' => 'sometimes|in:markdown,html',
                'synopsis' => 'sometimes|nullable|string',
                'metadata' => 'sometimes|array',
            ]);

            // Calculate word and character counts if content is being updated
            if (isset($validated['content']) || isset($validated['content_markdown'])) {
                $content = $validated['content'] ?? $item->content;

                // Strip HTML tags for accurate word count
                $plainText = strip_tags($content);
                $validated['word_count'] = str_word_count($plainText);
                $validated['character_count'] = mb_strlen($plainText);
            }

            $item->update($validated);

            return response()->json([
                'data' => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'content' => $item->content,
                    'content_markdown' => $item->content_markdown,
                    'content_format' => $item->content_format,
                    'word_count' => $item->word_count,
                    'character_count' => $item->character_count,
                    'synopsis' => $item->synopsis,
                    'metadata' => $item->metadata,
                    'manuscript_id' => $manuscriptId,
                    'updated_at' => $item->updated_at->toISOString(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update item', [
                'manuscript_id' => $manuscriptId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to update item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the content history/versions for an item.
     */
    public function versions(string $manuscriptId, string $itemId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Verify the item belongs to the manuscript
            ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $itemId)
                ->firstOrFail();

            $item = Item::findOrFail($itemId);
            $versions = $item->versions()
                ->select(['id', 'name', 'change_description', 'created_at'])
                ->limit(10)
                ->get();

            return response()->json([
                'data' => $versions
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch item versions', [
                'manuscript_id' => $manuscriptId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load versions',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}