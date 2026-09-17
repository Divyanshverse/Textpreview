export interface Document {
  id: string;
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'custom';
  createdAt: number;
  updatedAt: number;
  lastViewedAt: number;
  isPasswordProtected?: boolean;
  passwordHash?: string;
  expiresAt?: number | null;
}
