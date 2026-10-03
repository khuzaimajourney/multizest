'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  FileText,
  List,
  AlignLeft,
  ShieldCheck,
  Download,
  AlertTriangle,
  Clock,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';

const SAMPLE_TEXT = `Artificial intelligence (AI) has emerged as one of the most transformative technologies of the 21st century, reshaping industries from healthcare and finance to transportation and education. In medicine, machine learning models analyze complex radiological imaging to detect malignant tumors earlier than traditional methods, while predictive algorithms optimize hospital resource allocation and clinical workflows. Meanwhile, autonomous vehicles utilize computer vision and sensor fusion to navigate chaotic urban environments with millimeter precision.

However, the widespread deployment of large-scale AI also raises vital questions regarding privacy, algorithmic bias, energy consumption, and labor displacement. Data privacy is a cornerstone concern, as deep neural networks often train on vast troves of personal information harvested across the internet. To address these vulnerabilities, researchers are developing privacy-preserving AI architectures, such as federated learning, differential privacy, and client-side on-device intelligence. 

By running neural inference directly on personal hardware—using modern browser capabilities like WebAssembly and WebGPU—users retain complete sovereignty over their sensitive medical records, private essays, and proprietary code. This shift towards edge computing democratizes access to state-of-the-art natural language processing while drastically reducing reliance on centralized cloud datacenters.`;

export default function AiSummarizerTool() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'short' | 'bullet'>('short');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Waking up the AI... (This only happens once!)');
  const [friendlyAlert, setFriendlyAlert] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time typewriter effect
  const startTypewriter = useCallback((fullText: string) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setDisplayedSummary('');
    setIsTyping(true);

    const words = fullText.split(' ');
    let currentIndex = 0;

    typingTimerRef.current = setInterval(() => {
      currentIndex += 2;
      if (currentIndex >= words.length) {
        setDisplayedSummary(fullText);
        setIsTyping(false);
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        fireSuccessConfetti();
      } else {
        setDisplayedSummary(words.slice(0, currentIndex).join(' '));
      }
    }, 28);
  }, []);

  const initWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    workerRef.current = new Worker('/workers/summarizer.worker.js');
    workerRef.current.onmessage = (e) => {
      const { type, message, progress: p, summary: s, error } = e.data;

      if (type === 'status') {
        if (message) setStatusMessage(message);
        if (p !== undefined) setProgress(p);
      } else if (type === 'progress') {
        if (p !== undefined) setProgress(p);
        setStatusMessage(`Waking up the AI... (This only happens once!) ${p}%`);
      } else if (type === 'done') {
        setSummary(s);
        setIsProcessing(false);
        setProgress(100);
        setStatusMessage('Your summary is ready!');
        startTypewriter(s);
      } else if (type === 'error') {
        console.error('Summarizer worker error:', error);
        setIsProcessing(false);
        setFriendlyAlert('Oops! Something unexpected happened. Please try a shorter snippet or try again.');
      }
    };
  }, [startTypewriter]);

  useEffect(() => {
    initWorker();
    return () => {
      workerRef.current?.terminate();
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, [initWorker]);

  const inputWords = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  const handleSummarize = () => {
    setFriendlyAlert(null);
    if (!inputText.trim()) return;

    // Rule 2 & Engineering Spec: strict 1,000 words limit check with friendly warning
    if (inputWords > 1000) {
      setFriendlyAlert("Whoa, that's a whole book! Please paste a shorter article (under 1000 words).");
      return;
    }

    setIsProcessing(true);
    setProgress(20);
    setStatusMessage('Waking up the AI... (This only happens once!)');
    setDisplayedSummary('');
    setSummary('');

    if (workerRef.current) {
      workerRef.current.postMessage({
        text: inputText,
        mode,
      });
    }
  };

  const cancelProcessing = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }
    setIsProcessing(false);
    setIsTyping(false);
    setProgress(0);
    setStatusMessage('Canceled.');
    initWorker(); // re-init clean worker
  };

  const loadSample = () => {
    setFriendlyAlert(null);
    setInputText(SAMPLE_TEXT);
  };

  const copySummary = () => {
    navigator.clipboard.writeText(summary || displayedSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSummary = () => {
    const textToSave = summary || displayedSummary;
    const blob = new Blob([textToSave], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary-${mode}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summaryWords = (summary || displayedSummary).trim()
    ? (summary || displayedSummary).trim().split(/\s+/).length
    : 0;
  const reductionRate =
    inputWords > 0 && summaryWords > 0
      ? Math.max(0, Math.round(((inputWords - summaryWords) / inputWords) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {friendlyAlert && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{friendlyAlert}</span>
        </div>
      )}

      {/* Privacy Guarantee Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div className="text-xs sm:text-sm">
          <strong>100% Private & In-Browser:</strong> Your essays, research papers, and memos never leave your device. The AI summarizes everything locally.
        </div>
      </div>

      {/* Mode Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Summary Style:
          </span>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode('short')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'short'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Short &amp; Sweet</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('bullet')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'bullet'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Detailed Bullet Points</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!inputText && (
            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>Try Sample Article</span>
            </button>
          )}

          {inputText && (
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setSummary('');
                setDisplayedSummary('');
                setFriendlyAlert(null);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSummarize}
            disabled={isProcessing || !inputText.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Reading your document...' : 'Summarize It'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar with Cancel Button */}
      {isProcessing && (
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
              {statusMessage}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono">{progress}%</span>
              <button
                type="button"
                onClick={cancelProcessing}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-amber-200/60 dark:bg-amber-900 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Initial model download runs directly on your device CPU/GPU and stays cached for instant future visits.
          </p>
        </div>
      )}

      {/* Dual Panel Editor: Input on Left, Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Paste your article or notes here:</span>
            <span className={inputWords > 1000 ? 'text-rose-600 font-bold' : ''}>
              {inputWords} / 1,000 words ({Math.ceil(inputWords / 200)} min read)
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (friendlyAlert) setFriendlyAlert(null);
            }}
            placeholder="Paste your article, meeting notes, research paper, or essay here (under 1000 words)..."
            rows={16}
            className="w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm text-slate-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm resize-none"
          />
        </div>

        {/* Output Panel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Summary Takeaways:</span>
            </span>

            {displayedSummary && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 hidden sm:inline">Save my file as:</span>
                <button
                  type="button"
                  onClick={copySummary}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-50"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={downloadSummary}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold"
                >
                  <Download className="w-3 h-3" />
                  <span>.MD</span>
                </button>
              </div>
            )}
          </div>

          <div className="relative w-full h-[400px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 overflow-auto shadow-sm">
            {displayedSummary ? (
              <div className="space-y-4">
                {/* Reduction metrics pill */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                    <TrendingDown className="w-4 h-4 text-emerald-500" />
                    <span>Reduced by {reductionRate}%</span>
                  </div>
                  <div className="text-slate-500">
                    {inputWords} words → <strong>{summaryWords} words</strong>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 ml-auto">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>~{Math.ceil(summaryWords / 200)} min</span>
                  </div>
                </div>

                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {displayedSummary}
                  {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-amber-500 animate-pulse" />}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <FileText className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium">Your summary will type out here in real-time.</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Paste your text on the left, pick &apos;Short &amp; Sweet&apos; or &apos;Detailed Bullet Points&apos;, and click &apos;Summarize It&apos;.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
