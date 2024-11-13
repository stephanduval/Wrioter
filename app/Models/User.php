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
        return $this->belongsToMany(Role::class, 'user_roles')
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
        \Log::info('Fetching permissions for user roles.');
    
        return $this->roles->flatMap(function ($role) {
            \Log::info('Mapping role permissions:', ['role_id' => $role->id]);
    
            return $role->permissions->map(function ($permission) {
                \Log::info('Mapping permission:', [
                    'id' => $permission->id ?? 'N/A',
                    'action' => $permission->action ?? 'N/A',
                    'subject' => $permission->subject ?? 'N/A',
                ]);
    
                return [
                    'id' => $permission->id,
                    'action' => $permission->action,
                    'subject' => $permission->subject,
                ];
            });
        })->unique('id')->values();
    }
}
