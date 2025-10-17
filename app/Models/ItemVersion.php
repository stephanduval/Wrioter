<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ItemVersion extends Model
{
    protected $fillable = [
        'item_id',
        'user_id',
        'content',
        'synopsis',
        'metadata',
        'version_number',
        'is_forked',
        'parent_version_id'
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_forked' => 'boolean',
        'version_number' => 'integer'
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parentVersion(): BelongsTo
    {
        return $this->belongsTo(ItemVersion::class, 'parent_version_id');
    }

    public function forkedVersions(): HasMany
    {
        return $this->hasMany(ItemVersion::class, 'parent_version_id');
    }

    public function manuscripts(): BelongsToMany
    {
        return $this->belongsToMany(Manuscript::class, 'manuscript_items', 'item_version_id')
            ->withPivot(['order_index', 'is_independent', 'metadata'])
            ->withTimestamps();
    }
} 
