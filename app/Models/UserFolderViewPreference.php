<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserFolderViewPreference extends Model
{
    protected $fillable = [
        'user_id',
        'folder_id',
        'view_mode',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    /**
     * Get the user that owns the preference
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the folder that this preference is for
     */
    public function folder(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'folder_id');
    }
}
