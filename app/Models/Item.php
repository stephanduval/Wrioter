<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Item extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_id',
        'user_id',
        'type',
        'title',
        'content',
        'synopsis',
        'item_order',
        'metadata',
        'is_archived',
        'file_path_or_url'
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_archived' => 'boolean',
        'item_order' => 'integer'
    ];

    /**
     * Get the project that owns the item.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user that owns the item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all versions of this item.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ItemVersion::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the current version of this item.
     */
    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(ItemVersion::class, 'current_version_id');
    }

    /**
     * Get all manuscripts that use this item.
     */
    public function manuscripts(): BelongsToMany
    {
        return $this->belongsToMany(Manuscript::class, 'manuscript_items')
            ->using(ManuscriptItem::class)
            ->withPivot(['item_version_id', 'order_index', 'is_independent', 'forked_from_id', 'metadata'])
            ->withTimestamps();
    }

    /**
     * Get all manuscript items that use this item.
     */
    public function manuscriptItems(): HasMany
    {
        return $this->hasMany(ManuscriptItem::class);
    }

    /**
     * Create a new version of this item.
     */
    public function createVersion(array $attributes): ItemVersion
    {
        return $this->versions()->create([
            'user_id' => auth()->id(),
            'name' => $attributes['name'] ?? null,
            'content' => $attributes['content'] ?? $this->content,
            'synopsis' => $attributes['synopsis'] ?? $this->synopsis,
            'change_description' => $attributes['change_description'] ?? null,
            'metadata' => $attributes['metadata'] ?? null
        ]);
    }

    /**
     * Fork this item for a specific manuscript.
     */
    public function forkForManuscript(Manuscript $manuscript): ManuscriptItem
    {
        // Create a new version
        $newVersion = $this->createVersion([
            'name' => 'Forked version',
            'change_description' => 'Forked for manuscript: ' . $manuscript->title
        ]);

        // Create the manuscript item
        return $manuscript->addItem($this, $newVersion, [
            'is_independent' => true
        ]);
    }
} 
