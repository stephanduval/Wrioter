<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Item extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_id',
        'user_id',
        'type',
        'title',
        'content',
        'synopsis',
        'item_order',
        'metadata',
        'is_archived',
        'file_path_or_url',
        'scrivener_uuid',
        'parent_id',
        'folder_type',
        'icon_name',
        'format_metadata',
        'content_markdown',
        'raw_content',
        'content_format',
        'word_count',
        'character_count',
    ];

    protected $casts = [
        'metadata' => 'array',
        'format_metadata' => 'array',
        'is_archived' => 'boolean',
        'item_order' => 'integer',
        'word_count' => 'integer',
        'character_count' => 'integer',
    ];

    /**
     * Get the project that owns the item.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user that owns the item.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all versions of this item.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ItemVersion::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the current version of this item.
     */
    public function currentVersion(): BelongsTo
    {
        return $this->belongsTo(ItemVersion::class, 'current_version_id');
    }

    /**
     * Get all manuscripts that use this item.
     */
    public function manuscripts(): BelongsToMany
    {
        return $this->belongsToMany(Manuscript::class, 'manuscript_items')
            ->using(ManuscriptItem::class)
            ->withPivot(['item_version_id', 'order_index', 'is_independent', 'forked_from_id', 'metadata'])
            ->withTimestamps();
    }

    /**
     * Get all manuscript items that use this item.
     */
    public function manuscriptItems(): HasMany
    {
        return $this->hasMany(ManuscriptItem::class);
    }

    /**
     * Get the comments for this item.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(WritingComment::class, 'writing_item_id');
    }

    /**
     * Get all tags for this item.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'item_tags')
            ->withPivot(['context', 'position', 'confidence', 'added_by'])
            ->withTimestamps();
    }

    /**
     * Create a new version of this item.
     */
    public function createVersion(array $attributes): ItemVersion
    {
        return $this->versions()->create([
            'user_id' => auth()->id(),
            'name' => $attributes['name'] ?? null,
            'content' => $attributes['content'] ?? $this->content,
            'synopsis' => $attributes['synopsis'] ?? $this->synopsis,
            'change_description' => $attributes['change_description'] ?? null,
            'metadata' => $attributes['metadata'] ?? null
        ]);
    }

    /**
     * Fork this item for a specific manuscript.
     */
    public function forkForManuscript(Manuscript $manuscript): ManuscriptItem
    {
        // Create a new version
        $newVersion = $this->createVersion([
            'name' => 'Forked version',
            'change_description' => 'Forked for manuscript: ' . $manuscript->title
        ]);

        // Create the manuscript item
        return $manuscript->addItem($this, $newVersion, [
            'is_independent' => true
        ]);
    }

    /**
     * Get the parent item.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'parent_id');
    }

    /**
     * Get the child items.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Item::class, 'parent_id');
    }

    /**
     * Scope a query to only include root items (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Get the attachments for the item.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(ItemAttachment::class);
    }

    /**
     * Get the snippet references for this collection item.
     * Only applicable when type is 'snippet_collection'.
     */
    public function snippetReferences(): HasMany
    {
        return $this->hasMany(SnippetReference::class, 'collection_item_id')
            ->orderBy('order_index');
    }

    /**
     * Get all snippets that reference this item as a source.
     */
    public function referencedInSnippets(): HasMany
    {
        return $this->hasMany(SnippetReference::class, 'source_item_id');
    }

    /**
     * Check if this item is a snippet collection.
     */
    public function isSnippetCollection(): bool
    {
        return $this->type === 'snippet_collection';
    }

    /**
     * Scope a query to only include snippet collections.
     */
    public function scopeSnippetCollections($query)
    {
        return $query->where('type', 'snippet_collection');
    }
} 
