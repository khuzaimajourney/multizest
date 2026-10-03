'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Sparkles,
  Undo2,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  Paintbrush,
  Square,
  Zap,
} from 'lucide-react';
import { BrushCanvas, BrushCanvasRef, SelectionMode } from './BrushCanvas';
import { fireSuccessConfetti } from '@/lib/confetti';

type ToolState = 'idle' | 'loaded' | 'processing' | 'result';

export default function MagicEraserTool() {
  const [state, setState] = useState<ToolState>('idle');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('erased-photo');

  // Brush and Selection settings
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('brush');
  const [brushSize, setBrushSize] = useState<number>(35);
  const [hasMask, setHasMask] = useState<boolean>(false);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [autoErase, setAutoErase] = useState<boolean>(false);
  const [selectionHint, setSelectionHint] = useState<string | null>(null);

  // Processing state
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>('Working some magic... ✨');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Before / After comparison slider position (0 - 100%)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const canvasRef = useRef<BrushCanvasRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Web Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker('/workers/inpainting.worker.js');

      workerRef.current.onmessage = (e) => {
        const { type, text, pct, imageBuffer, width, height, message } = e.data;

        if (type === 'progress') {
          if (pct !== undefined) setProgress(pct);
          if (text) setProgressText(text);
        } else if (type === 'result') {
          // Convert imageBuffer back to Data URL
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imgData = new ImageData(new Uint8ClampedArray(imageBuffer), width, height);
            ctx.putImageData(imgData, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            setResultImage(dataUrl);
            setState('result');
            setProgress(100);
            fireSuccessConfetti();
          }
        } else if (type === 'error') {
          setErrorMessage(message || 'Hmm, the AI struggled with that one. Try painting a smaller area, or try a different photo.');
          setState('loaded');
        }
      };

      workerRef.current.onerror = () => {
        setErrorMessage('The inpainting worker encountered an issue. Please try again.');
        setState('loaded');
      };
    } catch {
      // Fallback
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // File upload handler
  const handleFile = (file: File) => {
    setErrorMessage(null);
    setSelectionHint(null);

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('That photo is a bit too large for the AI to handle. Try one under 10MB or with smaller dimensions (under 2000×2000 pixels).');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const cleanBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'photo';
    setFileName(`${cleanBaseName}-erased.png`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalImage(dataUrl);
      setResultImage(null);
      setState('loaded');
      setHasMask(false);
      setCanUndo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Erase trigger
  const handleErase = useCallback(() => {
    setSelectionHint(null);

    if (!canvasRef.current || !workerRef.current) return;

    const data = canvasRef.current.getImageAndMaskData();
    if (!data) return;

    // Check if the user has actually selected an area
    if (!data.hasMaskPixels && !hasMask) {
      setSelectionHint('Please brush or drag a box over the object you want to erase first!');
      return;
    }

    setState('processing');
    setProgress(10);
    setProgressText('Working some magic... ✨');

    // Transfer buffers to Web Worker
    const imgBuf = data.imageData.data.buffer.slice(0);
    const maskBuf = data.maskData.data.buffer.slice(0);

    workerRef.current.postMessage(
      {
        type: 'inpaint',
        imageBuffer: imgBuf,
        maskBuffer: maskBuf,
        width: data.width,
        height: data.height,
      },
      [imgBuf, maskBuf]
    );
  }, [hasMask]);

  // Draggable comparison slider handlers
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingSlider && e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  // Download cleaned image
  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = fileName;
    link.click();
  };

  // Continue erasing on top of result image
  const handleEraseMore = () => {
    if (!resultImage) return;
    setOriginalImage(resultImage);
    setResultImage(null);
    setState('loaded');
    setHasMask(false);
    setCanUndo(false);
    setSelectionHint(null);
  };

  const handleReset = () => {
    setState('idle');
    setOriginalImage(null);
    setResultImage(null);
    setErrorMessage(null);
    setSelectionHint(null);
    setHasMask(false);
    setCanUndo(false);
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

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Helpful Hint banner */}
      {selectionHint && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm animate-bounce">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{selectionHint}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectionHint(null)}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Got it
          </button>
        </div>
      )}

      {/* STATE 1: IDLE DROPZONE */}
      {state === 'idle' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative cursor-pointer min-h-[55vh] sm:min-h-[62vh] rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all flex flex-col items-center justify-center p-8 text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10 mb-6 group-hover:scale-110 transition-transform duration-300">
            <UploadCloud className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Drop your photo here
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md">
            or <span className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-4">click to browse</span>. We&apos;ll help you erase anything you don&apos;t want in it.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              JPG, PNG, WebP
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              Up to 10MB
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
              🔒 100% Private (No Upload)
            </span>
          </div>
        </div>
      )}

      {/* STATE 2: IMAGE LOADED / PAINTING TOOLBAR & CANVAS */}
      {state === 'loaded' && originalImage && (
        <div className="space-y-4">
          {/* Instructions and Toolbar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Select or paint over the area you want to remove
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Choose <span className="font-semibold text-slate-900 dark:text-white">Brush</span> to paint freehand, or <span className="font-semibold text-slate-900 dark:text-white">Select Area</span> to drag a box over watermarks and objects.
              </p>
            </div>

            {/* Brush & Action Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Tool Mode Selector: Brush vs Box */}
              <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setSelectionMode('brush')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectionMode === 'brush'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Freehand brush tool"
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Brush</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('box')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectionMode === 'box'
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Drag rectangle to select area"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Select Area</span>
                </button>
              </div>

              {/* Brush size slider (shown in brush mode) */}
              {selectionMode === 'brush' && (
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl shadow-xs">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Size:
                  </span>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20 sm:w-28 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-8 text-right">
                    {brushSize}px
                  </span>
                </div>
              )}

              {/* Auto-erase on select toggle */}
              <button
                type="button"
                onClick={() => setAutoErase(!autoErase)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  autoErase
                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Automatically erase when selection is released"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auto-Erase:</span>
                <span>{autoErase ? 'ON' : 'OFF'}</span>
              </button>

              {/* Undo */}
              <button
                type="button"
                onClick={() => {
                  setSelectionHint(null);
                  canvasRef.current?.undo();
                }}
                disabled={!canUndo}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  canUndo
                    ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent'
                }`}
                title="Undo last stroke"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">↩ Oops</span>
              </button>

              {/* Clear */}
              <button
                type="button"
                onClick={() => {
                  setSelectionHint(null);
                  canvasRef.current?.clearMask();
                  setHasMask(false);
                }}
                disabled={!hasMask}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  hasMask
                    ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-transparent'
                }`}
                title="Start over"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">🗑️ Clear</span>
              </button>

              {/* Erase It Magic Button - ALWAYS CLICKABLE with intelligent feedback */}
              <button
                type="button"
                onClick={handleErase}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ${
                  hasMask
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-blue-500/30 scale-102 animate-pulse ring-2 ring-blue-400/40'
                    : 'bg-gradient-to-r from-blue-500/80 to-indigo-500/80 hover:from-blue-600 hover:to-indigo-600 text-white shadow-slate-500/10'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Erase It ✨</span>
              </button>
            </div>
          </div>

          {/* Interactive Brush Canvas */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-3xl p-2 bg-slate-900/5 dark:bg-slate-950/50">
            <BrushCanvas
              ref={canvasRef}
              imageSrc={originalImage}
              brushSize={brushSize}
              selectionMode={selectionMode}
              onMaskChange={(has, undoable) => {
                setHasMask(has);
                setCanUndo(undoable);
                if (has) setSelectionHint(null);
              }}
              onSelectionComplete={() => {
                if (autoErase) {
                  setTimeout(() => {
                    handleErase();
                  }, 50);
                }
              }}
            />

            {/* In-Canvas Floating Action Capsule when area is selected */}
            {hasMask && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-slate-900/90 dark:bg-slate-950/95 text-white px-4 py-2 rounded-full shadow-2xl backdrop-blur-md border border-white/20 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                  Area Selected
                </span>
                <span className="w-px h-4 bg-white/20" />
                <button
                  type="button"
                  onClick={handleErase}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Erase It Now ✨</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    canvasRef.current?.clearMask();
                    setHasMask(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white px-1.5 py-1 rounded-full transition-colors cursor-pointer"
                  title="Clear selection"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Bottom helper info */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span>Red highlight = area to erase</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Click &amp; drag over objects or watermarks</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
            >
              Choose different photo
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: PROCESSING OVERLAY */}
      {state === 'processing' && (
        <div className="min-h-[50vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 animate-spin flex items-center justify-center p-1">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Working some magic... ✨
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {progressText} Our AI is filling in the gap. This usually takes 5-15 seconds.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-1.5">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>{progress < 40 ? 'Analyzing texture' : 'Synthesizing background'}</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 4: RESULT WITH COMPARISON SLIDER */}
      {state === 'result' && originalImage && resultImage && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Object erased seamlessly! ✨
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Drag the slider to compare before and after. Clean, watermark-free download.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleEraseMore}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Erase More Objects</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Photo</span>
              </button>
            </div>
          </div>

          {/* Interactive Split Comparison Slider */}
          <div
            ref={sliderContainerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseLeave={() => setIsDraggingSlider(false)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDraggingSlider(false)}
            className="relative w-full max-h-[70vh] rounded-3xl overflow-hidden select-none border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center cursor-ew-resize"
          >
            {/* Clean Result Image (Base) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resultImage}
              alt="Erased result photo"
              className="max-h-[70vh] w-auto max-w-full object-contain pointer-events-none"
            />

            {/* Original Image (Overlay with clip-path) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalImage}
                alt="Original photo before erase"
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Slider Divider Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 cursor-ew-resize flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
              onMouseDown={() => setIsDraggingSlider(true)}
              onTouchStart={() => setIsDraggingSlider(true)}
            >
              <div className="w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl flex items-center justify-center border-2 border-blue-600 text-[10px] font-bold">
                ◀▶
              </div>
            </div>

            {/* Badge Labels */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-md pointer-events-none">
              Original
            </div>
            <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600/90 text-white backdrop-blur-md pointer-events-none">
              Erased ✨
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
            <span>Drag the divider line to compare original vs erased</span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start with another photo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
