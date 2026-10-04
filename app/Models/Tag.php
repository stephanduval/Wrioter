<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'color',
        'icon',
        'user_id',
        'usage_count',
        'parent_id',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'usage_count' => 'integer'
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }

            if (empty($tag->color)) {
                // Generate a random color if not provided
                $tag->color = '#' . str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the user that owns this tag
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent tag (for hierarchical tags)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Tag::class, 'parent_id');
    }

    /**
     * Get child tags
     */
    public function children(): HasMany
    {
        return $this->hasMany(Tag::class, 'parent_id');
    }

    /**
     * Get all items with this tag
     */
    public function items(): BelongsToMany
    {
        return $this->belongsToMany(Item::class, 'item_tags')
            ->withPivot(['context', 'position', 'confidence', 'added_by'])
            ->withTimestamps();
    }

    /**
     * Increment usage count
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Decrement usage count
     */
    public function decrementUsage(): void
    {
        if ($this->usage_count > 0) {
            $this->decrement('usage_count');
        }
    }

    /**
     * Create tag from hashtag string
     */
    public static function createFromHashtag(string $hashtag, int $userId): self
    {
        $name = ltrim($hashtag, '#');
        $slug = Str::slug($name);

        return self::firstOrCreate(
            [
                'slug' => $slug,
                'user_id' => $userId
            ],
            [
                'name' => $name,
                'type' => 'hashtag'
            ]
        );
    }

    /**
     * Create tag from mention string
     */
    public static function createFromMention(string $mention, int $userId): self
    {
        $name = ltrim($mention, '@');
        $slug = Str::slug($name);

        return self::firstOrCreate(
            [
                'slug' => $slug,
                'user_id' => $userId
            ],
            [
                'name' => $name,
                'type' => 'mention'
            ]
        );
    }

    /**
     * Get popular tags for a user
     */
    public static function popular(int $userId, int $limit = 20)
    {
        return self::where('user_id', $userId)
            ->orderBy('usage_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Search tags by name
     */
    public static function search(string $query, int $userId)
    {
        return self::where('user_id', $userId)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('slug', 'like', "%{$query}%");
            })
            ->orderBy('usage_count', 'desc')
            ->get();
    }

    /**
     * Get full hierarchical path for nested tags
     */
    public function getFullPath(): string
    {
        $path = [$this->name];
        $parent = $this->parent;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }

        return implode(' > ', $path);
    }

    /**
     * Get all descendants (recursive children)
     */
    public function descendants(): \Illuminate\Database\Eloquent\Collection
    {
        $descendants = collect();

        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->descendants());
        }

        return $descendants;
    }
}