<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Assignment extends Model
{
    protected $fillable = [
        'title',
        'description',
        'status',
        'due_date',
        'company_id',
        'assigned_by',
        'priority',
        'metadata'
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'metadata' => 'array'
    ];

    /**
     * Get the company that owns the assignment.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the user who created the assignment.
     */
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Get the users assigned to this assignment.
     */
    public function assignedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_assignments')
            ->withTimestamps();
    }

    /**
     * Get the messages associated with this assignment.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
} 
