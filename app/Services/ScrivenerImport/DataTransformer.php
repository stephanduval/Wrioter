<?php

namespace App\Services\ScrivenerImport;

use Illuminate\Support\Str;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use App\Services\ScrivenerImport\RtfConverter;

class DataTransformer
{
    private RtfConverter $rtfConverter;

    public function __construct(RtfConverter $rtfConverter)
    {
        $this->rtfConverter = $rtfConverter;
    }

    /**
     * Transform manuscript data
     *
     * @param array $data Parsed XML data
     * @return array Transformed manuscript data
     */
    public function transformManuscript(array $data): array
    {
        $project = $data['project'];
        $settings = $data['settings'];

        return [
            'title' => $project['Title'],
            'description' => $project['Synopsis'],
            'status' => 'draft',
            'manuscript_type' => 'scrivener',
            'scrivener_uuid' => $project['UUID'],
            'version' => $project['Version'],
            'imported_at' => now(),
            'project_settings' => [
                'labels' => $settings['ProjectSettings']['Labels'] ?? [],
                'statuses' => $settings['ProjectSettings']['Statuses'] ?? [],
                'keywords' => $settings['ProjectSettings']['Keywords'] ?? [],
            ],
            'compile_settings' => $settings['CompileSettings'] ?? [],
            'custom_metadata' => [
                'created' => $project['Created'],
                'modified' => $project['Modified'],
            ],
        ];
    }

    /**
     * Transform items data
     *
     * @param array $data Parsed XML data
     * @return array Transformed items data
     */
    public function transformItems(array $data): array
    {
        \Log::debug('Starting Item Transformation', [
            'binder_items_count' => count($data['binder']['items']),
            'research_items_count' => count($data['research']['items'])
        ]);
        
        // Track unique items by UUID and their parent relationships
        $uniqueItems = [];
        $parentRelationships = [];
        
        // Process binder items
        $this->transformBinderItemsWithRelationships($data['binder']['items'], $uniqueItems, $parentRelationships);
        \Log::debug('After binder transformation', [
            'unique_items_count' => count($uniqueItems),
            'parent_relationships_count' => count($parentRelationships)
        ]);
        
        // Process research items
        $researchCount = count($uniqueItems);
        $this->transformResearchItemsWithRelationships($data['research']['items'], $uniqueItems, $parentRelationships);
        \Log::debug('After research transformation', [
            'unique_items_count' => count($uniqueItems),
            'research_items_added' => count($uniqueItems) - $researchCount
        ]);
        
        // Convert unique items to array and add parent relationships
        $items = [];
        foreach ($uniqueItems as $uuid => $item) {
            $item['parent_relationships'] = $parentRelationships[$uuid] ?? [];
            $items[] = $item;
        }
        
        \Log::debug('Item transformation completed', [
            'final_item_count' => count($items),
            'total_parent_relationships' => array_sum(array_map('count', $parentRelationships))
        ]);
        
        return $items;
    }

    /**
     * Transform collections data
     *
     * @param array $data Parsed XML data
     * @return array Transformed collections data
     */
    public function transformCollections(array $data): array
    {
        $collections = [];
        foreach ($data['collections'] as $collection) {
            if (empty($collection['UUID']) || empty($collection['Title'])) {
                continue; // Skip invalid collections
            }
            $collections[] = [
                'collection_id' => $collection['UUID'],
                'title' => $collection['Title'],
                'type' => $this->mapCollectionType($collection['Type'] ?? null),
                'color' => $collection['Color'] ?? null,
                'search_settings' => $collection['SearchSettings'] ?? null,
                'item_uuids' => $collection['BinderUUIDs'] ?? [],
                'order_index' => 0, // Will be set during import
            ];
        }
        return $collections;
    }

    /**
     * Transform writing history data
     *
     * @param array $data Parsed XML data
     * @return array Transformed writing history data
     */
    public function transformWritingHistory(array $data): array
    {
        // Scrivener doesn't store writing history in the project file
        // This is a placeholder for future implementation
        return [
            [
                'date' => now()->toDateString(),
                'draft_word_count' => $this->calculateTotalWordCount($data['binder']['items']),
                'draft_char_count' => $this->calculateTotalCharCount($data['binder']['items']),
                'other_word_count' => $this->calculateTotalWordCount($data['research']['items']),
                'other_char_count' => $this->calculateTotalCharCount($data['research']['items']),
                'session_word_count' => 0,
                'session_char_count' => 0,
                'total_word_count' => 0,
                'total_char_count' => 0,
                'active_manuscripts' => 1,
            ],
        ];
    }

