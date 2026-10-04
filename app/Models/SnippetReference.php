<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SnippetReference extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'collection_item_id',
        'source_item_id',
        'position_data',
        'anchor_text_before',
        'anchor_text_after',
        'reference_text',
        'current_text',
        'content_hash',
        'status',
        'last_verified_at',
        'became_ghost_at',
        'order_index',
        'metadata',
    ];

    protected $casts = [
        'position_data' => 'array',
        'metadata' => 'array',
        'last_verified_at' => 'datetime',
        'became_ghost_at' => 'datetime',
        'order_index' => 'integer',
    ];

    /**
     * Get the collection item that owns this snippet.
     */
    public function collection(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'collection_item_id');
    }

    /**
     * Get the source item this snippet references.
     */
    public function sourceItem(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'source_item_id');
    }

    /**
     * Get the position markers for this snippet.
     */
    public function markers(): HasMany
    {
        return $this->hasMany(SnippetMarker::class);
    }

    /**
     * Scope a query to only include active snippets.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include ghost snippets.
     */
    public function scopeGhosts($query)
    {
        return $query->where('status', 'ghost');
    }

    /**
     * Scope a query for a specific collection.
     */
    public function scopeForCollection($query, int $collectionItemId)
    {
        return $query->where('collection_item_id', $collectionItemId);
    }

    /**
     * Scope a query for snippets referencing a specific source item.
     */
    public function scopeFromSource($query, int $sourceItemId)
    {
        return $query->where('source_item_id', $sourceItemId);
    }

    /**
     * Mark this snippet as a ghost.
     */
    public function markAsGhost(): void
    {
        $this->update([
            'status' => 'ghost',
            'became_ghost_at' => now(),
            'current_text' => $this->reference_text,
        ]);
    }

    /**
     * Update the content hash based on current reference text.
     */
    public function updateContentHash(): void
    {
        $this->update([
            'content_hash' => hash('sha256', $this->reference_text),
        ]);
    }

    /**
     * Update the reference text and recalculate hash.
     */
    public function updateReferenceText(string $newText): void
    {
        $this->update([
            'reference_text' => $newText,
            'content_hash' => hash('sha256', $newText),
            'last_verified_at' => now(),
        ]);
    }

    /**
     * Check if this snippet is a ghost.
     */
    public function isGhost(): bool
    {
        return $this->status === 'ghost';
    }

    /**
     * Check if this snippet is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($snippet) {
            if (empty($snippet->content_hash)) {
                $snippet->content_hash = hash('sha256', $snippet->reference_text ?? '');
            }
        });
    }
}
