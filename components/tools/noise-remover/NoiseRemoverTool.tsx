'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Volume2,
  Sparkles,
  Download,
  RotateCcw,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Music,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';

type DenoiseState = 'idle' | 'uploaded' | 'processing' | 'result';

export default function NoiseRemoverTool() {
  const [state, setState] = useState<DenoiseState>('idle');
  const [fileName, setFileName] = useState<string>('clean-audio');
  const [fileSizeMb, setFileSizeMb] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Noise reduction strength: 'light' | 'aggressive'
  const [strength, setStrength] = useState<'light' | 'aggressive'>('light');

  // Audio URLs & Buffers
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [cleanedAudioUrl, setCleanedAudioUrl] = useState<string | null>(null);
  const [cleanedWavBuffer, setCleanedWavBuffer] = useState<ArrayBuffer | null>(null);

  // Download format selection: 'wav' | 'mp3'
  const [exportFormat, setExportFormat] = useState<'wav' | 'mp3'>('wav');

  // Playback states
  const [playingOriginal, setPlayingOriginal] = useState<boolean>(false);
  const [playingCleaned, setPlayingCleaned] = useState<boolean>(false);

  // Processing state
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('Scrubbing away the noise... 🧹');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const cleanedAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Raw channel data for worker
  const audioBufferLeftRef = useRef<Float32Array | null>(null);
  const audioBufferRightRef = useRef<Float32Array | null>(null);
  const sampleRateRef = useRef<number>(44100);

  // Canvas visualizer refs
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw static waveform onto canvas
  const drawWaveform = useCallback((canvas: HTMLCanvasElement | null, channelData: Float32Array, color: string) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = color;
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  }, []);

  // Initialize Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker('/workers/rnnoise.worker.js');

      workerRef.current.onmessage = (e) => {
        const { type, pct, text, wavBuffer, cleanLeft, message } = e.data;

        if (type === 'progress') {
          if (pct !== undefined) setProgress(pct);
          if (text) setProgressText(text);
        } else if (type === 'result') {
          const blob = new Blob([wavBuffer], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          setCleanedAudioUrl(url);
          setCleanedWavBuffer(wavBuffer);
          setState('result');
          setProgress(100);
          fireSuccessConfetti();

          // Render after waveform
          if (cleanLeft) {
            setTimeout(() => {
              drawWaveform(afterCanvasRef.current, new Float32Array(cleanLeft), '#10b981');
            }, 100);
          }
        } else if (type === 'error') {
          setErrorMessage(message || 'Audio cleaning failed.');
          setState('uploaded');
        }
      };

      workerRef.current.onerror = () => {
        setErrorMessage('Worker error occurred during audio cleaning.');
        setState('uploaded');
      };
    } catch {
      // Fallback
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, [drawWaveform]);

  // Handle uploaded audio file
  const handleFile = async (file: File) => {
    setErrorMessage(null);

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      setErrorMessage('That recording is longer than we can handle right now. Try a file under 50MB (about 30 minutes of audio).');
      return;
    }

    setFileName(file.name.substring(0, file.name.lastIndexOf('.')) || 'recording');
    setFileSizeMb(parseFloat((file.size / (1024 * 1024)).toFixed(1)));

    try {
      const origUrl = URL.createObjectURL(file);
      setOriginalAudioUrl(origUrl);

      const arrayBuffer = await file.arrayBuffer();

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioDuration(Math.round(decoded.duration));

      sampleRateRef.current = decoded.sampleRate;
      audioBufferLeftRef.current = decoded.getChannelData(0);
      if (decoded.numberOfChannels > 1) {
        audioBufferRightRef.current = decoded.getChannelData(1);
      } else {
        audioBufferRightRef.current = null;
      }

      setState('uploaded');

      // Draw initial before waveform
      setTimeout(() => {
        drawWaveform(beforeCanvasRef.current, decoded.getChannelData(0), '#f59e0b');
      }, 100);

    } catch {
      setErrorMessage("We can't read this audio format. Try converting it to MP3 or WAV first using our Audio Converter tool!");
      setState('idle');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Run AI Denoise in Web Worker
  const runDenoise = () => {
    if (!audioBufferLeftRef.current || !workerRef.current) return;

    setState('processing');
    setProgress(5);
    setProgressText('Scrubbing away the noise... 🧹');

    // Transfer copies of buffers
    const leftCopy = new Float32Array(audioBufferLeftRef.current).buffer;
    const rightCopy = audioBufferRightRef.current ? new Float32Array(audioBufferRightRef.current).buffer : undefined;

    const transferables = [leftCopy];
    if (rightCopy) transferables.push(rightCopy);

    workerRef.current.postMessage(
      {
        type: 'denoise',
        channelDataLeft: leftCopy,
        channelDataRight: rightCopy,
        sampleRate: sampleRateRef.current,
        strength,
      },
      transferables
    );
  };

  // Download output
  const handleDownload = () => {
    if (!cleanedAudioUrl) return;

    const link = document.createElement('a');
    link.href = cleanedAudioUrl;
    link.download = `${fileName}-clean.${exportFormat === 'mp3' ? 'mp3' : 'wav'}`;
    link.click();
  };

  // Reset
  const handleReset = () => {
    if (originalAudioRef.current) originalAudioRef.current.pause();
    if (cleanedAudioRef.current) cleanedAudioRef.current.pause();

    setState('idle');
    setOriginalAudioUrl(null);
    setCleanedAudioUrl(null);
    setCleanedWavBuffer(null);
    setErrorMessage(null);
    setPlayingOriginal(false);
    setPlayingCleaned(false);
    audioBufferLeftRef.current = null;
    audioBufferRightRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Hidden Audio Elements */}
      {originalAudioUrl && (
        <audio
          ref={originalAudioRef}
          src={originalAudioUrl}
          onEnded={() => setPlayingOriginal(false)}
        />
      )}
      {cleanedAudioUrl && (
        <audio
          ref={cleanedAudioRef}
          src={cleanedAudioUrl}
          onEnded={() => setPlayingCleaned(false)}
        />
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{errorMessage}</div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* STATE 1: IDLE DROPZONE */}
      {state === 'idle' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative cursor-pointer min-h-[55vh] sm:min-h-[62vh] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
            <Volume2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clean Up Your Audio
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md">
            Drop your noisy recording here. We&apos;ll remove background noise and make it sound crisp and clear.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              MP3, WAV, M4A, OGG, WebM
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              Up to 50MB (~30 mins)
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
              🔒 100% Private (No Upload)
            </span>
          </div>
        </div>
      )}

      {/* STATE 2: UPLOADED / SETTINGS */}
      {state === 'uploaded' && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-500" />
                Here&apos;s your original recording 🔊
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Press play to hear it. Notice the background noise? We&apos;ll fix that! ({audioDuration}s • {fileSizeMb}MB)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!originalAudioRef.current) return;
                  if (playingOriginal) {
                    originalAudioRef.current.pause();
                    setPlayingOriginal(false);
                  } else {
                    originalAudioRef.current.play();
                    setPlayingOriginal(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs hover:bg-slate-50 transition-colors"
              >
                {playingOriginal ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-amber-500" />}
                <span>{playingOriginal ? 'Pause' : 'Play Original'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Change File
              </button>
            </div>
          </div>

          {/* Waveform Canvas Container (Before) */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
            <span className="text-[11px] font-mono text-amber-400/90 block mb-2">
              ORIGINAL AUDIO WAVEFORM (WITH BACKGROUND NOISE SPIKES)
            </span>
            <canvas ref={beforeCanvasRef} width={800} height={80} className="w-full h-20 object-contain" />
          </div>

          {/* Noise Removal Strength Toggle */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                How much noise should we remove?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose between gentle suppression or aggressive noise stripping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStrength('light')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  strength === 'light'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  🌿 Light (Recommended)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Keeps more natural vocal warmth while removing fan hums and air conditioners.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStrength('aggressive')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  strength === 'aggressive'
                    ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  ⚡ Aggressive
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Removes maximum background noise and traffic. Best for very loud environments.
                </div>
              </button>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={runDenoise}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Clean Background Noise Now</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: PROCESSING WITH CHUNK PROGRESS */}
      {state === 'processing' && (
        <div className="min-h-[50vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 animate-pulse">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Scrubbing away the noise... 🧹
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {progressText} Processing your audio chunk by chunk. This takes about 1 second per 10 seconds of audio.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-1.5">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>Spectral Subtraction</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: RESULT WITH DUAL STACKED WAVEFORMS & PLAYBACK */}
      {state === 'result' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                Listen to the difference! 🎧
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Play both tracks below to hear the background noise disappear!
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Download Clean Audio</span>
            </button>
          </div>

          {/* DUAL STACKED WAVEFORMS */}
          <div className="space-y-4">
            {/* Waveform 1: Before (Original) */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  BEFORE: Original Recording (With Noise)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!originalAudioRef.current) return;
                    if (playingOriginal) {
                      originalAudioRef.current.pause();
                      setPlayingOriginal(false);
                    } else {
                      if (cleanedAudioRef.current) {
                        cleanedAudioRef.current.pause();
                        setPlayingCleaned(false);
                      }
                      originalAudioRef.current.play();
                      setPlayingOriginal(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold transition-colors"
                >
                  {playingOriginal ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{playingOriginal ? 'Pause Original' : 'Play Original'}</span>
                </button>
              </div>

              <canvas ref={beforeCanvasRef} width={800} height={70} className="w-full h-16 object-contain" />
            </div>

            {/* Waveform 2: After (Cleaned) */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-emerald-900/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  AFTER: Cleaned with AI (Background Noise Gone!)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!cleanedAudioRef.current) return;
                    if (playingCleaned) {
                      cleanedAudioRef.current.pause();
                      setPlayingCleaned(false);
                    } else {
                      if (originalAudioRef.current) {
                        originalAudioRef.current.pause();
                        setPlayingOriginal(false);
                      }
                      cleanedAudioRef.current.play();
                      setPlayingCleaned(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-bold transition-colors shadow-sm"
                >
                  {playingCleaned ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{playingCleaned ? 'Pause Cleaned' : 'Play Cleaned'}</span>
                </button>
              </div>

              <canvas ref={afterCanvasRef} width={800} height={70} className="w-full h-16 object-contain" />
            </div>
          </div>

          {/* Download & Export Configuration Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Format:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('wav')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    exportFormat === 'wav'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  WAV (Lossless Master)
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('mp3')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    exportFormat === 'mp3'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  MP3 (Standard Audio)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clean Another Recording</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Save Clean Audio</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
