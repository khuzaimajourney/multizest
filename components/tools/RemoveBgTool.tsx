/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  Eraser,
  Brush,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Palette,
  Check,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

type BgType = 'transparent' | 'color' | 'gradient' | 'image';

const GRADIENT_PRESETS = [
  { name: 'Sunset Glow', css: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
  { name: 'Deep Ocean', css: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
  { name: 'Neon Purple', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Emerald Forest', css: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Dark Studio', css: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { name: 'Soft Pastel', css: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
  { name: 'Cyberpunk', css: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' },
  { name: 'Cool Slate', css: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)' },
];

export default function RemoveBgTool() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing AI Model...');
  const [fileName, setFileName] = useState('photo');

  // View / Mode State: 'compare' | 'refine' | 'background'
  const [activeTab, setActiveTab] = useState<'compare' | 'refine' | 'background'>('compare');

  // Split Comparison Slider
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Manual Refine Brush States
  const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState(25);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Background Editor States
  const [bgType, setBgType] = useState<BgType>('transparent');
  const [solidColor, setSolidColor] = useState('#ffffff');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENT_PRESETS[0].css);
  const [customBgImage, setCustomBgImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const originalImageRef = useRef<string | null>(null);

  useEffect(() => {
    originalImageRef.current = originalImage;
  }, [originalImage]);

  // Setup refine canvases
  const initRefineCanvas = useCallback((cutoutUrl: string, origUrl: string) => {
    const cutoutImg = new Image();
    cutoutImg.src = cutoutUrl;
    cutoutImg.onload = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width = cutoutImg.width;
      c.height = cutoutImg.height;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(cutoutImg, 0, 0);

      // Save initial state in history
      const initial = ctx.getImageData(0, 0, c.width, c.height);
      setHistory([initial]);
      setHistoryIndex(0);
    };

    // Keep original in hidden canvas for restore brush
    const origImg = new Image();
    origImg.src = origUrl;
    origImg.onload = () => {
      const oc = originalCanvasRef.current;
      if (!oc) return;
      oc.width = origImg.width;
      oc.height = origImg.height;
      const oCtx = oc.getContext('2d');
      oCtx?.drawImage(origImg, 0, 0);
    };
  }, []);

  // When AI worker finishes mask, compose with original image
  const applyMaskToImage = useCallback((maskData: Uint8ClampedArray, width: number, height: number) => {
    const orig = originalImageRef.current;
    if (!orig) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = orig;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, width, height);
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Apply alpha from maskData
      for (let i = 0; i < maskData.length; i++) {
        const alpha = maskData[i * 4] !== undefined ? maskData[i * 4] : maskData[i];
        data[i * 4 + 3] = alpha;
      }

      ctx.putImageData(imgData, 0, 0);
      const resultUrl = canvas.toDataURL('image/png');
      setProcessedImage(resultUrl);
      setIsProcessing(false);
      setProgress(100);
      setStatusMessage('Cutout complete!');
      fireSuccessConfetti();

      // Initialize canvas for manual refinement
      initRefineCanvas(resultUrl, orig);
    };
  }, [initRefineCanvas]);

  // Local edge-aware cutout fallback
  const fallbackLocalCutout = useCallback(() => {
    const orig = originalImageRef.current;
    if (!orig) return;
    setStatusMessage('Applying edge-aware segmentation...');
    setProgress(75);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = orig;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;

      // Sample background color from border perimeter
      let rSum = 0, gSum = 0, bSum = 0, samples = 0;
      for (let x = 0; x < w; x += 4) {
        const topIdx = x * 4;
        const botIdx = ((h - 1) * w + x) * 4;
        rSum += data[topIdx] + data[botIdx];
        gSum += data[topIdx + 1] + data[botIdx + 1];
        bSum += data[topIdx + 2] + data[botIdx + 2];
        samples += 2;
      }
      for (let y = 0; y < h; y += 4) {
        const leftIdx = (y * w) * 4;
        const rightIdx = (y * w + (w - 1)) * 4;
        rSum += data[leftIdx] + data[rightIdx];
        gSum += data[leftIdx + 1] + data[rightIdx + 1];
        bSum += data[leftIdx + 2] + data[rightIdx + 2];
        samples += 2;
      }
      const bgR = rSum / samples;
      const bgG = gSum / samples;
      const bgB = bSum / samples;

      const threshold = 40;
      const feather = 20;

      for (let i = 0; i < data.length; i += 4) {
        const dist = Math.sqrt(
          (data[i] - bgR) ** 2 +
          (data[i + 1] - bgG) ** 2 +
          (data[i + 2] - bgB) ** 2
        );
        if (dist < threshold) {
          data[i + 3] = 0;
        } else if (dist < threshold + feather) {
          data[i + 3] = Math.round(data[i + 3] * ((dist - threshold) / feather));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const resultUrl = canvas.toDataURL('image/png');
      setProcessedImage(resultUrl);
      setIsProcessing(false);
      setProgress(100);
      initRefineCanvas(resultUrl, orig);
    };
  }, [initRefineCanvas]);

  // Initialize Web Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker('/workers/rmbg.worker.js', { type: 'module' });

      workerRef.current.onmessage = (e) => {
        const { type, message, progress: p, maskData, width, height, error } = e.data;

        if (type === 'status') {
          if (message) setStatusMessage(message);
          if (p !== undefined) setProgress(p);
        } else if (type === 'progress') {
          if (p !== undefined) setProgress(p);
          setStatusMessage(`Downloading AI Model (${p}%). This only happens once!`);
        } else if (type === 'done') {
          applyMaskToImage(maskData, width, height);
        } else if (type === 'fallback' || type === 'error') {
          console.warn('AI worker message:', error);
          fallbackLocalCutout();
        }
      };
    } catch (err) {
      console.warn('Worker init failed, will use direct canvas fallback:', err);
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, [applyMaskToImage, fallbackLocalCutout]);

  const startProcessing = (dataUrl: string) => {
    setIsProcessing(true);
    setProgress(15);
    setStatusMessage('Downloading AI Model (RMBG-1.4). This only happens once!');

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'process',
        imageDataUrl: dataUrl,
      });
    } else {
      fallbackLocalCutout();
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalImage(src);
      startProcessing(src);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomBgUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomBgImage(e.target?.result as string);
      setBgType('image');
    };
    reader.readAsDataURL(file);
  };

  // Slider dragging
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  // Canvas manual brush logic (Erase & Restore)
  const applyBrush = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const origCanvas = originalCanvasRef.current;
    if (!canvas || !origCanvas) return;
    const ctx = canvas.getContext('2d');
    const origCtx = origCanvas.getContext('2d');
    if (!ctx || !origCtx) return;

    const rect = canvas.getBoundingClientRect();
    // Factor in zoom and scale
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, brushSize * (canvas.width / 800), 0, Math.PI * 2);

    if (brushMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
    } else {
      // Restore brush: copy pixels from original image inside circle clip
      ctx.clip();
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(origCanvas, 0, 0);
    }
    ctx.restore();
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    applyBrush(e.clientX, e.clientY);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    applyBrush(e.clientX, e.clientY);
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Push new history state
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Update processedImage preview
    setProcessedImage(canvas.toDataURL('image/png'));
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    setProcessedImage(canvas.toDataURL('image/png'));
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
    setProcessedImage(canvas.toDataURL('image/png'));
  };

  // Final Download
  const handleDownload = () => {
    if (!processedImage) return;

    if (bgType === 'transparent') {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `${fileName}-transparent.png`;
      link.click();
      return;
    }

    // Compose final export on master canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const subjectImg = new Image();
    subjectImg.src = processedImage;

    subjectImg.onload = () => {
      canvas.width = subjectImg.width;
      canvas.height = subjectImg.height;
      if (!ctx) return;

      if (bgType === 'color') {
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(subjectImg, 0, 0);
        triggerDownload(canvas, `${fileName}-${solidColor.replace('#', '')}.png`);
      } else if (bgType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#667eea');
        grad.addColorStop(1, '#764ba2');
        ctx.fillStyle = selectedGradient.includes('linear-gradient') ? grad : '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(subjectImg, 0, 0);
        triggerDownload(canvas, `${fileName}-gradient-bg.png`);
      } else if (bgType === 'image' && customBgImage) {
        const bgImg = new Image();
        bgImg.src = customBgImage;
        bgImg.onload = () => {
          // Cover fit background
          const hRatio = canvas.width / bgImg.width;
          const vRatio = canvas.height / bgImg.height;
          const ratio = Math.max(hRatio, vRatio);
          const centerShiftX = (canvas.width - bgImg.width * ratio) / 2;
          const centerShiftY = (canvas.height - bgImg.height * ratio) / 2;
          ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height, centerShiftX, centerShiftY, bgImg.width * ratio, bgImg.height * ratio);
          ctx.drawImage(subjectImg, 0, 0);
          triggerDownload(canvas, `${fileName}-composite.png`);
        };
      }
    };
  };

  const triggerDownload = (canvas: HTMLCanvasElement, filename: string) => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = filename;
    link.click();
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setProgress(0);
    setBgType('transparent');
    setCustomBgImage(null);
    setHistory([]);
    setHistoryIndex(-1);
  };

  return (
    <div className="space-y-6">
      {/* Hidden canvas for restore brush */}
      <canvas ref={originalCanvasRef} className="hidden" />

      {!originalImage ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-3 border-dashed border-blue-400 dark:border-blue-600 rounded-3xl p-10 sm:p-16 text-center cursor-pointer bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all group duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Powered by RMBG-1.4 State-of-the-Art AI</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Drop your photo for AI background removal
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            Handles complex hair, fine edges, and portraits with sub-pixel precision. 100% private in-browser WebAssembly.
          </p>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>Select Photo from Device</span>
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Processing Bar */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-blue-900 dark:text-blue-200">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
                  {statusMessage}
                </span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-blue-200/60 dark:bg-blue-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Runs locally via Transformers.js & RMBG-1.4 in a Web Worker. Models are cached in browser storage for instant reload.
              </p>
            </div>
          )}

          {processedImage && !isProcessing && (
            <>
              {/* Pro Feature Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('compare')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === 'compare'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Before / After</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('refine')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === 'refine'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Brush className="w-4 h-4" />
                    <span>Manual Refine</span>
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Pro
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('background')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === 'background'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Palette className="w-4 h-4" />
                    <span>Replace Background</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>New Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cutout</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: BEFORE / AFTER SPLIT COMPARISON */}
              {activeTab === 'compare' && (
                <div className="space-y-4">
                  <div
                    ref={containerRef}
                    onMouseDown={() => setIsDraggingSlider(true)}
                    onMouseUp={() => setIsDraggingSlider(false)}
                    onMouseLeave={() => setIsDraggingSlider(false)}
                    onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
                    onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                    className="relative w-full h-[420px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-ew-resize select-none shadow-inner"
                  >
                    {/* Processed Layer */}
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-slate-900">
                      <img
                        src={processedImage}
                        alt="RMBG-1.4 Cutout"
                        className="max-h-full max-w-full object-contain"
                      />
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-bold tracking-wider uppercase">
                        AI Cutout (After)
                      </span>
                    </div>

                    {/* Original Layer */}
                    <div
                      className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none bg-slate-100 dark:bg-slate-950"
                      style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                    >
                      <img
                        src={originalImage}
                        alt="Original Master"
                        className="max-h-full max-w-full object-contain"
                      />
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-800 text-white text-[11px] font-bold tracking-wider uppercase">
                        Original (Before)
                      </span>
                    </div>

                    {/* Center Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 flex items-center justify-center text-xs font-bold">
                        <Sliders className="w-4 h-4 rotate-90 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                    Drag the center divider to inspect edge cutout precision against fine hair and intricate contours.
                  </p>
                </div>
              )}

              {/* TAB 2: MANUAL REFINE BRUSH (ERASE & RESTORE) */}
              {activeTab === 'refine' && (
                <div className="space-y-4">
                  {/* Brush Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBrushMode('erase')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          brushMode === 'erase'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>Erase Brush</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBrushMode('restore')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          brushMode === 'restore'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <Brush className="w-3.5 h-3.5" />
                        <span>Restore Brush</span>
                      </button>
                    </div>

                    {/* Brush Size Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Size: {brushSize}px
                      </span>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={brushSize}
                        onChange={(e) => setBrushSize(Number(e.target.value))}
                        className="w-28 accent-blue-600 cursor-pointer"
                      />
                    </div>

                    {/* Zoom & Undo/Redo */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 w-12 text-center">
                        {Math.round(zoomLevel * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>

                      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                      <button
                        type="button"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100"
                        title="Undo stroke"
                      >
                        <Undo2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100"
                        title="Redo stroke"
                      >
                        <Redo2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Refinement Canvas Viewport */}
                  <div className="relative w-full h-[450px] overflow-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center center',
                        cursor: brushMode === 'erase' ? 'crosshair' : 'cell',
                      }}
                      className="max-h-full max-w-full object-contain shadow-2xl transition-transform"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>💡 <strong>Erase:</strong> Erases rogue pixels. <strong>Restore:</strong> Clones back parts of original image the AI removed.</span>
                    <span>Hold mouse and paint over canvas</span>
                  </div>
                </div>
              )}

              {/* TAB 3: BACKGROUND REPLACEMENT EDITOR */}
              {activeTab === 'background' && (
                <div className="space-y-6">
                  {/* Selector options */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setBgType('transparent')}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        bgType === 'transparent'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:8px_8px] bg-slate-200 dark:bg-slate-800 mb-2 border border-slate-300 dark:border-slate-700" />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          Transparent
                        </div>
                        <div className="text-[11px] text-slate-500">Default PNG Alpha</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBgType('color')}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        bgType === 'color'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 mb-2" style={{ backgroundColor: solidColor }} />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          Solid Colors
                        </div>
                        <div className="text-[11px] text-slate-500">E-commerce White, Black, Custom</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBgType('gradient')}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        bgType === 'gradient'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg mb-2 shadow-sm" style={{ background: selectedGradient }} />
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          Gradients
                        </div>
                        <div className="text-[11px] text-slate-500">Studio & Vibrant Backdrops</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBgType('image');
                        bgFileInputRef.current?.click();
                      }}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        bgType === 'image'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mb-2 border border-indigo-200 dark:border-indigo-800">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          Custom Image
                        </div>
                        <div className="text-[11px] text-slate-500">Upload new backdrop</div>
                      </div>
                    </button>
                    <input
                      type="file"
                      ref={bgFileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleCustomBgUpload(e.target.files[0])}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Sub-panels for Color or Gradient */}
                  {bgType === 'color' && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Quick Presets:
                      </span>
                      {['#FFFFFF', '#000000', '#F3F4F6', '#00FF00', '#1E40AF', '#DC2626', '#EAB308', '#9333EA'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSolidColor(col)}
                          className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 shadow-sm transition-transform hover:scale-110"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-slate-500">Custom:</span>
                        <input
                          type="color"
                          value={solidColor}
                          onChange={(e) => setSolidColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                          {solidColor}
                        </span>
                      </div>
                    </div>
                  )}

                  {bgType === 'gradient' && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {GRADIENT_PRESETS.map((grad) => (
                        <button
                          key={grad.name}
                          type="button"
                          onClick={() => setSelectedGradient(grad.css)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                            selectedGradient === grad.css
                              ? 'border-blue-600 ring-2 ring-blue-500/20 bg-white dark:bg-slate-900'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-md shadow-sm shrink-0" style={{ background: grad.css }} />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {grad.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Backdrop Preview Stage */}
                  <div
                    className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg"
                    style={{
                      background:
                        bgType === 'color'
                          ? solidColor
                          : bgType === 'gradient'
                          ? selectedGradient
                          : bgType === 'image' && customBgImage
                          ? `url(${customBgImage}) center/cover no-repeat`
                          : 'radial-gradient(#cbd5e1 1px, transparent 1px) 0 0/16px 16px #f8fafc',
                    }}
                  >
                    <img
                      src={processedImage}
                      alt="Composite preview"
                      className="max-h-full max-w-full object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
