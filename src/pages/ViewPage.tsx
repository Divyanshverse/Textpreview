import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Clock, FileText, AlertCircle } from 'lucide-react';
import LZString from 'lz-string';
import { store } from '../store';
import { Document } from '../types';
import { Preview } from '../components/Preview';

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (id) {
      let found = store.getDocument(id);
      
      if (!found && window.location.hash.startsWith('#payload=')) {
        try {
          const encodedPayload = window.location.hash.substring(9);
          const decodedPayload = LZString.decompressFromEncodedURIComponent(encodedPayload);
          if (decodedPayload) {
            found = JSON.parse(decodedPayload);
            // Optional: Store the shared document locally so they can find it later
            if (found) {
               // Make sure it has an ID, since docData from payload might not include ID if it wasn't saved with it
               found = { ...found, id };
            }
          }
        } catch (err) {
          console.error("Failed to decode payload from URL hash", err);
        }
      }

      setDocumentData(found || null);
      setIsLoading(false);
    }
  }, [id]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentData) return;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(passwordInput);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // If document is protected but somehow missing a hash, let it unlock
      if (!documentData.passwordHash || hashHex === documentData.passwordHash) {
        setIsUnlocked(true);
        if (id) store.markViewed(id);
      } else {
        setPasswordError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setPasswordError('An error occurred while verifying the password.');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">Loading...</div>;
  }

  // Execution State Logic for /view/[id]
  if (!documentData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Document Not Found</h1>
        <p className="text-slate-500 mb-6">The link might be broken or the document was deleted.</p>
        <button onClick={() => navigate('/')} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium">Return Home</button>
      </div>
    );
  }

  if (documentData.expiresAt && Date.now() > documentData.expiresAt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
        <Clock className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
        <p className="text-slate-500 mb-6">This document is no longer available.</p>
        <button onClick={() => navigate('/')} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium">Return Home</button>
      </div>
    );
  }

  if (documentData.isPasswordProtected && !isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f7fa] dark:bg-[#0f1115]">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">Protected Document</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-6">Enter the password to view this document.</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
            </div>
            <button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg transition-colors">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render document ONLY when unlocked or unprotected
  useEffect(() => {
    if (documentData && !documentData.isPasswordProtected && id) {
      store.markViewed(id);
    }
  }, [documentData, id]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0c10]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1115] shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate('/')}>
          <div className="bg-brand-500 text-white p-1.5 rounded-md">
            <FileText className="w-4 h-4" />
          </div>
          <span className="tracking-tight">DocShowcase</span>
        </div>
        <div className="font-medium text-slate-800 dark:text-slate-200 truncate px-4">
          {documentData.title || 'Untitled Document'}
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg transition-colors"
        >
          Create Your Own
        </button>
      </header>
      <main className="flex-1 overflow-y-auto w-full flex justify-center">
        <div className="w-full max-w-4xl min-h-full bg-white dark:bg-[#0f1115] border-x border-slate-200 dark:border-slate-800 shadow-sm">
          <Preview content={documentData.content || ''} format={documentData.format || 'markdown'} />
        </div>
      </main>
    </div>
  );
}
