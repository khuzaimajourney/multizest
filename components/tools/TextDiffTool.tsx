'use client';

import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  RotateCcw,
  Sparkles,
  PlusCircle,
  MinusCircle,
  CheckCircle,
} from 'lucide-react';
import { diffWords, diffLines, Change } from 'diff';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

export default function TextDiffTool() {
  const sampleOriginal = `MultiZest is a suite of free online tools for creators, developers, and students.
All tools run fast in your web browser with zero server uploads.
We are committed to building reliable, high quality software.`;

  const sampleModified = `MultiZest is an amazing suite of 30+ free online tools for creators, developers, and teams worldwide.
All tools run instantly in your web browser with 100% private client-side execution.
We are passionately dedicated to building foolproof, high quality software.`;

  const [originalText, setOriginalText] = useState(sampleOriginal);
  const [modifiedText, setModifiedText] = useState(sampleModified);
  const [diffMode, setDiffMode] = useState<'words' | 'lines'>('words');

  // Compute differences
  const diffResults = useMemo(() => {
    if (diffMode === 'words') {
      return diffWords(originalText, modifiedText);
    } else {
      return diffLines(originalText, modifiedText);
    }
  }, [originalText, modifiedText, diffMode]);

  // Compute statistics
  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffResults.forEach((part) => {
      const count = part.value.trim().split(/\s+/).filter(Boolean).length;
      if (part.added) added += count;
      if (part.removed) removed += count;
    });
    return { added, removed };
  }, [diffResults]);

  const handleClear = () => {
    setOriginalText('');
    setModifiedText('');
  };

  const handleLoadSample = () => {
    setOriginalText(sampleOriginal);
    setModifiedText(sampleModified);
  };

  return (
    <div className="space-y-6">
      {/* Top Options & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
            <span>Diff Precision:</span>
            <InteractiveTooltip content="Choose word-by-word for prose/articles or line-by-line for source code." />
          </label>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setDiffMode('words')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                diffMode === 'words' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Word-by-Word
            </button>
            <button
              type="button"
              onClick={() => setDiffMode('lines')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                diffMode === 'lines' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Line-by-Line
            </button>
          </div>
        </div>

        {/* Change Stats Badges */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+{stats.added} Words Added</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
            <MinusCircle className="w-3.5 h-3.5" />
            <span>-{stats.removed} Words Removed</span>
          </span>
        </div>
      </div>

      {/* Side-by-Side Input Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Original Text (Before)
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {originalText.length} chars
            </span>
          </div>
          <textarea
            rows={8}
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste your original text or code here..."
            className="w-full p-4 font-mono text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Modified Text (After)
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {modifiedText.length} chars
            </span>
          </div>
          <textarea
            rows={8}
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste the revised text or code here..."
            className="w-full p-4 font-mono text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Difference Visualizer Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-amber-500" />
            <span>Live Visual Difference Highlights</span>
          </label>
          <span className="text-xs text-slate-400">Updates live as you type</span>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto shadow-inner">
          {diffResults.map((part: Change, index: number) => {
            if (part.added) {
              return (
                <mark
                  key={index}
                  className="bg-emerald-200/90 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 rounded px-1 py-0.5 font-bold"
                >
                  {part.value}
                </mark>
              );
            }
            if (part.removed) {
              return (
                <del
                  key={index}
                  className="bg-rose-200/90 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 rounded px-1 py-0.5 line-through opacity-80"
                >
                  {part.value}
                </del>
              );
            }
            return <span key={index} className="text-slate-700 dark:text-slate-300">{part.value}</span>;
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handleLoadSample}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Load Example Comparison</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold"
        >
          Clear Inputs
        </button>
      </div>
    </div>
  );
}
