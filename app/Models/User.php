<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * The roles that belong to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user')
                    ->withTimestamps();
    }

    /**
     * The subjects that belong to the user.
     */
    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'subject_user')
                    ->withTimestamps();
    }

    /**
     * Get all permissions for the user through their roles.
     */
    public function getPermissionsAttribute()
    {
        return $this->roles->flatMap(function ($role) {
            return $role->permissions->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'action' => $permission->action,
                    'subject' => $permission->subject,
                    'action_id' => $permission->pivot->action_id
                ];
            });
        })->unique('id');
    }
}
