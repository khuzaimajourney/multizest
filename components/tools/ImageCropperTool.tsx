'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Check,
  Maximize2,
  AlertCircle,
} from 'lucide-react';

export default function ImageCropperTool() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null); // null = freeform
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Crop box rectangle (percentages: 0 to 100)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 });

  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  const handleFile = (selected: File | null) => {
    if (!selected) return;
    if (!/image\//i.test(selected.type)) {
      setErrorMsg('Please upload a valid image file.');
      return;
    }

    setErrorMsg(null);
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setImageSrc(url);
    setCroppedUrl(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCropBox({ x: 10, y: 10, width: 80, height: 80 });
  };

  const applyRatio = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (!ratio) {
      setCropBox({ x: 10, y: 10, width: 80, height: 80 });
      return;
    }
    // Calculate box proportional to ratio
    const width = 80;
    const height = Math.min(80, Math.round(width / ratio));
    setCropBox({ x: 10, y: 10, width, height });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCrop = () => {
    if (!imageRef.current) return;
    setIsProcessing(true);

    const img = imageRef.current;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    const canvas = document.createElement('canvas');
    const pixelX = Math.round((cropBox.x / 100) * naturalW);
    const pixelY = Math.round((cropBox.y / 100) * naturalH);
    const pixelW = Math.round((cropBox.width / 100) * naturalW);
    const pixelH = Math.round((cropBox.height / 100) * naturalH);

    canvas.width = pixelW;
    canvas.height = pixelH;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    ctx.save();

    // Draw cropped portion
    ctx.drawImage(img, pixelX, pixelY, pixelW, pixelH, 0, 0, pixelW, pixelH);
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        setCroppedUrl(URL.createObjectURL(blob));
      }
      setIsProcessing(false);
    }, 'image/png');
  };

  const handleDownload = () => {
    if (!croppedUrl) return;
    const a = document.createElement('a');
    a.href = croppedUrl;
    const base = file ? file.name.replace(/\.[^/.]+$/, '') : 'cropped';
    a.download = `${base}-cropped.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0] || null);
          }}
          onClick={() => document.getElementById('crop-image-input')?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-10 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group"
        >
          <input
            id="crop-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-950/60 text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform">
              <Crop className="w-8 h-8" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Drag & drop image here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Crop with custom ratios, rotate, and export in full resolution
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                Ratio:
              </span>
              {[
                { name: 'Freeform', val: null },
                { name: '1:1 Square', val: 1 },
                { name: '16:9 Landscape', val: 16 / 9 },
                { name: '4:3 Standard', val: 4 / 3 },
                { name: '9:16 Story', val: 9 / 16 },
              ].map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => applyRatio(r.val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    aspectRatio === r.val
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRotate}
                title="Rotate 90° Clockwise"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-blue-600"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setFlipH(!flipH)}
                title="Flip Horizontal"
                className={`p-2 rounded-xl border transition-colors ${
                  flipH
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setFlipV(!flipV)}
                title="Flip Vertical"
                className={`p-2 rounded-xl border transition-colors ${
                  flipV
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <FlipVertical className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  setCroppedUrl(null);
                }}
                className="text-xs text-slate-500 hover:text-red-500 ml-2"
              >
                Change Image
              </button>
            </div>
          </div>

          {/* Image & Interactive Crop Framing Container */}
          <div className="relative max-h-[460px] overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center p-4">
            {/* Hidden source image ref */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Source to crop"
              style={{
                transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                maxHeight: '400px',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
              className="select-none"
            />
          </div>

          {/* Sliders for Crop Window Tuning */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Crop Boundary Position
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Start X: {cropBox.x}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={cropBox.x}
                  onChange={(e) => setCropBox({ ...cropBox, x: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Start Y: {cropBox.y}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={cropBox.y}
                  onChange={(e) => setCropBox({ ...cropBox, y: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Width: {cropBox.width}%
                </label>
                <input
                  type="range"
                  min={20}
                  max={100 - cropBox.x}
                  value={cropBox.width}
                  onChange={(e) => setCropBox({ ...cropBox, width: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Height: {cropBox.height}%
                </label>
                <input
                  type="range"
                  min={20}
                  max={100 - cropBox.y}
                  value={cropBox.height}
                  onChange={(e) => setCropBox({ ...cropBox, height: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCrop}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all inline-flex items-center justify-center gap-2"
            >
              <Crop className="w-4 h-4" />
              <span>Apply Crop to Image</span>
            </button>
          </div>

          {/* Result Card */}
          {croppedUrl && (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cropped Output Preview
                </h4>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Cropped Image</span>
                </button>
              </div>

              <div className="max-h-[300px] overflow-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={croppedUrl}
                  alt="Cropped Result"
                  className="max-h-[260px] object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
