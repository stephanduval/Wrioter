<?php

namespace App\Services\ScrivenerImport;

use DOMDocument;
use DOMElement;
use DOMNodeList;
use RuntimeException;
use Illuminate\Support\Str;

class XmlParser
{
    private const REQUIRED_ELEMENTS = [
        'Project',
        'Binder',
        'Settings',
        'Version',
        'UUID',
    ];

    private const REQUIRED_BINDER_ELEMENTS = [
        'Children',
        'Type',
        'Title',
    ];

    /**
     * Parse the Scrivener project XML file
     *
     * @param string $xmlPath Path to the project.scrivx file
     * @return array Structured data from the XML
     * @throws RuntimeException if parsing fails
     */
    public function parse(string $xmlPath): array
    {
        if (!file_exists($xmlPath) || !is_readable($xmlPath)) {
            throw new RuntimeException("XML file not found or not readable: {$xmlPath}");
        }

        $dom = new DOMDocument();
        $dom->preserveWhiteSpace = false;
        
        if (!$dom->load($xmlPath)) {
            throw new RuntimeException("Failed to load XML file");
        }

        $root = $dom->documentElement;
        if ($root->nodeName !== 'ScrivenerProject') {
            throw new RuntimeException("Invalid root element: {$root->nodeName}");
        }

        return [
            'project' => $this->parseProject($root),
            'binder' => $this->parseBinder($root),
            'settings' => $this->parseSettings($root),
            'research' => $this->parseResearch($root),
            'collections' => $this->parseCollections($root),
        ];
    }

    /**
     * Validate the parsed data structure
     *
     * @param array $data Parsed XML data
     * @return bool True if valid, false otherwise
     */
    public function validate(array $data): bool
    {
        // Check required project fields
        $requiredProjectFields = ['UUID', 'Version', 'Title'];
        foreach ($requiredProjectFields as $field) {
            if (empty($data['project'][$field])) {
                \Log::error('Scrivener import validation failed: missing project field', ['field' => $field, 'data' => $data['project']]);
                return false;
            }
        }

        // Validate project UUID
        if (!Str::isUuid($data['project']['UUID'])) {
            \Log::error('Scrivener import validation failed: invalid UUID', ['uuid' => $data['project']['UUID']]);
            return false;
        }

        // Validate binder structure
        if (!isset($data['binder']['items']) || !is_array($data['binder']['items'])) {
            \Log::error('Scrivener import validation failed: binder items missing or not array', ['binder' => $data['binder']]);
            return false;
        }

        // Validate each binder item
        foreach ($data['binder']['items'] as $item) {
            foreach (['Type', 'Title'] as $element) {
                if (!isset($item[$element])) {
                    \Log::error('Scrivener import validation failed: binder item missing element', ['element' => $element, 'item' => $item]);
                    return false;
                }
            }
            // Validate item UUID if present
            if (isset($item['UUID']) && !Str::isUuid($item['UUID'])) {
                \Log::error('Scrivener import validation failed: binder item invalid UUID', ['uuid' => $item['UUID'], 'item' => $item]);
                return false;
            }
        }

        return true;
    }

    /**
     * Extract metadata from the parsed data
     *
     * @param array $data Parsed XML data
     * @return array Extracted metadata
     */
    public function extractMetadata(array $data): array
    {
        return [
            'project' => [
                'title' => $data['project']['Title'] ?? null,
                'uuid' => $data['project']['UUID'] ?? null,
                'version' => $data['project']['Version'] ?? null,
                'created' => $data['project']['Created'] ?? null,
                'modified' => $data['project']['Modified'] ?? null,
            ],
            'statistics' => [
                'binder_items' => count($data['binder']['items'] ?? []),
                'research_items' => count($data['research']['items'] ?? []),
                'collections' => count($data['collections'] ?? []),
            ],
            'settings' => [
                'compile_settings' => $data['settings']['CompileSettings'] ?? [],
                'project_settings' => $data['settings']['ProjectSettings'] ?? [],
            ],
        ];
        }

    /**
     * Parse the Project element
     *
     * @param DOMElement $root Root element
     * @return array Project data
     */
    private function parseProject(DOMElement $root): array
    {
        $project = $root->getElementsByTagName('Project')->item(0);
        if ($project) {
            return [
                'Title' => $this->getElementText($project, 'Title'),
                'UUID' => $this->getElementText($project, 'UUID'),
                'Version' => $this->getElementText($project, 'Version'),
                'Created' => $this->getElementText($project, 'Created'),
                'Modified' => $this->getElementText($project, 'Modified'),
                'Synopsis' => $this->getElementText($project, 'Synopsis'),
            ];
        }
        // Fallback: extract from root attributes or children
        $title = $root->getAttribute('Title') ?: $this->getElementText($root, 'Title');
        $uuid = $root->getAttribute('Identifier') ?: $this->getElementText($root, 'UUID');
        $version = $root->getAttribute('Version') ?: $this->getElementText($root, 'Version');
        $created = $root->getAttribute('Created') ?: $this->getElementText($root, 'Created');
        $modified = $root->getAttribute('Modified') ?: $this->getElementText($root, 'Modified');
        if (!$uuid) {
            throw new \RuntimeException('Project element not found');
        }
        return [
            'Title' => $title,
            'UUID' => $uuid,
            'Version' => $version,
            'Created' => $created,
            'Modified' => $modified,
            'Synopsis' => $this->getElementText($root, 'Synopsis'),
        ];
    }

