<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WritingMindmap extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'writing_item_id',
        'user_id',
        'manuscript_id',
        'folder_id',
        'title',
        'description',
        'settings',
        'format',
        'is_template',
        'is_public',
        'is_archived',
        'is_default'
    ];

    protected $casts = [
        'settings' => 'array',
        'is_template' => 'boolean',
        'is_public' => 'boolean',
        'is_archived' => 'boolean',
        'is_default' => 'boolean',
        'archived_at' => 'datetime'
    ];

    /**
     * Get the writing item that owns the mindmap.
     */
    public function writingItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'writing_item_id');
    }

    /**
     * Get the user that owns the mindmap.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the manuscript that owns the mindmap.
     */
    public function manuscript(): BelongsTo
    {
        return $this->belongsTo(Manuscript::class);
    }

    /**
     * Get the folder that owns the mindmap.
     */
    public function folder(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'folder_id');
    }

    /**
     * Get the item positions for this mindmap.
     */
    public function positions(): HasMany
    {
        return $this->hasMany(MindmapItemPosition::class, 'mindmap_id');
    }

    /**
     * Get the connections for this mindmap.
     */
    public function connections(): HasMany
    {
        return $this->hasMany(MindmapConnection::class, 'mindmap_id');
    }

    /**
     * Get the ghost placeholders for this mindmap.
     * Ghosts represent deleted items that were previously in the mindmap.
     */
    public function ghosts(): HasMany
    {
        return $this->hasMany(MindmapGhost::class, 'mindmap_id');
    }

    /**
     * Get all items in this mindmap through positions.
     */
    public function items()
    {
        return $this->hasManyThrough(
            Item::class,
            MindmapItemPosition::class,
            'mindmap_id',  // Foreign key on positions table
            'id',          // Foreign key on items table
            'id',          // Local key on mindmaps table
            'item_id'      // Local key on positions table
        );
    }

    /**
     * Scope a query to only include active mindmaps.
     */
    public function scopeActive($query)
    {
        return $query->where('is_archived', false);
    }

    /**
     * Scope a query to only include archived mindmaps.
     */
    public function scopeArchived($query)
    {
        return $query->where('is_archived', true);
    }

    /**
     * Scope a query to only include default mindmaps.
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Scope a query to folder-specific mindmaps.
     */
    public function scopeForFolder($query, int $folderId)
    {
        return $query->where('folder_id', $folderId);
    }

    /**
     * Populate this mindmap with all items from a manuscript.
     */
    public function populateFromManuscript(Manuscript $manuscript): void
    {
        $items = $manuscript->items()->with('children')->get();
        $positionMap = $this->calculateHierarchicalLayout($items);

        foreach ($positionMap as $itemId => $position) {
            MindmapItemPosition::updateOrCreate(
                [
                    'mindmap_id' => $this->id,
                    'item_id' => $itemId,
                ],
                [
                    'position' => $position,
                    'style' => $this->getDefaultStyleForItem($items->find($itemId)),
                ]
            );
        }
    }

    /**
     * Calculate hierarchical layout for items.
     */
    protected function calculateHierarchicalLayout($items): array
    {
        $positions = [];
        $levelWidths = [];
        $currentY = 50;
        $xSpacing = 250;
        $ySpacing = 150;

        // Group items by parent_id
        $grouped = $items->groupBy('parent_id');

        // Process items level by level (breadth-first)
        $processLevel = function($parentId, $depth) use (&$processLevel, &$positions, &$levelWidths, &$currentY, $xSpacing, $ySpacing, $grouped) {
            if (!isset($grouped[$parentId])) {
                return;
            }

            $levelItems = $grouped[$parentId];
            $itemCount = $levelItems->count();

            // Calculate X positions for this level
            $startX = -($itemCount - 1) * $xSpacing / 2;

            foreach ($levelItems as $index => $item) {
                $x = $startX + ($index * $xSpacing);
                $y = $depth * $ySpacing;

                $positions[$item->id] = [
                    'x' => $x,
                    'y' => $y
                ];

                // Process children
                $processLevel($item->id, $depth + 1);
            }
        };

        // Start with root items (parent_id = null)
        $processLevel(null, 0);

        return $positions;
    }

    /**
     * Get default style for an item based on its type.
     */
    public function getDefaultStyleForItem($item): array
    {
        $styles = [
            'folder' => [
                'backgroundColor' => '#e3f2fd',
                'borderColor' => '#1976d2',
                'width' => 200,
                'height' => 80,
            ],
            'text' => [
                'backgroundColor' => '#fff3e0',
                'borderColor' => '#f57c00',
                'width' => 180,
                'height' => 60,
            ],
            'character' => [
                'backgroundColor' => '#f3e5f5',
                'borderColor' => '#7b1fa2',
                'width' => 180,
                'height' => 60,
            ],
            'scene' => [
                'backgroundColor' => '#e8f5e9',
                'borderColor' => '#388e3c',
                'width' => 180,
                'height' => 60,
            ],
        ];

        return $styles[$item->type] ?? [
            'backgroundColor' => '#ffffff',
            'borderColor' => '#cccccc',
            'width' => 180,
            'height' => 60,
        ];
    }
} 
