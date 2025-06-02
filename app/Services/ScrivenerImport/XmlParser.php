<?php

namespace App\Services\ScrivenerImport;

use SimpleXMLElement;
use DOMDocument;
use Exception;

class XmlParser
{
    /**
     * The parsed XML data
     */
    protected ?SimpleXMLElement $xml = null;

    /**
     * The path to the .scrivx file
     */
    protected string $filePath;

    /**
     * Create a new XML parser instance
     */
    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
    }

    /**
     * Parse the .scrivx file and return the parsed data
     *
     * @throws Exception if the file cannot be parsed
     * @return array The parsed project data
     */
    public function parse(): array
    {
        if (!file_exists($this->filePath)) {
            throw new Exception("Scrivener XML file not found: {$this->filePath}");
        }

        // Load and validate XML
        $this->loadXml();

        // Parse the project structure
        return [
            'project' => $this->parseProject(),
            'binder' => $this->parseBinder(),
            'research' => $this->parseResearch(),
            'metadata' => $this->parseMetadata(),
        ];
    }

    /**
     * Load and validate the XML file
     *
     * @throws Exception if the XML is invalid
     */
    protected function loadXml(): void
    {
        // First, validate the XML structure
        $dom = new DOMDocument();
        $dom->load($this->filePath);
        
        if (!$dom->schemaValidate(__DIR__ . '/schemas/scrivener.xsd')) {
            throw new Exception("Invalid Scrivener XML structure");
        }

        // Load as SimpleXML for easier parsing
        $this->xml = simplexml_load_file($this->filePath);
        if ($this->xml === false) {
            throw new Exception("Failed to parse Scrivener XML file");
        }
    }

    /**
     * Parse the project settings and metadata
     */
    protected function parseProject(): array
    {
        $project = $this->xml->ProjectSettings;
        
        return [
            'title' => (string)$project->ProjectTitle,
            'created' => (string)$project->CreationDate,
            'modified' => (string)$project->ModificationDate,
            'version' => (string)$project->Version,
            'type' => (string)$project->ProjectType,
            'settings' => $this->parseProjectSettings($project),
        ];
    }

    /**
     * Parse the binder (document structure)
     */
    protected function parseBinder(): array
    {
        $binder = $this->xml->Binder;
        $items = [];

        foreach ($binder->BinderItem as $item) {
            $items[] = $this->parseBinderItem($item);
        }

        return [
            'items' => $items,
            'structure' => $this->buildBinderStructure($items),
        ];
    }

    /**
     * Parse a single binder item
     */
    protected function parseBinderItem(SimpleXMLElement $item): array
    {
        return [
            'id' => (string)$item->ID,
            'type' => (string)$item->Type,
            'title' => (string)$item->Title,
            'uuid' => (string)$item->UUID,
            'created' => (string)$item->Created,
            'modified' => (string)$item->Modified,
            'children' => $this->parseBinderItemChildren($item),
            'content' => $this->parseBinderItemContent($item),
        ];
    }

    /**
     * Parse the children of a binder item
     */
    protected function parseBinderItemChildren(SimpleXMLElement $item): array
    {
        $children = [];
        if (isset($item->Children)) {
            foreach ($item->Children->BinderItem as $child) {
                $children[] = $this->parseBinderItem($child);
            }
        }
        return $children;
    }

    /**
     * Parse the content of a binder item
     */
    protected function parseBinderItemContent(SimpleXMLElement $item): ?array
    {
        if (!isset($item->Content)) {
            return null;
        }

        return [
            'text' => (string)$item->Content->Text,
            'rtf' => (string)$item->Content->RTF,
            'word_count' => (int)$item->Content->WordCount,
            'page_count' => (int)$item->Content->PageCount,
        ];
    }

    /**
     * Parse the research folder contents
     */
    protected function parseResearch(): array
    {
        $research = $this->xml->Research;
        $items = [];

        if (isset($research->BinderItem)) {
            foreach ($research->BinderItem as $item) {
                $items[] = $this->parseBinderItem($item);
            }
        }

        return [
            'items' => $items,
            'structure' => $this->buildBinderStructure($items),
        ];
    }

    /**
     * Parse project settings
     */
    protected function parseProjectSettings(SimpleXMLElement $project): array
    {
        return [
            'compile_format' => (string)$project->CompileFormat,
            'compile_separator' => (string)$project->CompileSeparator,
            'page_size' => [
                'width' => (float)$project->PageSize->Width,
                'height' => (float)$project->PageSize->Height,
            ],
            'page_margins' => [
                'top' => (float)$project->PageMargins->Top,
                'bottom' => (float)$project->PageMargins->Bottom,
                'left' => (float)$project->PageMargins->Left,
                'right' => (float)$project->PageMargins->Right,
            ],
        ];
    }

    /**
     * Parse metadata
     */
    protected function parseMetadata(): array
    {
        $metadata = $this->xml->MetaData;
        
        return [
            'author' => (string)$metadata->Author,
            'description' => (string)$metadata->Description,
            'keywords' => (string)$metadata->Keywords,
            'custom_metadata' => $this->parseCustomMetadata($metadata),
        ];
    }

    /**
     * Parse custom metadata fields
     */
    protected function parseCustomMetadata(SimpleXMLElement $metadata): array
    {
        $custom = [];
        if (isset($metadata->CustomMetaData)) {
            foreach ($metadata->CustomMetaData->MetaDataItem as $item) {
                $custom[(string)$item->Key] = (string)$item->Value;
            }
        }
        return $custom;
    }

    /**
     * Build a hierarchical structure from flat binder items
     */
    protected function buildBinderStructure(array $items, ?string $parentId = null): array
    {
        $structure = [];
        foreach ($items as $item) {
            if ($item['parent_id'] === $parentId) {
                $item['children'] = $this->buildBinderStructure($items, $item['id']);
                $structure[] = $item;
            }
        }
        return $structure;
    }
} 
