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
        // Check for duplicate scrivener_uuid
        if (isset($data['scrivener_uuid'])) {
            $existing = Manuscript::where('scrivener_uuid', $data['scrivener_uuid'])->first();
            if ($existing) {
                throw new RuntimeException('A manuscript with this Scrivener UUID already exists');
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
        $items = [];
        $parentMap = [];
        $itemVersions = [];

        // First pass: Create Item records and their versions
        foreach ($itemsData as $itemData) {
            // Create the item
            $item = Item::create([
                'user_id' => $itemData['user_id'],
                'type' => $itemData['type'],
                'title' => $itemData['title'],
                'content' => $itemData['content'],
                'synopsis' => $itemData['synopsis'],
                'item_order' => $itemData['item_order'],
                'metadata' => $itemData['metadata'],
                'scrivener_uuid' => $itemData['scrivener_uuid'],
                'folder_type' => $itemData['folder_type'],
                'icon_name' => $itemData['icon_name'],
                'format_metadata' => $itemData['format_metadata'],
                'content_markdown' => $itemData['content_markdown'],
                'raw_content' => $itemData['raw_content'],
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

            // Store the item and version for later use
            $items[$item->scrivener_uuid] = $item;
            $itemVersions[$item->scrivener_uuid] = $version;
            $parentMap[$item->scrivener_uuid] = $itemData['metadata']['parent_id'] ?? null;

            // Update the item's current version
            $item->update(['current_version_id' => $version->id]);
        }

        // Log counts after creation
        Log::info('Item creation counts', [
            'itemsData_count' => count($itemsData),
            'items_created_count' => count($items),
        ]);

        // Second pass: Update parent relationships
        foreach ($parentMap as $uuid => $parentUuid) {
            if ($parentUuid && isset($items[$parentUuid])) {
                $item = $items[$uuid];
                $parent = $items[$parentUuid];
                $item->update(['parent_id' => $parent->id]);
            }
        }

        // Third pass: Attach items to manuscript via pivot table
        $manuscript = Manuscript::find($manuscriptId);
        foreach ($items as $uuid => $item) {
            $itemData = collect($itemsData)->firstWhere('scrivener_uuid', $uuid);
            $manuscript->items()->attach($item->id, [
                'item_version_id' => $itemVersions[$uuid]->id,
                'order_index' => $itemData['item_order'] ?? 0,
                'is_independent' => false,
                'metadata' => $itemData['metadata'] ?? null,
            ]);
        }

        Log::info('Created items', [
            'manuscript_id' => $manuscriptId,
            'count' => count($items),
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
            $record = WritingHistory::create($historyData);
            $history[] = $record;
        }

        Log::info('Created writing history records', [
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
        try {
            // Validate manuscript data
            if (empty($manuscriptData['title']) || empty($manuscriptData['scrivener_uuid'])) {
                throw new RuntimeException('Invalid manuscript data: missing required fields');
            }

            // Validate items data
            foreach ($itemsData as $item) {
                if (empty($item['title']) || empty($item['scrivener_uuid'])) {
                    throw new RuntimeException('Invalid item data: missing required fields');
                }
            }

            // Validate collections data
            foreach ($collectionsData as $collection) {
                if (empty($collection['title']) || empty($collection['collection_id'])) {
                    throw new RuntimeException('Invalid collection data: missing required fields');
                }
            }

            // Validate writing history data
            foreach ($writingHistoryData as $history) {
                if (empty($history['date']) || !isset($history['user_id'])) {
                    throw new RuntimeException('Invalid writing history data: missing required fields');
                }
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Data validation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw new RuntimeException('Data validation failed: ' . $e->getMessage());
        }
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
