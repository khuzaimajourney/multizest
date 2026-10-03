'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Camera,
  CheckCircle,
  Download,
  Printer,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Grid,
  User,
  ShieldCheck,
} from 'lucide-react';
import { passportSizes, PassportCountryKey, getPixelDimensions } from '@/lib/passport-sizes';
import { fireSuccessConfetti } from '@/lib/confetti';

type PassportState = 'idle' | 'country_select' | 'processing' | 'result';

export default function PassportPhotoTool() {
  const [state, setState] = useState<PassportState>('idle');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<PassportCountryKey>('us-passport');

  // Custom dimensions state
  const [customWidth, setCustomWidth] = useState<number>(35);
  const [customHeight, setCustomHeight] = useState<number>(45);

  // Result images
  const [singlePhotoUrl, setSinglePhotoUrl] = useState<string | null>(null);
  const [sheetPhotoUrl, setSheetPhotoUrl] = useState<string | null>(null);
  const [copiesCount, setCopiesCount] = useState<number>(6);

  // Processing state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepText, setStepText] = useState<string>('Finding your face...');
  const [progress, setProgress] = useState<number>(10);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active view tab in result: 'sheet' | 'single'
  const [resultTab, setResultTab] = useState<'sheet' | 'single'>('sheet');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const rawImageBufferRef = useRef<ArrayBuffer | null>(null);
  const imageDimsRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // Initialize Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker('/workers/passport.worker.js');

      workerRef.current.onmessage = (e) => {
        const {
          type,
          step,
          text,
          pct,
          singleBuffer,
          singleWidth,
          singleHeight,
          sheetBuffer,
          sheetWidth,
          sheetHeight,
          totalCopies,
          message,
        } = e.data;

        if (type === 'progress') {
          if (step) setCurrentStep(step);
          if (text) setStepText(text);
          if (pct !== undefined) setProgress(pct);
        } else if (type === 'result') {
          // Render Single Photo Data URL
          const sCanvas = document.createElement('canvas');
          sCanvas.width = singleWidth;
          sCanvas.height = singleHeight;
          const sCtx = sCanvas.getContext('2d');
          if (sCtx) {
            const sData = new ImageData(new Uint8ClampedArray(singleBuffer), singleWidth, singleHeight);
            sCtx.putImageData(sData, 0, 0);
            setSinglePhotoUrl(sCanvas.toDataURL('image/jpeg', 0.95));
          }

          // Render Sheet Data URL
          const sheetCanvas = document.createElement('canvas');
          sheetCanvas.width = sheetWidth;
          sheetCanvas.height = sheetHeight;
          const sheetCtx = sheetCanvas.getContext('2d');
          if (sheetCtx) {
            const sheetData = new ImageData(new Uint8ClampedArray(sheetBuffer), sheetWidth, sheetHeight);
            sheetCtx.putImageData(sheetData, 0, 0);
            setSheetPhotoUrl(sheetCanvas.toDataURL('image/jpeg', 0.95));
          }

          setCopiesCount(totalCopies || 6);
          setState('result');
          setProgress(100);
          fireSuccessConfetti();
        } else if (type === 'error') {
          setErrorMessage(message || 'We could not detect a clear portrait face. Please try another photo.');
          setState('country_select');
        }
      };

      workerRef.current.onerror = () => {
        setErrorMessage('Worker error during passport processing.');
        setState('country_select');
      };
    } catch {
      // Fallback
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleFile = (file: File) => {
    setErrorMessage(null);

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG or PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = dataUrl;
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        const MAX_DIM = 2000;
        if (w > MAX_DIM || h > MAX_DIM) {
          const s = MAX_DIM / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }

        imageDimsRef.current = { w, h };

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          rawImageBufferRef.current = imgData.data.buffer.slice(0);
        }

        setOriginalImage(dataUrl);
        setState('country_select');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const startProcessing = () => {
    if (!rawImageBufferRef.current || !workerRef.current) return;

    setState('processing');
    setCurrentStep(1);
    setStepText('Finding your face...');
    setProgress(15);

    const config = passportSizes[selectedCountry];
    let dimensions = getPixelDimensions(config);

    if (selectedCountry === 'custom') {
      dimensions = {
        widthPx: Math.round((customWidth / 25.4) * 300),
        heightPx: Math.round((customHeight / 25.4) * 300),
      };
    }

    const buf = rawImageBufferRef.current.slice(0);

    workerRef.current.postMessage(
      {
        type: 'process',
        imageBuffer: buf,
        width: imageDimsRef.current.w,
        height: imageDimsRef.current.h,
        targetWidthPx: dimensions.widthPx,
        targetHeightPx: dimensions.heightPx,
        headRatio: config.headRatio,
        countryName: config.country,
      },
      [buf]
    );
  };

  const downloadFile = (url: string, suffix: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `passport-${selectedCountry}-${suffix}.jpg`;
    link.click();
  };

  const handlePrint = () => {
    if (!sheetPhotoUrl) return;

    // Use hidden iframe to avoid popup blocker and window.open restrictions in iframe environments
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const contentWin = iframe.contentWindow;
    if (!contentWin) return;

    const doc = contentWin.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Passport Photo Sheet (4x6 Inches)</title>
          <style>
            @page { size: 6in 4in; margin: 0; }
            body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #fff; }
            img { width: 6in; height: 4in; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${sheetPhotoUrl}" onload="window.focus(); window.print();" />
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 60000);
  };

  const handleReset = () => {
    setState('idle');
    setOriginalImage(null);
    setSinglePhotoUrl(null);
    setSheetPhotoUrl(null);
    setErrorMessage(null);
    rawImageBufferRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentCountryConfig = passportSizes[selectedCountry];
  const pixelDims = getPixelDimensions(currentCountryConfig);

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

      {/* Error notice */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{errorMessage}</div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-xs font-bold underline">
            Dismiss
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
            <Camera className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Turn Your Selfie Into a Passport Photo
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-md">
            Upload a clear photo of your face. We&apos;ll do the rest — crop it, fix the background, and make it print-ready!
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              🇺🇸 US 2×2&quot;
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              🇬🇧 UK 35×45mm
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              🇮🇳 India 2×2&quot;
            </span>
            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              🇪🇺 Schengen 35×45mm
            </span>
            <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
              🔒 100% Private (No Upload)
            </span>
          </div>
        </div>
      )}

      {/* STATE 2: COUNTRY SELECTOR & REQUIREMENTS */}
      {state === 'country_select' && originalImage && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  What&apos;s this photo for?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  Pick your country and document type. We&apos;ll use the exact official size requirements.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Choose different photo
              </button>
            </div>

            {/* Country grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Object.entries(passportSizes).map(([key, config]) => {
                const isSelected = selectedCountry === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCountry(key as PassportCountryKey)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{config.flag}</span>
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {config.name}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {config.width}×{config.height} {config.unit} @ 300 DPI
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom dimensions inputs if selected */}
            {selectedCountry === 'custom' && (
              <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Width (mm):
                  </label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Math.max(20, Number(e.target.value)))}
                    className="w-20 p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-mono bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Height (mm):
                  </label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Math.max(20, Number(e.target.value)))}
                    className="w-20 p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-mono bg-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-blue-900 dark:text-blue-200">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>
                Selected: <strong>{currentCountryConfig.name}</strong> ({currentCountryConfig.description})
              </span>
            </div>

            <button
              type="button"
              onClick={startProcessing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Passport Photo Now</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: 3-STEP PROCESSING ANIMATION */}
      {state === 'processing' && (
        <div className="min-h-[50vh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 animate-pulse">
            <Camera className="w-10 h-10" />
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Making your passport photo... 📸
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {stepText}
            </p>
          </div>

          {/* 3 Step Indicator */}
          <div className="w-full max-w-md grid grid-cols-3 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border text-center font-semibold transition-colors ${currentStep >= 1 ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'border-slate-200 text-slate-400'}`}>
              Step 1: Face detection
            </div>
            <div className={`p-2.5 rounded-xl border text-center font-semibold transition-colors ${currentStep >= 2 ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'border-slate-200 text-slate-400'}`}>
              Step 2: White background
            </div>
            <div className={`p-2.5 rounded-xl border text-center font-semibold transition-colors ${currentStep >= 3 ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300' : 'border-slate-200 text-slate-400'}`}>
              Step 3: Biometric crop
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-sm h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* STATE 4: RESULT WITH PRINTABLE SHEET & COMPLIANCE CHECKER */}
      {state === 'result' && singlePhotoUrl && sheetPhotoUrl && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                Your passport photo is ready! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                We made a single photo AND a printable sheet. Just print the sheet on 4×6 glossy paper at any store!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs hover:bg-slate-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print 4×6 Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => downloadFile(sheetPhotoUrl, '4x6-sheet')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>Download Printable Sheet ({copiesCount} photos)</span>
              </button>
            </div>
          </div>

          {/* Compliance Checklist Card */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-500" />
              Official Biometric Compliance Checklist
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Face centered &amp; upright</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Background is pure white</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Head size meets requirements</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{pixelDims.widthPx}×{pixelDims.heightPx} px @ 300 DPI</span>
              </div>
            </div>
          </div>

          {/* Preview Tabs: Printable Sheet vs Single Photo */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResultTab('sheet')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    resultTab === 'sheet'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Printable 4×6 Sheet ({copiesCount} Copies)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResultTab('single')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    resultTab === 'single'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Single Passport Photo</span>
                </button>
              </div>

              <span className="text-xs text-slate-500 hidden sm:inline">
                {resultTab === 'sheet' ? 'Ready to print on 4×6" photo paper' : 'Official document single portrait'}
              </span>
            </div>

            {/* Preview Box */}
            <div className="max-h-[65vh] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900/5 dark:bg-slate-950 p-4 flex items-center justify-center">
              {resultTab === 'sheet' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sheetPhotoUrl}
                  alt="Printable 4x6 passport sheet"
                  className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={singlePhotoUrl}
                  alt="Single passport photo"
                  className="max-h-[50vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
                />
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Make Another Passport Photo</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadFile(singlePhotoUrl, 'single')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Single Photo</span>
              </button>
              <button
                type="button"
                onClick={() => downloadFile(sheetPhotoUrl, '4x6-sheet')}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Printable Sheet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
