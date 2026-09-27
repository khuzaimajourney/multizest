'use client';

import React, { useState } from 'react';
import { Copy, Check, Palette, UploadCloud, Eye } from 'lucide-react';

export default function ColorPickerTool() {
  const [hex, setHex] = useState<string>('#2563eb');
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Contrast checker state
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [bgColor, setBgColor] = useState<string>('#2563eb');

  // Image extract state
  const [extractedColors, setExtractedColors] = useState<string[]>([]);

  // Convert Hex to RGB
  const hexToRgb = (h: string) => {
    let clean = h.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return { r: 37, g: 99, b: 235 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgb = hexToRgb(hex);

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // RGB to CMYK
  const rgbToCmyk = (r: number, g: number, b: number) => {
    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, Math.min(m, y));
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
      c: Math.round(((c - k) / (1 - k)) * 100),
      m: Math.round(((m - k) / (1 - k)) * 100),
      y: Math.round(((y - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  };

  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  // WCAG Luminance & Contrast Ratio
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const calculateContrastRatio = (c1: string, c2: string) => {
    const rgb1 = hexToRgb(c1);
    const rgb2 = hexToRgb(c2);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const contrast = calculateContrastRatio(textColor, bgColor);
  const passAA = contrast >= 4.5;
  const passAAA = contrast >= 7.0;

  const handleCopy = async (text: string, formatId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(formatId);
      setTimeout(() => setCopiedFormat(null), 1500);
    } catch (_) {}
  };

  // Image extract palette handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;

      const palette: string[] = [];
      for (let i = 0; i < data.length; i += 400) {
        const r = data[i].toString(16).padStart(2, '0');
        const g = data[i + 1].toString(16).padStart(2, '0');
        const b = data[i + 2].toString(16).padStart(2, '0');
        palette.push(`#${r}${g}${b}`);
      }
      setExtractedColors(Array.from(new Set(palette)).slice(0, 8));
    };
  };

  return (
    <div className="space-y-8">
      {/* Main Color Picker Card */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Color Preview Swatch */}
        <div className="md:col-span-4 flex flex-col items-center gap-3">
          <div
            className="w-full aspect-square max-w-[200px] rounded-3xl shadow-xl border-4 border-white dark:border-slate-700 relative overflow-hidden"
            style={{ backgroundColor: hex }}
          >
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <span className="text-xs text-slate-500">Click swatch to pick color visually</span>
        </div>

        {/* Color Formats Inputs */}
        <div className="md:col-span-8 space-y-3">
          {/* HEX */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                HEX
              </span>
              <input
                type="text"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="font-mono font-bold text-sm bg-transparent text-slate-900 dark:text-white uppercase focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleCopy(hex, 'hex')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 inline-flex items-center gap-1"
            >
              {copiedFormat === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormat === 'hex' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* RGB */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                RGB
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 inline-flex items-center gap-1"
            >
              {copiedFormat === 'rgb' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormat === 'rgb' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* HSL */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                HSL
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 inline-flex items-center gap-1"
            >
              {copiedFormat === 'hsl' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormat === 'hsl' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* CMYK */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                CMYK
              </span>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%)
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, 'cmyk')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 inline-flex items-center gap-1"
            >
              {copiedFormat === 'cmyk' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFormat === 'cmyk' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* WCAG Contrast Ratio Checker */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <span>WCAG Accessibility Contrast Checker</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Live Contrast Preview Box */}
        <div
          className="p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <div>
            <div className="text-xl font-bold">Contrast Ratio: {contrast.toFixed(2)} : 1</div>
            <p className="text-xs opacity-90 mt-0.5">
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                passAA ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              WCAG AA {passAA ? 'Pass' : 'Fail'}
            </span>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                passAAA ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              WCAG AAA {passAAA ? 'Pass' : 'Fail'}
            </span>
          </div>
        </div>
      </div>

      {/* Extract Colors from Image */}
      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span>Extract Palette from Image</span>
          </h3>
          <label className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Picture</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        {extractedColors.length > 0 ? (
          <div className="flex flex-wrap gap-3 pt-2">
            {extractedColors.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHex(c)}
                title={`Select ${c}`}
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
              >
                <span className="w-6 h-6 rounded-lg shadow-sm border" style={{ backgroundColor: c }} />
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {c}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Upload any picture to automatically extract its dominant color swatches.
          </p>
        )}
      </div>
    </div>
  );
}
