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
        'title',
        'description',
        'settings',
        'format',
        'is_template',
        'is_public',
        'is_archived'
    ];

    protected $casts = [
        'settings' => 'array',
        'is_template' => 'boolean',
        'is_public' => 'boolean',
        'is_archived' => 'boolean',
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
} 
