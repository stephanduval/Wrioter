<?php

namespace App\Http\Controllers;

use App\Models\Manuscript;
use App\Models\ManuscriptCollection;
use App\Models\ManuscriptItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ManuscriptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        Log::info("Fetching manuscripts for user {$userId}");

        $query = Manuscript::where('user_id', $userId);

        // Load items if requested
        if ($request->has('with') && $request->with === 'items') {
            $query->with(['items' => function ($query) {
                $query->select('items.id', 'items.title', 'items.type')
                    ->withPivot('order_index');
            }]);
        }

        $manuscripts = $query->get();

        Log::info("Found {" . $manuscripts->count() . "} manuscripts for user {$userId}");

        return response()->json([
            'data' => $manuscripts,
            'meta' => [
                'total' => $manuscripts->count(),
                'user_id' => $userId
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('ManuscriptController::store - Creating new manuscript', $request->all());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:draft,in_progress,completed',
        ]);

        $manuscript = Manuscript::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
        ]);

        return response()->json([
            'data' => $manuscript
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $manuscript = Manuscript::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return response()->json([
            'data' => $manuscript
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        Log::info("ManuscriptController::update - Updating manuscript {$id}", $request->all());

        $manuscript = Manuscript::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:draft,in_progress,completed',
        ]);

        $manuscript->update($validated);

        return response()->json([
            'data' => $manuscript
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Log::info("ManuscriptController::destroy - Deleting manuscript {$id}");

        $manuscript = Manuscript::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $manuscript->delete();

        return response()->json(['message' => 'Manuscript deleted successfully']);
    }

    /**
     * Get collections for a specific manuscript.
     */
    public function collections(string $id)
    {
        $manuscript = Manuscript::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $collections = ManuscriptCollection::where('manuscript_id', $id)
            ->ordered()
            ->get();

        return response()->json([
            'data' => $collections
        ]);
    }

    /**
     * Get items for a specific manuscript - enhanced for navigation.
     */
    public function items(Request $request, string $id)
    {
        try {
            // Ensure the manuscript belongs to the authenticated user
            $manuscript = Manuscript::where('id', $id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            Log::info("Fetching items for manuscript navigation: {$id}");

            // Fetch all items at once for efficient tree building
            $items = ManuscriptItem::where('manuscript_id', $id)
                ->with([
                    'item' => function ($query) {
                        $query->select([
                            'items.id',
                            'items.parent_id',
                            'items.title',
                            'items.type',
                            'items.word_count',
                            'items.character_count',
                            'items.synopsis',
                            'items.metadata',
                            'items.include_in_compile',
                            'items.updated_at'
                        ])
                        ->withCount(['comments' => function ($query) {
                            $query->where('status', 'active');
                        }]);
                    }
                ])
                ->orderBy('order_index')
                ->get()
                ->map(function ($manuscriptItem) {
                    $item = $manuscriptItem->item;

                    if ($item) {
                        // Transform for navigation
                        return [
                            'id' => $item->id,
                            'parent_id' => $item->parent_id,
                            'title' => $item->title,
                            'type' => $item->type,
                            'word_count' => $item->word_count,
                            'character_count' => $item->character_count,
                            'item_order' => $manuscriptItem->order_index,
                            'synopsis' => $item->synopsis,
                            'metadata' => $item->metadata,
                            'include_in_compile' => $item->include_in_compile,
                            'updated_at' => $item->updated_at->toISOString(),
                            'has_comments' => $item->comments_count > 0,
                            'comment_count' => $item->comments_count,
                        ];
                    }

                    return null;
                })
                ->filter(); // Remove null items

            return response()->json([
                'data' => $items->values(),
                'meta' => [
                    'total_items' => $items->count(),
                    'total_words' => $items->sum('word_count'),
                    'last_modified' => $items->max('updated_at')
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch manuscript items for navigation', [
                'manuscript_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load manuscript structure',
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 
