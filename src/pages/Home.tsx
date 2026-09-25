import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, Zap, Moon, Sun, Clock, Plus } from 'lucide-react';
import { store } from '../store';
import { Document } from '../types';
import { format } from 'date-fns';
import { useTheme } from '../components/ThemeProvider';

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
    return tab === 'created' ? b.createdAt - a.createdAt : b.lastViewedAt - a.lastViewedAt;
  });

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-[#f5f7fa]/80 dark:bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <div className="bg-brand-500 text-white p-1.5 rounded-xl shadow-md">
            <FileText className="w-5 h-5" />
          </div>
          <span>Text Preview</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleCreate}
            className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <Plus className="w-4 h-4" /> New Doc
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center">
        <div className="text-center max-w-3xl mb-20 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#f5f7fa] dark:bg-[#0f1115] neo-light dark:neo-dark text-xs font-semibold text-brand-600 dark:text-brand-400 mb-10 transition-all hover:-translate-y-0.5">
            <Zap className="w-3.5 h-3.5" />
            No account required
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-8 tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
            Share Documents <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-500 to-indigo-600 dark:from-brand-400 dark:to-indigo-400 drop-shadow-sm">Instantly</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            A minimal, professional workspace for your thoughts. Write in Markdown or HTML with live preview and mathematical typesetting.
          </p>
          <button 
            onClick={handleCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-brand-500/25 flex items-center gap-2 mx-auto text-lg"
          >
            Start Creating <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
            <h2 className="text-2xl font-bold tracking-tight">Your Documents</h2>
            <div className="flex bg-[#f5f7fa] dark:bg-[#0f1115] p-1.5 rounded-2xl neo-light-inner dark:neo-dark-inner">
              <button 
                onClick={() => setTab('created')}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === 'created' ? 'bg-[#f5f7fa] dark:bg-[#1a1d24] text-brand-600 dark:text-brand-400 neo-light dark:neo-dark' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Plus className="w-4 h-4" /> Created
              </button>
              <button 
                onClick={() => setTab('viewed')}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${tab === 'viewed' ? 'bg-[#f5f7fa] dark:bg-[#1a1d24] text-brand-600 dark:text-brand-400 neo-light dark:neo-dark' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Clock className="w-4 h-4" /> Viewed
              </button>
            </div>
          </div>

          {displayedDocs.length === 0 ? (
            <div className="text-center py-20 bg-[#f5f7fa] dark:bg-[#0f1115] rounded-3xl neo-light-inner dark:neo-dark-inner flex flex-col items-center">
              <div className="p-4 rounded-2xl neo-light dark:neo-dark mb-6 text-slate-400 dark:text-slate-500">
                <FileText className="w-10 h-10" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">No documents yet. Start writing!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedDocs.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => navigate(`/doc/${doc.id}`)}
                  className="bg-[#f5f7fa] dark:bg-[#161920] rounded-3xl p-7 cursor-pointer transition-all hover:-translate-y-1 neo-light dark:neo-dark group flex flex-col border border-white/50 dark:border-white/5"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-[#f5f7fa] dark:bg-[#0f1115] p-3 rounded-2xl text-brand-600 dark:text-brand-400 neo-light-inner dark:neo-dark-inner">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-[#f5f7fa] dark:bg-[#0f1115] neo-light-inner dark:neo-dark-inner px-3 py-1.5 rounded-full">
                      {format(tab === 'created' ? doc.createdAt : doc.lastViewedAt, 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
                    {doc.format}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
