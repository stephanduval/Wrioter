<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Manuscript;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CorkboardController extends Controller
{
    /**
     * Get corkboard for a manuscript.
     */
    public function show($manuscriptId): JsonResponse
    {
        $manuscript = Manuscript::where('user_id', Auth::id())->findOrFail($manuscriptId);

        // Get all items in this manuscript (corkboard cards are just items)
        $cards = Item::where('manuscript_id', $manuscriptId)
            ->where('user_id', Auth::id())
            ->orderBy('item_order', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => (string)$item->id,
                    'itemId' => $item->id,
                    'title' => $item->title,
                    'synopsis' => $item->synopsis,
                    'content' => $item->content,
                    'status' => $item->metadata?->status ?? 'draft',
                    'labels' => $item->metadata?->labels ?? [],
                    'wordCount' => str_word_count($item->content ?? ''),
                    'characterCount' => strlen($item->content ?? ''),
                    'order' => $item->item_order ?? 0,
                    'includeInCompile' => $item->include_in_compile ?? true,
                    'createdAt' => $item->created_at?->toIso8601String(),
                    'updatedAt' => $item->updated_at?->toIso8601String(),
                    'metadata' => $item->metadata,
                ];
            });

        return response()->json([
            'corkboard' => [
                'id' => $manuscript->id,
                'title' => $manuscript->title,
                'manuscript_id' => $manuscript->id,
            ],
            'cards' => $cards,
            'settings' => null,
            'cardPositions' => null,
        ]);
    }

    /**
     * Create a card in the corkboard (creates an item in the manuscript).
     */
    public function createCard(Request $request, $manuscriptId): JsonResponse
    {
        $manuscript = Manuscript::where('user_id', Auth::id())->findOrFail($manuscriptId);

        $validated = $request->validate([
            'title' => 'required|string|max:191',
            'synopsis' => 'nullable|string',
            'content' => 'nullable|string',
            'status' => 'nullable|in:todo,draft,review,done',
            'labels' => 'nullable|array',
            'parent_id' => 'nullable|integer|exists:items,id',
            'metadata' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            // Determine project_id - use parent's project if parent exists, otherwise use manuscript's default project
            $projectId = null;
            if (!empty($validated['parent_id'])) {
                $parentItem = Item::where('user_id', Auth::id())->find($validated['parent_id']);
                if ($parentItem) {
                    $projectId = $parentItem->project_id;
                }
            } else {
                // If no parent specified, use the manuscript's first project
                $projectId = $manuscript->projects()->first()?->id;
            }

            // Create the item
            $item = Item::create([
                'user_id' => Auth::id(),
                'manuscript_id' => $manuscriptId,
                'project_id' => $projectId,
                'type' => 'text',
                'title' => $validated['title'],
                'synopsis' => $validated['synopsis'] ?? null,
                'content' => $validated['content'] ?? null,
                'parent_id' => $validated['parent_id'] ?? null,
                'include_in_compile' => true,
                'metadata' => array_merge(
                    $validated['metadata'] ?? [],
                    ['status' => $validated['status'] ?? 'draft', 'labels' => $validated['labels'] ?? []]
                ),
            ]);

            DB::commit();

            // Return as corkboard card format
            return response()->json([
                'id' => (string)$item->id,
                'itemId' => $item->id,
                'title' => $item->title,
                'synopsis' => $item->synopsis,
                'content' => $item->content,
                'status' => $validated['status'] ?? 'draft',
                'labels' => $validated['labels'] ?? [],
                'wordCount' => str_word_count($item->content ?? ''),
                'characterCount' => strlen($item->content ?? ''),
                'order' => 0,
                'includeInCompile' => true,
                'createdAt' => $item->created_at?->toIso8601String(),
                'updatedAt' => $item->updated_at?->toIso8601String(),
                'metadata' => $item->metadata,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create corkboard card: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'manuscript_id' => $manuscriptId,
            ]);
            return response()->json([
                'error' => 'Failed to create card',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a card.
     */
    public function updateCard(Request $request, $manuscriptId, $cardId): JsonResponse
    {
        $manuscript = Manuscript::where('user_id', Auth::id())->findOrFail($manuscriptId);
        $item = Item::where('user_id', Auth::id())
            ->where('manuscript_id', $manuscriptId)
            ->findOrFail($cardId);

        $validated = $request->validate([
            'title' => 'nullable|string|max:191',
            'synopsis' => 'nullable|string',
            'content' => 'nullable|string',
            'status' => 'nullable|in:todo,draft,review,done',
            'labels' => 'nullable|array',
            'order' => 'nullable|integer',
            'include_in_compile' => 'nullable|boolean',
            'metadata' => 'nullable|array',
        ]);

        try {
            $updateData = array_filter($validated, function ($value) {
                return $value !== null;
            });

            // Handle metadata specially
            if (isset($validated['status']) || isset($validated['labels'])) {
                $metadata = $item->metadata ?? [];
                if (isset($validated['status'])) {
                    $metadata['status'] = $validated['status'];
                }
                if (isset($validated['labels'])) {
                    $metadata['labels'] = $validated['labels'];
                }
                $updateData['metadata'] = $metadata;
            }

            $item->update($updateData);

            return response()->json([
                'id' => (string)$item->id,
                'itemId' => $item->id,
                'title' => $item->title,
                'synopsis' => $item->synopsis,
                'content' => $item->content,
                'status' => $item->metadata?->status ?? 'draft',
                'labels' => $item->metadata?->labels ?? [],
                'wordCount' => str_word_count($item->content ?? ''),
                'characterCount' => strlen($item->content ?? ''),
                'order' => $item->item_order ?? 0,
                'includeInCompile' => $item->include_in_compile ?? true,
                'createdAt' => $item->created_at?->toIso8601String(),
                'updatedAt' => $item->updated_at?->toIso8601String(),
                'metadata' => $item->metadata,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to update corkboard card: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to update card',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a card.
     */
    public function deleteCard($manuscriptId, $cardId): JsonResponse
    {
        $manuscript = Manuscript::where('user_id', Auth::id())->findOrFail($manuscriptId);
        $item = Item::where('user_id', Auth::id())
            ->where('manuscript_id', $manuscriptId)
            ->findOrFail($cardId);

        try {
            $item->delete();
            return response()->json(['message' => 'Card deleted successfully']);
        } catch (\Exception $e) {
            \Log::error('Failed to delete corkboard card: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to delete card',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reorder cards.
     */
    public function reorderCards(Request $request, $manuscriptId): JsonResponse
    {
        $manuscript = Manuscript::where('user_id', Auth::id())->findOrFail($manuscriptId);

        $validated = $request->validate([
            'orders' => 'required|array',
            'orders.*.id' => 'required|integer',
            'orders.*.order' => 'required|integer',
        ]);

        try {
            DB::transaction(function () use ($validated, $manuscriptId) {
                foreach ($validated['orders'] as $order) {
                    Item::where('user_id', Auth::id())
                        ->where('manuscript_id', $manuscriptId)
                        ->where('id', $order['id'])
                        ->update(['item_order' => $order['order']]);
                }
            });

            return response()->json(['message' => 'Cards reordered successfully']);
        } catch (\Exception $e) {
            \Log::error('Failed to reorder cards: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to reorder cards',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
