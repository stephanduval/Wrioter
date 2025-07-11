<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;


class User extends Authenticatable implements CanResetPasswordContract
{
    use HasApiTokens, HasFactory, Notifiable, CanResetPassword;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'department',
        'password',
        'password_reset_required',
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
        'password_reset_required' => 'boolean',
    ];

    /**
     * Define a many-to-many relationship with Role.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Role::class,    // The related model
            'user_roles',   // The pivot table name
            'user_id',      // The foreign key on the pivot table for the User model
            'role_id'       // The foreign key on the pivot table for the Role model
        );
    }

    /**
     * Define a many-to-many relationship with Company.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function companies(): BelongsToMany
    {
        return $this->belongsToMany(
            Company::class, // The related model
            'user_company', // The pivot table name
            'user_id',      // The foreign key on the pivot table for the User model
            'company_id'    // The foreign key on the pivot table for the Company model
        );
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
     * Get the scrivener imports for the user.
     */
    public function scrivenerImports()
    {
        return $this->hasMany(ScrivenerImport::class);
    }

    /**
     * Get all permissions for the user through their roles.
     *
     * @return \Illuminate\Support\Collection
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
                    'action' => strtolower($permission->action),
                    'subject' => strtolower($permission->subject),
                ];
            });
        })->unique('id')->values();
    }

    /**
     * Get the password reset URL for the given token.
     *
     * @param  string  $token
     * @return string
     */
    public function getPasswordResetUrl($token)
    {
        return config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($this->email);
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\CustomResetPassword($token));
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($user) {
            // Detach all related companies and roles
            $user->companies()->detach();
            $user->roles()->detach();
        });
    }
}
