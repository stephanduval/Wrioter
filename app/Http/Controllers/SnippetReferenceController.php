<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\SnippetReference;
use App\Services\SnippetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SnippetReferenceController extends Controller
{
    protected SnippetService $snippetService;

    public function __construct(SnippetService $snippetService)
    {
        $this->snippetService = $snippetService;
    }

    /**
     * Add a snippet to a collection.
     */
    public function store(Request $request, string $collectionId)
    {
        try {
            $collection = Item::where('id', $collectionId)
                ->where('user_id', Auth::id())
                ->where('type', 'snippet_collection')
                ->firstOrFail();

            $validated = $request->validate([
                'source_item_id' => 'required|integer|exists:items,id',
                'selected_text' => 'required|string|max:10000',
                'position_data' => 'required|array',
                'position_data.from' => 'required|integer|min:0',
                'position_data.to' => 'required|integer|min:0',
                'anchor_text_before' => 'nullable|string|max:100',
                'anchor_text_after' => 'nullable|string|max:100',
                'metadata' => 'nullable|array',
            ]);

            // Verify source item belongs to the user
            $sourceItem = Item::where('id', $validated['source_item_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $snippet = $this->snippetService->createSnippet(
                $collection,
                $sourceItem,
                $validated['position_data'],
                $validated['selected_text'],
                $validated['anchor_text_before'] ?? null,
                $validated['anchor_text_after'] ?? null
            );

            // Update metadata if provided
            if (isset($validated['metadata'])) {
                $snippet->update(['metadata' => $validated['metadata']]);
            }

            Log::info('Created snippet reference', [
                'snippet_id' => $snippet->id,
                'collection_id' => $collectionId,
                'source_item_id' => $sourceItem->id,
            ]);

            return response()->json([
                'data' => [
                    'id' => $snippet->id,
                    'source_item_id' => $snippet->source_item_id,
                    'source_item_title' => $sourceItem->title,
                    'reference_text' => $snippet->reference_text,
                    'current_text' => $snippet->current_text,
                    'status' => $snippet->status,
                    'order_index' => $snippet->order_index,
                    'position_data' => $snippet->position_data,
                    'metadata' => $snippet->metadata,
                    'created_at' => $snippet->created_at->toISOString(),
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create snippet', [
                'collection_id' => $collectionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to create snippet',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all snippets in a collection.
     */
    public function index(string $collectionId)
    {
        try {
            $collection = Item::where('id', $collectionId)
                ->where('user_id', Auth::id())
                ->where('type', 'snippet_collection')
                ->firstOrFail();

            $snippets = $collection->snippetReferences()
                ->with('sourceItem:id,title,parent_id')
                ->orderBy('order_index')
                ->get();

            return response()->json([
                'data' => $snippets->map(function ($snippet) {
                    return [
                        'id' => $snippet->id,
                        'source_item_id' => $snippet->source_item_id,
                        'source_item_title' => $snippet->sourceItem?->title,
                        'reference_text' => $snippet->reference_text,
                        'current_text' => $snippet->current_text,
                        'status' => $snippet->status,
                        'order_index' => $snippet->order_index,
                        'position_data' => $snippet->position_data,
                        'last_verified_at' => $snippet->last_verified_at?->toISOString(),
                        'became_ghost_at' => $snippet->became_ghost_at?->toISOString(),
                        'metadata' => $snippet->metadata,
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to list snippets', [
                'collection_id' => $collectionId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to list snippets',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a snippet (reorder, metadata).
     */
    public function update(Request $request, string $snippetId)
    {
        try {
            $snippet = SnippetReference::findOrFail($snippetId);

            // Verify the collection belongs to the user
            Item::where('id', $snippet->collection_item_id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $validated = $request->validate([
                'order_index' => 'sometimes|integer|min:0',
                'metadata' => 'sometimes|array',
            ]);

            $snippet->update($validated);

            Log::info('Updated snippet', [
                'snippet_id' => $snippetId,
            ]);

            return response()->json([
                'data' => [
                    'id' => $snippet->id,
                    'order_index' => $snippet->order_index,
                    'metadata' => $snippet->metadata,
                    'updated_at' => $snippet->updated_at->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update snippet', [
                'snippet_id' => $snippetId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to update snippet',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a snippet.
     */
    public function destroy(string $snippetId)
    {
        try {
            $snippet = SnippetReference::findOrFail($snippetId);

            // Verify the collection belongs to the user
            Item::where('id', $snippet->collection_item_id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $snippet->delete();

            Log::info('Deleted snippet', [
                'snippet_id' => $snippetId,
            ]);

            return response()->json([
                'message' => 'Snippet deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete snippet', [
                'snippet_id' => $snippetId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to delete snippet',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify a single snippet's position.
     */
    public function verify(string $snippetId)
    {
        try {
            $snippet = SnippetReference::findOrFail($snippetId);

            // Verify the collection belongs to the user
            Item::where('id', $snippet->collection_item_id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $result = $this->snippetService->verifySnippet($snippet);

            // Reload the snippet to get updated values
            $snippet->refresh();

            Log::info('Verified snippet', [
                'snippet_id' => $snippetId,
                'result' => $result,
            ]);

            return response()->json([
                'data' => [
                    'id' => $snippet->id,
                    'status' => $snippet->status,
                    'reference_text' => $snippet->reference_text,
                    'current_text' => $snippet->current_text,
                    'last_verified_at' => $snippet->last_verified_at?->toISOString(),
                    'verification_result' => $result,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to verify snippet', [
                'snippet_id' => $snippetId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to verify snippet',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reorder snippets within a collection.
     */
    public function reorder(Request $request, string $collectionId)
    {
        try {
            $collection = Item::where('id', $collectionId)
                ->where('user_id', Auth::id())
                ->where('type', 'snippet_collection')
                ->firstOrFail();

            $validated = $request->validate([
                'snippet_ids' => 'required|array|min:1',
                'snippet_ids.*' => 'integer|exists:snippet_references,id',
            ]);

            $this->snippetService->reorderSnippets($collection, $validated['snippet_ids']);

            Log::info('Reordered snippets', [
                'collection_id' => $collectionId,
                'snippet_ids' => $validated['snippet_ids'],
            ]);

            return response()->json([
                'message' => 'Snippets reordered successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to reorder snippets', [
                'collection_id' => $collectionId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to reorder snippets',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
