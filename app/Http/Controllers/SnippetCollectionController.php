<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Manuscript;
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
}
