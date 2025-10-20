<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Manuscript extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'scrivener_uuid',
        'manuscript_type',
        'version',
        'imported_at',
        'project_settings',
        'compile_settings',
        'custom_metadata'
    ];

    protected $casts = [
        'project_settings' => 'array',
        'compile_settings' => 'array',
        'custom_metadata' => 'array',
        'metadata' => 'array',
        'version' => 'integer'
    ];

    /**
     * Get the user that owns the manuscript.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all items associated with this manuscript through manuscript_items.
     */
    public function manuscriptItems(): HasMany
    {
        return $this->hasMany(ManuscriptItem::class)->orderBy('order_index');
    }

    /**
     * Get all items associated with this manuscript.
     */
    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'manuscript_items')
            ->using(ManuscriptItem::class)
            ->withPivot(['item_version_id', 'order_index', 'is_independent', 'forked_from_id', 'metadata'])
            ->withTimestamps();
    }

    /**
     * Add an item to the manuscript.
     */
    public function addItem(Item $item, ?ItemVersion $version = null, array $attributes = []): ManuscriptItem
    {
        // ItemVersion might not be used in all cases
        $versionId = null;
        if ($version) {
            $versionId = $version->id;
        } elseif (method_exists($item, 'versions')) {
            $latestVersion = $item->versions()->latest()->first();
            $versionId = $latestVersion ? $latestVersion->id : null;
        }

        return $this->manuscriptItems()->create([
            'item_id' => $item->id,
            'item_version_id' => $versionId,
            'order_index' => $this->manuscriptItems()->count(),
            'is_independent' => false,
            'metadata' => $attributes['metadata'] ?? null
        ]);
    }

    /**
     * Reorder items in the manuscript.
     */
    public function reorderItems(array $itemIds): void
    {
        foreach ($itemIds as $index => $id) {
            $this->manuscriptItems()->where('id', $id)->update(['order_index' => $index]);
        }
    }

    public function parentVersion(): BelongsTo
    {
        return $this->belongsTo(Manuscript::class, 'parent_version_id');
    }

    public function childVersions(): HasMany
    {
        return $this->hasMany(Manuscript::class, 'parent_version_id');
    }

    /**
     * Get the default mindmap for this manuscript.
     */
    public function defaultMindmap(): HasOne
    {
        return $this->hasOne(WritingMindmap::class)->where('is_default', true);
    }

    /**
     * Get all mindmaps for this manuscript.
     */
    public function mindmaps(): HasMany
    {
        return $this->hasMany(WritingMindmap::class);
    }

    /**
     * Create or get the default mindmap for this manuscript.
     */
    public function createDefaultMindmap(): WritingMindmap
    {
        // Check if a default mindmap already exists
        $existingDefault = $this->defaultMindmap()->first();
        if ($existingDefault) {
            return $existingDefault;
        }

        // Create the default mindmap
        $mindmap = WritingMindmap::create([
            'user_id' => $this->user_id,
            'manuscript_id' => $this->id,
            'title' => $this->title . ' - Structure',
            'description' => 'Automatic visualization of all items in ' . $this->title,
            'is_default' => true,
            'is_template' => false,
            'is_public' => false,
            'settings' => [
                'layout' => 'hierarchical',
                'auto_sync' => true,
                'show_connections' => true,
            ]
        ]);

        // Populate with all manuscript items
        $mindmap->populateFromManuscript($this);

        return $mindmap;
    }

    /**
     * Sync the default mindmap with current manuscript items.
     */
    public function syncDefaultMindmap(): void
    {
        $mindmap = $this->defaultMindmap()->first();

        if (!$mindmap) {
            $mindmap = $this->createDefaultMindmap();
        } else {
            // Re-populate to ensure all items are present
            $mindmap->populateFromManuscript($this);
        }
    }

    /**
     * Add an item to manuscript and sync with default mindmap.
     */
    public function addItemWithSync(Item $item, ?ItemVersion $version = null, array $attributes = []): ManuscriptItem
    {
        // ItemVersion might not be used in all cases
        $versionId = null;
        if ($version) {
            $versionId = $version->id;
        } elseif (method_exists($item, 'versions')) {
            $latestVersion = $item->versions()->latest()->first();
            $versionId = $latestVersion ? $latestVersion->id : null;
        }

        $manuscriptItem = $this->manuscriptItems()->create([
            'item_id' => $item->id,
            'item_version_id' => $versionId,
            'order_index' => $this->manuscriptItems()->count(),
            'is_independent' => false,
            'metadata' => $attributes['metadata'] ?? null
        ]);

        // Add to default mindmap if it exists
        $defaultMindmap = $this->defaultMindmap()->first();
        if ($defaultMindmap) {
            $this->addItemToDefaultMindmap($item);
        }

        return $manuscriptItem;
    }

    /**
     * Add a single item to the default mindmap.
     */
    protected function addItemToDefaultMindmap(Item $item): void
    {
        $mindmap = $this->defaultMindmap()->first();
        if (!$mindmap) {
            return;
        }

        // Calculate position based on existing items
        $existingPositions = $mindmap->positions()->get();
        $position = $this->calculateNewItemPosition($item, $existingPositions);

        MindmapItemPosition::updateOrCreate(
            [
                'mindmap_id' => $mindmap->id,
                'item_id' => $item->id,
            ],
            [
                'position' => $position,
                'style' => $mindmap->getDefaultStyleForItem($item),
            ]
        );
    }

    /**
     * Calculate position for a new item based on its parent.
     */
    protected function calculateNewItemPosition(Item $item, $existingPositions): array
    {
        // If item has a parent, position it near the parent
        if ($item->parent_id) {
            $parentPosition = $existingPositions->where('item_id', $item->parent_id)->first();
            if ($parentPosition) {
                // Find siblings
                $siblings = $existingPositions->filter(function ($pos) use ($item, $existingPositions) {
                    $posItem = Item::find($pos->item_id);
                    return $posItem && $posItem->parent_id == $item->parent_id;
                });

                $siblingCount = $siblings->count();
                return [
                    'x' => $parentPosition->position['x'] + ($siblingCount * 50),
                    'y' => $parentPosition->position['y'] + 150,
                ];
            }
        }

        // Default position for root items
        $rootCount = $existingPositions->filter(function ($pos) {
            $item = Item::find($pos->item_id);
            return $item && !$item->parent_id;
        })->count();

        return [
            'x' => $rootCount * 250,
            'y' => 50,
        ];
    }

    public function exportConfigurations(): HasMany
    {
        return $this->hasMany(ExportConfiguration::class);
    }

    /**
     * Get the raw files for the manuscript.
     */
    public function rawFiles(): HasMany
    {
        return $this->hasMany(ManuscriptRawFile::class);
    }

    public function createNewVersion(): Manuscript
    {
        $newVersion = $this->replicate();
        $newVersion->version = $this->version + 1;
        $newVersion->parent_version_id = $this->id;
        $newVersion->save();

        // Copy all items with their current versions
        foreach ($this->items as $item) {
            $newVersion->items()->attach($item->id, [
                'item_version_id' => $item->currentVersion->id,
                'order_index' => $item->pivot->order_index,
                'is_independent' => $item->pivot->is_independent,
                'metadata' => $item->pivot->metadata
            ]);
        }

        return $newVersion;
    }
} 
