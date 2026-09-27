'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

export default function PasswordGeneratorTool() {
  const [length, setLength] = useState<number>(16);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [multiList, setMultiList] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateSinglePassword = (): string => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) chars += '0123456789';
    if (useSymbols) chars += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    if (excludeAmbiguous) {
      chars = chars.replace(/[0O1lI|]/g, '');
    }

    if (!chars) return '';

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    return result;
  };

  const regenerate = () => {
    if (typeof window === 'undefined') return;
    const pwd = generateSinglePassword();
    setPassword(pwd);

    // Also generate 5 options
    const list: string[] = [];
    for (let i = 0; i < 5; i++) {
      list.push(generateSinglePassword());
    }
    setMultiList(list);
  };

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, useUpper, useLower, useNumbers, useSymbols, excludeAmbiguous]);

  const handleCopy = async (str: string, index?: number) => {
    try {
      await navigator.clipboard.writeText(str);
      if (typeof index === 'number') {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 1500);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (_) {}
  };

  // Calculate entropy score
  const getEntropyScore = (): { label: string; color: string; percent: number } => {
    let pool = 0;
    if (useUpper) pool += 26;
    if (useLower) pool += 26;
    if (useNumbers) pool += 10;
    if (useSymbols) pool += 30;
    if (pool === 0) return { label: 'None', color: 'bg-red-500', percent: 0 };

    const entropy = length * Math.log2(pool);
    if (entropy < 40) return { label: 'Weak', color: 'bg-red-500', percent: 25 };
    if (entropy < 65) return { label: 'Fair', color: 'bg-amber-500', percent: 55 };
    if (entropy < 85) return { label: 'Strong', color: 'bg-emerald-500', percent: 80 };
    return { label: 'Very Strong', color: 'bg-blue-600', percent: 100 };
  };

  const strength = getEntropyScore();

  return (
    <div className="space-y-6">
      {/* Generated Password Box */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Generated Password
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400">Strength:</span>
            <span className="text-emerald-400">{strength.label}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 font-mono text-lg sm:text-2xl font-bold tracking-wider break-all select-all flex items-center justify-between gap-4">
          <span className="text-emerald-400">{password || 'Select options below'}</span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={regenerate}
              title="Regenerate Password"
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleCopy(password)}
              title="Copy to Clipboard"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors inline-flex items-center gap-1 font-sans text-xs font-bold"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Strength Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
      </div>

      {/* Settings Panel */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            <span>Password Length</span>
            <span className="text-blue-600 font-mono text-sm">{length} Characters</span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>6 (Short)</span>
            <span>16 (Recommended)</span>
            <span>64 (Maximum)</span>
          </div>
        </div>

        {/* Character Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useUpper}
              onChange={(e) => setUseUpper(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <span>Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useLower}
              onChange={(e) => setUseLower(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <span>Lowercase (a-z)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={(e) => setUseNumbers(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <span>Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={(e) => setUseSymbols(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <span>Symbols (!@#$)</span>
          </label>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600"
            />
            <span>Exclude ambiguous characters (0, O, 1, l, I)</span>
          </label>
        </div>
      </div>

      {/* Multiple Generated Options */}
      {multiList.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Alternative Random Choices
          </span>
          <div className="space-y-2">
            {multiList.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono shadow-sm"
              >
                <span className="truncate max-w-sm sm:max-w-md text-slate-800 dark:text-slate-200">
                  {item}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(item, idx)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-600 font-sans font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
