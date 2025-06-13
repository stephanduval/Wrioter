<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
        $version = $version ?? $item->versions()->latest()->first();
        
        return $this->manuscriptItems()->create([
            'item_id' => $item->id,
            'item_version_id' => $version->id,
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

    public function exportConfigurations(): HasMany
    {
        return $this->hasMany(ExportConfiguration::class);
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
