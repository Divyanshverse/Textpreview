import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Share2, ChevronDown, Moon, Sun, Check, Settings as SettingsIcon, Copy, ExternalLink, Plus, Undo2, Redo2 } from 'lucide-react';
import LZString from 'lz-string';
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
  const [searchParams] = useSearchParams();
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

  const { pushSnapshot, undo, redo, canUndo, canRedo } = useHistory(id, content);

  useEffect(() => {
    if (id) {
      const encodedData = searchParams.get('d');
      let found = store.getDocument(id);

      if (encodedData) {
        try {
          const decodedString = LZString.decompressFromEncodedURIComponent(encodedData);
          if (decodedString) {
            const parsedData = JSON.parse(decodedString);
            if (found) {
               store.updateDocument(id, parsedData);
               found = store.getDocument(id);
            } else {
               const newDoc = { ...parsedData, id };
               found = store.createDocument(newDoc);
            }
            // Clean up the URL so it's not massive in the address bar
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('d');
            window.history.replaceState({}, '', cleanUrl.toString());
          }
        } catch (e) {
          console.error("Failed to decode document from URL", e);
        }
      }

      if (found) {
        setDoc(found);
        setContent(found.content);
        setTitle(found.title);
        setFormat(found.format);
        store.markViewed(id);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]); // Removed searchParams to prevent reload loop on share

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    if (id) {
      store.updateDocument(id, { content: newContent });
    }
  }, [id]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      pushSnapshot(content);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [content, pushSnapshot]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (id) {
      store.updateDocument(id, { title: newTitle });
    }
  };

  const handleFormatChange = (newFormat: 'markdown' | 'html' | 'custom') => {
    setFormat(newFormat);
    setShowFormatDropdown(false);
    if (id) store.updateDocument(id, { format: newFormat });
  };

  const handleUndo = () => {
    const restored = undo();
    if (restored !== null) {
      setContent(restored);
      if (id) store.updateDocument(id, { content: restored });
    }
  };

  const handleRedo = () => {
    const restored = redo();
    if (restored !== null) {
      setContent(restored);
      if (id) store.updateDocument(id, { content: restored });
    }
  };

  const handleShareClick = () => {
    if (id) {
      store.updateDocument(id, { content, title, format });
      
      const compressedData = LZString.compressToEncodedURIComponent(JSON.stringify({
        title,
        content,
        format
      }));
      
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('d', compressedData);
      window.history.replaceState({}, '', newUrl.toString());
      
      setShowSharePage(true);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
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
          <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Your document is ready to share</p>

          <div className="w-full max-w-xl space-y-4">
            <div className="bg-[#f5f7fa] dark:bg-[#15171b] border border-slate-200 dark:border-slate-800/60 rounded-xl p-5 text-center shadow-sm">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">Public URL</p>
              <code className="text-sm font-mono text-slate-800 dark:text-slate-200 break-all bg-white/50 dark:bg-[#0a0c10]/50 px-3 py-1.5 rounded-lg block">
                {window.location.href}
              </code>
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
                onClick={handleCopyUrl}
                className="flex items-center justify-center gap-2 bg-transparent border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-xl font-medium transition-all text-sm shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setShowSharePage(false);
                  const cleanUrl = new URL(window.location.href);
                  cleanUrl.searchParams.delete('d');
                  window.history.replaceState({}, '', cleanUrl.toString());
                }}
                className="flex items-center justify-center gap-2 bg-transparent border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-xl font-medium transition-all text-sm shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </button>
              <button 
                onClick={() => {
                  const newDoc = store.createDocument();
                  navigate(`/doc/${newDoc.id}`);
                  setShowSharePage(false);
                }}
                className="flex items-center justify-center gap-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-6 py-3.5 rounded-xl font-medium transition-all shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                New Doc
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
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Require Password to View</span>
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Link Expiry Date</span>
                      <input type="date" className="bg-transparent border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 outline-none" />
                    </div>
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
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Auto-saved locally
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
