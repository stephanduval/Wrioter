<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MindmapNodeConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'mindmap_id',
        'from_node_id',
        'to_node_id',
        'connection_type',
        'relationship_type',
        'strength',
        'style',
        'label',
        'metadata'
    ];

    protected $casts = [
        'style' => 'array',
        'metadata' => 'array'
    ];

    /**
     * Get the mindmap that owns this connection
     */
    public function mindmap(): BelongsTo
    {
        return $this->belongsTo(WritingMindmap::class, 'mindmap_id');
    }

    /**
     * Get the source node of this connection
     */
    public function fromNode(): BelongsTo
    {
        return $this->belongsTo(WritingMindmapNode::class, 'from_node_id');
    }

    /**
     * Get the target node of this connection
     */
    public function toNode(): BelongsTo
    {
        return $this->belongsTo(WritingMindmapNode::class, 'to_node_id');
    }

    /**
     * Reverse the direction of the connection
     */
    public function reverse(): self
    {
        $temp = $this->from_node_id;
        $this->from_node_id = $this->to_node_id;
        $this->to_node_id = $temp;

        if ($this->connection_type === 'one-way') {
            // Optionally update relationship type for reversed connection
            $reverseTypes = [
                'leads-to' => 'follows',
                'causes' => 'caused-by',
                'parent' => 'child',
                'contains' => 'part-of',
            ];

            if (isset($reverseTypes[$this->relationship_type])) {
                $this->relationship_type = $reverseTypes[$this->relationship_type];
            }
        }

        $this->save();

        return $this;
    }

    /**
     * Convert connection to bidirectional
     */
    public function makeBidirectional(): self
    {
        $this->connection_type = 'two-way';
        $this->save();

        return $this;
    }

    /**
     * Check if this connection creates a circular dependency
     */
    public function createsCircularDependency(): bool
    {
        if ($this->from_node_id === $this->to_node_id) {
            return true;
        }

        // Check for circular path
        $visited = [$this->from_node_id];
        $queue = [$this->to_node_id];

        while (!empty($queue)) {
            $current = array_shift($queue);

            if (in_array($current, $visited)) {
                return true;
            }

            $visited[] = $current;

            // Get all connections from current node
            $nextConnections = self::where('from_node_id', $current)
                ->where('mindmap_id', $this->mindmap_id)
                ->pluck('to_node_id')
                ->toArray();

            $queue = array_merge($queue, $nextConnections);
        }

        return false;
    }
}