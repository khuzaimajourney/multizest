'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import {
  UploadCloud,
  FileImage,
  Download,
  Trash2,
  Sliders,
  CheckCircle,
  RefreshCw,
  Archive,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  previewUrl: string;
  compressedBlob?: Blob;
  compressedSize?: number;
  compressedUrl?: string;
  reductionPercent?: number;
  status: 'idle' | 'compressing' | 'done' | 'error';
  errorMessage?: string;
}

export default function ImageCompressorTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const [format, setFormat] = useState<'original' | 'image/jpeg' | 'image/png' | 'image/webp'>('original');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setErrorMsg(null);

    const validFiles: File[] = [];
    const maxFiles = 10;
    const remainingSlots = maxFiles - images.length;

    if (remainingSlots <= 0) {
      setErrorMsg(`Maximum ${maxFiles} images can be processed simultaneously.`);
      return;
    }

    for (let i = 0; i < files.length && i < remainingSlots; i++) {
      const f = files[i];
      if (/image\/(jpeg|png|webp)/i.test(f.type)) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setErrorMsg('Please upload valid JPG, PNG, or WebP images.');
      return;
    }

    const newItems: ImageItem[] = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      originalSize: file.size,
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
    }));

    setImages((prev) => [...prev, ...newItems]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const found = prev.find((img) => img.id === id);
      if (found) {
        URL.revokeObjectURL(found.previewUrl);
        if (found.compressedUrl) URL.revokeObjectURL(found.compressedUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleClearAll = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.previewUrl);
      if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
    });
    setImages([]);
    setErrorMsg(null);
  };

  const handleCompress = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const updated = [...images];

    for (let i = 0; i < updated.length; i++) {
      const current = updated[i];
      current.status = 'compressing';
      setImages([...updated]);

      try {
        const options = {
          maxSizeMB: 10,
          maxWidthOrHeight: maxWidth ? maxWidth : undefined,
          initialQuality: quality / 100,
          useWebWorker: true,
          fileType: format === 'original' ? undefined : format,
        };

        const compressed = await imageCompression(current.file, options);
        const compUrl = URL.createObjectURL(compressed);
        const compSize = compressed.size;
        const reduction = Math.max(0, Math.round(((current.originalSize - compSize) / current.originalSize) * 100));

        current.compressedBlob = compressed;
        current.compressedSize = compSize;
        current.compressedUrl = compUrl;
        current.reductionPercent = reduction;
        current.status = 'done';
      } catch (err: unknown) {
        console.error('Compression error for', current.name, err);
        current.status = 'error';
        current.errorMessage = 'Failed to compress image.';
      }

      setImages([...updated]);
    }

    setIsProcessing(false);
  };

  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.compressedUrl) return;
    const a = document.createElement('a');
    a.href = item.compressedUrl;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : format === 'image/jpeg' ? 'jpg' : item.name.split('.').pop();
    a.download = `compressed-${baseName}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllZip = async () => {
    const completed = images.filter((img) => img.status === 'done' && img.compressedBlob);
    if (completed.length === 0) return;

    const zip = new JSZip();
    completed.forEach((img) => {
      const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : format === 'image/jpeg' ? 'jpg' : img.name.split('.').pop();
      const baseName = img.name.replace(/\.[^/.]+$/, '');
      zip.file(`compressed-${baseName}.${ext}`, img.compressedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multizest-compressed-images-${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const anyDone = images.some((img) => img.status === 'done');

  return (
    <div className="space-y-6">
      {/* File Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-8 sm:p-10 text-center transition-colors bg-slate-50/50 dark:bg-slate-900/50 group cursor-pointer"
        onClick={() => document.getElementById('image-compress-input')?.click()}
      >
        <input
          id="image-compress-input"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Drag & drop images here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Supports JPG, PNG, and WebP (up to 10 files simultaneously)
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Settings Control Panel */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Compression & Output Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Quality Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Quality Level</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">{quality}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              80% is the recommended perceptual sweet spot.
            </span>
          </div>

          {/* Max Width Resize Constraint */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Max Dimension (Optional)
            </label>
            <input
              type="number"
              placeholder="e.g. 1920 (keeps aspect ratio)"
              value={maxWidth || ''}
              onChange={(e) => setMaxWidth(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Downscales large DSLR photos automatically.
            </span>
          </div>

          {/* Target Output Format */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'original' | 'image/jpeg' | 'image/png' | 'image/webp')}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            >
              <option value="original">Keep Original Format</option>
              <option value="image/webp">Convert to WebP (Smallest)</option>
              <option value="image/jpeg">Convert to JPG</option>
              <option value="image/png">Convert to PNG</option>
            </select>
            <span className="text-[11px] text-slate-400 mt-1 block">
              WebP offers the greatest compression savings.
            </span>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              {images.length} {images.length === 1 ? 'image' : 'images'} loaded
            </span>
            {images.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-red-500 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {anyDone && (
              <button
                type="button"
                onClick={handleDownloadAllZip}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm"
              >
                <Archive className="w-3.5 h-3.5 text-blue-500" />
                <span>Download All (ZIP)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCompress}
              disabled={images.length === 0 || isProcessing}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-40 inline-flex items-center gap-2"
            >
              {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isProcessing ? 'Compressing...' : 'Compress Images'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Uploaded Images List & Comparison Table */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Image Queue & Results
          </h4>

          <div className="space-y-3">
            {images.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Name */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.compressedUrl || item.previewUrl}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Original: {formatFileSize(item.originalSize)}
                    </p>
                  </div>
                </div>

                {/* Center: Savings Comparison Badge */}
                <div className="flex items-center gap-3">
                  {item.status === 'compressing' && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 font-medium animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Compressing...
                    </span>
                  )}

                  {item.status === 'done' && (
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatFileSize(item.compressedSize || 0)}
                        </div>
                        <div className="text-[10px] text-slate-400">Compressed</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        -{item.reductionPercent}%
                      </span>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <span className="text-xs text-red-500 font-medium">Failed</span>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {item.status === 'done' && (
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(item.id)}
                    aria-label="Remove image"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
