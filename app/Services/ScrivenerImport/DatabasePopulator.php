<?php

namespace App\Services\ScrivenerImport;

use App\Models\Manuscript;
use App\Models\ManuscriptItem;
use App\Models\ManuscriptCollection;
use App\Models\WritingHistory;
use App\Models\Item;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use RuntimeException;

class DatabasePopulator
{
    /**
     * Populate database with transformed data
     *
     * @param array $manuscriptData Transformed manuscript data
     * @param array $itemsData Transformed items data
     * @param array $collectionsData Transformed collections data
     * @param array $writingHistoryData Transformed writing history data
     * @return array Import results
     * @throws RuntimeException
     */
    public function populate(
        array $manuscriptData,
        array $itemsData,
        array $collectionsData,
        array $writingHistoryData
    ): array {
        try {
            // Validate data before proceeding
            $this->validate($manuscriptData, $itemsData, $collectionsData, $writingHistoryData);
            DB::beginTransaction();

            // Create manuscript
            $manuscript = $this->createManuscript($manuscriptData);

            // Create items
            $items = $this->createItems($manuscript->id, $itemsData);

            // Create collections
            $collections = $this->createCollections($manuscript->id, $collectionsData);

            // Inject manuscript_id into each writing history record
            foreach ($writingHistoryData as &$history) {
                $history['manuscript_id'] = $manuscript->id;
            }
            unset($history);

            // Create writing history
            $writingHistory = $this->createWritingHistory($writingHistoryData);

            // Update collection item references
            $this->updateCollectionItems($collections, $items);

            DB::commit();

            return [
                'manuscript' => $manuscript,
                'items_count' => count($items),
                'collections_count' => count($collections),
                'writing_history_count' => count($writingHistory),
            ];
        } catch (QueryException $e) {
            DB::rollBack();
            Log::error('Database population failed', [
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings(),
            ]);
            throw new RuntimeException('Failed to populate database: ' . $e->getMessage());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Database population failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw new RuntimeException('Failed to populate database: ' . $e->getMessage());
        }
    }

    /**
     * Create manuscript record
     *
     * @param array $data Manuscript data
     * @return Manuscript Created manuscript
     */
    private function createManuscript(array $data): Manuscript
    {
        // Generate unique scrivener_uuid if duplicate exists
        if (isset($data['scrivener_uuid']) && isset($data['user_id'])) {
            $originalUuid = $data['scrivener_uuid'];
            $counter = 1;
            
            // Keep checking until we find a unique UUID
            while (Manuscript::where('scrivener_uuid', $data['scrivener_uuid'])
                    ->where('user_id', $data['user_id'])
                    ->exists()) {
                
                $data['scrivener_uuid'] = $originalUuid . '-copy-' . $counter;
                $counter++;
                
                // Also update the title to indicate it's a copy
                if (!str_contains($data['title'], '(Copy')) {
                    $data['title'] = $data['title'] . ' (Copy ' . $counter . ')';
                } else {
                    // Replace existing copy number
                    $data['title'] = preg_replace('/\(Copy \d+\)$/', '(Copy ' . $counter . ')', $data['title']);
                }
            }
            
            if ($counter > 1) {
                Log::info('Generated unique UUID for duplicate manuscript', [
                    'original_uuid' => $originalUuid,
                    'new_uuid' => $data['scrivener_uuid'],
                    'title' => $data['title'],
                    'copy_number' => $counter,
                ]);
            }
        }

        $manuscript = Manuscript::create($data);

        Log::info('Created manuscript', [
            'id' => $manuscript->id,
            'title' => $manuscript->title,
            'scrivener_uuid' => $manuscript->scrivener_uuid,
        ]);

        return $manuscript;
    }

