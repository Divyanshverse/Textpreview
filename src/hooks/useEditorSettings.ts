import { useState, useEffect } from 'react';

export interface EditorSettings {
  // Engine
  engine: 'Monaco Editor (IDE)' | 'Standard Textarea';
  theme: 'Match App' | 'vs-dark' | 'vs-light' | 'hc-black';
  
  // Typography
  fontFamily: 'Default Monospace' | 'Fira Code' | 'JetBrains Mono' | 'Consolas' | 'Courier New';
  fontSize: '12px' | '13px' | '14px' | '16px' | '18px' | '20px';
  fontLigatures: 'Disabled' | 'Enabled';
  lineHeight: 'Default (0)' | '1.4' | '1.6' | '1.8' | '2.0';
  letterSpacing: 'Normal (0)' | '0.5px' | '1px' | '1.5px';

  // Visuals
  wordWrap: 'Auto (Smart)' | 'On' | 'Off' | 'Bounded';
  renderWhitespace: 'None' | 'Boundary' | 'Selection' | 'All';
  minimap: 'Disabled' | 'Enabled';
  minimapCharacters: 'Color Blocks Only' | 'Render Actual Characters';
  lineNumbers: 'On' | 'Off' | 'Relative';
  highlightActiveLine: 'Line' | 'None' | 'Gutter' | 'All';

  // Behavior
  cursorStyle: 'Line' | 'Block' | 'Underline' | 'Line-Thin' | 'Block-Outline';
  cursorBlinking: 'Smooth' | 'Blink' | 'Solid' | 'Phase' | 'Expand';
  smoothCaretAnimation: 'Enabled' | 'Disabled';
  scrollBeyondLastLine: 'Disabled' | 'Enabled';
  smoothScrolling: 'Enabled' | 'Disabled';
  multiCursorModifier: 'Alt Key' | 'Ctrl / Cmd Key';

  // Assistance
  bracketPairColorization: 'Enabled' | 'Disabled';
  autoClosingBrackets: 'Language Defined' | 'Always' | 'Never' | 'Before Whitespace';
  autoClosingQuotes: 'Language Defined' | 'Always' | 'Never' | 'Before Whitespace';
  formatOnPaste: 'Enabled' | 'Disabled';
  codeFolding: 'Enabled' | 'Disabled';
  quickSuggestions: 'Enabled' | 'Disabled';
}

const defaultSettings: EditorSettings = {
  engine: 'Monaco Editor (IDE)',
  theme: 'Match App',
  
  fontFamily: 'Default Monospace',
  fontSize: '14px',
  fontLigatures: 'Disabled',
  lineHeight: 'Default (0)',
  letterSpacing: 'Normal (0)',
  
  wordWrap: 'On',
  renderWhitespace: 'Selection',
  minimap: 'Disabled',
  minimapCharacters: 'Color Blocks Only',
  lineNumbers: 'On',
  highlightActiveLine: 'Line',

  cursorStyle: 'Line',
  cursorBlinking: 'Smooth',
  smoothCaretAnimation: 'Enabled',
  scrollBeyondLastLine: 'Disabled',
  smoothScrolling: 'Enabled',
  multiCursorModifier: 'Alt Key',

  bracketPairColorization: 'Enabled',
  autoClosingBrackets: 'Always',
  autoClosingQuotes: 'Always',
  formatOnPaste: 'Enabled',
  codeFolding: 'Enabled',
  quickSuggestions: 'Enabled',
};

export function useEditorSettings() {
  const [settings, setSettings] = useState<EditorSettings>(() => {
    const saved = localStorage.getItem('docshowcase_editor_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('docshowcase_editor_settings', JSON.stringify(settings));
  }, [settings]);

  return { settings, setSettings };
}
