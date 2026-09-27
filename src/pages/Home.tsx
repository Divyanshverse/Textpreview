import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Zap, Moon, Sun, Clock, Plus } from 'lucide-react';
import { store } from '../store';
import { Document } from '../types';
import { format } from 'date-fns';
import { useTheme } from '../components/ThemeProvider';
import { SpiralAnimation } from '@/components/ui/spiral-animation';

export default function Home() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tab, setTab] = useState<'created' | 'viewed'>('created');

  useEffect(() => {
    setDocuments(store.getDocuments());
  }, []);

  const handleCreate = () => {
    const newDoc = store.createDocument();
    navigate(`/doc/${newDoc.id}`);
  };

  const displayedDocs = documents.sort((a, b) => {
    return tab === 'created' ? b.createdAt - a.createdAt : (b.lastViewedAt || 0) - (a.lastViewedAt || 0);
  });

  return (
    <div className="min-h-screen flex flex-col relative text-slate-100 overflow-x-hidden selection:bg-brand-500/30 selection:text-white">
      {/* Dynamic Cosmic Spiral Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-black">
        <SpiralAnimation />
        {/* Subtle radial and vignette overlays for optimal contrast and readability */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 backdrop-blur-[1px]" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center gap-2.5 font-semibold text-lg tracking-tight text-white cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-brand-500 text-white p-1.5 rounded-xl shadow-lg shadow-brand-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <span className="tracking-tight font-bold">Text Preview</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl border border-white/10 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 backdrop-blur-md transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-500/25 border border-white/10"
          >
            <Plus className="w-4 h-4" /> Start Creation
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center relative z-10">
        <div className="text-center max-w-3xl mb-16 sm:mb-20 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-brand-300 mb-8 transition-all hover:-translate-y-0.5 shadow-lg">
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            No account required • Built under divyanshverse
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold mb-8 tracking-tight text-white drop-shadow-md">
            Share Documents <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-400 via-indigo-300 to-purple-400">Instantly</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-normal">
            A minimal, professional workspace for your thoughts. Write in Markdown or HTML with live preview and mathematical typesetting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleCreate}
              className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-brand-500 via-indigo-600 to-purple-600 hover:from-brand-400 hover:via-indigo-500 hover:to-purple-500 text-white font-semibold text-base sm:text-lg transition-all hover:scale-[1.03] active:scale-[0.98] shadow-2xl shadow-indigo-500/30 border border-white/20 backdrop-blur-sm cursor-pointer"
            >
              <span>Enter Workspace & Start Creation</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Documents Showcase Section */}
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Your Documents
            </h2>
            <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
              <button 
                onClick={() => setTab('created')}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === 'created' ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-slate-400 hover:text-white'}`}
              >
                <Plus className="w-4 h-4" /> Created
              </button>
              <button 
                onClick={() => setTab('viewed')}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === 'viewed' ? 'bg-white/15 text-white shadow-sm border border-white/10' : 'text-slate-400 hover:text-white'}`}
              >
                <Clock className="w-4 h-4" /> Viewed
              </button>
            </div>
          </div>

          {displayedDocs.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md flex flex-col items-center shadow-lg">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 mb-6 text-slate-300">
                <FileText className="w-10 h-10" />
              </div>
              <p className="text-slate-300 font-semibold text-lg mb-2">No documents yet</p>
              <p className="text-slate-400 text-sm max-w-sm mb-6">Click below to start creation in a clean Markdown and HTML editor.</p>
              <button
                onClick={handleCreate}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                Create First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedDocs.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => navigate(`/doc/${doc.id}`)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-3xl p-7 cursor-pointer transition-all hover:-translate-y-1 backdrop-blur-md group flex flex-col shadow-lg shadow-black/20"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-white/10 p-3 rounded-2xl text-brand-400 group-hover:text-brand-300 transition-colors border border-white/10">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                      {format(tab === 'created' ? doc.createdAt : (doc.lastViewedAt || doc.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 truncate text-white group-hover:text-brand-300 transition-colors">
                    {doc.title || 'Untitled Document'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-auto pt-6 border-t border-white/10">
                    {doc.format || 'markdown'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 bg-black/40 backdrop-blur-md relative z-10 text-center text-sm text-slate-400">
        <p>Text Preview • Built with passion under <span className="text-white font-semibold">divyanshverse</span></p>
      </footer>
    </div>
  );
}
