<?php

namespace App\Http\Controllers;

use App\Models\Manuscript;
use App\Models\ManuscriptRawFile;
use App\Models\ItemAttachment;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    /**
     * Check if the current user has admin access
     */
    private function checkAdminAccess()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        
        // Check if user has admin role
        $userRole = $user->roles->first()->name ?? null;
        if (!$userRole || strtolower($userRole) !== 'admin') {
            return response()->json(['error' => 'Unauthorized - Admin access required'], 403);
        }
        
        return null; // No error
    }

    /**
     * Get manuscript structure with raw files organized like Scrivener folders
     */
    public function getManuscriptStructure($manuscriptId)
    {
        try {
            // Verify admin access
            $accessCheck = $this->checkAdminAccess();
            if ($accessCheck) {
                return $accessCheck;
            }

            $manuscript = Manuscript::with(['rawFiles', 'items.attachments'])->findOrFail($manuscriptId);
            
            // Organize files by type to match Scrivener structure
            $structure = [
                'manuscript' => [
                    'id' => $manuscript->id,
                    'title' => $manuscript->title,
                    'scrivener_uuid' => $manuscript->scrivener_uuid,
                    'imported_at' => $manuscript->imported_at,
                    'version' => $manuscript->version,
                ],
                'project_files' => [],
                'data_files' => [],
                'snapshots' => [],
                'settings' => [],
                'stats' => [
                    'total_raw_files' => 0,
                    'total_attachments' => 0,
                    'total_size' => 0,
                ]
            ];

            // Categorize manuscript raw files
            foreach ($manuscript->rawFiles as $rawFile) {
                $fileData = [
                    'id' => $rawFile->id,
                    'name' => $rawFile->file_name,
                    'type' => $rawFile->file_type,
                    'size' => $rawFile->file_size,
                    'path' => $rawFile->scrivener_path,
                    'metadata' => $rawFile->metadata,
                ];

                $structure['stats']['total_raw_files']++;
                $structure['stats']['total_size'] += $rawFile->file_size;

                switch ($rawFile->file_type) {
                    case 'project_xml':
                    case 'compile':
                    case 'styles':
                    case 'writing_history':
                        $structure['project_files'][] = $fileData;
                        break;
                    case 'snapshot':
                        $structure['snapshots'][] = $fileData;
                        break;
                    default:
                        $structure['settings'][] = $fileData;
                        break;
                }
            }

            // Organize item attachments by UUID (similar to Files/Data structure)
            foreach ($manuscript->items as $item) {
                if ($item->attachments->count() > 0) {
                    $itemData = [
                        'uuid' => $item->scrivener_uuid,
                        'title' => $item->title,
                        'type' => $item->type,
                        'folder_type' => $item->folder_type,
                        'attachments' => []
                    ];

                    foreach ($item->attachments as $attachment) {
                        $itemData['attachments'][] = [
                            'id' => $attachment->id,
                            'name' => $attachment->file_name,
                            'type' => $attachment->file_type,
                            'size' => $attachment->file_size,
                            'mime_type' => $attachment->mime_type,
                            'path' => $attachment->scrivener_path,
                            'metadata' => $attachment->metadata,
                        ];

                        $structure['stats']['total_attachments']++;
                        $structure['stats']['total_size'] += $attachment->file_size;
                    }

                    $structure['data_files'][] = $itemData;
                }
            }

            return response()->json($structure);

        } catch (\Exception $e) {
            Log::error('Error getting manuscript structure', [
                'manuscript_id' => $manuscriptId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json(['error' => 'Failed to load manuscript structure'], 500);
        }
    }

    /**
     * Get all manuscript raw files
     */
    public function getManuscriptRawFiles($manuscriptId)
    {
        try {
            // Verify admin access
            $accessCheck = $this->checkAdminAccess();
            if ($accessCheck) {
                return $accessCheck;
            }

            $manuscript = Manuscript::with('rawFiles')->findOrFail($manuscriptId);
            
            return response()->json([
                'manuscript' => [
                    'id' => $manuscript->id,
                    'title' => $manuscript->title,
                    'scrivener_uuid' => $manuscript->scrivener_uuid,
                ],
                'raw_files' => $manuscript->rawFiles->map(function($file) {
                    return [
                        'id' => $file->id,
                        'name' => $file->file_name,
                        'type' => $file->file_type,
                        'size' => $file->file_size,
                        'path' => $file->scrivener_path,
                        'metadata' => $file->metadata,
                        'created_at' => $file->created_at,
                    ];
                })
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting manuscript raw files', [
                'manuscript_id' => $manuscriptId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to load raw files'], 500);
        }
    }

    /**
     * Get specific raw file content
     */
    public function getRawFileContent($manuscriptId, $fileId)
    {
        try {
            // Verify admin access
            $accessCheck = $this->checkAdminAccess();
            if ($accessCheck) {
                return $accessCheck;
            }

            $rawFile = ManuscriptRawFile::where('manuscript_id', $manuscriptId)
                ->where('id', $fileId)
                ->firstOrFail();
            
            return response()->json([
                'id' => $rawFile->id,
                'name' => $rawFile->file_name,
                'type' => $rawFile->file_type,
                'size' => $rawFile->file_size,
                'path' => $rawFile->scrivener_path,
                'content' => $rawFile->file_content,
                'metadata' => $rawFile->metadata,
                'created_at' => $rawFile->created_at,
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting raw file content', [
                'manuscript_id' => $manuscriptId,
                'file_id' => $fileId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to load file content'], 500);
        }
    }

    /**
     * Get item attachments
     */
    public function getItemAttachments($itemId)
    {
        try {
            // Verify admin access
            $accessCheck = $this->checkAdminAccess();
            if ($accessCheck) {
                return $accessCheck;
            }

            // Check if itemId is a UUID (scrivener_uuid) or database ID
            $item = is_numeric($itemId) 
                ? Item::with('attachments')->findOrFail($itemId)
                : Item::with('attachments')->where('scrivener_uuid', $itemId)->firstOrFail();
            
            return response()->json([
                'item' => [
                    'id' => $item->id,
                    'title' => $item->title,
                    'scrivener_uuid' => $item->scrivener_uuid,
                    'type' => $item->type,
                ],
                'attachments' => $item->attachments->map(function($attachment) {
                    return [
                        'id' => $attachment->id,
                        'name' => $attachment->file_name,
                        'type' => $attachment->file_type,
                        'size' => $attachment->file_size,
                        'mime_type' => $attachment->mime_type,
                        'path' => $attachment->scrivener_path,
                        'metadata' => $attachment->metadata,
                        'created_at' => $attachment->created_at,
                    ];
                })
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting item attachments', [
                'item_id' => $itemId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to load attachments'], 500);
        }
    }

    /**
     * Get specific attachment content
     */
    public function getAttachmentContent($itemId, $attachmentId)
    {
        try {
            // Verify admin access
            $accessCheck = $this->checkAdminAccess();
            if ($accessCheck) {
                return $accessCheck;
            }

            // First, find the item by UUID or ID
            $item = is_numeric($itemId) 
                ? Item::findOrFail($itemId)
                : Item::where('scrivener_uuid', $itemId)->firstOrFail();

            // Then find the attachment using the actual item ID
            $attachment = ItemAttachment::where('item_id', $item->id)
                ->where('id', $attachmentId)
                ->firstOrFail();
            
            // For binary files, we need to handle them differently
            $isBinary = $this->isBinaryFile($attachment->mime_type);
            
            return response()->json([
                'id' => $attachment->id,
                'name' => $attachment->file_name,
                'type' => $attachment->file_type,
                'size' => $attachment->file_size,
                'mime_type' => $attachment->mime_type,
                'path' => $attachment->scrivener_path,
                'content' => $attachment->file_content,
                'raw_content' => $attachment->raw_content,
                'is_binary' => $isBinary,
                'metadata' => $attachment->metadata,
                'created_at' => $attachment->created_at,
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting attachment content', [
                'item_id' => $itemId,
                'attachment_id' => $attachmentId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to load attachment content'], 500);
        }
    }

    /**
     * Download raw file
     */
    public function downloadRawFile($manuscriptId, $fileId)
    {
        try {
            // Verify admin access
            $accessCheck = $this->checkAdminAccess();
            if ($accessCheck) {
                return $accessCheck;
            }

            $rawFile = ManuscriptRawFile::where('manuscript_id', $manuscriptId)
                ->where('id', $fileId)
                ->firstOrFail();
            
            return response($rawFile->file_content)
                ->header('Content-Type', $this->getMimeType($rawFile->file_name))
                ->header('Content-Disposition', 'attachment; filename="' . $rawFile->file_name . '"')
                ->header('Content-Length', $rawFile->file_size);

        } catch (\Exception $e) {
            Log::error('Error downloading raw file', [
                'manuscript_id' => $manuscriptId,
                'file_id' => $fileId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to download file'], 500);
        }
    }

    /**
     * Download attachment
     */
    public function downloadAttachment($itemId, $attachmentId)
    {
        try {
            // Verify admin access
            $accessCheck = $this->checkAdminAccess();
            if ($accessCheck) {
                return $accessCheck;
            }

            // First, find the item by UUID or ID
            $item = is_numeric($itemId) 
                ? Item::findOrFail($itemId)
                : Item::where('scrivener_uuid', $itemId)->firstOrFail();

            // Then find the attachment using the actual item ID
            $attachment = ItemAttachment::where('item_id', $item->id)
                ->where('id', $attachmentId)
                ->firstOrFail();
            
            // For binary files, decode base64 content
            $content = $attachment->file_content;
            if ($this->isBinaryFile($attachment->mime_type)) {
                $content = base64_decode($content);
            }
            
            return response($content)
                ->header('Content-Type', $attachment->mime_type)
                ->header('Content-Disposition', 'attachment; filename="' . $attachment->file_name . '"')
                ->header('Content-Length', $attachment->file_size);

        } catch (\Exception $e) {
            Log::error('Error downloading attachment', [
                'item_id' => $itemId,
                'attachment_id' => $attachmentId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json(['error' => 'Failed to download attachment'], 500);
        }
    }

    /**
     * Check if file is binary based on MIME type
     */
    private function isBinaryFile($mimeType)
    {
        $binaryTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'audio/wav',
            'audio/mpeg',
            'video/mp4'
        ];

        return in_array($mimeType, $binaryTypes);
    }

    /**
     * Get MIME type for file
     */
    private function getMimeType($fileName)
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        $mimeTypes = [
            'xml' => 'application/xml',
            'scrivx' => 'application/xml',
            'rtf' => 'application/rtf',
            'txt' => 'text/plain',
            'pdf' => 'application/pdf',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'wav' => 'audio/wav',
            'mp3' => 'audio/mpeg',
            'mp4' => 'video/mp4'
        ];

        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }
}