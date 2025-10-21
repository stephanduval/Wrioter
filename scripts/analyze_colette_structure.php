<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\RtfConverter;

$xmlPath = '/home/rogers/Code/Wrioter/Scrivener Zip Files/Colette Graphic Novel [2025_06_01_05_14_50]/Colette Graphic Novel.scriv/Colette Graphic Novel.scrivx';

$parser = new XmlParser(new RtfConverter());
$xmlData = $parser->parse($xmlPath);

echo "Project Title: " . $xmlData['project']['Title'] . "\n";
echo "Project UUID: " . $xmlData['project']['UUID'] . "\n";
echo "\n";

// Count binder items
function countItems($items) {
    $count = count($items);
    foreach ($items as $item) {
        if (!empty($item['Children'])) {
            $count += countItems($item['Children']);
        }
    }
    return $count;
}

// List all UUIDs in binder
function listUUIDs($items, $prefix = '') {
    $uuids = [];
    foreach ($items as $item) {
        $uuids[] = $prefix . $item['UUID'] . ' - ' . $item['Title'] . ' (' . $item['Type'] . ')';
        if (!empty($item['Children'])) {
            $childUuids = listUUIDs($item['Children'], $prefix . '  ');
            $uuids = array_merge($uuids, $childUuids);
        }
    }
    return $uuids;
}

echo "Binder Items: " . countItems($xmlData['binder']['items']) . "\n";
$binderUuids = listUUIDs($xmlData['binder']['items']);
echo "Binder structure:\n";
foreach ($binderUuids as $uuid) {
    echo $uuid . "\n";
}

echo "\nResearch Items: " . countItems($xmlData['research']['items']) . "\n";
if (!empty($xmlData['research']['items'])) {
    $researchUuids = listUUIDs($xmlData['research']['items']);
    echo "Research structure:\n";
    foreach ($researchUuids as $uuid) {
        echo $uuid . "\n";
    }
}

// Check which UUIDs have RTF files
$dataPath = '/home/rogers/Code/Wrioter/Scrivener Zip Files/Colette Graphic Novel [2025_06_01_05_14_50]/Colette Graphic Novel.scriv/Files/Data';
$rtfFiles = [];
foreach (scandir($dataPath) as $folder) {
    if ($folder === '.' || $folder === '..') continue;
    $rtfPath = $dataPath . '/' . $folder . '/content.rtf';
    if (file_exists($rtfPath)) {
        $rtfFiles[$folder] = filesize($rtfPath);
    }
}

echo "\nRTF files found: " . count($rtfFiles) . "\n";
echo "Total data folders: " . (count(scandir($dataPath)) - 2) . "\n";

// Find RTF files not in binder
$allBinderUuids = [];
function collectUUIDs($items, &$collection) {
    foreach ($items as $item) {
        $collection[] = $item['UUID'];
        if (!empty($item['Children'])) {
            collectUUIDs($item['Children'], $collection);
        }
    }
}

collectUUIDs($xmlData['binder']['items'], $allBinderUuids);
collectUUIDs($xmlData['research']['items'] ?? [], $allBinderUuids);

$orphanedRtfs = array_diff(array_keys($rtfFiles), $allBinderUuids);
echo "\nRTF files not referenced in binder/research: " . count($orphanedRtfs) . "\n";
if (count($orphanedRtfs) > 0 && count($orphanedRtfs) < 20) {
    foreach ($orphanedRtfs as $uuid) {
        echo "  - $uuid (size: " . $rtfFiles[$uuid] . " bytes)\n";
    }
}