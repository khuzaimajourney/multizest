'use client';

import React, { useState } from 'react';
import { Copy, Check, FileText, Sparkles } from 'lucide-react';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'ut',
  'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat',
  'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim',
  'id', 'est', 'laborum', 'curabitur', 'pretium', 'tincidunt', 'lacus', 'nulla', 'gravida', 'orci',
  'a', 'odio', 'nullam', 'varius', 'turpis', 'et', 'commodo', 'pharetra', 'est', 'eros',
  'bibendum', 'elit', 'nec', 'luctus', 'magna', 'felis', 'sollicitudin', 'mauris', 'integer', 'in',
  'mauris', 'eu', 'nibh', 'euismod', 'gravida', 'duis', 'ac', 'tellus', 'et', 'risus',
];

export default function LoremIpsumTool() {
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [startWithClassic, setStartWithClassic] = useState(true);
  const [includeHtmlTags, setIncludeHtmlTags] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const generateSentence = (minWords = 8, maxWords = 15): string => {
    const len = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords;
    const words: string[] = [];
    for (let i = 0; i < len; i++) {
      words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }
    const sentence = words.join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = (sentenceCount = 5): string => {
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  };

  const handleGenerate = () => {
    let output = '';

    if (unit === 'paragraphs') {
      const paras: string[] = [];
      for (let i = 0; i < count; i++) {
        let p = generateParagraph();
        if (i === 0 && startWithClassic) {
          p = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' + p;
        }
        paras.push(includeHtmlTags ? `<p>${p}</p>` : p);
      }
      output = paras.join(includeHtmlTags ? '\n\n' : '\n\n');
    } else if (unit === 'sentences') {
      const sents: string[] = [];
      for (let i = 0; i < count; i++) {
        let s = generateSentence();
        if (i === 0 && startWithClassic) {
          s = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        }
        sents.push(includeHtmlTags ? `<span>${s}</span>` : s);
      }
      output = sents.join(' ');
    } else {
      // Words
      const words: string[] = [];
      for (let i = 0; i < count; i++) {
        if (i === 0 && startWithClassic && count >= 5) {
          words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
          i += 4;
        } else {
          words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
        }
      }
      output = words.join(' ');
      if (includeHtmlTags) output = `<p>${output}</p>`;
    }

    setResult(output);
  };

  // Run on initial render if empty
  React.useEffect(() => {
    handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Unit Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Generation Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'paragraphs' | 'sentences' | 'words')}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            />
          </div>

          {/* Options checkboxes */}
          <div className="space-y-2 pb-1">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={startWithClassic}
                onChange={(e) => setStartWithClassic(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <span>Start with &quot;Lorem ipsum...&quot;</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeHtmlTags}
                onChange={(e) => setIncludeHtmlTags(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600"
              />
              <span>Wrap in HTML tags (&lt;p&gt;)</span>
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Dummy Text</span>
            </button>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span>Generated Content</span>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!result}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>
        </div>

        <div className="relative">
          <textarea
            readOnly
            value={result}
            rows={12}
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-none font-normal"
          />
        </div>
      </div>
    </div>
  );
}
