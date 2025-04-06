export interface EmailFrom {
  id: number | null; // Ensure ID is here
  fullName: string;
  email: string;
  avatar?: string | null; // Make avatar optional or provide default
}

export type EmailLabel = 'personal' | 'company' | 'important' | 'private' | string; // Allow any string

export type EmailFolder = 'inbox' | 'sent' | 'draft' | 'starred' | 'spam' | 'trash' | 'archive';

export interface EmailAttachment {
  fileName: string;
  size: string;
  thumbnail: string; // Or make optional
  url?: string;     // Or make optional
}

export interface Email {
  id: number;
  from: EmailFrom;
  to: { 
      name?: string; // Keep if used elsewhere
      fullName?: string; // Add fullName
      email: string 
  }[]; 
  subject: string;
  message: string; // HTML content
  time: string | Date; // ISO string or Date object
  labels: EmailLabel[];
  attachments: EmailAttachment[];
  isRead: boolean;
  isStarred: boolean;
  isDeleted?: boolean; // Keep for compatibility if needed, but rely on 'status'/'folder'
  folder?: EmailFolder; // Use folder for UI state if needed
  status: 'read' | 'unread' | 'sent' | 'draft' | 'archived' | 'deleted' | 'spam'; // Add status field
  // Optional fields
  cc?: { name?: string; email: string }[];
  bcc?: { name?: string; email: string }[];
  reply_to_id?: number | null;
  requestedDate?: string | Date; // Added for 'Requested' column (maps from created_at)
  dueDate?: string | null;       // Added Due Date (YYYY-MM-DD or null)
  task_status: 'new' | 'completed'; // Added Task Status
  isArchived: boolean;          // Added Archive flag
}

// Add MoveEmailToAction if not present
export type MoveEmailToAction = 'inbox' | 'trash' | 'archive'; 
