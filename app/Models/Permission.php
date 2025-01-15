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
    return $this->belongsToMany(Role::class, 'role_permissions')
                ->withTimestamps();
}

    /**
     * The actions associated with this permission through permission_role.
     */
    
}
