'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Type,
  Image as ImageIcon,
  Grid,
  Check,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

export default function WatermarkTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState('photo');
  const [mode, setMode] = useState<'text' | 'logo'>('text');
  const [text, setText] = useState('© MultiZest');
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(50);
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState('#FFFFFF');
  const [position, setPosition] = useState<
    'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right' | 'tile'
  >('bottom-right');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Redraw canvas whenever settings change
  useEffect(() => {
    if (!imageSrc) return;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.src = imageSrc;

    baseImg.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = baseImg.width;
      canvas.height = baseImg.height;

      // Draw original image
      ctx.drawImage(baseImg, 0, 0);

      // Setup watermark style
      ctx.save();
      ctx.globalAlpha = opacity / 100;

      if (mode === 'text' && text) {
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'middle';

        // Add subtle shadow for visibility on any background
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const metrics = ctx.measureText(text);
        const textWidth = metrics.width;
        const padding = 30;

        if (position === 'tile') {
          ctx.rotate((-25 * Math.PI) / 180);
          const stepX = textWidth + 120;
          const stepY = fontSize + 100;
          for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
            for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
              ctx.fillText(text, x, y);
            }
          }
        } else {
          let x = padding;
          let y = padding + fontSize / 2;

          if (position === 'top-right') {
            x = canvas.width - textWidth - padding;
            y = padding + fontSize / 2;
          } else if (position === 'center') {
            x = (canvas.width - textWidth) / 2;
            y = canvas.height / 2;
          } else if (position === 'bottom-left') {
            x = padding;
            y = canvas.height - padding - fontSize / 2;
          } else if (position === 'bottom-right') {
            x = canvas.width - textWidth - padding;
            y = canvas.height - padding - fontSize / 2;
          }

          ctx.fillText(text, x, y);
        }
      } else if (mode === 'logo' && logoSrc) {
        const logoImg = new Image();
        logoImg.src = logoSrc;
        logoImg.onload = () => {
          const targetWidth = canvas.width * 0.2; // 20% of base image width
          const targetHeight = (logoImg.height / logoImg.width) * targetWidth;
          const padding = 30;

          let x = padding;
          let y = padding;

          if (position === 'top-right') {
            x = canvas.width - targetWidth - padding;
            y = padding;
          } else if (position === 'center') {
            x = (canvas.width - targetWidth) / 2;
            y = (canvas.height - targetHeight) / 2;
          } else if (position === 'bottom-left') {
            x = padding;
            y = canvas.height - targetHeight - padding;
          } else if (position === 'bottom-right') {
            x = canvas.width - targetWidth - padding;
            y = canvas.height - targetHeight - padding;
          }

          ctx.drawImage(logoImg, x, y, targetWidth, targetHeight);
          ctx.restore();
        };
        return;
      }

      ctx.restore();
    };
  }, [imageSrc, mode, text, logoSrc, opacity, fontSize, color, position]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoSrc(e.target?.result as string);
      setMode('logo');
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${fileName}-watermarked.png`;
    link.click();
    fireSuccessConfetti();
  };

  return (
    <div className="space-y-6">
      {!imageSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-3 border-dashed border-violet-400 dark:border-violet-600 rounded-3xl p-10 sm:p-16 text-center cursor-pointer bg-violet-50/40 dark:bg-violet-950/20 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all group duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
          <div className="w-20 h-20 rounded-3xl bg-violet-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Drop photo to watermark
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Stamp copyright text or PNG logos without uploading files to any server.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold shadow-sm group-hover:bg-violet-700 transition-colors">
            Select Photo
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            {/* Mode selection */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                  <span>Watermark Type</span>
                  <InteractiveTooltip content="Choose whether to type text (e.g. copyright notice) or upload your brand logo image." />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('text')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      mode === 'text'
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span>Text Stamp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!logoSrc) logoInputRef.current?.click();
                      else setMode('logo');
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition-all ${
                      mode === 'logo'
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{logoSrc ? 'Logo Stamp' : 'Upload Logo'}</span>
                  </button>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                    accept="image/png,image/svg+xml"
                    className="hidden"
                  />
                </div>
              </div>

              {mode === 'text' ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g. © 2026 Your Name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Text Color
                      </label>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-10 rounded-xl cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Size: {fontSize}px
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="96"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-violet-600 mt-2"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                    {logoSrc ? 'Custom Logo Loaded' : 'No Logo Uploaded Yet'}
                  </span>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    Change Logo
                  </button>
                </div>
              )}
            </div>

            {/* Placement and Opacity */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center">
                  <span>Placement</span>
                  <InteractiveTooltip content="Select where you want the watermark positioned on your photo." />
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPosition('top-left')}
                    className={`p-2 rounded-lg border transition-all ${
                      position === 'top-left' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Top Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('center')}
                    className={`p-2 rounded-lg border transition-all ${
                      position === 'center' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('top-right')}
                    className={`p-2 rounded-lg border transition-all ${
                      position === 'top-right' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Top Right
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('bottom-left')}
                    className={`p-2 rounded-lg border transition-all ${
                      position === 'bottom-left' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Bottom Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('bottom-right')}
                    className={`p-2 rounded-lg border transition-all ${
                      position === 'bottom-right' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Bottom Right
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('tile')}
                    className={`p-2 rounded-lg border transition-all ${
                      position === 'tile' ? 'bg-violet-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Full Tile Pattern
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Transparency (Opacity)</span>
                  <span>{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-violet-600 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Live Canvas Preview */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-h-96 max-w-full rounded-xl object-contain shadow-sm"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setImageSrc(null);
                setLogoSrc(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Choose Another Photo</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm transition-all shadow-lg shadow-violet-500/25 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download Watermarked Photo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
