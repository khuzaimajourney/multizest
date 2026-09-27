'use client';

import React, { useState, useMemo } from 'react';
import {
  Copy,
  Trash2,
  Search,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  Mic,
  AlignLeft,
  FileSpreadsheet,
} from 'lucide-react';

export default function WordCounterTool() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Real-time calculations
  const stats = useMemo(() => {
    const raw = text.trim();
    if (!raw) {
      return {
        words: 0,
        charsWithSpaces: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMin: 0,
        speakingTimeMin: 0,
      };
    }

    // Word count (splits by whitespace)
    const wordMatches = raw.match(/\S+/g);
    const words = wordMatches ? wordMatches.length : 0;

    // Characters
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;

    // Sentences (punctuated by ., !, ?)
    const sentenceMatches = raw.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentences = sentenceMatches.length;

    // Paragraphs
    const paragraphs = raw.split(/\n+/).filter((p) => p.trim().length > 0).length;

    // Reading & Speaking Time
    const readingTimeMin = Math.ceil(words / 200);
    const speakingTimeMin = Math.ceil(words / 130);

    return {
      words,
      charsWithSpaces,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTimeMin,
      speakingTimeMin,
    };
  }, [text]);

  // Keyword density calculation
  const topKeywords = useMemo(() => {
    if (!text.trim()) return [];

    const stopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'is', 'are', 'was', 'were', 'has', 'had', 'been',
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    const freqMap: Record<string, number> = {};
    for (const word of words) {
      freqMap[word] = (freqMap[word] || 0) + 1;
    }

    const sorted = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word, count]) => ({
        word,
        count,
        percent: stats.words > 0 ? ((count / stats.words) * 100).toFixed(1) : '0',
      }));

    return sorted;
  }, [text, stats.words]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy text.');
    }
  };

  const handleClear = () => {
    setText('');
    showToast('Text cleared.');
  };

  const handleTransformCase = (type: 'upper' | 'lower' | 'title' | 'sentence') => {
    if (!text) return;
    let transformed = text;
    if (type === 'upper') {
      transformed = text.toUpperCase();
    } else if (type === 'lower') {
      transformed = text.toLowerCase();
    } else if (type === 'title') {
      transformed = text.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      );
    } else if (type === 'sentence') {
      transformed = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    }
    setText(transformed);
    showToast(`Converted to ${type} case!`);
  };

  const handleReplace = () => {
    if (!findWord) return;
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(findWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const replaced = text.replace(regex, replaceWord);
      setText(replaced);
      showToast('Replacements applied!');
    } catch {
      showToast('Error applying replacement regex.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
          {notification}
        </div>
      )}

      {/* Real-Time Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-300">
            {stats.words.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-blue-950/70 dark:text-blue-200/80 mt-1 uppercase tracking-wider">
            Words
          </div>
        </div>

        <div className="bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200/70 dark:border-violet-900/60 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-black text-violet-700 dark:text-violet-300">
            {stats.charsWithSpaces.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-violet-950/70 dark:text-violet-200/80 mt-1 uppercase tracking-wider">
            Characters
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
            {stats.charsNoSpaces.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            No Spaces
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
            {stats.sentences.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Sentences
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-200">
            {stats.paragraphs.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            Paragraphs
          </div>
        </div>

        <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 rounded-2xl p-4 text-center">
          <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300">
            {stats.readingTimeMin} <span className="text-sm font-semibold">min</span>
          </div>
          <div className="text-xs font-semibold text-amber-950/70 dark:text-amber-200/80 mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" /> Read Time
          </div>
        </div>
      </div>

      {/* Editor Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!text}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold text-red-600 dark:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              showFindReplace
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find & Replace</span>
          </button>
        </div>

        {/* Case Converters */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 mr-1 hidden sm:inline">Case:</span>
          <button
            type="button"
            onClick={() => handleTransformCase('upper')}
            disabled={!text}
            className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono disabled:opacity-40"
          >
            UPPER
          </button>
          <button
            type="button"
            onClick={() => handleTransformCase('lower')}
            disabled={!text}
            className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono disabled:opacity-40"
          >
            lower
          </button>
          <button
            type="button"
            onClick={() => handleTransformCase('title')}
            disabled={!text}
            className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono disabled:opacity-40"
          >
            Title
          </button>
          <button
            type="button"
            onClick={() => handleTransformCase('sentence')}
            disabled={!text}
            className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono disabled:opacity-40"
          >
            Sentence
          </button>
        </div>
      </div>

      {/* Expandable Find & Replace Panel */}
      {showFindReplace && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Find word or phrase
              </label>
              <input
                type="text"
                value={findWord}
                onChange={(e) => setFindWord(e.target.value)}
                placeholder="e.g. error"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Replace with
              </label>
              <input
                type="text"
                value={replaceWord}
                onChange={(e) => setReplaceWord(e.target.value)}
                placeholder="e.g. fix"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <span>Match case</span>
            </label>
            <button
              type="button"
              onClick={handleReplace}
              disabled={!findWord}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40"
            >
              Replace All
            </button>
          </div>
        </div>
      )}

      {/* Main Textarea Editor */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type your text here... Words, characters, sentences, and reading metrics calculate in real-time."
          className="w-full min-h-[320px] p-5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y font-normal"
        />
        {text.length === 0 && (
          <div className="absolute bottom-4 right-4 text-xs text-slate-400 pointer-events-none">
            Ready for input
          </div>
        )}
      </div>

      {/* Bottom Insights: Speaking Time & Keyword Density */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Speaking pace & presentation estimation */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Estimated Speaking Time
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {stats.speakingTimeMin} {stats.speakingTimeMin === 1 ? 'minute' : 'minutes'}
            </div>
            <div className="text-[11px] text-slate-400">
              Calculated at conversational speech rate (130 words/minute).
            </div>
          </div>
        </div>

        {/* Keyword density overview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span>Top Keywords (Density)</span>
            <span className="text-[11px] font-normal text-slate-400">Stop words filtered</span>
          </div>

          {topKeywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topKeywords.map((item) => (
                <span
                  key={item.word}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{item.word}</span>
                  <span className="text-slate-400 text-[10px]">
                    ({item.count}× / {item.percent}%)
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Type or paste longer content to analyze keyword density.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
