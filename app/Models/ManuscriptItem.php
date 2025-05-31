<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManuscriptItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'manuscript_id',
        'item_id',
        'item_version_id',
        'order_index',
        'is_independent',
        'forked_from_id',
        'metadata'
    ];

    protected $casts = [
        'is_independent' => 'boolean',
        'metadata' => 'array',
        'order_index' => 'integer'
    ];

    /**
     * Get the manuscript that owns this item.
     */
    public function manuscript(): BelongsTo
    {
        return $this->belongsTo(Manuscript::class);
    }

    /**
     * Get the item associated with this manuscript.
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the specific version of the item being used.
     */
    public function version(): BelongsTo
    {
        return $this->belongsTo(ItemVersion::class, 'item_version_id');
    }

    /**
     * Get the original manuscript item if this is a fork.
     */
    public function forkedFrom(): BelongsTo
    {
        return $this->belongsTo(ManuscriptItem::class, 'forked_from_id');
    }

    /**
     * Get all forks of this manuscript item.
     */
    public function forks()
    {
        return $this->hasMany(ManuscriptItem::class, 'forked_from_id');
    }

    /**
     * Create a fork of this manuscript item.
     */
    public function fork(Manuscript $targetManuscript): ManuscriptItem
    {
        // Create a new version of the item
        $newVersion = $this->item->versions()->create([
            'user_id' => auth()->id(),
            'content' => $this->version->content,
            'name' => 'Forked version',
            'change_description' => 'Forked from manuscript: ' . $this->manuscript->title
        ]);

        // Create the new manuscript item
        return $targetManuscript->items()->create([
            'item_id' => $this->item_id,
            'item_version_id' => $newVersion->id,
            'order_index' => $this->order_index,
            'is_independent' => true,
            'forked_from_id' => $this->id,
            'metadata' => $this->metadata
        ]);
    }
} 
