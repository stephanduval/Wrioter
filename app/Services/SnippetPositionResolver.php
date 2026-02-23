<?php

namespace App\Services;

class SnippetPositionResolver
{
    /**
     * Try to get text at the specified position from HTML content.
     * Falls back to anchor-based matching if position fails.
     */
    public function getTextAtPosition(
        string $html,
        array $positionData,
        ?string $anchorBefore = null,
        ?string $anchorAfter = null,
        ?string $originalText = null
    ): ?string {
        // First try position-based extraction
        $text = $this->extractByPosition($html, $positionData);

        if ($text !== null) {
            return $text;
        }

        // Fall back to anchor-based matching
        if ($anchorBefore !== null || $anchorAfter !== null) {
            $text = $this->findByAnchors($html, $anchorBefore, $anchorAfter, $originalText);
            if ($text !== null) {
                return $text;
            }
        }

        // Last resort: try to find the original text directly
        if ($originalText !== null) {
            $text = $this->findExactMatch($html, $originalText);
            if ($text !== null) {
                return $text;
            }
        }

        return null;
    }

    /**
     * Extract text by character position from plain text content.
     */
    protected function extractByPosition(string $html, array $positionData): ?string
    {
        $from = $positionData['from'] ?? null;
        $to = $positionData['to'] ?? null;

        if ($from === null || $to === null || $from >= $to) {
            return null;
        }

        // Strip HTML to get plain text for position matching
        $plainText = $this->htmlToPlainText($html);

        // Check if positions are within bounds
        $textLength = mb_strlen($plainText);
        if ($from < 0 || $to > $textLength) {
            return null;
        }

        $extracted = mb_substr($plainText, $from, $to - $from);

        return $extracted !== '' ? $extracted : null;
    }

    /**
     * Find text using surrounding anchor text.
     */
    protected function findByAnchors(
        string $html,
        ?string $anchorBefore,
        ?string $anchorAfter,
        ?string $originalText
    ): ?string {
        $plainText = $this->htmlToPlainText($html);

        // Build search pattern
        if ($anchorBefore && $anchorAfter && $originalText) {
            // Try to find the pattern: anchorBefore + something + anchorAfter
            $pattern = preg_quote($anchorBefore, '/') . '(.+?)' . preg_quote($anchorAfter, '/');
            if (preg_match('/' . $pattern . '/su', $plainText, $matches)) {
                return $matches[1];
            }
        }

        // Try with just before anchor
        if ($anchorBefore && $originalText) {
            $pos = mb_strpos($plainText, $anchorBefore);
            if ($pos !== false) {
                $startPos = $pos + mb_strlen($anchorBefore);
                $expectedLength = mb_strlen($originalText);
                $candidate = mb_substr($plainText, $startPos, $expectedLength + 50);

                // Check if original text exists near this position
                if (mb_strpos($candidate, $originalText) !== false) {
                    return $originalText;
                }

                // Try fuzzy match - find text of similar length
                $extracted = mb_substr($plainText, $startPos, $expectedLength);
                if (mb_strlen($extracted) === $expectedLength) {
                    return $extracted;
                }
            }
        }

        // Try with just after anchor
        if ($anchorAfter && $originalText) {
            $pos = mb_strpos($plainText, $anchorAfter);
            if ($pos !== false) {
                $expectedLength = mb_strlen($originalText);
                $startPos = max(0, $pos - $expectedLength);
                $candidate = mb_substr($plainText, $startPos, $expectedLength);

                if (mb_strlen($candidate) === $expectedLength) {
                    return $candidate;
                }
            }
        }

        return null;
    }

    /**
     * Find exact match of original text in content.
     */
    protected function findExactMatch(string $html, string $originalText): ?string
    {
        $plainText = $this->htmlToPlainText($html);

        if (mb_strpos($plainText, $originalText) !== false) {
            return $originalText;
        }

        return null;
    }

