<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ManuscriptCollection extends Model
{
    protected $fillable = [
        'manuscript_id',
        'collection_id',
        'title',
        'type',
        'color',
        'search_settings',
        'item_uuids',
        'order_index'
    ];

    protected $casts = [
        'search_settings' => 'array',
        'item_uuids' => 'array',
        'order_index' => 'integer'
    ];

    /**
     * Get the manuscript that owns the collection.
     */
    public function manuscript(): BelongsTo
    {
        return $this->belongsTo(Manuscript::class);
    }

    /**
     * Get the items in this collection.
     */
    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'collection_items')
            ->withPivot(['order_index'])
            ->withTimestamps();
    }

    /**
     * Scope a query to only include binder collections.
     */
    public function scopeBinders($query)
    {
        return $query->where('type', 'Binder');
    }

    /**
     * Scope a query to only include recent search collections.
     */
    public function scopeRecentSearches($query)
    {
        return $query->where('type', 'RecentSearch');
    }

    /**
     * Scope a query to only include arbitrary collections.
     */
    public function scopeArbitrary($query)
    {
        return $query->where('type', 'Arbitrary');
    }

    /**
     * Scope a query to order collections by their index.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order_index');
    }
} 