    /**
     * Parse the Binder element
     *
     * @param DOMElement $root Root element
     * @return array Binder data
     */
    private function parseBinder(DOMElement $root): array
    {
        $binder = $root->getElementsByTagName('Binder')->item(0);
        if (!$binder) {
            throw new RuntimeException('Binder element not found');
        }

        $children = $binder->getElementsByTagName('Children')->item(0);
        if (!$children) {
            throw new RuntimeException('Binder Children element not found');
        }

        return [
            'items' => $this->parseBinderItems($children->getElementsByTagName('BinderItem')),
        ];
        }

    /**
     * Parse BinderItem elements
     *
     * @param DOMNodeList $items List of BinderItem elements
     * @return array Array of parsed items
     */
    private function parseBinderItems(DOMNodeList $items): array
    {
        $parsedItems = [];
        foreach ($items as $item) {
            // Get UUID and Type from attribute or child element
            $uuid = $item->hasAttribute('UUID') ? $item->getAttribute('UUID') : $this->getElementText($item, 'UUID');
            $type = $item->hasAttribute('Type') ? $item->getAttribute('Type') : $this->getElementText($item, 'Type');
            $parsedItems[] = [
                'UUID' => $uuid,
                'Type' => $type,
                'Title' => $this->getElementText($item, 'Title'),
                'Children' => $this->parseBinderItems($item->getElementsByTagName('BinderItem')),
                'MetaData' => $this->parseMetaData($item),
                'Content' => $this->parseContent($item),
            ];
        }
        return $parsedItems;
    }

    /**
     * Parse the Settings element
     *
     * @param DOMElement $root Root element
     * @return array Settings data
     */
    private function parseSettings(DOMElement $root): array
    {
        $settings = $root->getElementsByTagName('Settings')->item(0);
        if (!$settings) {
            return [];
        }
        
        return [
            'CompileSettings' => $this->parseCompileSettings($settings),
            'ProjectSettings' => $this->parseProjectSettings($settings),
        ];
    }

    /**
     * Parse the Research element
     *
     * @param DOMElement $root Root element
     * @return array Research data
     */
    private function parseResearch(DOMElement $root): array
    {
        $research = $root->getElementsByTagName('Research')->item(0);
        if (!$research) {
            return ['items' => []];
        }

        $children = $research->getElementsByTagName('Children')->item(0);
        if (!$children) {
            return ['items' => []];
        }

        return [
            'items' => $this->parseBinderItems($children->getElementsByTagName('BinderItem')),
        ];
    }

    /**
     * Parse the Collections element
     *
     * @param DOMElement $root Root element
     * @return array Collections data
     */
    private function parseCollections(DOMElement $root): array
    {
        $collections = $root->getElementsByTagName('Collections')->item(0);
        if (!$collections) {
            return [];
        }

        $parsedCollections = [];
        foreach ($collections->getElementsByTagName('Collection') as $collection) {
            $parsedCollections[] = [
                'UUID' => $this->getElementText($collection, 'UUID'),
                'Title' => $this->getElementText($collection, 'Title'),
                'Type' => $this->getElementText($collection, 'Type'),
                'Color' => $this->getElementText($collection, 'Color'),
                'SearchSettings' => $this->parseSearchSettings($collection),
                'BinderUUIDs' => $this->parseBinderUUIDs($collection),
        ];
        }
        return $parsedCollections;
    }

    /**
     * Parse MetaData element
     *
     * @param DOMElement $item BinderItem element
     * @return array MetaData
     */
    private function parseMetaData(DOMElement $item): array
    {
        $metaData = $item->getElementsByTagName('MetaData')->item(0);
        if (!$metaData) {
            return [];
        }

        return [
            'IncludeInCompile' => $this->getElementText($metaData, 'IncludeInCompile') === 'true',
            'TargetType' => $this->getElementText($metaData, 'TargetType'),
            'TargetCount' => (int) $this->getElementText($metaData, 'TargetCount'),
            'TargetNotify' => $this->getElementText($metaData, 'TargetNotify') === 'true',
        ];
    }

    /**
     * Parse Content element
     *
     * @param DOMElement $item BinderItem element
     * @return array Content data
     */
    private function parseContent(DOMElement $item): array
    {
        $content = $item->getElementsByTagName('Content')->item(0);
        if (!$content) {
            return [];
        }

        return [
            'Text' => $this->getElementText($content, 'Text'),
            'RTF' => $this->getElementText($content, 'RTF'),
        ];
    }

