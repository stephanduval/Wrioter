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

    /**
     * Reorder items within a manuscript or move items between folders.
     */
    public function reorder(Request $request, string $manuscriptId)
    {
        Log::info("Reorder called", [
            'manuscript_id' => $manuscriptId,
            'request_data' => $request->all(),
            'user_id' => Auth::id(),
        ]);

        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $validated = $request->validate([
                'source_item_id' => 'required|integer|exists:items,id',
                'target_item_id' => 'required|integer|exists:items,id',
                'position' => 'required|in:above,below,inside',
            ]);

            $sourceItem = Item::findOrFail($validated['source_item_id']);
            $targetItem = Item::findOrFail($validated['target_item_id']);

            Log::info("Reorder debug - items found", [
                'source_item_id' => $sourceItem->id,
                'source_user_id' => $sourceItem->user_id,
                'target_item_id' => $targetItem->id,
                'target_user_id' => $targetItem->user_id,
                'auth_user_id' => Auth::id(),
            ]);

            // Verify both items belong to the manuscript
            $sourceManuscriptItem = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $sourceItem->id)
                ->first();
            $targetManuscriptItem = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $targetItem->id)
                ->first();

            Log::info("Reorder debug - manuscript items", [
                'source_in_manuscript' => $sourceManuscriptItem ? true : false,
                'target_in_manuscript' => $targetManuscriptItem ? true : false,
            ]);

            if (!$sourceManuscriptItem) {
                throw new \Exception("Source item {$sourceItem->id} not found in manuscript {$manuscriptId}");
            }
            if (!$targetManuscriptItem) {
                throw new \Exception("Target item {$targetItem->id} not found in manuscript {$manuscriptId}");
            }

            Log::info("Reordering item", [
                'manuscript_id' => $manuscriptId,
                'source_item_id' => $sourceItem->id,
                'target_item_id' => $targetItem->id,
                'position' => $validated['position'],
            ]);

            // Handle reordering based on position
            switch ($validated['position']) {
                case 'inside':
                    // Move source item inside target (target must be a folder)
                    $sourceItem->parent_id = $targetItem->id;
                    $sourceItem->save();

                    // Set item_order to be at the end of target's children
                    $maxOrder = Item::where('parent_id', $targetItem->id)
                        ->max('item_order') ?? 0;
                    $sourceItem->item_order = $maxOrder + 1;
                    $sourceItem->save();
                    break;

                case 'above':
                case 'below':
                    // Move source item to same parent as target
                    $sourceItem->parent_id = $targetItem->parent_id;
                    $sourceItem->save();

                    // Get all siblings (items with same parent) ordered by item_order
                    $siblings = Item::where('parent_id', $targetItem->parent_id)
                        ->where('id', '!=', $sourceItem->id)
                        ->orderBy('item_order', 'asc')
                        ->get();

                    // Find target's position in siblings
                    $newOrder = [];
                    $insertPosition = $validated['position'] === 'above' ? 0 : 1;

                    foreach ($siblings as $index => $sibling) {
                        if ($sibling->id === $targetItem->id) {
                            // Insert source at the correct position relative to target
                            if ($insertPosition === 0) {
                                $newOrder[] = $sourceItem;
                                $newOrder[] = $sibling;
                            } else {
                                $newOrder[] = $sibling;
                                $newOrder[] = $sourceItem;
                            }
                        } else {
                            $newOrder[] = $sibling;
                        }
                    }

                    // Update item_order for all affected items
                    foreach ($newOrder as $index => $item) {
                        $item->item_order = $index;
                        $item->save();
                    }
                    break;
            }

            Log::info("Item reordered successfully", [
                'manuscript_id' => $manuscriptId,
                'source_item_id' => $sourceItem->id,
                'new_parent_id' => $sourceItem->parent_id,
                'new_order' => $sourceItem->item_order,
            ]);

            return response()->json([
                'message' => 'Item reordered successfully',
                'data' => [
                    'source_item' => [
                        'id' => $sourceItem->id,
                        'parent_id' => $sourceItem->parent_id,
                        'item_order' => $sourceItem->item_order,
                    ],
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to reorder item', [
                'manuscript_id' => $manuscriptId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to reorder item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Batch reorder multiple items in a manuscript.
     * Moves multiple items to a new location while preserving their relative order.
     */
    public function batchReorder(Request $request, string $manuscriptId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $validated = $request->validate([
                'source_item_ids' => 'required|array|min:1',
                'source_item_ids.*' => 'integer|exists:items,id',
                'target_item_id' => 'required|integer|exists:items,id',
                'position' => 'required|in:above,below,inside',
            ]);

            $sourceItemIds = $validated['source_item_ids'];
            $targetItem = Item::findOrFail($validated['target_item_id']);

            // Verify all source items belong to the manuscript
            foreach ($sourceItemIds as $sourceId) {
                ManuscriptItem::where('manuscript_id', $manuscriptId)
                    ->where('item_id', $sourceId)
                    ->firstOrFail();
            }

            // Verify target item belongs to the manuscript
            ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $targetItem->id)
                ->firstOrFail();

            Log::info("Batch reordering items", [
                'manuscript_id' => $manuscriptId,
                'source_item_ids' => $sourceItemIds,
                'target_item_id' => $targetItem->id,
                'position' => $validated['position'],
            ]);

            DB::beginTransaction();

            // Determine new parent_id based on position
            $newParentId = $validated['position'] === 'inside'
                ? $targetItem->id
                : $targetItem->parent_id;

            // Get the source items in their current order
            $sourceItems = Item::whereIn('id', $sourceItemIds)
                ->orderBy('item_order', 'asc')
                ->get();

            // Calculate the base order for insertion
            $baseOrder = 0;
            if ($validated['position'] === 'inside') {
                // Place at the end of target's children
                $maxOrder = Item::where('parent_id', $targetItem->id)
                    ->max('item_order') ?? -1;
                $baseOrder = $maxOrder + 1;
            } else {
                // Get all siblings (excluding source items)
                $siblings = Item::where('parent_id', $newParentId)
                    ->whereNotIn('id', $sourceItemIds)
                    ->orderBy('item_order', 'asc')
                    ->get();

                // Find target's position in siblings and calculate insert position
                $targetIndex = $siblings->search(function ($item) use ($targetItem) {
                    return $item->id === $targetItem->id;
                });

                if ($targetIndex === false) {
                    // Target might be one of the source items, handle edge case
                    $targetIndex = 0;
                }

                // Insert above or below target
                $insertIndex = $validated['position'] === 'above' ? $targetIndex : $targetIndex + 1;

                // Rebuild the order: items before insert, source items, items after insert
                $newOrder = [];
                $orderIndex = 0;

                foreach ($siblings as $index => $sibling) {
                    if ($index === $insertIndex) {
                        // Insert source items here
                        foreach ($sourceItems as $sourceItem) {
                            $sourceItem->parent_id = $newParentId;
                            $sourceItem->item_order = $orderIndex++;
                            $sourceItem->save();
                        }
                    }
                    $sibling->item_order = $orderIndex++;
                    $sibling->save();
                }

                // If insert position is at the end
                if ($insertIndex >= $siblings->count()) {
                    foreach ($sourceItems as $sourceItem) {
                        $sourceItem->parent_id = $newParentId;
                        $sourceItem->item_order = $orderIndex++;
                        $sourceItem->save();
                    }
                }

                DB::commit();

                Log::info("Batch reorder completed successfully", [
                    'manuscript_id' => $manuscriptId,
                    'items_moved' => count($sourceItemIds),
                    'new_parent_id' => $newParentId,
                ]);

                return response()->json([
                    'message' => 'Items reordered successfully',
                    'data' => [
                        'items_moved' => count($sourceItemIds),
                        'new_parent_id' => $newParentId,
                    ]
                ]);
            }

            // Handle 'inside' position - move items into the target folder
            foreach ($sourceItems as $index => $sourceItem) {
                $sourceItem->parent_id = $newParentId;
                $sourceItem->item_order = $baseOrder + $index;
                $sourceItem->save();
            }

            DB::commit();

            Log::info("Batch reorder completed successfully", [
                'manuscript_id' => $manuscriptId,
                'items_moved' => count($sourceItemIds),
                'new_parent_id' => $newParentId,
            ]);

            return response()->json([
                'message' => 'Items reordered successfully',
                'data' => [
                    'items_moved' => count($sourceItemIds),
                    'new_parent_id' => $newParentId,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to batch reorder items', [
                'manuscript_id' => $manuscriptId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to reorder items',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an item from the manuscript.
     */
    public function destroy(string $manuscriptId, string $itemId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            Log::info("ItemController::destroy - Deleting item {$itemId} from manuscript {$manuscriptId}");

            $item = Item::where('id', $itemId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Delete the manuscript-item relationship
            ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $itemId)
                ->delete();

            // Delete the item itself
            $item->delete();

            Log::info("Item {$itemId} deleted successfully from manuscript {$manuscriptId}");

            return response()->json(['message' => 'Item deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete item', [
                'manuscript_id' => $manuscriptId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to delete item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rename an item (update its title).
     */
    public function rename(Request $request, string $manuscriptId, string $itemId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $validated = $request->validate([
                'title' => 'required|string|max:255',
            ]);

            Log::info("ItemController::rename - Renaming item {$itemId} in manuscript {$manuscriptId} to '{$validated['title']}'");

            $item = Item::where('id', $itemId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $item->update(['title' => $validated['title']]);

            Log::info("Item {$itemId} renamed successfully to '{$validated['title']}'");

            return response()->json([
                'data' => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'updated_at' => $item->updated_at->toISOString(),
                ],
                'message' => 'Item renamed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to rename item', [
                'manuscript_id' => $manuscriptId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to rename item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Duplicate an item with all its properties and children.
     */
    public function duplicate(string $manuscriptId, string $itemId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Get the original item
            $originalItem = Item::where('id', $itemId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Get the manuscript item for order_index
            $originalManuscriptItem = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $itemId)
                ->firstOrFail();

            Log::info("ItemController::duplicate - Duplicating item {$itemId} in manuscript {$manuscriptId}");

            // Create duplicate item
            $duplicateItem = $originalItem->replicate();
            $duplicateItem->title = $originalItem->title . ' (Copy)';
            $duplicateItem->save();

            // Attach duplicate to manuscript with next order_index
            ManuscriptItem::create([
                'manuscript_id' => $manuscriptId,
                'item_id' => $duplicateItem->id,
                'order_index' => $originalManuscriptItem->order_index + 1,
                'is_independent' => $originalManuscriptItem->is_independent,
                'metadata' => $originalManuscriptItem->metadata,
            ]);

            // Reorder subsequent items
            ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('order_index', '>', $originalManuscriptItem->order_index)
                ->where('item_id', '!=', $duplicateItem->id)
                ->increment('order_index');

            Log::info("Item {$itemId} duplicated successfully as item {$duplicateItem->id}");

            return response()->json([
                'data' => [
                    'id' => $duplicateItem->id,
                    'title' => $duplicateItem->title,
                    'type' => $duplicateItem->type,
                    'parent_id' => $duplicateItem->parent_id,
                    'order_index' => $originalManuscriptItem->order_index + 1,
                    'created_at' => $duplicateItem->created_at->toISOString(),
                    'updated_at' => $duplicateItem->updated_at->toISOString(),
                ],
                'message' => 'Item duplicated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to duplicate item', [
                'manuscript_id' => $manuscriptId,
                'item_id' => $itemId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to duplicate item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Move an item up in the order.
     */
    public function moveUp(string $manuscriptId, string $itemId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Get the manuscript item
            $manuscriptItem = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $itemId)
                ->firstOrFail();

            $currentOrder = $manuscriptItem->order_index;

            // Get the item above (lower order_index)
            $itemAbove = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('order_index', '<', $currentOrder)
                ->orderBy('order_index', 'desc')
                ->first();

            if (!$itemAbove) {
                return response()->json([
                    'message' => 'Item is already at the top'
                ], 400);
            }

            Log::info("ItemController::moveUp - Moving item {$itemId} up in manuscript {$manuscriptId}");

            // Swap order_index values
            $itemAboveOrder = $itemAbove->order_index;
            $itemAbove->order_index = $currentOrder;
            $manuscriptItem->order_index = $itemAboveOrder;

            $itemAbove->save();
            $manuscriptItem->save();

            Log::info("Item {$itemId} moved up successfully");

            return response()->json([
                'data' => [
                    'id' => $itemId,
                    'order_index' => $manuscriptItem->order_index,
                ],
                'message' => 'Item moved up successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to move item up', [
                'manuscript_id' => $manuscriptId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to move item up',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Move an item down in the order.
     */
    public function moveDown(string $manuscriptId, string $itemId)
    {
        try {
            // Verify the manuscript belongs to the user
            $manuscript = Manuscript::where('id', $manuscriptId)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            // Get the manuscript item
            $manuscriptItem = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('item_id', $itemId)
                ->firstOrFail();

            $currentOrder = $manuscriptItem->order_index;

            // Get the item below (higher order_index)
            $itemBelow = ManuscriptItem::where('manuscript_id', $manuscriptId)
                ->where('order_index', '>', $currentOrder)
                ->orderBy('order_index', 'asc')
                ->first();

            if (!$itemBelow) {
                return response()->json([
                    'message' => 'Item is already at the bottom'
                ], 400);
            }

            Log::info("ItemController::moveDown - Moving item {$itemId} down in manuscript {$manuscriptId}");

            // Swap order_index values
            $itemBelowOrder = $itemBelow->order_index;
            $itemBelow->order_index = $currentOrder;
            $manuscriptItem->order_index = $itemBelowOrder;

            $itemBelow->save();
            $manuscriptItem->save();

            Log::info("Item {$itemId} moved down successfully");

            return response()->json([
                'data' => [
                    'id' => $itemId,
                    'order_index' => $manuscriptItem->order_index,
                ],
                'message' => 'Item moved down successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to move item down', [
                'manuscript_id' => $manuscriptId,
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to move item down',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}