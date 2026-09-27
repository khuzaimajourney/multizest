'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Lock,
  Unlock,
  Download,
  RotateCcw,
  Sliders,
  Check,
  Maximize2,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

interface Preset {
  name: string;
  width: number;
  height: number;
  category: string;
}

const PRESETS: Preset[] = [
  { name: 'Instagram Square', width: 1080, height: 1080, category: 'Instagram' },
  { name: 'Instagram Story / Reel', width: 1080, height: 1920, category: 'Instagram' },
  { name: 'Facebook Cover', width: 820, height: 312, category: 'Facebook' },
  { name: 'Twitter/X Header', width: 1500, height: 500, category: 'Twitter' },
  { name: 'YouTube Banner', width: 2560, height: 1440, category: 'YouTube' },
  { name: 'Full HD 1080p', width: 1920, height: 1080, category: 'Display' },
  { name: 'Avatar Thumbnail', width: 150, height: 150, category: 'Profile' },
];

export default function ImageResizerTool() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Resize controls
  const [mode, setMode] = useState<'dimensions' | 'percentage'>('dimensions');
  const [targetWidth, setTargetWidth] = useState(1080);
  const [targetHeight, setTargetHeight] = useState(1080);
  const [lockAspect, setLockAspect] = useState(true);
  const [scalePercent, setScalePercent] = useState(100);
  const [format, setFormat] = useState<'original' | 'image/jpeg' | 'image/png' | 'image/webp'>('original');

  // Output
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!/image\/(jpeg|png|webp)/i.test(file.type)) {
      setErrorMsg('Please select a valid JPG, PNG, or WebP image file.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResizedUrl(null);
    setResizedBlob(null);

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      const ratio = img.naturalWidth / img.naturalHeight;
      setAspectRatio(ratio);
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
      setScalePercent(100);
    };
    img.src = objectUrl;
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && aspectRatio > 0) {
      setTargetHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && aspectRatio > 0) {
      setTargetWidth(Math.round(val * aspectRatio));
    }
  };

  const handleScaleChange = (percent: number) => {
    setScalePercent(percent);
    const factor = percent / 100;
    setTargetWidth(Math.round(originalWidth * factor));
    setTargetHeight(Math.round(originalHeight * factor));
  };

  const applyPreset = (preset: Preset) => {
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    setLockAspect(false); // Presets have specific aspect ratios
  };

  const handleResize = () => {
    if (!previewUrl || targetWidth <= 0 || targetHeight <= 0) return;
    setIsResizing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsResizing(false);
        setErrorMsg('Failed to initialize Canvas 2D context.');
        return;
      }

      // Smooth bicubic resampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const mimeType =
        format === 'original'
          ? selectedFile?.type || 'image/png'
          : format;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setResizedBlob(blob);
            setResizedUrl(url);
          }
          setIsResizing(false);
        },
        mimeType,
        0.92
      );
    };
    img.src = previewUrl;
  };

  const handleDownload = () => {
    if (!resizedUrl) return;
    const a = document.createElement('a');
    a.href = resizedUrl;
    const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'image';
    const ext =
      format === 'image/webp'
        ? 'webp'
        : format === 'image/jpeg'
        ? 'jpg'
        : format === 'image/png'
        ? 'png'
        : selectedFile?.name.split('.').pop() || 'png';

    a.download = `resized-${baseName}-${targetWidth}x${targetHeight}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Dropzone if no file selected */}
      {!previewUrl ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById('resizer-file-input')?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-10 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group"
        >
          <input
            id="resizer-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Drop image here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Supports JPG, PNG, and WebP (runs 100% locally in browser)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Header with metadata */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {selectedFile?.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Original Dimensions: <span className="font-mono font-semibold">{originalWidth} × {originalHeight}px</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPreviewUrl(null);
                setSelectedFile(null);
                setResizedUrl(null);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Choose different image
            </button>
          </div>

          {/* Social Media One-Click Presets */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Popular Social Media Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                >
                  <span className="font-semibold">{preset.name}</span>{' '}
                  <span className="text-slate-400 font-mono text-[10px]">({preset.width}×{preset.height})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sizing Controls */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('dimensions')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  mode === 'dimensions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                By Exact Pixels
              </button>
              <button
                type="button"
                onClick={() => setMode('percentage')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  mode === 'percentage'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                By Percentage Ratio
              </button>
            </div>

            {mode === 'dimensions' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setLockAspect(!lockAspect)}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
                      lockAspect
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{lockAspect ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Scale Percentage</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{scalePercent}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={scalePercent}
                  onChange={(e) => handleScaleChange(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>10% (Tiny)</span>
                  <span>100% (Original)</span>
                  <span>200% (Enlarged)</span>
                </div>
              </div>
            )}

            {/* Target Output Format */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'original' | 'image/jpeg' | 'image/png' | 'image/webp')}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                >
                  <option value="original">Keep Original Format</option>
                  <option value="image/png">PNG (Preserves transparency)</option>
                  <option value="image/jpeg">JPG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleResize}
                  disabled={isResizing}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all inline-flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>{isResizing ? 'Resizing...' : 'Resize Image Now'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Resized Result Preview & Download */}
          {resizedUrl && (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Resized Preview
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    New Dimensions: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{targetWidth} × {targetHeight}px</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resized Image</span>
                </button>
              </div>

              <div className="max-h-[350px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resizedUrl}
                  alt="Resized Preview"
                  className="max-h-[300px] object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
