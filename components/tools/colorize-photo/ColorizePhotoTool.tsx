'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Palette,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Share2,
  Copy,
  Check,
  Sliders,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';

type ColorizeState = 'idle' | 'loaded' | 'processing' | 'result';

export default function ColorizePhotoTool() {
  const [state, setState] = useState<ColorizeState>('idle');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [colorizedImage, setColorizedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('colorized-photo');
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Color Intensity (0.5 to 1.5, default 1.0)
  const [intensity, setIntensity] = useState<number>(1.0);

  // Processing state
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('Painting colors onto your memories... 🎨');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAlreadyColoredWarning, setIsAlreadyColoredWarning] = useState<boolean>(false);

  // Before / After comparison slider
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const rawImageBufferRef = useRef<ArrayBuffer | null>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Web Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker('/workers/colorize.worker.js');

      workerRef.current.onmessage = (e) => {
        const { type, text, pct, imageBuffer, width, height, isAlreadyColored, message } = e.data;

        if (type === 'progress') {
          if (pct !== undefined) setProgress(pct);
          if (text) setProgressText(text);
        } else if (type === 'result') {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imgData = new ImageData(new Uint8ClampedArray(imageBuffer), width, height);
            ctx.putImageData(imgData, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            setColorizedImage(dataUrl);
            setState('result');
            setProgress(100);
            if (isAlreadyColored) {
              setIsAlreadyColoredWarning(true);
            }
            fireSuccessConfetti();
          }
        } else if (type === 'error') {
          setErrorMessage(message || 'The AI works best with clear, well-lit black & white photos. Try one with visible faces or scenery for the best results.');
          setState('loaded');
        }
      };

      workerRef.current.onerror = () => {
        setErrorMessage('The colorizer worker encountered an error. Please try again.');
        setState('loaded');
      };
    } catch {
      // Fallback
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFile = (file: File) => {
    setErrorMessage(null);
    setIsAlreadyColoredWarning(false);

    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('That photo is over 8MB. Try uploading a slightly smaller file under 8MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const cleanBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'photo';
    setFileName(`${cleanBaseName}-colorized.png`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = dataUrl;
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        const MAX_DIM = 1600;
        if (w > MAX_DIM || h > MAX_DIM) {
          const scale = MAX_DIM / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        setImageDims({ width: w, height: h });

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          rawImageBufferRef.current = imgData.data.buffer.slice(0);
        }

        setOriginalImage(dataUrl);
        setColorizedImage(null);
        setState('loaded');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRunColorize = (overrideIntensity?: number) => {
    if (!rawImageBufferRef.current || !workerRef.current) return;

    setState('processing');
    setProgress(15);
    setProgressText('Downloading the color AI... (just this once!)');

    const targetIntensity = overrideIntensity !== undefined ? overrideIntensity : intensity;
    const buf = rawImageBufferRef.current.slice(0);

    workerRef.current.postMessage(
      {
        type: 'colorize',
        imageBuffer: buf,
        width: imageDims.width,
        height: imageDims.height,
        intensity: targetIntensity,
      },
      [buf]
    );
  };

  const handleIntensityChange = (val: number) => {
    setIntensity(val);
    handleRunColorize(val);
  };

  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleDownload = () => {
    if (!colorizedImage) return;
    const link = document.createElement('a');
    link.href = colorizedImage;
    link.download = fileName;
    link.click();
  };

  const handleShare = (platform: 'twitter' | 'whatsapp' | 'facebook' | 'copy') => {
    const text = 'I colorized a vintage photo using AI on MultiZest! Check it out:';
    const url = typeof window !== 'undefined' ? window.location.href : 'https://multizest.vercel.app';

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleReset = () => {
    setState('idle');
    setOriginalImage(null);
    setColorizedImage(null);
    setErrorMessage(null);
    setIsAlreadyColoredWarning(false);
    rawImageBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Error or Warning Notice */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{errorMessage}</div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {isAlreadyColoredWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-amber-800 dark:text-amber-200 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="flex-1">
            This photo already looks like it has color! We enhanced its vibrancy and saturation. This tool works best with vintage black &amp; white photos.
          </p>
        </div>
      )}

      {/* STATE 1: IDLE */}
      {state === 'idle' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative cursor-pointer min-h-[55vh] sm:min-h-[62vh] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-violet-500 dark:hover:border-violet-400 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-violet-50/20 dark:hover:bg-violet-950/20 transition-all flex flex-col items-center justify-center p-8 text-center"
        >
          {/* Split Half B&W / Half Color Badge */}
          <div className="w-20 h-20 rounded-3xl overflow-hidden flex shadow-lg shadow-violet-500/10 mb-6 group-hover:scale-110 transition-transform duration-300 border-2 border-slate-300 dark:border-slate-700">
            <div className="w-1/2 h-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Palette className="w-6 h-6 -mr-3" />
            </div>
            <div className="w-1/2 h-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white">
              <Palette className="w-6 h-6 -ml-3" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Give your old photos a splash of color
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md">
            Drop a black &amp; white photo here. Our AI will bring it to life with realistic colors.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              Vintage &amp; Family Portraits
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              Historical Landscapes
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
              🔒 100% Private (No Upload)
            </span>
          </div>
        </div>
      )}

      {/* STATE 2: IMAGE LOADED */}
      {state === 'loaded' && originalImage && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                Ready to add some color?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                This is your original photo. Click the button below and watch the magic happen!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={() => handleRunColorize()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all hover:scale-105 animate-pulse"
              >
                <Sparkles className="w-4 h-4" />
                <span>Colorize Photo ✨</span>
              </button>
            </div>
          </div>

          <div className="max-h-[65vh] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalImage}
              alt="Black and white original upload"
              className="max-h-[62vh] w-auto max-w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* STATE 3: PROCESSING WITH RAINBOW SHIMMER */}
      {state === 'processing' && (
        <div className="min-h-[50vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-500 animate-spin flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center">
              <Palette className="w-10 h-10 text-violet-600 dark:text-violet-400 animate-pulse" />
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Painting colors onto your memories... 🎨
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {progressText} The AI is analyzing textures, faces, and scenery to pick the most realistic colors.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-1.5">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>{progress < 30 ? 'Downloading AI (cached)' : 'Synthesizing chrominance'}</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: RESULT WITH BEFORE / AFTER SLIDER & INTENSITY */}
      {state === 'result' && originalImage && colorizedImage && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  ✨ Your photo, now in living color!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Drag the slider to see the transformation. Download it and surprise your family!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>Download in Full Quality</span>
            </button>
          </div>

          {/* Interactive Split Comparison Slider */}
          <div
            ref={sliderContainerRef}
            onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseLeave={() => setIsDraggingSlider(false)}
            onTouchMove={(e) => isDraggingSlider && e.touches[0] && handleSliderMove(e.touches[0].clientX)}
            onTouchEnd={() => setIsDraggingSlider(false)}
            className="relative w-full max-h-[70vh] rounded-3xl overflow-hidden select-none border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center cursor-ew-resize"
          >
            {/* Colorized Image Base */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={colorizedImage}
              alt="Colorized photo"
              className="max-h-[70vh] w-auto max-w-full object-contain pointer-events-none"
            />

            {/* Original B&W Overlay clipped */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalImage}
                alt="Black and white original"
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Slider Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] z-20 cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
              onMouseDown={() => setIsDraggingSlider(true)}
              onTouchStart={() => setIsDraggingSlider(true)}
            >
              <div className="w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl flex items-center justify-center border-2 border-violet-600 text-[10px] font-bold">
                ◀▶
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md pointer-events-none">
              Original B&amp;W
            </div>
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-600/90 text-white backdrop-blur-md pointer-events-none">
              Colorized ✨
            </div>
          </div>

          {/* Intensity Control Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 justify-center sm:justify-start">
                <Sliders className="w-4 h-4 text-violet-500" />
                Adjust color intensity
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Slide left for softer, more natural tones. Slide right for bolder, more vivid colors.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-medium text-slate-500">Subtle</span>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                onPointerUp={() => handleRunColorize(intensity)}
                onTouchEnd={() => handleRunColorize(intensity)}
                className="w-full sm:w-44 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
              <span className="text-xs font-medium text-slate-500">Vivid</span>
              <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 w-10">
                {Math.round(intensity * 100)}%
              </span>
              <button
                type="button"
                onClick={() => handleRunColorize(intensity)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer"
                title="Apply color intensity"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Share & Secondary Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                Share:
              </span>
              <button
                type="button"
                onClick={() => handleShare('twitter')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-colors"
              >
                X / Twitter
              </button>
              <button
                type="button"
                onClick={() => handleShare('whatsapp')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-colors"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => handleShare('facebook')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => handleShare('copy')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1"
              >
                {copiedShare ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedShare ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Photo</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
