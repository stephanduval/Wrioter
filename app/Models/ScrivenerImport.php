<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrivenerImport extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'filename',
        'status',
        'storage_path',
        'manuscript_id',
        'error_message',
        'progress',
        'total_items',
        'processed_items',
        'current_step',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'progress' => 'float',
        'total_items' => 'integer',
        'processed_items' => 'integer',
    ];

    protected $attributes = [
        'progress' => 0,
        'total_items' => 0,
        'processed_items' => 0,
        'current_step' => null,
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function manuscript()
    {
        return $this->belongsTo(Manuscript::class);
    }
} 
 