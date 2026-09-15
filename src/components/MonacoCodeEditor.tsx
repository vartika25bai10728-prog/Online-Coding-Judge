import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, ZoomIn, ZoomOut, Eye, Sun, Moon } from 'lucide-react';
import { SupportedLanguage } from '../types';

interface MonacoCodeEditorProps {
  problemId: string;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  starterCode: Record<SupportedLanguage, string>;
  code: string;
  onChange: (value: string) => void;
}

export const MonacoCodeEditor: React.FC<MonacoCodeEditorProps> = ({
  problemId,
  language,
  onLanguageChange,
  starterCode,
  code,
  onChange
}) => {
  const [fontSize, setFontSize] = useState<number>(14);
  const [minimap, setMinimap] = useState<boolean>(false);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Auto-restore code from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem(`apex_code_${problemId}_${language}`);
    if (saved) {
      onChange(saved);
    } else if (starterCode[language]) {
      onChange(starterCode[language]);
    }
  }, [problemId, language]);

  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || '';
    onChange(newCode);
    localStorage.setItem(`apex_code_${problemId}_${language}`, newCode);
  };

  const handleResetCode = () => {
    const defaultCode = starterCode[language] || '';
    onChange(defaultCode);
    localStorage.setItem(`apex_code_${problemId}_${language}`, defaultCode);
    setShowResetConfirm(false);
  };

  // Map our language key to Monaco editor's language string
  const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : 'java';

  return (
    <div className="flex flex-col h-full bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d1321] border-b border-slate-800 text-xs">
        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-mono text-[11px]">LANG:</label>
          <select
            id="editor-language-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="python">Python 3.11</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="java">Java 21</option>
            <option value="cpp">C++ (GCC 14)</option>
          </select>
        </div>

        {/* Editor Controls */}
        <div className="flex items-center gap-1.5 text-slate-400">
          {/* Font size control */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5">
            <button
              id="editor-font-decrease"
              onClick={() => setFontSize(s => Math.max(12, s - 1))}
              className="hover:text-white p-0.5"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1">{fontSize}px</span>
            <button
              id="editor-font-increase"
              onClick={() => setFontSize(s => Math.min(22, s + 1))}
              className="hover:text-white p-0.5"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Minimap toggle */}
          <button
            id="editor-minimap-toggle"
            onClick={() => setMinimap(m => !m)}
            className={`p-1.5 rounded border transition-colors ${
              minimap ? 'bg-indigo-950/80 border-indigo-700 text-indigo-400' : 'bg-slate-900 border-slate-800 hover:text-white'
            }`}
            title="Toggle Minimap"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Theme toggle */}
          <button
            id="editor-theme-toggle"
            onClick={() => setTheme(t => t === 'vs-dark' ? 'light' : 'vs-dark')}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:text-white transition-colors"
            title="Toggle Editor Theme"
          >
            {theme === 'vs-dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Reset Code */}
          <div className="relative">
            <button
              id="editor-reset-code-btn"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-rose-900 hover:text-rose-400 transition-colors"
              title="Reset to Template"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[11px]">Reset</span>
            </button>

            {showResetConfirm && (
              <div className="absolute right-0 top-full mt-2 w-52 p-3 bg-slate-900 border border-rose-800/80 rounded-lg shadow-2xl z-50">
                <p className="text-xs text-slate-200 mb-2 font-medium">Revert code to default template?</p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetCode}
                    className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-500 text-white rounded font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-[350px] relative">
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          theme={theme}
          onChange={handleCodeChange}
          options={{
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', monospace",
            lineNumbers: 'on',
            minimap: { enabled: minimap },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'all',
            smoothScrolling: true
          }}
        />
      </div>
    </div>
  );
};
