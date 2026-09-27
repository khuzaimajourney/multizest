'use client';

import React, { useState } from 'react';
import { Copy, Check, ArrowLeftRight, Trash2 } from 'lucide-react';

export default function CaseConverterTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [activeCase, setActiveCase] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const convertCase = (type: string) => {
    setActiveCase(type);
    if (!input) return;

    let res = '';
    switch (type) {
      case 'upper':
        res = input.toUpperCase();
        break;
      case 'lower':
        res = input.toLowerCase();
        break;
      case 'title':
        res = input.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
        );
        break;
      case 'sentence':
        res = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        res = input
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
          )
          .replace(/\s+/g, '');
        break;
      case 'pascal':
        res = input
          .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
          .replace(/\s+/g, '');
        break;
      case 'snake':
        res = input
          .trim()
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '_');
        break;
      case 'kebab':
        res = input
          .trim()
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
        break;
      case 'alternating':
        res = input
          .split('')
          .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
          .join('');
        break;
      case 'inverse':
        res = input
          .split('')
          .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
          .join('');
        break;
      default:
        res = input;
    }
    setOutput(res);
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setOutput('');
    setActiveCase('');
  };

  return (
    <div className="space-y-6">
      {/* Transformation Buttons Grid */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Select Target Format
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'upper', label: 'UPPERCASE' },
            { id: 'lower', label: 'lowercase' },
            { id: 'title', label: 'Title Case' },
            { id: 'sentence', label: 'Sentence case' },
            { id: 'camel', label: 'camelCase' },
            { id: 'pascal', label: 'PascalCase' },
            { id: 'snake', label: 'snake_case' },
            { id: 'kebab', label: 'kebab-case' },
            { id: 'alternating', label: 'aLtErNaTiNg' },
            { id: 'inverse', label: 'InVeRsE' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => convertCase(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                activeCase === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Output Double View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Input Text</span>
            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput('');
                  setOutput('');
                  setActiveCase('');
                }}
                className="text-slate-400 hover:text-red-500 flex items-center gap-1 font-normal"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (activeCase) {
                // Auto update
                setTimeout(() => convertCase(activeCase), 0);
              }
            }}
            placeholder="Type or paste your text here to change casing..."
            rows={10}
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Converted Result</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSwap}
                disabled={!output}
                title="Swap result back to input"
                className="text-slate-500 hover:text-blue-600 disabled:opacity-30 inline-flex items-center gap-1 text-[11px]"
              >
                <ArrowLeftRight className="w-3 h-3" /> Swap
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output}
                className="text-blue-600 hover:text-blue-700 disabled:opacity-30 inline-flex items-center gap-1 font-bold text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Converted text will appear here..."
            rows={10}
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-mono focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