    /**
     * Create items records
     *
     * @param int $manuscriptId Manuscript ID
     * @param array $itemsData Items data
     * @return array Created items
     */
    private function createItems(int $manuscriptId, array $itemsData): array
    {
        // Ensure every item has a user_id key (even if null)
        foreach ($itemsData as &$itemData) {
            if (!array_key_exists('user_id', $itemData)) {
                $itemData['user_id'] = null;
            }
        }
        unset($itemData);

        Log::debug('Starting createItems', [
            'itemsData_count' => count($itemsData),
            'first_item_sample' => !empty($itemsData) ? array_slice($itemsData[0], 0, 5) : null
        ]);
        
        $items = [];
        $itemVersions = [];
        $manuscriptItems = [];

        // First pass: Create Item records and their versions
        foreach ($itemsData as $index => $itemData) {
            Log::debug('Processing item', [
                'index' => $index,
                'uuid' => $itemData['scrivener_uuid'] ?? 'missing',
                'parent_relationships_count' => count($itemData['parent_relationships'] ?? [])
            ]);
            
            // Prepare content fields to handle size limits
            $content = $itemData['content'] ?? '';
            $rawContent = $itemData['raw_content'] ?? '';
            $contentMarkdown = $itemData['content_markdown'] ?? '';
            
            // If content is too large for TEXT field (64KB), truncate it and ensure we have it in raw_content
            if (strlen($content) > 65000) {
                if (empty($rawContent)) {
                    $rawContent = $content; // Store full content in raw_content
                }
                $content = substr($content, 0, 65000) . '... [Content truncated - view full content in raw_content field]';
            }
            
            // Generate unique scrivener_uuid if duplicate exists
            $originalUuid = $itemData['scrivener_uuid'];
            $originalTitle = $itemData['title'];
            $counter = 1;
            
            // Keep checking until we find a unique UUID
            while (Item::where('scrivener_uuid', $itemData['scrivener_uuid'])->exists()) {
                $itemData['scrivener_uuid'] = $originalUuid . '-copy-' . $counter;
                $counter++;
                
                // Also update the title to indicate it's a copy
                if (!str_contains($itemData['title'], '(Copy')) {
                    $itemData['title'] = $originalTitle . ' (Copy ' . $counter . ')';
                } else {
                    // Replace existing copy number
                    $itemData['title'] = preg_replace('/\(Copy \d+\)$/', '(Copy ' . $counter . ')', $originalTitle);
                }
            }
            
            if ($counter > 1) {
                Log::debug('Generated unique UUID for duplicate item', [
                    'original_uuid' => $originalUuid,
                    'new_uuid' => $itemData['scrivener_uuid'],
                    'original_title' => $originalTitle,
                    'new_title' => $itemData['title'],
                    'copy_number' => $counter,
                ]);
            }

            // Create the item
            $item = Item::create([
                'user_id' => $itemData['user_id'],
                'type' => $itemData['type'],
                'title' => $itemData['title'],
                'content' => $content,
                'synopsis' => $itemData['synopsis'],
                'item_order' => $itemData['item_order'],
                'metadata' => $itemData['metadata'],
                'scrivener_uuid' => $itemData['scrivener_uuid'],
                'folder_type' => $itemData['folder_type'],
                'icon_name' => $itemData['icon_name'],
                'format_metadata' => $itemData['format_metadata'],
                'content_markdown' => $contentMarkdown,
                'raw_content' => $rawContent,
                'content_format' => $itemData['content_format'],
                'word_count' => $itemData['word_count'],
                'character_count' => $itemData['character_count'],
                'created_at' => $itemData['created_at'],
                'updated_at' => $itemData['updated_at'],
            ]);

            // Create a version for the item
            $version = $item->versions()->create([
                'user_id' => $itemData['user_id'],
                'content' => $itemData['content'],
                'synopsis' => $itemData['synopsis'],
                'metadata' => $itemData['metadata'],
                'version_number' => 1,
                'is_forked' => false,
            ]);

            Log::debug('Created item and version', [
                'item_id' => $item->id,
                'version_id' => $version->id
            ]);

            // Store the item and version for later use
            $items[$item->scrivener_uuid] = $item;
            $itemVersions[$item->scrivener_uuid] = $version;

            // Store manuscript item data for later attachment
            $manuscriptItems[$item->scrivener_uuid] = [
                'item' => $item,
                'version' => $version,
                'parent_relationships' => $itemData['parent_relationships'] ?? [],
            ];
        }

        // Log counts after creation
        Log::debug('Item creation completed', [
            'total_items_created' => count($items),
            'total_versions_created' => count($itemVersions)
        ]);

        // Second pass: Update parent relationships and attach to manuscript
        Log::debug('Starting parent relationships update and manuscript attachment');
        $manuscript = Manuscript::find($manuscriptId);
        $attachedCount = 0;
        $parentUpdateCount = 0;

        foreach ($manuscriptItems as $uuid => $data) {
            $item = $data['item'];
            $version = $data['version'];
            $relationships = $data['parent_relationships'];

            // Determine the primary parent relationship (first one) and its order
            $primaryParent = null;
            $primaryOrder = 0;
            $allParents = [];

            if (!empty($relationships)) {
                $primaryParent = $relationships[0];
                $primaryOrder = $primaryParent['order'];
                
                // Collect all parent relationships for metadata
                foreach ($relationships as $relationship) {
                    if (isset($items[$relationship['parent_uuid']])) {
                        $parent = $items[$relationship['parent_uuid']];
                        $allParents[] = [
                            'id' => $parent->id,
                            'uuid' => $relationship['parent_uuid'],
                            'order' => $relationship['order']
                        ];
                    }
                }
            }

            // Attach item to manuscript with primary parent relationship
            $metadata = $item->metadata ?? [];
            if ($primaryParent && isset($items[$primaryParent['parent_uuid']])) {
                $parent = $items[$primaryParent['parent_uuid']];
                $metadata = array_merge($metadata, [
                    'primary_parent_id' => $parent->id,
                    'primary_parent_uuid' => $primaryParent['parent_uuid'],
                    'all_parents' => $allParents
                ]);
            }

            $manuscript->items()->attach($item->id, [
                'item_version_id' => $version->id,
                'order_index' => $primaryOrder,
                'is_independent' => false,
                'metadata' => $metadata
            ]);

            Log::debug('Attached item to manuscript', [
                'item_id' => $item->id,
                'is_root' => !$primaryParent,
                'primary_parent_uuid' => $primaryParent['parent_uuid'] ?? null,
                'order' => $primaryOrder
            ]);

            $attachedCount++;
            $parentUpdateCount += count($allParents);
        }

        Log::debug('Final item creation summary', [
            'total_items_created' => count($items),
            'parent_relationships_created' => $parentUpdateCount,
            'manuscript_attachments' => $attachedCount
        ]);

        Log::info('Created items', [
            'manuscript_id' => $manuscriptId,
            'count' => count($items),
            'parent_relationships' => $parentUpdateCount,
            'attachments' => $attachedCount,
        ]);

        return $items;
    }

