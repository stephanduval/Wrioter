<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    /**
     * Summarize a block of text using Claude.
     *
     * The Anthropic API key lives server-side (config/services.php) and is
     * never exposed to the browser. We call the Messages API directly over
     * HTTP — there is no first-party PHP SDK, and a single request needs no
     * more than this.
     */
    public function summarize(Request $request)
    {
        // Cap input size so a single call can't send a huge document.
        // ~8000 chars is roughly 1500-2000 words — plenty for a selection.
        $validated = $request->validate([
            'text' => 'required|string|max:8000',
        ]);

        $apiKey = config('services.anthropic.api_key');
        if (! $apiKey) {
            return response()->json([
                'message' => 'AI is not configured. Set ANTHROPIC_API_KEY in the environment.',
            ], 503);
        }

        // Strip any HTML so the model summarizes prose, not markup.
        $text = trim(strip_tags($validated['text']));
        if ($text === '') {
            return response()->json(['message' => 'Nothing to summarize.'], 422);
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
                ->timeout(30)
                ->post('https://api.anthropic.com/v1/messages', [
                    'model' => config('services.anthropic.model'),
                    // A summary is short; 400 tokens caps output cost per call.
                    'max_tokens' => 400,
                    'system' => 'You are a concise summarization assistant. '
                        . 'Summarize the user-provided text in a few clear sentences. '
                        . 'Respond with only the summary — no preamble, no headings.',
                    'messages' => [
                        ['role' => 'user', 'content' => $text],
                    ],
                ]);

            if ($response->failed()) {
                Log::error('Anthropic API error', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);

                return response()->json([
                    'message' => 'The AI service returned an error.',
                ], 502);
            }

            // Concatenate any text blocks the model returned.
            $summary = collect($response->json('content', []))
                ->where('type', 'text')
                ->pluck('text')
                ->implode('');

            return response()->json([
                'summary' => trim($summary),
            ]);
        } catch (\Throwable $e) {
            Log::error('Summarize request failed', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Could not reach the AI service.',
            ], 502);
        }
    }
}
