import { Document } from './types';

const STORAGE_KEY = 'docshowcase_documents';

const generateShortId = () => {
  return Math.random().toString(36).substring(2, 10);
};

export const store = {
  getDocuments: (): Document[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getDocument: (id: string): Document | undefined => {
    const docs = store.getDocuments();
    return docs.find((d) => d.id === id);
  },

  createDocument: (initialData?: Partial<Document>): Document => {
    const docs = store.getDocuments();
    const now = Date.now();
    const newDoc: Document = {
      id: initialData?.id || generateShortId(),
      title: initialData?.title || 'Untitled Document',
      content: initialData?.content || '',
      format: initialData?.format || 'markdown',
      createdAt: initialData?.createdAt || now,
      updatedAt: now,
      lastViewedAt: now,
    };
    docs.push(newDoc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    return newDoc;
  },

  updateDocument: (id: string, updates: Partial<Document>) => {
    const docs = store.getDocuments();
    const index = docs.findIndex((d) => d.id === id);
    if (index !== -1) {
      docs[index] = { ...docs[index], ...updates, updatedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
      return docs[index];
    }
    return null;
  },

  markViewed: (id: string) => {
    const docs = store.getDocuments();
    const index = docs.findIndex((d) => d.id === id);
    if (index !== -1) {
      docs[index] = { ...docs[index], lastViewedAt: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    }
  },

  deleteDocument: (id: string) => {
    const docs = store.getDocuments();
    const filtered = docs.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },
};