    /**
     * Transform binder items while tracking parent relationships
     */
    private function transformBinderItemsWithRelationships(
        array $items,
        array &$uniqueItems,
        array &$parentRelationships,
        ?string $parentId = null,
        int $order = 0
    ): void {
        foreach ($items as $item) {
            $uuid = $item['UUID'];
            
            // Store parent relationship
            if ($parentId) {
                if (!isset($parentRelationships[$uuid])) {
                    $parentRelationships[$uuid] = [];
                }
                $parentRelationships[$uuid][] = [
                    'parent_uuid' => $parentId,
                    'order' => $order
                ];
            }
            
            // Only store the item if we haven't seen it before
            if (!isset($uniqueItems[$uuid])) {
                $uniqueItems[$uuid] = [
                    'type' => $this->mapItemType($item['Type']),
                    'title' => $item['Title'],
                    'content' => $item['Content']['Text'] ?? '',
                    'synopsis' => $item['MetaData']['Synopsis'] ?? '',
                    'item_order' => $order,
                    'metadata' => [
                        'icon' => $item['MetaData']['Icon'] ?? null,
                        'label' => $item['MetaData']['Label'] ?? null,
                        'status' => $item['MetaData']['Status'] ?? null,
                    ],
                    'scrivener_uuid' => $uuid,
                    'folder_type' => $item['Type'],
                    'icon_name' => $item['MetaData']['Icon'] ?? null,
                    'include_in_compile' => $item['MetaData']['IncludeInCompile'] ?? true,
                    'target_type' => $item['MetaData']['TargetType'] ?? null,
                    'target_count' => $item['MetaData']['TargetCount'] ?? null,
                    'target_notify' => $item['MetaData']['TargetNotify'] ?? false,
                    'format_metadata' => [
                        'rtf' => $item['Content']['RTF'] ?? null,
                    ],
                    'content_markdown' => $this->convertRtfToMarkdown($item['Content']['RTF'] ?? ''),
                    'raw_content' => $this->stripContent($item['Content']['Text'] ?? ''),
                    'content_format' => 'markdown',
                    'word_count' => $this->countWords($item['Content']['Text'] ?? ''),
                    'character_count' => $this->countCharacters($item['Content']['Text'] ?? ''),
                    'created_at' => $this->parseDate($item['MetaData']['Created'] ?? null),
                    'updated_at' => $this->parseDate($item['MetaData']['Modified'] ?? null),
                ];
            }

            if (!empty($item['Children'])) {
                $this->transformBinderItemsWithRelationships($item['Children'], $uniqueItems, $parentRelationships, $uuid, 0);
            }
        }
    }

    /**
     * Transform research items while tracking parent relationships
     */
    private function transformResearchItemsWithRelationships(
        array $items,
        array &$uniqueItems,
        array &$parentRelationships
    ): void {
        \Log::debug('Processing Research Items');
        foreach ($items as $item) {
            $uuid = $item['UUID'];
            
            // Only store the item if we haven't seen it before
            if (!isset($uniqueItems[$uuid])) {
                $uniqueItems[$uuid] = [
                    'type' => 'research',
                    'title' => $item['Title'],
                    'content' => $item['Content']['Text'] ?? '',
                    'synopsis' => $item['MetaData']['Synopsis'] ?? '',
                    'item_order' => 0,
                    'metadata' => [
                        'icon' => $item['MetaData']['Icon'] ?? null,
                        'label' => $item['MetaData']['Label'] ?? null,
                        'status' => $item['MetaData']['Status'] ?? null,
                        'file_type' => $this->determineFileType($item),
                        'file_path' => $this->determineFilePath($item),
                    ],
                    'scrivener_uuid' => $uuid,
                    'folder_type' => $item['Type'],
                    'icon_name' => $item['MetaData']['Icon'] ?? null,
                    'include_in_compile' => false,
                    'format_metadata' => [
                        'rtf' => $item['Content']['RTF'] ?? null,
                        'file_info' => $this->getFileInfo($item),
                    ],
                    'content_markdown' => $this->convertRtfToMarkdown($item['Content']['RTF'] ?? ''),
                    'raw_content' => $this->stripContent($item['Content']['Text'] ?? ''),
                    'content_format' => 'markdown',
                    'word_count' => $this->countWords($item['Content']['Text'] ?? ''),
                    'character_count' => $this->countCharacters($item['Content']['Text'] ?? ''),
                    'created_at' => $this->parseDate($item['MetaData']['Created'] ?? null),
                    'updated_at' => $this->parseDate($item['MetaData']['Modified'] ?? null),
                ];
            }
        }
    }

