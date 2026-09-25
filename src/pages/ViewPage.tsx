import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Clock, FileText, AlertCircle, Copy } from 'lucide-react';
import { store } from '../store';
import { Document } from '../types';
import { Preview } from '../components/Preview';

export default function ViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (id) {
      try {
        const found = store.getDocument(id) || null;
        
        if (found) {
          setDocumentData(found);
        } else {
          setError("Document data is invalid or could not be decoded.");
        }
      } catch (err: any) {
        console.error("Payload decoding error:", err);
        setError(`Failed to load document: ${err.message || 'Corrupted payload'}`);
      } finally {
        setIsLoading(false);
      }
    } else {
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

  // Render document ONLY when unlocked or unprotected
  useEffect(() => {
    // Only mark viewed if we have data, we are not loading, and the document is either unprotected or we have unlocked it.
    if (!isLoading && documentData && (!documentData.isPasswordProtected || isUnlocked) && id) {
      store.markViewed(id);
    }
  }, [isLoading, documentData, isUnlocked, id]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">Loading...</div>;
  }

  // Execution State Logic for /view/[id]
  if (error || !documentData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-4 text-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/60 max-w-md w-full flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Unable to Load Document</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md">{error || "The link might be broken or the document was deleted."}</p>
          <button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full">Create New Document</button>
        </div>
      </div>
    );
  }

  if (documentData.expiresAt && Date.now() > documentData.expiresAt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white p-4 text-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/60 max-w-md w-full flex flex-col items-center">
          <Clock className="w-12 h-12 text-amber-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Link Expired</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">This document is no longer available.</p>
          <button onClick={() => navigate('/')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full">Return Home</button>
        </div>
      </div>
    );
  }

  if (documentData.isPasswordProtected && !isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 rounded-2xl p-8 w-full max-w-md shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-center mb-2 text-slate-900 dark:text-white">Protected Document</h1>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">Enter the password to view this document.</p>
          
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
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
              {passwordError && <p className="text-red-500 text-sm mt-2">{passwordError}</p>}
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleCopyContent = () => {
    navigator.clipboard.writeText(documentData.content || '')
      .then(() => alert("Content copied to clipboard!"))
      .catch(() => alert("Failed to copy."));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900 shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate('/')}>
          <div className="bg-indigo-600 text-white p-1.5 rounded-md">
            <FileText className="w-4 h-4" />
          </div>
          <span className="tracking-tight font-medium">Text Preview</span>
        </div>
        <div className="font-semibold text-slate-800 dark:text-slate-200 truncate px-4">
          {documentData.title || 'Shared Document'}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyContent}
            className="flex items-center gap-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Content</span>
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Your Own
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/60 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <Preview content={documentData.content || ''} format={documentData.format || 'markdown'} />
          </div>
        </div>
      </main>
    </div>
  );
}
