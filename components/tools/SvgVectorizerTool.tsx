/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Code2,
  SlidersHorizontal,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';

export default function SvgVectorizerTool() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [svgOutput, setSvgOutput] = useState<string | null>(null);
  const [fileName, setFileName] = useState('vector');

  // Vectorization presets: Black & White, Few Colors, High Detail
  const [preset, setPreset] = useState<'bw' | 'few' | 'detail'>('few');
  const [viewMode, setViewMode] = useState<'svg' | 'split' | 'code'>('svg');

  // Interactive SVG Zoom & Pan
  const [zoom, setZoom] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Tracing paths and smoothing curves...');
  const [friendlyAlert, setFriendlyAlert] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedDataUri, setCopiedDataUri] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const initWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    workerRef.current = new Worker('/workers/vectorizer.worker.js');
    workerRef.current.onmessage = (e) => {
      const { type, message, svg, error } = e.data;

      if (type === 'status') {
        if (message) setStatusMessage(message);
      } else if (type === 'done') {
        setSvgOutput(svg);
        setIsProcessing(false);
        setStatusMessage('Your vector is crisp and ready!');
        fireSuccessConfetti();
      } else if (type === 'error') {
        console.error('Vectorizer worker error:', error);
        setIsProcessing(false);
        setFriendlyAlert('Oops! Vectorizing this image took longer than expected. Try picking the "Black & White" or "Few Colors" preset.');
      }
    };
  }, []);

  useEffect(() => {
    initWorker();
    return () => {
      workerRef.current?.terminate();
    };
  }, [initWorker]);

  const processImageToSvg = useCallback(
    (src: string, chosenPreset: 'bw' | 'few' | 'detail') => {
      setIsProcessing(true);
      setStatusMessage('Tracing paths and smoothing curves...');
      setFriendlyAlert(null);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        // Constrain canvas dimensions to avoid freezing
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);

        let colors = 8;
        let pathomit = 8;
        let ltres = 1;

        if (chosenPreset === 'bw') {
          colors = 2;
          pathomit = 12;
          ltres = 1.2;
        } else if (chosenPreset === 'few') {
          colors = 8;
          pathomit = 8;
          ltres = 1.0;
        } else if (chosenPreset === 'detail') {
          colors = 24;
          pathomit = 4;
          ltres = 0.5;
        }

        if (workerRef.current) {
          workerRef.current.postMessage({
            imageData: imgData,
            options: {
              numberofcolors: colors,
              blurradius: 0,
              pathomit,
              ltres,
            },
          });
        }
      };
    },
    []
  );

  const handleFileUpload = (file: File) => {
    setFriendlyAlert(null);
    if (!file.type.startsWith('image/')) {
      setFriendlyAlert('Please pick a regular picture file like JPG, PNG, or WebP.');
      return;
    }
    // Friendly Error Message
    if (file.size > 50 * 1024 * 1024) {
      setFriendlyAlert('Oops! That file is a bit too heavy for your browser to carry. Could you try a file under 50MB?');
      return;
    }

    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalImage(src);
      setSvgOutput(null);
      processImageToSvg(src, preset);
    };
    reader.readAsDataURL(file);
  };

  const cancelProcessing = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    setIsProcessing(false);
    setStatusMessage('Canceled.');
    initWorker();
  };

  const handlePresetChange = (newPreset: 'bw' | 'few' | 'detail') => {
    setPreset(newPreset);
    if (originalImage) {
      processImageToSvg(originalImage, newPreset);
    }
  };

  const downloadSvgFile = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-clean-vector.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySvgCode = () => {
    if (!svgOutput) return;
    navigator.clipboard.writeText(svgOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyDataUri = () => {
    if (!svgOutput) return;
    const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svgOutput)}`;
    navigator.clipboard.writeText(uri);
    setCopiedDataUri(true);
    setTimeout(() => setCopiedDataUri(false), 2000);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setSvgOutput(null);
    setIsProcessing(false);
    setZoom(100);
    setFriendlyAlert(null);
  };

  return (
    <div className="space-y-6">
      {friendlyAlert && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{friendlyAlert}</span>
        </div>
      )}

      {/* Tip Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
        <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>Pro-Tip:</strong> Vectorizing works best with logos, icons, clipart, and signatures! Highly detailed photos might take longer.
        </span>
      </div>

      {!originalImage ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-3 border-dashed border-emerald-400 dark:border-emerald-600 rounded-3xl p-10 sm:p-16 text-center cursor-pointer bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all group duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
            <Sparkles className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Turn Pixelated Logos into Crisp Vectors (SVG)</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Upload your logo, icon, or sketch
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            Turn blurry JPG and PNG graphics into infinitely sharp SVG curves ready for websites, laser cutting, or high-res printing.
          </p>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>Select Logo or Graphic</span>
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Presets: Black & White, Few Colors, High Detail */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Vector Style:
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                {[
                  { id: 'bw', label: 'Black & White' },
                  { id: 'few', label: 'Few Colors' },
                  { id: 'detail', label: 'High Detail' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePresetChange(item.id as typeof preset)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      preset === item.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              {[
                { id: 'svg', label: 'Vector Preview' },
                { id: 'split', label: 'Before & After' },
                { id: 'code', label: 'SVG Code' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setViewMode(m.id as typeof viewMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === m.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload Another</span>
              </button>

              <button
                type="button"
                onClick={downloadSvgFile}
                disabled={!svgOutput}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                <span>Download SVG</span>
              </button>
            </div>
          </div>

          {/* Progress / Loading State */}
          {isProcessing && (
            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
                  {statusMessage}
                </span>
                <button
                  type="button"
                  onClick={cancelProcessing}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
              <div className="w-full h-2 rounded-full bg-emerald-200/60 dark:bg-emerald-900 overflow-hidden">
                <div className="h-full bg-emerald-600 animate-pulse rounded-full w-3/4" />
              </div>
            </div>
          )}

          {/* Interactive Preview Canvas */}
          <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-6 min-h-[460px] flex items-center justify-center overflow-hidden shadow-inner">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-1.5 rounded-2xl text-white">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(50, z - 25))}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono font-bold">{zoom}%</span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(800, z + 25))}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(100)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                title="Reset Zoom"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Checkered Transparency Background */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            />

            {viewMode === 'svg' && (
              <div
                className="transition-transform duration-200 max-w-full max-h-[400px] flex items-center justify-center"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                {svgOutput ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: svgOutput }}
                    className="max-h-[380px] max-w-full flex items-center justify-center [&>svg]:max-h-[380px] [&>svg]:w-auto drop-shadow-2xl"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Rendering vector curves...</span>
                )}
              </div>
            )}

            {viewMode === 'split' && (
              <div className="grid grid-cols-2 gap-6 w-full max-w-3xl z-10">
                <div className="text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Original Raster (Pixelated)
                  </span>
                  <div className="h-64 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-center p-3">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Vectorized Curves (Crisp SVG)
                  </span>
                  <div className="h-64 rounded-2xl bg-black/40 border border-slate-800 flex items-center justify-center p-3">
                    {svgOutput && (
                      <div
                        dangerouslySetInnerHTML={{ __html: svgOutput }}
                        className="max-h-full max-w-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:w-auto"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'code' && (
              <div className="w-full max-w-3xl z-10 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Scalable Vector Graphics (SVG) Source:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copySvgCode}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied XML' : 'Copy XML'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={copyDataUri}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      {copiedDataUri ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDataUri ? 'Copied URI' : 'Copy Data URI'}</span>
                    </button>
                  </div>
                </div>
                <pre className="p-4 rounded-2xl bg-black/80 border border-slate-800 text-xs font-mono text-emerald-400 max-h-72 overflow-auto select-all">
                  {svgOutput}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Format Options Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Save my file as:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadSvgFile}
                disabled={!svgOutput}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors disabled:opacity-50"
              >
                Scalable SVG (.svg)
              </button>
              <button
                type="button"
                onClick={copySvgCode}
                disabled={!svgOutput}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 font-semibold transition-colors disabled:opacity-50"
              >
                Copy SVG XML Code
              </button>
              <button
                type="button"
                onClick={copyDataUri}
                disabled={!svgOutput}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 font-semibold transition-colors disabled:opacity-50"
              >
                Copy Data URI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
