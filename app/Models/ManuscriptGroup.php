<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ManuscriptGroup extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type'
    ];

    /**
     * Get the user that owns the group.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the manuscripts in this group.
     */
    public function manuscripts(): BelongsToMany
    {
        return $this->belongsToMany(Manuscript::class, 'manuscript_group_items')
            ->withPivot(['order_index'])
            ->withTimestamps();
    }

    /**
     * Scope a query to only include personal groups.
     */
    public function scopePersonal($query)
    {
        return $query->where('type', 'personal');
    }

    /**
     * Scope a query to only include shared groups.
     */
    public function scopeShared($query)
    {
        return $query->where('type', 'shared');
    }

    /**
     * Scope a query to only include client groups.
     */
    public function scopeClient($query)
    {
        return $query->where('type', 'client');
    }

    /**
     * Add a manuscript to the group.
     */
    public function addManuscript(Manuscript $manuscript, int $orderIndex = null): void
    {
        $this->manuscripts()->attach($manuscript->id, [
            'order_index' => $orderIndex ?? $this->manuscripts()->count()
        ]);
    }

    /**
     * Remove a manuscript from the group.
     */
    public function removeManuscript(Manuscript $manuscript): void
    {
        $this->manuscripts()->detach($manuscript->id);
    }

    /**
     * Reorder manuscripts in the group.
     */
    public function reorderManuscripts(array $manuscriptIds): void
    {
        foreach ($manuscriptIds as $index => $manuscriptId) {
            $this->manuscripts()->updateExistingPivot($manuscriptId, [
                'order_index' => $index
            ]);
        }
    }
} 