    /**
     * Create collections records
     *
     * @param int $manuscriptId Manuscript ID
     * @param array $collectionsData Collections data
     * @return array Created collections
     */
    private function createCollections(int $manuscriptId, array $collectionsData): array
    {
        $collections = [];

        foreach ($collectionsData as $collectionData) {
            $collectionData['manuscript_id'] = $manuscriptId;
            $collection = ManuscriptCollection::create($collectionData);
            $collections[$collection->collection_id] = $collection;
        }

        Log::info('Created collections', [
            'manuscript_id' => $manuscriptId,
            'count' => count($collections),
        ]);

        return $collections;
    }

    /**
     * Create writing history records
     *
     * @param array $writingHistoryData Writing history data
     * @return array Created writing history records
     */
    private function createWritingHistory(array $writingHistoryData): array
    {
        $history = [];

        foreach ($writingHistoryData as $historyData) {
            // Check for existing writing history record for this user, date, and manuscript
            $existing = WritingHistory::where('user_id', $historyData['user_id'])
                ->where('date', $historyData['date'])
                ->where('manuscript_id', $historyData['manuscript_id'])
                ->first();

            if ($existing) {
                // Update existing record instead of creating duplicate
                $existing->update($historyData);
                $history[] = $existing;
                
                Log::debug('Updated existing writing history record', [
                    'id' => $existing->id,
                    'user_id' => $historyData['user_id'],
                    'date' => $historyData['date'],
                    'manuscript_id' => $historyData['manuscript_id'],
                ]);
            } else {
                // Create new record
                $record = WritingHistory::create($historyData);
                $history[] = $record;
                
                Log::debug('Created new writing history record', [
                    'id' => $record->id,
                    'user_id' => $historyData['user_id'],
                    'date' => $historyData['date'],
                    'manuscript_id' => $historyData['manuscript_id'],
                ]);
            }
        }

        Log::info('Processed writing history records', [
            'count' => count($history),
        ]);

        return $history;
    }