    /**
     * Map Scrivener item type to Wrioter item type
     */
    private function mapItemType(string $type): string
    {
        // Scrivener types: 'folder', 'text', 'file', etc.
        return match (strtolower($type)) {
            'folder' => 'folder',
            'text' => 'text',
            'file' => 'file',
            'image' => 'image',
            'mindmap' => 'mindmap',
            'link' => 'link',
            default => 'text', // fallback for unknown types
        };
    }

    /**
     * Map Scrivener collection type to our type
     *
     * @param ?string $type Scrivener collection type
     * @return string Mapped type
     */
    private function mapCollectionType(?string $type): string
    {
        if (empty($type)) {
            return 'Arbitrary';
        }
        return match(strtolower($type)) {
            'binder' => 'Binder',
            'search' => 'RecentSearch',
            default => 'Arbitrary',
        };
    }

    /**
     * Convert RTF content to Markdown
     *
     * @param string $rtf RTF content
     * @return string Markdown content
     */
    private function convertRtfToMarkdown(string $rtf): string
    {
        return $this->rtfConverter->convert($rtf);
    }

    /**
     * Strip content for search
     *
     * @param string $content Content to strip
     * @return string Stripped content
     */
    private function stripContent(string $content): string
    {
        return strip_tags($content);
    }

    /**
     * Count words in content
     *
     * @param string $content Content to count
     * @return int Word count
     */
    private function countWords(string $content): int
    {
        return str_word_count(strip_tags($content));
    }

    /**
     * Count characters in content
     *
     * @param string $content Content to count
     * @return int Character count
     */
    private function countCharacters(string $content): int
    {
        return mb_strlen(strip_tags($content));
    }

    /**
     * Calculate total word count for items
     *
     * @param array $items Items to count
     * @return int Total word count
     */
    private function calculateTotalWordCount(array $items): int
    {
        $count = 0;
        foreach ($items as $item) {
            $count += $this->countWords($item['Content']['Text'] ?? '');
            if (!empty($item['Children'])) {
                $count += $this->calculateTotalWordCount($item['Children']);
            }
        }
        return $count;
    }

    /**
     * Calculate total character count for items
     *
     * @param array $items Items to count
     * @return int Total character count
     */
    private function calculateTotalCharCount(array $items): int
    {
        $count = 0;
        foreach ($items as $item) {
            $count += $this->countCharacters($item['Content']['Text'] ?? '');
            if (!empty($item['Children'])) {
                $count += $this->calculateTotalCharCount($item['Children']);
            }
        }
        return $count;
    }

    /**
     * Parse a date string
     *
     * @param ?string $date Date string to parse
     * @return ?Carbon Parsed date
     */
    private function parseDate(?string $date): ?Carbon
    {
        if (!$date) {
            return null;
        }

        try {
            return Carbon::parse($date);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Determine file type for research item
     *
     * @param array $item Research item
     * @return string File type
     */
    private function determineFileType(array $item): string
    {
        $type = strtolower($item['Type']);
        return match($type) {
            'pdf' => 'pdf',
            'image' => 'image',
            'webarchive' => 'web',
            'movie' => 'video',
            'sound' => 'audio',
            default => 'document',
        };
    }

    /**
     * Determine file path for research item
     *
     * @param array $item Research item
     * @return ?string File path
     */
    private function determineFilePath(array $item): ?string
    {
        // TODO: Implement file path determination
        return null;
    }

    /**
     * Get file information for research item
     *
     * @param array $item Research item
     * @return array File information
     */
    private function getFileInfo(array $item): array
    {
        // TODO: Implement file info extraction
        return [
            'original_name' => $item['Title'],
            'mime_type' => $this->getMimeType($item['Type']),
            'size' => 0,
        ];
    }

    /**
     * Get MIME type for file type
     *
     * @param string $type File type
     * @return string MIME type
     */
    private function getMimeType(string $type): string
    {
        return match(strtolower($type)) {
            'pdf' => 'application/pdf',
            'image' => 'image/jpeg',
            'webarchive' => 'application/x-webarchive',
            'movie' => 'video/mp4',
            'sound' => 'audio/mpeg',
            default => 'application/octet-stream',
        };
    }
} 
