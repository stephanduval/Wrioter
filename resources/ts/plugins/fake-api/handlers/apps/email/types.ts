export type EmailFolder = 'inbox' | 'sent' | 'draft' | 'starred' | 'spam' | 'trash' | 'archive'
export type EmailFilter = EmailFolder | 'trashed' | 'starred'
export type EmailLabel = 'personal' | 'company' | 'important' | 'private' | string

export interface EmailTo {
  name?: string
  fullName?: string
  email: string
}

export interface EmailFrom {
  id: number
  fullName: string
  email: string
  avatar: string
}

export interface EmailAttachment {
  fileName: string
  thumbnail: string
  url: string
  size: string
}

/*
  - You can have draft mail in your inbox
    - We can have flag isDraft for mail
  - You can't move sent mail to inbox
  - You can move sent mail to inbox

  --- above are gmail notes

  - We will provide inbox, spam & sent as folders
    - You can't move any mail in sent folder. Sent mail can be deleted or retrieved back
  - We will provide isDraft, isSpam, isTrash as flags
  - draft is flag
  - trash is flag
  - spam email can be moved to inbox only
  - We will provide isDeleted flag

  === this is too confusing 😔

  // this is final now 💯
  folders => inbox, sent, draft, spam
  flags: starred, trash
*/

export interface Email {
  id: number
  from: EmailFrom
  to: EmailTo[]
  subject: string
  cc?: string[]
  bcc?: string[]
  message: string
  attachments: EmailAttachment[]
  time: string
  replies?: Email[]

  labels: EmailLabel[]

  folder?: EmailFolder

  // Flags 🚩
  isRead: boolean
  isStarred: boolean
  isDeleted?: boolean

  status: 'read' | 'unread' | 'deleted' | 'sent' | 'draft' | 'spam'
  task_status: 'new' | 'completed'
  dueDate: string | null
  requestedDate: string
  isArchived: boolean

  company_id?: number
  reply_to_id?: number | null
}

export interface FetchEmailsPayload {
  q?: string
  filter?: EmailFilter
  label?: EmailLabel
}

export type MoveEmailToAction = 'inbox' | 'archive' | 'trash' | 'spam'