    /**
     * Update collection item references
     *
     * @param array $collections Collections
     * @param array $items Items
     * @return void
     */
    private function updateCollectionItems(array $collections, array $items): void
    {
        foreach ($collections as $collection) {
            $itemIds = [];
            foreach ($collection->item_uuids as $uuid) {
                if (isset($items[$uuid])) {
                    $itemIds[] = $items[$uuid]->id;
                }
            }
            $collection->update(['item_ids' => $itemIds]);
        }
    }

    /**
     * Validate data before population
     *
     * @param array $manuscriptData Manuscript data
     * @param array $itemsData Items data
     * @param array $collectionsData Collections data
     * @param array $writingHistoryData Writing history data
     * @return bool
     * @throws RuntimeException
     */
    public function validate(
        array $manuscriptData,
        array $itemsData,
        array $collectionsData,
        array $writingHistoryData
    ): bool {
        // Validate manuscript data
        if (empty($manuscriptData['title']) || empty($manuscriptData['scrivener_uuid'])) {
            throw new RuntimeException('Invalid manuscript data: missing required fields');
        }

        // Validate items data
        foreach ($itemsData as $item) {
            if (empty($item['type']) || empty($item['title'])) {
                throw new RuntimeException('Invalid item data: missing required fields');
            }
        }

        // Validate collections data
        foreach ($collectionsData as $collection) {
            if (empty($collection['title']) || empty($collection['type'])) {
                throw new RuntimeException('Invalid collection data: missing required fields');
            }
        }

        // Writing history is optional, so no validation needed
        Log::debug('Writing history validation skipped', ['count' => count($writingHistoryData)]);

        return true;
    }

    /**
     * Rollback import
     *
     * @param ?int $manuscriptId Manuscript ID to rollback
     * @return bool
     */
    public function rollback(?int $manuscriptId = null): bool
    {
        try {
            DB::beginTransaction();

            if ($manuscriptId) {
                // Rollback specific manuscript
                $manuscript = Manuscript::find($manuscriptId);
                if ($manuscript) {
                    // Delete associated records
                    ManuscriptItem::where('manuscript_id', $manuscriptId)->delete();
                    ManuscriptCollection::where('manuscript_id', $manuscriptId)->delete();
                    WritingHistory::where('manuscript_id', $manuscriptId)->delete();
                    $manuscript->delete();

                    Log::info('Rolled back manuscript import', [
                        'manuscript_id' => $manuscriptId,
                    ]);
                }
            } else {
                // Rollback all Scrivener imports
                $manuscripts = Manuscript::where('manuscript_type', 'scrivener')->get();
                foreach ($manuscripts as $manuscript) {
                    ManuscriptItem::where('manuscript_id', $manuscript->id)->delete();
                    ManuscriptCollection::where('manuscript_id', $manuscript->id)->delete();
                    WritingHistory::where('manuscript_id', $manuscript->id)->delete();
                }
                Manuscript::where('manuscript_type', 'scrivener')->delete();

                Log::info('Rolled back all Scrivener imports');
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Rollback failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return false;
        }
    }
} 
