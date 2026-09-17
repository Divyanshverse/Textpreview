import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { cn } from '../lib/utils';
import { EditorSettings } from '../hooks/useEditorSettings';
import { useTheme } from './ThemeProvider';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  language: 'markdown' | 'html';
  className?: string;
}

export function CodeEditor({ value, onChange, settings, language, className }: CodeEditorProps) {
  const { theme: appTheme } = useTheme();

  // Handle Standard Textarea Fallback
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');

  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  if (settings.engine === 'Standard Textarea') {
    return (
      <div className={cn("flex w-full h-full font-mono text-[13px] overflow-hidden bg-transparent", className)}>
        <div 
          ref={gutterRef}
          className="w-12 flex-shrink-0 bg-slate-50 dark:bg-[#0b0d11] border-r border-slate-200 dark:border-slate-800 py-4 text-right pr-3 text-slate-400 dark:text-slate-600 select-none overflow-hidden"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {lines.map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={cn("flex-1 bg-transparent resize-none outline-none p-4 leading-6 text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-0",
             settings.wordWrap !== 'Off' ? "whitespace-pre-wrap break-words" : "whitespace-pre"
          )}
          style={{ tabSize: 2, fontSize: parseInt(settings.fontSize) || 14 }}
        />
      </div>
    );
  }

  // Monaco Options Mapper
  const fontSize = parseInt(settings.fontSize);
  
  const monacoOptions: any = {
    fontFamily: settings.fontFamily === 'Default Monospace' ? 'monospace' : settings.fontFamily,
    fontSize: fontSize,
    fontLigatures: settings.fontLigatures === 'Enabled',
    lineHeight: settings.lineHeight === 'Default (0)' ? 0 : parseFloat(settings.lineHeight) * fontSize,
    letterSpacing: parseFloat(settings.letterSpacing) || 0,
    wordWrap: settings.wordWrap === 'Auto (Smart)' || settings.wordWrap === 'On' ? 'on' : settings.wordWrap === 'Bounded' ? 'bounded' : 'off',
    renderWhitespace: settings.renderWhitespace.toLowerCase(),
    minimap: { 
      enabled: settings.minimap === 'Enabled',
      renderCharacters: settings.minimapCharacters === 'Render Actual Characters'
    },
    lineNumbers: settings.lineNumbers.toLowerCase(),
    renderLineHighlight: settings.highlightActiveLine.toLowerCase(),
    cursorStyle: settings.cursorStyle.toLowerCase(),
    cursorBlinking: settings.cursorBlinking.toLowerCase(),
    cursorSmoothCaretAnimation: settings.smoothCaretAnimation === 'Enabled' ? 'on' : 'off',
    scrollBeyondLastLine: settings.scrollBeyondLastLine === 'Enabled',
    smoothScrolling: settings.smoothScrolling === 'Enabled',
    multiCursorModifier: settings.multiCursorModifier === 'Alt Key' ? 'altKey' : 'ctrlCmd',
    'bracketPairColorization.enabled': settings.bracketPairColorization === 'Enabled',
    autoClosingBrackets: settings.autoClosingBrackets === 'Language Defined' ? 'languageDefined' : settings.autoClosingBrackets.toLowerCase(),
    autoClosingQuotes: settings.autoClosingQuotes === 'Language Defined' ? 'languageDefined' : settings.autoClosingQuotes.toLowerCase(),
    formatOnPaste: settings.formatOnPaste === 'Enabled',
    folding: settings.codeFolding === 'Enabled',
    quickSuggestions: settings.quickSuggestions === 'Enabled',
    padding: { top: 16, bottom: 16 },
  };

  const resolvedTheme = settings.theme === 'Match App' 
    ? (appTheme === 'dark' ? 'vs-dark' : 'light') 
    : settings.theme === 'vs-light' ? 'light' : settings.theme;

  return (
    <div className={cn("flex w-full h-full overflow-hidden", className)}>
      <Editor
        height="100%"
        width="100%"
        language={language}
        theme={resolvedTheme}
        value={value}
        onChange={(val) => onChange(val || '')}
        options={monacoOptions}
        loading={<div className="flex h-full items-center justify-center text-slate-500">Loading editor...</div>}
      />
    </div>
  );
}

