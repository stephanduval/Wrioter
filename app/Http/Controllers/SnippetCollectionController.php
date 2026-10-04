<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Manuscript;
use App\Models\ManuscriptItem;
use App\Models\SnippetReference;
use App\Services\SnippetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SnippetCollectionController extends Controller
{
    protected SnippetService $snippetService;

    public function __construct(SnippetService $snippetService)
    {
        $this->snippetService = $snippetService;
    }

    /**
     * List all snippet collections for a manuscript.
     */
    public function index(string $manuscriptId)
    {
        try {
            // Verify the manuscript belongs to the user
            Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $collections = $this->snippetService->getCollections((int) $manuscriptId);

            return response()->json([
                'data' => $collections->map(function ($collection) {
                    return [
                        'id' => $collection->id,
                        'title' => $collection->title,
                        'type' => $collection->type,
                        'parent_id' => $collection->parent_id,
                        'snippet_count' => $collection->snippet_references_count ?? 0,
                        'ghost_count' => $collection->ghost_count ?? 0,
                        'created_at' => $collection->created_at->toISOString(),
                        'updated_at' => $collection->updated_at->toISOString(),
                    ];
                }),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to list snippet collections', [
                'manuscript_id' => $manuscriptId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to list snippet collections',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new snippet collection.
     */
    public function store(Request $request, string $manuscriptId)
    {
        try {
            // Verify the manuscript belongs to the user
            Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'parent_id' => 'nullable|integer|exists:items,id',
            ]);

            $collection = $this->snippetService->createCollection(
                (int) $manuscriptId,
                $validated['title'],
                $validated['parent_id'] ?? null
            );

            Log::info('Created snippet collection', [
                'collection_id' => $collection->id,
                'manuscript_id' => $manuscriptId,
            ]);

            return response()->json([
                'data' => [
                    'id' => $collection->id,
                    'title' => $collection->title,
                    'type' => $collection->type,
                    'parent_id' => $collection->parent_id,
                    'snippet_count' => 0,
                    'created_at' => $collection->created_at->toISOString(),
                    'updated_at' => $collection->updated_at->toISOString(),
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create snippet collection', [
                'manuscript_id' => $manuscriptId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to create snippet collection',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a snippet collection with all its snippets.
     */
    public function show(string $collectionId)
    {
        try {
            $collection = Item::where('id', $collectionId)
                ->where('user_id', Auth::id())
                ->where('type', 'snippet_collection')
                ->firstOrFail();

            $data = $this->snippetService->getCollectionWithSnippets($collection);

            return response()->json([
                'data' => [
                    'collection' => [
                        'id' => $collection->id,
                        'title' => $collection->title,
                        'parent_id' => $collection->parent_id,
                        'metadata' => $collection->metadata,
                        'created_at' => $collection->created_at->toISOString(),
                        'updated_at' => $collection->updated_at->toISOString(),
                    ],
                    'snippets' => $data['snippets']->map(function ($snippet) {
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
                    'stats' => $data['stats'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get snippet collection', [
                'collection_id' => $collectionId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to get snippet collection',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update a snippet collection.
     */
    public function update(Request $request, string $collectionId)
    {
        try {
            $collection = Item::where('id', $collectionId)
                ->where('user_id', Auth::id())
                ->where('type', 'snippet_collection')
                ->firstOrFail();

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'parent_id' => 'sometimes|nullable|integer|exists:items,id',
            ]);

            $collection->update($validated);

            Log::info('Updated snippet collection', [
                'collection_id' => $collectionId,
            ]);

            return response()->json([
                'data' => [
                    'id' => $collection->id,
                    'title' => $collection->title,
                    'parent_id' => $collection->parent_id,
                    'updated_at' => $collection->updated_at->toISOString(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update snippet collection', [
                'collection_id' => $collectionId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to update snippet collection',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a snippet collection.
     */
    public function destroy(string $collectionId)
    {
        try {
            $collection = Item::where('id', $collectionId)
                ->where('user_id', Auth::id())
                ->where('type', 'snippet_collection')
                ->firstOrFail();

            $collection->delete();

            Log::info('Deleted snippet collection', [
                'collection_id' => $collectionId,
            ]);

            return response()->json([
                'message' => 'Snippet collection deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete snippet collection', [
                'collection_id' => $collectionId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to delete snippet collection',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify all snippets in a collection.
     */
    public function verifyAll(string $collectionId)
    {
        try {
            $collection = Item::where('id', $collectionId)
                ->where('user_id', Auth::id())
                ->where('type', 'snippet_collection')
                ->firstOrFail();

            $results = $this->snippetService->verifyCollection($collection);

            Log::info('Verified snippet collection', [
                'collection_id' => $collectionId,
                'results' => $results,
            ]);

            return response()->json([
                'data' => $results,
                'message' => 'Verification complete',
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to verify snippet collection', [
                'collection_id' => $collectionId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to verify snippet collection',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear all ghost snippets from a collection.
     */
    public function clearGhosts(string $collectionId)
    {
        try {
            $collection = Item::where('id', $collectionId)
                ->where('user_id', Auth::id())
                ->where('type', 'snippet_collection')
                ->firstOrFail();

            $cleared = $this->snippetService->clearGhosts($collection);

            Log::info('Cleared ghost snippets', [
                'collection_id' => $collectionId,
                'cleared_count' => $cleared,
            ]);

            return response()->json([
                'data' => [
                    'cleared' => $cleared,
                ],
                'message' => "Cleared {$cleared} ghost snippets",
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to clear ghost snippets', [
                'collection_id' => $collectionId,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Failed to clear ghost snippets',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Duplicate a snippet collection with all its snippet references.
     */
    public function duplicate(string $manuscriptId, string $collectionId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Get the original collection
            $originalCollection = Item::where('id', $collectionId)
                ->where('user_id', Auth::id())
                ->where('type', 'snippet_collection')
                ->firstOrFail();

            // Get the manuscript item for order_index
            $originalManuscriptItem = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $collectionId)
                ->firstOrFail();

            // Replicate the collection item
            $duplicateCollection = $originalCollection->replicate();
            $duplicateCollection->title = $originalCollection->title . ' (Copy)';
            $duplicateCollection->save();

            // Attach duplicate to manuscript with next order_index
            ManuscriptItem::create([
                'manuscript_id' => $manuscriptId,
                'item_id' => $duplicateCollection->id,
                'order_index' => $originalManuscriptItem->order_index + 1,
                'is_independent' => $originalManuscriptItem->is_independent,
                'metadata' => $originalManuscriptItem->metadata,
            ]);

            // Reorder subsequent items
            ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('order_index', '>', $originalManuscriptItem->order_index)
                ->where('item_id', '!=', $duplicateCollection->id)
                ->increment('order_index');

            // Copy all snippet references to the new collection
            $originalSnippets = SnippetReference::where('collection_item_id', $collectionId)->get();
            foreach ($originalSnippets as $snippet) {
                $newSnippet = $snippet->replicate();
                $newSnippet->collection_item_id = $duplicateCollection->id;
                $newSnippet->save();
            }

            Log::info('Duplicated snippet collection', [
                'original_id' => $collectionId,
                'duplicate_id' => $duplicateCollection->id,
                'manuscript_id' => $manuscriptId,
                'snippets_copied' => $originalSnippets->count(),
            ]);

            return response()->json([
                'data' => [
                    'id' => $duplicateCollection->id,
                    'title' => $duplicateCollection->title,
                    'type' => $duplicateCollection->type,
                    'parent_id' => $duplicateCollection->parent_id,
                    'snippet_count' => $originalSnippets->count(),
                    'ghost_count' => $originalSnippets->where('status', 'ghost')->count(),
                    'created_at' => $duplicateCollection->created_at->toISOString(),
                    'updated_at' => $duplicateCollection->updated_at->toISOString(),
                ],
                'message' => 'Snippet collection duplicated successfully',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to duplicate snippet collection', [
                'manuscript_id' => $manuscriptId,
                'collection_id' => $collectionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Failed to duplicate snippet collection',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