    /**
     * Parse CompileSettings element
     *
     * @param DOMElement $settings Settings element
     * @return array Compile settings
     */
    private function parseCompileSettings(DOMElement $settings): array
    {
        $compileSettings = $settings->getElementsByTagName('CompileSettings')->item(0);
        if (!$compileSettings) {
            return [];
        }

        return [
            'Format' => $this->getElementText($compileSettings, 'Format'),
            'Target' => $this->getElementText($compileSettings, 'Target'),
            'Settings' => $this->parseSettingsElement($compileSettings),
        ];
    }

    /**
     * Parse ProjectSettings element
     *
     * @param DOMElement $settings Settings element
     * @return array Project settings
     */
    private function parseProjectSettings(DOMElement $settings): array
    {
        $projectSettings = $settings->getElementsByTagName('ProjectSettings')->item(0);
        if (!$projectSettings) {
            return [];
        }

        return [
            'Labels' => $this->parseLabels($projectSettings),
            'Statuses' => $this->parseStatuses($projectSettings),
            'Keywords' => $this->parseKeywords($projectSettings),
        ];
    }

    /**
     * Parse SearchSettings element
     *
     * @param DOMElement $collection Collection element
     * @return array Search settings
     */
    private function parseSearchSettings(DOMElement $collection): array
    {
        $searchSettings = $collection->getElementsByTagName('SearchSettings')->item(0);
        if (!$searchSettings) {
            return [];
        }
        
        return [
            'SearchString' => $this->getElementText($searchSettings, 'SearchString'),
            'SearchType' => $this->getElementText($searchSettings, 'SearchType'),
            'SearchOptions' => $this->parseSettingsElement($searchSettings),
        ];
    }

    /**
     * Parse BinderUUIDs element
     *
     * @param DOMElement $collection Collection element
     * @return array Array of UUIDs
     */
    private function parseBinderUUIDs(DOMElement $collection): array
    {
        $uuids = [];
        $binderUUIDs = $collection->getElementsByTagName('BinderUUID');
        foreach ($binderUUIDs as $uuid) {
            $uuids[] = $uuid->textContent;
        }
        return $uuids;
    }

    /**
     * Parse Labels element
     *
     * @param DOMElement $settings Settings element
     * @return array Labels
     */
    private function parseLabels(DOMElement $settings): array
    {
        $labels = [];
        $labelElements = $settings->getElementsByTagName('Label');
        foreach ($labelElements as $label) {
            $labels[] = [
                'Title' => $this->getElementText($label, 'Title'),
                'Color' => $this->getElementText($label, 'Color'),
            ];
        }
        return $labels;
    }

    /**
     * Parse Statuses element
     *
     * @param DOMElement $settings Settings element
     * @return array Statuses
     */
    private function parseStatuses(DOMElement $settings): array
    {
        $statuses = [];
        $statusElements = $settings->getElementsByTagName('Status');
        foreach ($statusElements as $status) {
            $statuses[] = [
                'Title' => $this->getElementText($status, 'Title'),
                'Color' => $this->getElementText($status, 'Color'),
            ];
        }
        return $statuses;
    }

    /**
     * Parse Keywords element
     *
     * @param DOMElement $settings Settings element
     * @return array Keywords
     */
    private function parseKeywords(DOMElement $settings): array
    {
        $keywords = [];
        $keywordElements = $settings->getElementsByTagName('Keyword');
        foreach ($keywordElements as $keyword) {
            $keywords[] = [
                'Title' => $this->getElementText($keyword, 'Title'),
                'Color' => $this->getElementText($keyword, 'Color'),
            ];
        }
        return $keywords;
    }

    /**
     * Parse a Settings element
     *
     * @param DOMElement $element Element containing settings
     * @return array Settings
     */
    private function parseSettingsElement(DOMElement $element): array
    {
        $settings = [];
        $settingElements = $element->getElementsByTagName('Setting');
        foreach ($settingElements as $setting) {
            $key = $setting->getAttribute('Key');
            $value = $setting->getAttribute('Value');
            if ($key) {
                $settings[$key] = $value;
            }
        }
        return $settings;
    }

    /**
     * Get text content of an element
     *
     * @param DOMElement $parent Parent element
     * @param string $tagName Tag name to find
     * @return string|null Text content or null if not found
     */
    private function getElementText(DOMElement $parent, string $tagName): ?string
    {
        $element = $parent->getElementsByTagName($tagName)->item(0);
        $value = $element ? $element->textContent : null;
        \Log::debug("getElementText called", [
            'parent_tag' => $parent->tagName,
            'seeking_tag' => $tagName,
            'found' => $element !== null,
            'value' => $value,
            'parent_attributes' => array_map(function($attr) { return $attr->value; }, iterator_to_array($parent->attributes ?? new \DOMNamedNodeMap())),
        ]);
        return $value;
    }
} 

