'use client';

import React, { useState } from 'react';
import { Copy, Check, Braces, Minimize2, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';

export default function JsonFormatterTool() {
  const [input, setInput] = useState<string>(
    '{"name":"MultiZest","version":"2.0.0","tools":20,"features":["100% Client-Side","Zero Uploads","Free Forever"],"developer":{"name":"MultiZest Lab","role":"Open Source"}}'
  );
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'code' | 'tree'>('code');
  const [parsedObject, setParsedObject] = useState<unknown>(null);

  const formatJson = () => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      setParsedObject(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setParsedObject(parsed);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid JSON syntax.');
      }
      setOutput('');
      setParsedObject(null);
    }
  };

  const minifyJson = () => {
    setError(null);
    if (!input.trim()) return;

    try {
      const parsed = JSON.parse(input);
      setParsedObject(parsed);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Invalid JSON syntax.');
      }
    }
  };

  React.useEffect(() => {
    formatJson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indentSize]);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  // Render collapsible JSON tree
  const renderTree = (data: unknown, depth = 0): React.ReactNode => {
    if (data === null) return <span className="text-slate-400">null</span>;
    if (typeof data === 'boolean') return <span className="text-amber-500">{String(data)}</span>;
    if (typeof data === 'number') return <span className="text-blue-500 font-mono">{data}</span>;
    if (typeof data === 'string') return <span className="text-emerald-500 font-mono">&quot;{data}&quot;</span>;

    if (Array.isArray(data)) {
      return (
        <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
          <span className="text-slate-400">[</span>
          {data.map((item, idx) => (
            <div key={idx} className="my-1">
              <span className="text-slate-400 text-xs mr-2">{idx}:</span>
              {renderTree(item, depth + 1)}
            </div>
          ))}
          <span className="text-slate-400">]</span>
        </div>
      );
    }

    if (typeof data === 'object') {
      return (
        <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
          <span className="text-slate-400">{'{'}</span>
          {Object.entries(data as Record<string, unknown>).map(([k, v]) => (
            <div key={k} className="my-1">
              <span className="font-bold text-violet-500 text-xs mr-1">&quot;{k}&quot;:</span>
              {renderTree(v, depth + 1)}
            </div>
          ))}
          <span className="text-slate-400">{'}'}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={formatJson}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
          >
            <Braces className="w-3.5 h-3.5" />
            <span>Beautify / Format</span>
          </button>

          <button
            type="button"
            onClick={minifyJson}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>

          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value={1}>Compact Tab</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                viewMode === 'code' ? 'bg-blue-600 text-white' : 'text-slate-500'
              }`}
            >
              Text View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-slate-500'
              }`}
            >
              Tree View
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!output}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Validation Status Banner */}
      {error ? (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Invalid JSON: {error}</span>
        </div>
      ) : output ? (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Valid JSON Syntax</span>
        </div>
      ) : null}

      {/* Split Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Raw Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Raw JSON Input</span>
            <button
              type="button"
              onClick={() => {
                setInput('');
                setOutput('');
                setError(null);
                setParsedObject(null);
              }}
              className="text-slate-400 hover:text-red-500 font-normal"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            rows={15}
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Formatted Output</span>
            <span className="text-slate-400 font-normal">{output.length} characters</span>
          </div>

          {viewMode === 'code' ? (
            <textarea
              readOnly
              value={output}
              placeholder="Formatted JSON will appear here..."
              rows={15}
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs leading-relaxed focus:outline-none"
            />
          ) : (
            <div className="p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 min-h-[300px] max-h-[360px] overflow-auto text-xs">
              {parsedObject ? (
                renderTree(parsedObject)
              ) : (
                <span className="text-slate-400 italic">Enter valid JSON to view interactive tree</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
