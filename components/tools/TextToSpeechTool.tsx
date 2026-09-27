'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, RotateCcw } from 'lucide-react';

export default function TextToSpeechTool() {
  const [text, setText] = useState(
    'Welcome to MultiZest! Our free online tools run completely in your browser with zero file uploads and complete privacy protection.'
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="space-y-6">
      {/* Editor Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Enter text to read aloud</span>
          <span>{text.length} / 5,000 characters</span>
        </div>
        <textarea
          rows={7}
          maxLength={5000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here..."
          className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Voice Controls */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Voice
            </label>
            <select
              value={selectedVoiceIndex}
              onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            >
              {voices.length > 0 ? (
                voices.map((v, i) => (
                  <option key={`${v.name}-${i}`} value={i}>
                    {v.name} ({v.lang})
                  </option>
                ))
              ) : (
                <option value={0}>Standard System Voice</option>
              )}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Speed (Rate)</span>
              <span className="font-mono text-blue-600">{rate}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Pitch</span>
              <span className="font-mono text-blue-600">{pitch}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Playback Button Bar */}
        <div className="pt-2 flex items-center justify-center gap-3">
          {!isPlaying ? (
            <button
              type="button"
              onClick={handlePlay}
              disabled={!text.trim()}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isPaused ? 'Resume Audio' : 'Play Text to Speech'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause Speech</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className="p-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-red-500 disabled:opacity-40 transition-colors"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
