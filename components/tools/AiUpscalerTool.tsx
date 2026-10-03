/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';

export default function AiUpscalerTool() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [origDimensions, setOrigDimensions] = useState<{ w: number; h: number } | null>(null);
  const [targetDimensions, setTargetDimensions] = useState<{ w: number; h: number } | null>(null);

  const [scale, setScale] = useState<2 | 4>(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Waking up the AI... (This only happens once!)');
  const [fileName, setFileName] = useState('photo');
  const [friendlyAlert, setFriendlyAlert] = useState<string | null>(null);

  // Before/After comparison slider
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const initWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    workerRef.current = new Worker('/workers/upscaler.worker.js');
    workerRef.current.onmessage = (e) => {
      const { type, message, progress: p, dstData, dstWidth, dstHeight, error } = e.data;

      if (type === 'status') {
        if (message) setStatusMessage(message);
        if (p !== undefined) setProgress(p);
      } else if (type === 'done') {
        const canvas = document.createElement('canvas');
        canvas.width = dstWidth;
        canvas.height = dstHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imgData = new ImageData(dstData, dstWidth, dstHeight);
          ctx.putImageData(imgData, 0, 0);
          const url = canvas.toDataURL('image/png');
          setUpscaledImage(url);
          setTargetDimensions({ w: dstWidth, h: dstHeight });
          setIsProcessing(false);
          setProgress(100);
          setStatusMessage('Your picture is crystal clear!');
          fireSuccessConfetti();
        }
      } else if (type === 'error') {
        console.error('Upscaler error:', error);
        setIsProcessing(false);
        setFriendlyAlert('Oops! Something unexpected happened while sharpening. Let\'s try again.');
      }
    };
  }, []);

  useEffect(() => {
    initWorker();
    return () => {
      workerRef.current?.terminate();
    };
  }, [initWorker]);

  const handleFileUpload = (file: File) => {
    setFriendlyAlert(null);
    if (!file.type.startsWith('image/')) {
      setFriendlyAlert('Please pick a regular picture file like JPG, PNG, or WebP.');
      return;
    }
    // Friendly Error Message
    if (file.size > 50 * 1024 * 1024) {
      setFriendlyAlert('Oops! That file is a bit too heavy for your browser to carry. Could you try a file under 50MB?');
      return;
    }

    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalImage(src);
      setUpscaledImage(null);

      const img = new Image();
      img.src = src;
      img.onload = () => {
        // Memory Protection Check (Prevent browser freezing)
        if (img.width > 2000 || img.height > 2000) {
          setFriendlyAlert('This image is already huge! We will keep it safe so your device stays fast and cool.');
        }
        setOrigDimensions({ w: img.width, h: img.height });
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const cancelProcessing = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    setIsProcessing(false);
    setProgress(0);
    setStatusMessage('Canceled.');
    initWorker(); // re-init clean worker
  };

  const startUpscaling = () => {
    if (!originalImage || !origDimensions) return;
    setIsProcessing(true);
    setProgress(15);
    setStatusMessage('Enhancing pixels to make it sharp...');
    setFriendlyAlert(null);

    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      // Memory safety downscale if massive
      let processWidth = img.width;
      let processHeight = img.height;
      const maxDim = 2000;
      if (processWidth > maxDim || processHeight > maxDim) {
        if (processWidth > processHeight) {
          processHeight = Math.round((processHeight * maxDim) / processWidth);
          processWidth = maxDim;
        } else {
          processWidth = Math.round((processWidth * maxDim) / processHeight);
          processHeight = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = processWidth;
      canvas.height = processHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, processWidth, processHeight);
      const imageData = ctx.getImageData(0, 0, processWidth, processHeight);

      if (workerRef.current) {
        workerRef.current.postMessage({
          imageData,
          scale,
          width: processWidth,
          height: processHeight,
        });
      }
    };
  };

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handleDownload = () => {
    if (!upscaledImage) return;
    const link = document.createElement('a');
    link.href = upscaledImage;
    link.download = `${fileName}-crystal-clear-${scale}x.png`;
    link.click();
  };

  const handleReset = () => {
    setOriginalImage(null);
    setUpscaledImage(null);
    setOrigDimensions(null);
    setTargetDimensions(null);
    setIsProcessing(false);
    setProgress(0);
    setFriendlyAlert(null);
  };

  return (
    <div className="space-y-6">
      {friendlyAlert && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{friendlyAlert}</span>
        </div>
      )}

      {!originalImage ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-3 border-dashed border-violet-400 dark:border-violet-600 rounded-3xl p-10 sm:p-16 text-center cursor-pointer bg-violet-50/40 dark:bg-violet-950/20 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all group duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform">
            <Maximize2 className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>Make Blurry Photos Crystal Clear (2x & 4x)</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Drop your blurry or low-res picture here
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            Turn blurry smartphone shots, pixelated memes, and tiny logos into high-resolution pictures without sending your data to the cloud.
          </p>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-md transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>Pick a Picture from Device</span>
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Enhancement Boost:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setScale(2)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    scale === 2
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  2x Double Resolution
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setScale(4)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    scale === 4
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  4x Ultra HD
                </button>
              </div>

              {origDimensions && (
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span>{origDimensions.w} × {origDimensions.h} px</span>
                  <ArrowRight className="w-3.5 h-3.5 text-violet-500" />
                  <span className="font-bold text-violet-600 dark:text-violet-400">
                    {origDimensions.w * scale} × {origDimensions.h * scale} px
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Another Picture</span>
              </button>

              {!upscaledImage ? (
                <button
                  type="button"
                  onClick={startUpscaling}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-violet-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Do the Magic! ({scale}x)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Save my clear picture</span>
                </button>
              )}
            </div>
          </div>

          {/* Conversational Loading State */}
          {isProcessing && (
            <div className="p-6 rounded-3xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/60 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-violet-900 dark:text-violet-200">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-violet-600" />
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
              <div className="w-full h-3 rounded-full bg-violet-200/60 dark:bg-violet-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Running locally on your device hardware. Your photos never leave your computer or phone.
              </p>
            </div>
          )}

          {/* Split Comparison Slider (Before / After) */}
          {upscaledImage ? (
            <div className="space-y-4">
              <div
                ref={containerRef}
                onMouseDown={() => setIsDraggingSlider(true)}
                onMouseUp={() => setIsDraggingSlider(false)}
                onMouseLeave={() => setIsDraggingSlider(false)}
                onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
                onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                className="relative w-full h-[460px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-ew-resize select-none bg-slate-950 shadow-2xl"
              >
                {/* Crystal Clear Output */}
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  <img
                    src={upscaledImage}
                    alt="Crystal Clear Enhanced"
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute bottom-4 right-4 px-3 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Crystal Clear ({scale}x)</span>
                  </span>
                </div>

                {/* Original Blurry Layer */}
                <div
                  className="absolute inset-0 flex items-center justify-center p-2 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={originalImage}
                    alt="Original Blurry"
                    className="max-h-full max-w-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="absolute bottom-4 left-4 px-3 py-1 rounded-lg bg-slate-900/90 backdrop-blur-sm text-white text-xs font-bold tracking-wider uppercase shadow-md">
                    Original Blurry
                  </span>
                </div>

                {/* Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-800 shadow-2xl border border-slate-200 flex items-center justify-center text-xs font-bold">
                    <Sliders className="w-4 h-4 rotate-90 text-violet-600" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
                <span>Slide the divider to compare sharpness.</span>
                <span>Enhanced resolution: {targetDimensions?.w} × {targetDimensions?.h} px</span>
              </div>
            </div>
          ) : (
            !isProcessing && (
              <div className="p-8 text-center rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                <img
                  src={originalImage}
                  alt="Ready to enhance"
                  className="max-h-72 mx-auto rounded-2xl shadow-md mb-4 object-contain"
                />
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Ready to Make this Crystal Clear!
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Select {scale}x boost above and click &quot;Do the Magic!&quot; to begin.
                </p>
                <button
                  type="button"
                  onClick={startUpscaling}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Do the Magic!</span>
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
