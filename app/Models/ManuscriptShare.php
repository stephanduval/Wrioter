<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ManuscriptShare extends Model
{
    protected $fillable = [
        'shared_by',
        'share_type',
        'share_target_id',
        'access_level'
    ];

    /**
     * Get the user who created the share.
     */
    public function sharedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_by');
    }

    /**
     * Get the users who have access to this share.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'manuscript_share_users')
            ->withPivot(['last_accessed_at'])
            ->withTimestamps();
    }

    /**
     * Get the target manuscript or group.
     */
    public function target()
    {
        return $this->share_type === 'manuscript'
            ? $this->belongsTo(Manuscript::class, 'share_target_id')
            : $this->belongsTo(ManuscriptGroup::class, 'share_target_id');
    }

    /**
     * Scope a query to only include manuscript shares.
     */
    public function scopeManuscriptShares($query)
    {
        return $query->where('share_type', 'manuscript');
    }

    /**
     * Scope a query to only include group shares.
     */
    public function scopeGroupShares($query)
    {
        return $query->where('share_type', 'group');
    }

    /**
     * Scope a query to only include shares with read access.
     */
    public function scopeReadAccess($query)
    {
        return $query->where('access_level', 'read');
    }

    /**
     * Scope a query to only include shares with write access.
     */
    public function scopeWriteAccess($query)
    {
        return $query->where('access_level', 'write');
    }

    /**
     * Scope a query to only include shares with admin access.
     */
    public function scopeAdminAccess($query)
    {
        return $query->where('access_level', 'admin');
    }

    /**
     * Check if a user has access to this share.
     */
    public function hasAccess(User $user): bool
    {
        return $this->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Grant access to a user.
     */
    public function grantAccess(User $user): void
    {
        $this->users()->attach($user->id);
    }

    /**
     * Revoke access from a user.
     */
    public function revokeAccess(User $user): void
    {
        $this->users()->detach($user->id);
    }

    /**
     * Update the last accessed timestamp for a user.
     */
    public function updateLastAccessed(User $user): void
    {
        $this->users()->updateExistingPivot($user->id, [
            'last_accessed_at' => now()
        ]);
    }
} 