    /**
     * Check if a marker ID exists in the HTML content.
     */
    public function markerExists(string $html, string $markerId): bool
    {
        return str_contains($html, 'data-marker-id="' . $markerId . '"')
            || str_contains($html, "data-marker-id='" . $markerId . "'");
    }

    /**
     * Get text content between marker spans.
     */
    public function getMarkedText(string $html, string $markerId): ?string
    {
        // Look for span with the marker ID
        $pattern = '/<span[^>]*data-marker-id=["\']' . preg_quote($markerId, '/') . '["\'][^>]*>(.*?)<\/span>/su';

        if (preg_match($pattern, $html, $matches)) {
            return strip_tags($matches[1]);
        }

        return null;
    }

    /**
     * Convert HTML to plain text, preserving paragraph breaks.
     */
    protected function htmlToPlainText(string $html): string
    {
        // Replace block elements with newlines
        $html = preg_replace('/<(p|div|br|h[1-6])[^>]*>/i', "\n", $html);
        $html = preg_replace('/<\/(p|div|h[1-6])>/i', "\n", $html);

        // Strip remaining tags
        $text = strip_tags($html);

        // Decode HTML entities
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Normalize whitespace
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/\n+/', "\n", $text);

        return trim($text);
    }

    /**
     * Calculate similarity between two strings (0-1).
     */
    public function calculateSimilarity(string $str1, string $str2): float
    {
        if ($str1 === $str2) {
            return 1.0;
        }

        if (empty($str1) || empty($str2)) {
            return 0.0;
        }

        $len1 = mb_strlen($str1);
        $len2 = mb_strlen($str2);

        // Use Levenshtein for short strings
        if ($len1 <= 255 && $len2 <= 255) {
            $distance = levenshtein($str1, $str2);
            $maxLen = max($len1, $len2);
            return 1 - ($distance / $maxLen);
        }

        // For longer strings, use simple character overlap
        $chars1 = count_chars($str1, 1);
        $chars2 = count_chars($str2, 1);

        $intersection = 0;
        $union = 0;

        foreach ($chars1 as $char => $count) {
            if (isset($chars2[$char])) {
                $intersection += min($count, $chars2[$char]);
            }
            $union += $count;
        }

        foreach ($chars2 as $char => $count) {
            if (!isset($chars1[$char])) {
                $union += $count;
            }
        }

        return $union > 0 ? $intersection / $union : 0.0;
    }

    /**
     * Resolve position by finding the best match in content.
     */
    public function resolvePosition(
        string $html,
        string $targetText,
        array $originalPosition,
        ?string $anchorBefore = null,
        ?string $anchorAfter = null
    ): ?array {
        $plainText = $this->htmlToPlainText($html);

        // First try exact position
        $from = $originalPosition['from'] ?? 0;
        $to = $originalPosition['to'] ?? 0;
        $length = $to - $from;

        if ($length > 0 && $from >= 0) {
            $atPosition = mb_substr($plainText, $from, $length);
            if ($atPosition === $targetText) {
                return $originalPosition;
            }
        }

        // Search for exact match
        $pos = mb_strpos($plainText, $targetText);
        if ($pos !== false) {
            return [
                'from' => $pos,
                'to' => $pos + mb_strlen($targetText),
            ];
        }

        // Search using anchors
        if ($anchorBefore) {
            $anchorPos = mb_strpos($plainText, $anchorBefore);
            if ($anchorPos !== false) {
                $searchStart = $anchorPos + mb_strlen($anchorBefore);
                $searchArea = mb_substr($plainText, $searchStart, mb_strlen($targetText) * 2);
                $targetPos = mb_strpos($searchArea, $targetText);
                if ($targetPos !== false) {
                    $absolutePos = $searchStart + $targetPos;
                    return [
                        'from' => $absolutePos,
                        'to' => $absolutePos + mb_strlen($targetText),
                    ];
                }
            }
        }

        return null;
    }
}
