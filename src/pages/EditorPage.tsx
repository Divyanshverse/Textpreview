import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Share2, ChevronDown, Moon, Sun, Check, Settings as SettingsIcon, Copy, ExternalLink, Plus, Undo2, Redo2 } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { store } from '../store';
import { Document } from '../types';
import { CodeEditor } from '../components/CodeEditor';
import { Preview } from '../components/Preview';
import { useTheme } from '../components/ThemeProvider';
import { useEditorSettings } from '../hooks/useEditorSettings';
import { SettingsModal } from '../components/SettingsModal';
import { useHistory } from '../hooks/useHistory';

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [doc, setDoc] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<'markdown' | 'html' | 'custom'>('markdown');
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const { settings, setSettings } = useEditorSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [showSharePage, setShowSharePage] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const [securityApplyStatus, setSecurityApplyStatus] = useState<'idle' | 'success'>('idle');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  const { pushSnapshot, undo, redo, canUndo, canRedo } = useHistory(id, content);

  useEffect(() => {
    if (id) {
      let found = store.getDocument(id);

      if (found) {
        setDoc(found);
        setContent(found.content);
        setTitle(found.title);
        setFormat(found.format);
        setIsPasswordProtected(found.isPasswordProtected || false);
        store.markViewed(id);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  // Debounced auto-save
  useEffect(() => {
    if (!id || saveStatus === 'saved') return;
    const timeout = setTimeout(() => {
      store.updateDocument(id, { content, title, format });
      setSaveStatus('saved');
    }, 1000);
    return () => clearTimeout(timeout);
  }, [content, title, format, id, saveStatus]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      pushSnapshot(content);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [content, pushSnapshot]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setSaveStatus('saving');
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSaveStatus('saving');
  };

  const handleFormatChange = (newFormat: 'markdown' | 'html' | 'custom') => {
    setFormat(newFormat);
    setShowFormatDropdown(false);
    setSaveStatus('saving');
  };

  const handleUndo = () => {
    const restored = undo();
    if (restored !== null) {
      setContent(restored);
      setSaveStatus('saving');
    }
  };

  const handleRedo = () => {
    const restored = redo();
    if (restored !== null) {
      setContent(restored);
      setSaveStatus('saving');
    }
  };

  const handleApplySecurity = async () => {
    if (id) {
      let passwordHash = undefined;
      let expiresAt = null;

      if (isPasswordProtected && password) {
         const encoder = new TextEncoder();
         const data = encoder.encode(password);
         const hashBuffer = await crypto.subtle.digest('SHA-256', data);
         const hashArray = Array.from(new Uint8Array(hashBuffer));
         passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      if (expiryDate) {
         const date = new Date(expiryDate);
         date.setHours(23, 59, 59, 999);
         expiresAt = date.getTime();
      }

      store.updateDocument(id, { 
        isPasswordProtected: isPasswordProtected && !!password, 
        passwordHash, 
        expiresAt 
      });

      setSecurityApplyStatus('success');
      setTimeout(() => setSecurityApplyStatus('idle'), 3000);
    }
  };

  const handleShareClick = async () => {
    if (id) {
      let passwordHash = undefined;
      let expiresAt = null;

      if (isPasswordProtected && password) {
         const encoder = new TextEncoder();
         const data = encoder.encode(password);
         const hashBuffer = await crypto.subtle.digest('SHA-256', data);
         const hashArray = Array.from(new Uint8Array(hashBuffer));
         passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      if (expiryDate) {
         const date = new Date(expiryDate);
         date.setHours(23, 59, 59, 999);
         expiresAt = date.getTime();
      }

      store.updateDocument(id, { 
        content, 
        title, 
        format, 
        isPasswordProtected, 
        passwordHash, 
        expiresAt 
      });
      
      const fullUrl = `${window.location.origin}/view/${id}`;
      setShortUrl(fullUrl);
      setShowSharePage(true);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shortUrl || window.location.href)
      .then(() => {
         setIsCopied(true);
         setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {});
  };

  if (!doc) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (showSharePage) {
    return (
      <div className="min-h-screen flex flex-col transition-colors duration-200">
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-[#f5f7fa]/80 dark:bg-[#0f1115]/80 backdrop-blur-md">
          <div 
            className="flex items-center gap-2 font-semibold text-lg tracking-tight cursor-pointer hover:opacity-80 transition-opacity text-slate-900 dark:text-white"
            onClick={() => navigate('/')}
          >
            <div className="bg-brand-500 text-white p-1 rounded-md">
              <FileText className="w-5 h-5" />
            </div>
            <span>DocShowcase</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const newDoc = store.createDocument();
                navigate(`/doc/${newDoc.id}`);
                setShowSharePage(false);
              }}
              className="hidden sm:flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Doc
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg transition-all text-slate-500 dark:text-slate-400 bg-transparent border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-lg transition-all text-slate-500 dark:text-slate-400 bg-transparent border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Editor Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f5f7fa] dark:bg-[#0f1115]">
          <div className="w-16 h-16 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white tracking-tight">Document Saved!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Your document is ready to share</p>

          <div className="w-full max-w-xl space-y-4">
            <div className="bg-[#f5f7fa] dark:bg-[#15171b] border border-slate-200 dark:border-slate-800/60 rounded-xl p-5 shadow-sm flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl mb-4 shadow-sm border border-slate-100">
                <QRCodeCanvas 
                  value={shortUrl || window.location.href} 
                  size={140}
                  level="L"
                  includeMargin={false}
                />
              </div>
              <div className="w-full text-center">
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">Public URL</p>
                <code className="text-sm font-mono text-slate-800 dark:text-slate-200 break-all bg-white/50 dark:bg-[#0a0c10]/50 px-3 py-1.5 rounded-lg block">
                  {shortUrl || window.location.href}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleCopyUrl}
                className="flex items-center justify-center gap-2 bg-transparent border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-xl font-medium transition-all text-sm shadow-sm"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Copied' : 'Copy URL'}
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: title || 'Shared Document',
                      url: shortUrl || window.location.href
                    }).catch(() => {});
                  } else {
                    handleCopyUrl();
                  }
                }}
                className="flex items-center justify-center gap-2 bg-transparent border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-xl font-medium transition-all text-sm shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  window.open(shortUrl || window.location.href, '_blank');
                }}
                className="flex items-center justify-center gap-2 bg-transparent border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-xl font-medium transition-all text-sm shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </button>
              <button 
                onClick={() => setShowSharePage(false)}
                className="flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-6 py-3.5 rounded-xl font-medium transition-all shadow-sm text-sm"
              >
                <Undo2 className="w-4 h-4" />
                Return to Editor
              </button>
            </div>
            
            <div className="mt-4 border border-slate-200 dark:border-slate-800/80 rounded-xl bg-transparent overflow-hidden">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Advanced Options
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>
              {showAdvanced && (
                <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-black/20 text-sm">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">Require Password to View</span>
                        <input 
                          type="checkbox" 
                          checked={isPasswordProtected}
                          onChange={(e) => setIsPasswordProtected(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" 
                        />
                      </div>
                      {isPasswordProtected && (
                        <input 
                          type="password"
                          placeholder="Enter a secure password..."
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 outline-none focus:border-brand-500 w-full mt-1"
                        />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Link Expiry Date</span>
                      <input 
                        type="date" 
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 outline-none" 
                      />
                    </div>
                    <button
                      onClick={handleApplySecurity}
                      className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition-colors mt-4 flex items-center justify-center gap-2"
                    >
                      {securityApplyStatus === 'success' ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>Settings Applied!</span>
                        </>
                      ) : (
                        'Apply Security Settings'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <footer className="py-6 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-8 bg-[#f5f7fa]/80 dark:bg-[#0f1115]/80 text-sm font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 text-slate-400">
            <FileText className="w-4 h-4" />
            DocShowcase
          </div>
          <div>Built by <span className="text-slate-900 dark:text-white font-semibold">AryansDevStudios</span></div>
        </footer>

        <SettingsModal 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onChange={setSettings}
        />
      </div>
    );
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950 transition-colors duration-200 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <div 
            className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <div className="bg-brand-500 text-white p-1 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline tracking-tight">DocShowcase</span>
          </div>
          
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 hidden sm:block"></div>

          <input 
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled Document"
            className="bg-transparent border-none px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/50 rounded-md text-slate-800 dark:text-slate-200 w-64 max-w-full placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-shadow"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center mr-2 border-r border-slate-200 dark:border-slate-800 pr-3">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors ${canUndo ? 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
              aria-label="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-colors ${canRedo ? 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
              aria-label="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
            aria-label="Editor Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowFormatDropdown(!showFormatDropdown)}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {format === 'markdown' ? 'Markdown' : format === 'html' ? 'HTML' : 'Custom'}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showFormatDropdown && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                <button onClick={() => handleFormatChange('markdown')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium">Markdown</button>
                <button onClick={() => handleFormatChange('html')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium">HTML</button>
                <button onClick={() => handleFormatChange('custom')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium">Custom Format</button>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={handleShareClick}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:-translate-y-0.5"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Save & Share</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Editor Pane */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-[#0f1115]">
          <CodeEditor 
            value={content}
            onChange={handleContentChange}
            settings={settings}
            language={format === 'html' ? 'html' : 'markdown'}
          />
        </div>
        
        {/* Preview Pane */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto bg-slate-50 dark:bg-[#0a0c10]">
          <Preview content={content} format={format} />
        </div>
      </main>

      {/* Status Bar */}
      <footer className="flex items-center justify-between px-4 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 select-none">
        <div className="flex gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${saveStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          <span>{saveStatus === 'saving' ? 'Saving...' : 'Auto-saved locally'}</span>
        </div>
      </footer>

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onChange={setSettings}
      />
    </div>
  );
}
