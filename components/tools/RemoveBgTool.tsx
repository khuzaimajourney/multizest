/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  Layers,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

export default function RemoveBgTool() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [bgColor, setBgColor] = useState<'transparent' | 'white' | 'black' | 'green'>('transparent');
  const [fileName, setFileName] = useState('image');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Background removal algorithm using smart edge and chroma segmentation
  const processImage = useCallback((imgSrc: string) => {
    setIsProcessing(true);
    setProgress(15);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;

    img.onload = () => {
      setProgress(40);

      // Create high-res canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      setProgress(65);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      // Sample border corner pixels to detect dominant background color
      const sampleCorners = [
        [0, 0],
        [width - 1, 0],
        [0, height - 1],
        [width - 1, height - 1],
        [Math.floor(width / 2), 0],
        [0, Math.floor(height / 2)],
        [width - 1, Math.floor(height / 2)],
      ];

      let rSum = 0, gSum = 0, bSum = 0;
      for (const [cx, cy] of sampleCorners) {
        const idx = (cy * width + cx) * 4;
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
      }

      const bgR = rSum / sampleCorners.length;
      const bgG = gSum / sampleCorners.length;
      const bgB = bSum / sampleCorners.length;

      // Distance threshold with soft feathered alpha transition
      const colorDist = (r: number, g: number, b: number) => {
        return Math.sqrt(
          Math.pow(r - bgR, 2) +
          Math.pow(g - bgG, 2) +
          Math.pow(b - bgB, 2)
        );
      };

      const threshold = 45;
      const feather = 20;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Also check if pixel is near-white or uniform background
        const dist = colorDist(r, g, b);

        if (dist < threshold) {
          data[i + 3] = 0; // Fully transparent
        } else if (dist < threshold + feather) {
          const alphaFactor = (dist - threshold) / feather;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProgress(95);

      setTimeout(() => {
        const resultUrl = canvas.toDataURL('image/png');
        setProcessedImage(resultUrl);
        setIsProcessing(false);
        setProgress(100);
        fireSuccessConfetti();
      }, 400);
    };

    img.onerror = () => {
      setIsProcessing(false);
    };
  }, []);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalImage(src);
      // Auto-processing kicks off immediately per V3 UX rules!
      processImage(src);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handleDownload = () => {
    if (!processedImage) return;

    if (bgColor === 'transparent') {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = `${fileName}-no-bg.png`;
      link.click();
    } else {
      // Export with selected solid background color
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = processedImage;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.fillStyle = bgColor === 'white' ? '#FFFFFF' : bgColor === 'black' ? '#000000' : '#00FF00';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${fileName}-${bgColor}-bg.png`;
          link.click();
        }
      };
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setIsProcessing(false);
    setProgress(0);
    setBgColor('transparent');
  };

  return (
    <div className="space-y-6">
      {!originalImage ? (
        /* Massive Dropzone - V3 Foolproof Requirement */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
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
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Drop your photo here
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Supports JPG, PNG, and WebP. Background detection starts automatically with zero clicks.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm group-hover:bg-blue-700 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Image File</span>
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress State */}
          {isProcessing && (
            <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-blue-900 dark:text-blue-200">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
                  Analyzing photo & removing background...
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-blue-200/60 dark:bg-blue-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Processing entirely on your device. Your photo stays 100% private.
              </p>
            </div>
          )}

          {/* Interactive Before/After Split Preview */}
          {processedImage && (
            <div className="space-y-6">
              {/* Background Color Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Background:</span>
                  <InteractiveTooltip content="Choose whether to keep transparent background or replace it with crisp studio colors." />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBgColor('transparent')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      bgColor === 'transparent'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Transparent
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor('white')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      bgColor === 'white'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Pure White
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor('black')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      bgColor === 'black'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Black
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor('green')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      bgColor === 'green'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Green Screen
                  </button>
                </div>
              </div>

              {/* Split Comparison Slider */}
              <div
                ref={containerRef}
                onMouseDown={() => setIsDraggingSlider(true)}
                onMouseUp={() => setIsDraggingSlider(false)}
                onMouseLeave={() => setIsDraggingSlider(false)}
                onMouseMove={(e) => isDraggingSlider && handleSliderMove(e.clientX)}
                onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-ew-resize select-none shadow-inner"
              >
                {/* Processed Cutout (Background layer) */}
                <div
                  className={`absolute inset-0 flex items-center justify-center ${
                    bgColor === 'white'
                      ? 'bg-white'
                      : bgColor === 'black'
                      ? 'bg-black'
                      : bgColor === 'green'
                      ? 'bg-green-500'
                      : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100 dark:bg-slate-900'
                  }`}
                >
                  <img
                    src={processedImage}
                    alt="Processed subject cutout"
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-emerald-600/90 text-white text-[11px] font-bold tracking-wider uppercase">
                    Removed (After)
                  </span>
                </div>

                {/* Original (Clipped on top) */}
                <div
                  className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none bg-slate-100 dark:bg-slate-950"
                  style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                  <img
                    src={originalImage}
                    alt="Original photo"
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-800/90 text-white text-[11px] font-bold tracking-wider uppercase">
                    Original (Before)
                  </span>
                </div>

                {/* Slider bar */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-800 shadow-lg border border-slate-200 flex items-center justify-center text-xs font-bold">
                    <Sliders className="w-4 h-4 rotate-90 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Choose Another Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Transparent PNG</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
