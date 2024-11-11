<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    protected $fillable = [
        'name',
        'subject'
    ];

    /**
     * The roles that belong to the permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role')
                    ->withPivot(['id', 'action_id'])
                    ->withTimestamps();
    }

    /**
     * The actions associated with this permission through permission_role.
     */
    public function actions(): BelongsToMany
    {
        return $this->belongsToMany(Action::class, 'permission_role', 'permission_id', 'action_id');
    }
}
