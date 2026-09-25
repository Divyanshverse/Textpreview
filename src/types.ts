export interface DocumentRecord {
  id: string; // 8-char slug or custom name
  title?: string;
  content: string; // Markdown or HTML
  type: 'markdown' | 'html' | 'custom';
  createdAt: number;
  views: number;
  isEncrypted?: boolean;
  encryptedData?: string; // AES-GCM ciphertext
  passwordHash?: string;  // SHA-256 hash
  passkeyHash?: string;   // Edit passkey SHA-256 hash
  expiresAt?: number | null; // Milliseconds timestamp
  burnAfterReading?: boolean;

  // Additional compatibility fields
  format?: 'markdown' | 'html' | 'custom';
  isPasswordProtected?: boolean;
  updatedAt?: number;
  lastViewedAt?: number;
}

export type Document = DocumentRecord;
