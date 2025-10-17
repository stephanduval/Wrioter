<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WritingMindmap;
use App\Models\WritingMindmapNode;
use App\Models\MindmapNodeConnection;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MindMapController extends Controller
{
    /**
     * Display a listing of mindmaps.
     */
    public function index(Request $request): JsonResponse
    {
        $mindmaps = WritingMindmap::where('user_id', Auth::id())
            ->when($request->get('archived'), function ($query) use ($request) {
                return $query->where('is_archived', $request->get('archived') === 'true');
            })
            ->when($request->get('is_template'), function ($query) use ($request) {
                return $query->where('is_template', $request->get('is_template') === 'true');
            })
            ->orderBy('updated_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($mindmaps);
    }

    /**
     * Store a newly created mindmap.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:191',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'format' => 'nullable|in:internal,opml,freemind,xmind',
            'is_template' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
        ]);

        $mindmap = WritingMindmap::create([
            ...$validated,
            'user_id' => Auth::id(),
            'format' => $validated['format'] ?? 'internal',
        ]);

        // Create root node
        $rootNode = WritingMindmapNode::create([
            'mindmap_id' => $mindmap->id,
            'content' => $mindmap->title,
            'position' => ['x' => 0, 'y' => 0],
            'node_type' => 'root',
            'order_index' => 0,
        ]);

        $mindmap->load('nodes');

        return response()->json($mindmap, 201);
    }

    /**
     * Display the specified mindmap.
     */
    public function show($id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())
            ->with(['nodes.outgoingConnections', 'nodes.incomingConnections'])
            ->findOrFail($id);

        // Get all connections for the mindmap
        $connections = MindmapNodeConnection::where('mindmap_id', $id)->get();

        return response()->json([
            'mindmap' => $mindmap,
            'connections' => $connections,
        ]);
    }

    /**
     * Update the specified mindmap.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:191',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'is_template' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
            'is_archived' => 'nullable|boolean',
        ]);

        $mindmap->update($validated);

        if ($request->get('is_archived') === true) {
            $mindmap->archived_at = now();
            $mindmap->save();
        } elseif ($request->get('is_archived') === false) {
            $mindmap->archived_at = null;
            $mindmap->save();
        }

        return response()->json($mindmap);
    }

    /**
     * Remove the specified mindmap.
     */
    public function destroy($id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        DB::transaction(function () use ($mindmap) {
            // Cascading deletes will handle nodes and connections
            $mindmap->delete();
        });

        return response()->json(['message' => 'Mindmap deleted successfully']);
    }

    /**
     * Export mindmap in specified format.
     */
    public function export($id, Request $request): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())
            ->with(['nodes', 'nodes.outgoingConnections', 'nodes.incomingConnections'])
            ->findOrFail($id);

        $format = $request->get('format', 'json');

        switch ($format) {
            case 'json':
                return response()->json($this->exportAsJson($mindmap));

            case 'graphml':
                return response()->json([
                    'format' => 'graphml',
                    'content' => $this->exportAsGraphML($mindmap),
                ]);

            case 'markdown':
                return response()->json([
                    'format' => 'markdown',
                    'content' => $this->exportAsMarkdown($mindmap),
                ]);

            default:
                return response()->json(['error' => 'Unsupported export format'], 400);
        }
    }

    /**
     * Export mindmap as JSON.
     */
    private function exportAsJson($mindmap): array
    {
        $connections = MindmapNodeConnection::where('mindmap_id', $mindmap->id)->get();

        return [
            'mindmap' => [
                'id' => $mindmap->id,
                'title' => $mindmap->title,
                'description' => $mindmap->description,
                'settings' => $mindmap->settings,
            ],
            'nodes' => $mindmap->nodes->map(function ($node) {
                return [
                    'id' => $node->id,
                    'content' => $node->content,
                    'position' => $node->position,
                    'style' => $node->style,
                    'parent_id' => $node->parent_id,
                    'node_type' => $node->node_type,
                ];
            }),
            'connections' => $connections->map(function ($connection) {
                return [
                    'id' => $connection->id,
                    'from' => $connection->from_node_id,
                    'to' => $connection->to_node_id,
                    'type' => $connection->connection_type,
                    'relationship' => $connection->relationship_type,
                    'strength' => $connection->strength,
                    'label' => $connection->label,
                ];
            }),
        ];
    }

    /**
     * Export mindmap as GraphML.
     */
    private function exportAsGraphML($mindmap): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">';
        $xml .= '<graph id="' . $mindmap->id . '" edgedefault="directed">';

        // Add nodes
        foreach ($mindmap->nodes as $node) {
            $xml .= '<node id="n' . $node->id . '">';
            $xml .= '<data key="label">' . htmlspecialchars($node->content) . '</data>';
            $xml .= '<data key="x">' . ($node->position['x'] ?? 0) . '</data>';
            $xml .= '<data key="y">' . ($node->position['y'] ?? 0) . '</data>';
            $xml .= '</node>';
        }

        // Add connections
        $connections = MindmapNodeConnection::where('mindmap_id', $mindmap->id)->get();
        foreach ($connections as $connection) {
            $xml .= '<edge id="e' . $connection->id . '" source="n' . $connection->from_node_id . '" target="n' . $connection->to_node_id . '">';
            $xml .= '<data key="relationship">' . htmlspecialchars($connection->relationship_type) . '</data>';
            $xml .= '<data key="type">' . $connection->connection_type . '</data>';
            $xml .= '<data key="strength">' . $connection->strength . '</data>';
            if ($connection->label) {
                $xml .= '<data key="label">' . htmlspecialchars($connection->label) . '</data>';
            }
            $xml .= '</edge>';
        }

        $xml .= '</graph>';
        $xml .= '</graphml>';

        return $xml;
    }

    /**
     * Export mindmap as Markdown.
     */
    private function exportAsMarkdown($mindmap): string
    {
        $markdown = "# " . $mindmap->title . "\n\n";

        if ($mindmap->description) {
            $markdown .= $mindmap->description . "\n\n";
        }

        $markdown .= "## Nodes\n\n";

        // Build hierarchical structure
        $rootNodes = $mindmap->nodes->where('parent_id', null);
        foreach ($rootNodes as $rootNode) {
            $markdown .= $this->nodeToMarkdown($rootNode, 0);
        }

        // Add connections
        $connections = MindmapNodeConnection::where('mindmap_id', $mindmap->id)->get();
        if ($connections->isNotEmpty()) {
            $markdown .= "\n## Connections\n\n";
            foreach ($connections as $connection) {
                $fromNode = $mindmap->nodes->find($connection->from_node_id);
                $toNode = $mindmap->nodes->find($connection->to_node_id);

                $arrow = $connection->connection_type === 'two-way' ? '↔' : '→';
                $markdown .= "- " . $fromNode->content . " " . $arrow . " " . $toNode->content;
                $markdown .= " (" . $connection->relationship_type . ", " . $connection->strength . ")\n";
            }
        }

        return $markdown;
    }

    /**
     * Convert node to markdown recursively.
     */
    private function nodeToMarkdown($node, $level): string
    {
        $indent = str_repeat('  ', $level);
        $markdown = $indent . "- " . $node->content . "\n";

        foreach ($node->children as $child) {
            $markdown .= $this->nodeToMarkdown($child, $level + 1);
        }

        return $markdown;
    }

    /**
     * Clone a mindmap as template.
     */
    public function cloneAsTemplate($id): JsonResponse
    {
        $originalMindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        DB::transaction(function () use ($originalMindmap, &$newMindmap) {
            // Create new mindmap
            $newMindmap = WritingMindmap::create([
                'user_id' => Auth::id(),
                'title' => $originalMindmap->title . ' (Copy)',
                'description' => $originalMindmap->description,
                'settings' => $originalMindmap->settings,
                'format' => $originalMindmap->format,
                'is_template' => false,
            ]);

            // Clone nodes
            $nodeMapping = [];
            foreach ($originalMindmap->nodes as $originalNode) {
                $newNode = WritingMindmapNode::create([
                    'mindmap_id' => $newMindmap->id,
                    'parent_id' => isset($nodeMapping[$originalNode->parent_id])
                        ? $nodeMapping[$originalNode->parent_id]
                        : null,
                    'content' => $originalNode->content,
                    'position' => $originalNode->position,
                    'style' => $originalNode->style,
                    'node_type' => $originalNode->node_type,
                    'is_collapsed' => $originalNode->is_collapsed,
                    'order_index' => $originalNode->order_index,
                    'metadata' => $originalNode->metadata,
                ]);

                $nodeMapping[$originalNode->id] = $newNode->id;
            }

            // Clone connections
            $originalConnections = MindmapNodeConnection::where('mindmap_id', $originalMindmap->id)->get();
            foreach ($originalConnections as $originalConnection) {
                MindmapNodeConnection::create([
                    'mindmap_id' => $newMindmap->id,
                    'from_node_id' => $nodeMapping[$originalConnection->from_node_id],
                    'to_node_id' => $nodeMapping[$originalConnection->to_node_id],
                    'connection_type' => $originalConnection->connection_type,
                    'relationship_type' => $originalConnection->relationship_type,
                    'strength' => $originalConnection->strength,
                    'style' => $originalConnection->style,
                    'label' => $originalConnection->label,
                    'metadata' => $originalConnection->metadata,
                ]);
            }
        });

        return response()->json($newMindmap->load('nodes'), 201);
    }
}