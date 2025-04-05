export interface EmailFrom {
  id: number | null; // Ensure ID is here
  fullName: string;
  email: string;
  avatar?: string | null; // Make avatar optional or provide default
}

export type EmailLabel = 'personal' | 'company' | 'important' | 'private' | string; // Allow any string

export type EmailFolder = 'inbox' | 'sent' | 'draft' | 'starred' | 'spam' | 'trash';

export interface EmailAttachment {
  fileName: string;
  size: string;
  thumbnail: string; // Or make optional
  url?: string;     // Or make optional
}

export interface Email {
  id: number;
  from: EmailFrom;
  to: { name?: string; email: string }[]; // Make 'to' more flexible
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
} 
