import React, { useState } from 'react';
import { EditorSettings } from '../hooks/useEditorSettings';
import { X, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onChange: (newSettings: EditorSettings) => void;
}

const TABS = ['Engine', 'Typography', 'Visuals', 'Behavior', 'Assistance'] as const;
type TabType = typeof TABS[number];

export function SettingsModal({ isOpen, onClose, settings, onChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Engine');

  if (!isOpen) return null;

  const handleChange = (key: keyof EditorSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const handleReset = () => {
    localStorage.removeItem('docshowcase_editor_settings');
    window.location.reload();
  };

  const renderDropdown = (label: string, key: keyof EditorSettings, options: string[], subtitle?: string) => (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-neutral-200 mb-1.5">{label}</label>
      {subtitle && <p className="text-xs text-neutral-500 mb-2">{subtitle}</p>}
      <select
        value={settings[key] as string}
        onChange={(e) => handleChange(key, e.target.value)}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-neutral-900/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Editor Settings</h2>
            <p className="text-sm text-neutral-400 mt-1">Customize your coding environment. Settings are saved automatically.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 flex-shrink-0 border-r border-neutral-800 bg-neutral-900/30 p-4 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-neutral-900/10">
            <div className="max-w-xl">
              {activeTab === 'Engine' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  {renderDropdown('Editor Engine', 'engine', ['Monaco Editor (IDE)', 'Standard Textarea'], 'Switch to Standard Textarea on low-end devices.')}
                  {renderDropdown('Editor Theme', 'theme', ['Match App', 'vs-dark', 'vs-light', 'hc-black'], 'Forces a specific theme for the Monaco Editor.')}
                </div>
              )}

              {activeTab === 'Typography' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  {renderDropdown('Font Family', 'fontFamily', ['Default Monospace', 'Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New'])}
                  {renderDropdown('Font Size', 'fontSize', ['12px', '13px', '14px', '16px', '18px', '20px'])}
                  {renderDropdown('Font Ligatures', 'fontLigatures', ['Disabled', 'Enabled'], 'Requires a font with ligatures (e.g., Fira Code).')}
                  {renderDropdown('Line Height', 'lineHeight', ['Default (0)', '1.4', '1.6', '1.8', '2.0'])}
                  {renderDropdown('Letter Spacing', 'letterSpacing', ['Normal (0)', '0.5px', '1px', '1.5px'])}
                </div>
              )}

              {activeTab === 'Visuals' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  {renderDropdown('Word Wrap', 'wordWrap', ['Auto (Smart)', 'On', 'Off', 'Bounded'])}
                  {renderDropdown('Render Whitespace', 'renderWhitespace', ['None', 'Boundary', 'Selection', 'All'])}
                  {renderDropdown('Minimap (Outline)', 'minimap', ['Disabled', 'Enabled'])}
                  {renderDropdown('Minimap Characters', 'minimapCharacters', ['Color Blocks Only', 'Render Actual Characters'])}
                  {renderDropdown('Line Numbers', 'lineNumbers', ['On', 'Off', 'Relative'])}
                  {renderDropdown('Highlight Active Line', 'highlightActiveLine', ['Line', 'None', 'Gutter', 'All'])}
                </div>
              )}

              {activeTab === 'Behavior' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  {renderDropdown('Cursor Style', 'cursorStyle', ['Line', 'Block', 'Underline', 'Line-Thin', 'Block-Outline'])}
                  {renderDropdown('Cursor Blinking', 'cursorBlinking', ['Smooth', 'Blink', 'Solid', 'Expand', 'Phase'])}
                  {renderDropdown('Smooth Caret Animation', 'smoothCaretAnimation', ['Enabled', 'Disabled'])}
                  {renderDropdown('Scroll Beyond Last Line', 'scrollBeyondLastLine', ['Disabled', 'Enabled'])}
                  {renderDropdown('Smooth Scrolling', 'smoothScrolling', ['Enabled', 'Disabled'])}
                  {renderDropdown('Multi-Cursor Modifier', 'multiCursorModifier', ['Alt Key', 'Ctrl / Cmd Key'])}
                </div>
              )}

              {activeTab === 'Assistance' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                  {renderDropdown('Bracket Pair Colorization', 'bracketPairColorization', ['Enabled', 'Disabled'])}
                  {renderDropdown('Auto Closing Brackets', 'autoClosingBrackets', ['Language Defined', 'Always', 'Never', 'Before Whitespace'])}
                  {renderDropdown('Auto Closing Quotes', 'autoClosingQuotes', ['Language Defined', 'Always', 'Never', 'Before Whitespace'])}
                  {renderDropdown('Format On Paste', 'formatOnPaste', ['Enabled', 'Disabled'])}
                  {renderDropdown('Code Folding', 'codeFolding', ['Enabled', 'Disabled'])}
                  {renderDropdown('Quick Suggestions', 'quickSuggestions', ['Enabled', 'Disabled'])}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
