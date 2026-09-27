'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  UploadCloud,
  RefreshCw,
  Download,
  Trash2,
  Archive,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  previewUrl: string;
  convertedBlob?: Blob;
  convertedUrl?: string;
  convertedSize?: number;
  status: 'idle' | 'converting' | 'done' | 'error';
}

export default function ImageConverterTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [targetFormat, setTargetFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');
  const [quality, setQuality] = useState(85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setErrorMsg(null);

    const validFiles: File[] = [];
    const maxFiles = 10;
    const remainingSlots = maxFiles - images.length;

    for (let i = 0; i < files.length && i < remainingSlots; i++) {
      const f = files[i];
      if (/image\//i.test(f.type) || /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(f.name)) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setErrorMsg('Please select valid JPG, PNG, WebP, GIF, or BMP image files.');
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

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const updated = [...images];

    for (let i = 0; i < updated.length; i++) {
      const current = updated[i];
      current.status = 'converting';
      setImages([...updated]);

      try {
        const img = new Image();
        img.src = current.previewUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Could not get canvas context');
        ctx.drawImage(img, 0, 0);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => {
              if (b) resolve(b);
              else reject(new Error('Canvas to blob failed'));
            },
            targetFormat,
            quality / 100
          );
        });

        current.convertedBlob = blob;
        current.convertedUrl = URL.createObjectURL(blob);
        current.convertedSize = blob.size;
        current.status = 'done';
      } catch (err) {
        console.error('Conversion error:', err);
        current.status = 'error';
      }

      setImages([...updated]);
    }

    setIsProcessing(false);
  };

  const getExt = () => {
    switch (targetFormat) {
      case 'image/webp':
        return 'webp';
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      default:
        return 'png';
    }
  };

  const handleDownloadSingle = (item: ImageItem) => {
    if (!item.convertedUrl) return;
    const a = document.createElement('a');
    a.href = item.convertedUrl;
    const base = item.name.replace(/\.[^/.]+$/, '');
    a.download = `${base}.${getExt()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllZip = async () => {
    const done = images.filter((img) => img.status === 'done' && img.convertedBlob);
    if (done.length === 0) return;

    const zip = new JSZip();
    done.forEach((item) => {
      const base = item.name.replace(/\.[^/.]+$/, '');
      zip.file(`${base}.${getExt()}`, item.convertedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multizest-converted-images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const anyDone = images.some((img) => img.status === 'done');

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById('convert-image-input')?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-8 sm:p-10 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group"
      >
        <input
          id="convert-image-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Drag & drop images here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Convert JPG, PNG, WebP, BMP, and GIF (up to 10 images at once)
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Conversion Settings */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Output Format
            </label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value as 'image/webp' | 'image/jpeg' | 'image/png')}
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            >
              <option value="image/webp">WebP (Modern, Smallest)</option>
              <option value="image/jpeg">JPG (Universal Compatibility)</option>
              <option value="image/png">PNG (Lossless, Transparency)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Quality</span>
              <span className="font-mono text-blue-600">{quality}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-700">
          <span className="text-xs text-slate-500">
            {images.length} {images.length === 1 ? 'image' : 'images'} in queue
          </span>

          <div className="flex items-center gap-2">
            {anyDone && (
              <button
                type="button"
                onClick={handleDownloadAllZip}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-sm"
              >
                <Archive className="w-3.5 h-3.5 text-blue-500" />
                <span>Download All (ZIP)</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleConvert}
              disabled={images.length === 0 || isProcessing}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-40 inline-flex items-center gap-2"
            >
              {isProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isProcessing ? 'Converting...' : 'Convert Images Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image list */}
      {images.length > 0 && (
        <div className="space-y-3">
          {images.map((item) => (
            <div
              key={item.id}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.convertedUrl || item.previewUrl}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="overflow-hidden">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Original: {formatFileSize(item.originalSize)}
                    {item.convertedSize ? ` → ${formatFileSize(item.convertedSize)}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
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
                  onClick={() => setImages((prev) => prev.filter((img) => img.id !== item.id))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
