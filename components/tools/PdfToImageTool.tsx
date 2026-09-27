'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  UploadCloud,
  FileText,
  Download,
  Check,
  RefreshCw,
  Archive,
  Layers,
  Sliders,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface ConvertedPage {
  pageNumber: number;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export default function PdfToImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [fileSize, setFileSize] = useState<string>('');
  const [format, setFormat] = useState<'jpg' | 'png'>('jpg');
  const [qualityLevel, setQualityLevel] = useState<'low' | 'medium' | 'high' | 'max'>('high');
  const [pageSelection, setPageSelection] = useState<'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>('1');

  // Execution states
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleFile = async (selected: File | null) => {
    if (!selected) return;
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 50MB browser limit.');
      return;
    }

    setErrorMsg(null);
    setFile(selected);
    setFileSize(formatBytes(selected.size));
    setConvertedPages([]);
    setProgress(0);
    setCurrentStepText('Analyzing document...');

    try {
      // Dynamic import of pdfjs-dist to ensure client-side only
      const pdfjs = await import('pdfjs-dist');
      // Set worker
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await selected.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const doc = await loadingTask.promise;
      setTotalPages(doc.numPages);
      setCustomRange(`1-${Math.min(doc.numPages, 3)}`);
      setCurrentStepText(`Loaded ${doc.numPages} pages.`);
    } catch (err: unknown) {
      console.error('Failed to parse PDF document:', err);
      setErrorMsg('Could not read PDF. Make sure the file is not password-protected.');
    }
  };

  // Parse page numbers from "1-3, 5, 7" string
  const getPagesToConvert = (total: number): number[] => {
    if (pageSelection === 'all') {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set<number>();
    const parts = customRange.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(total, end); p++) {
            pages.add(p);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= total) {
          pages.add(p);
        }
      }
    }

    const result = Array.from(pages).sort((a, b) => a - b);
    return result.length > 0 ? result : [1];
  };

  const handleConvert = async () => {
    if (!file || totalPages === 0) return;
    setIsConverting(true);
    setErrorMsg(null);
    setConvertedPages([]);
    setProgress(0);

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const targetPageNumbers = getPagesToConvert(totalPages);

      // Rendering scale based on quality setting
      const scaleMap = {
        low: 1.0,
        medium: 1.5,
        high: 2.0,
        max: 3.0,
      };
      const renderScale = scaleMap[qualityLevel];

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const compressionQuality = qualityLevel === 'low' ? 0.7 : qualityLevel === 'medium' ? 0.85 : 0.95;

      const results: ConvertedPage[] = [];

      for (let i = 0; i < targetPageNumbers.length; i++) {
        const pageNum = targetPageNumbers[i];
        setCurrentStepText(`Rendering page ${pageNum} of ${totalPages}...`);
        setProgress(Math.round(((i + 1) / targetPageNumbers.length) * 100));

        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport, canvas }).promise;

        const dataUrl = canvas.toDataURL(mimeType, compressionQuality);

        // Convert dataUrl to blob
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        results.push({
          pageNumber: pageNum,
          dataUrl,
          blob,
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
        });
      }

      setConvertedPages(results);
      setCurrentStepText('Conversion completed successfully!');
    } catch (err: unknown) {
      console.error('PDF conversion error:', err);
      setErrorMsg('Failed during page conversion. Ensure your browser has sufficient memory.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadSingle = (page: ConvertedPage) => {
    const a = document.createElement('a');
    a.href = page.dataUrl;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
    a.download = `${baseName}-page-${page.pageNumber}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadZip = async () => {
    if (convertedPages.length === 0) return;
    const zip = new JSZip();
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';

    convertedPages.forEach((page) => {
      zip.file(`${baseName}-page-${page.pageNumber}.${format}`, page.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}-images.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* File Dropzone */}
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById('pdf-upload-input')?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-10 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group"
        >
          <input
            id="pdf-upload-input"
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Drag & drop your PDF here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              PDF files up to 50MB (Processed 100% locally in your browser)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* File Meta Header */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {totalPages} {totalPages === 1 ? 'Page' : 'Pages'} • {fileSize}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setConvertedPages([]);
                setProgress(0);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Choose different PDF
            </button>
          </div>

          {/* Settings Panel */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Conversion Settings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Output Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Image Format
                </label>
                <div className="flex rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 p-1">
                  <button
                    type="button"
                    onClick={() => setFormat('jpg')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      format === 'jpg'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    JPG (Smaller)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('png')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      format === 'png'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    PNG (Crisp)
                  </button>
                </div>
              </div>

              {/* Quality Slider */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Rendering Quality
                </label>
                <select
                  value={qualityLevel}
                  onChange={(e) => setQualityLevel(e.target.value as 'low' | 'medium' | 'high' | 'max')}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                >
                  <option value="low">Low (1.0x Scale, Quickest)</option>
                  <option value="medium">Medium (1.5x Scale)</option>
                  <option value="high">High (2.0x Scale, Standard)</option>
                  <option value="max">Maximum (3.0x Scale, Ultra Sharp)</option>
                </select>
              </div>

              {/* Pages to Convert */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pages to Extract
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2 text-xs">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pageSel"
                        checked={pageSelection === 'all'}
                        onChange={() => setPageSelection('all')}
                        className="text-blue-600"
                      />
                      <span>All ({totalPages})</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pageSel"
                        checked={pageSelection === 'custom'}
                        onChange={() => setPageSelection('custom')}
                        className="text-blue-600"
                      />
                      <span>Custom Range</span>
                    </label>
                  </div>

                  {pageSelection === 'custom' && (
                    <input
                      type="text"
                      value={customRange}
                      onChange={(e) => setCustomRange(e.target.value)}
                      placeholder="e.g. 1-3, 5"
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Convert Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{currentStepText || 'Converting PDF Pages...'}</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Convert to {format.toUpperCase()} Images Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            {isConverting && (
              <div className="space-y-1 pt-1">
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{currentStepText}</span>
                  <span>{progress}%</span>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results: Page Thumbnails & Downloads */}
          {convertedPages.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Converted Pages ({convertedPages.length})
                </h4>

                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Archive className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </button>
              </div>

              {/* Grid of thumbnail previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {convertedPages.map((pg) => (
                  <div
                    key={pg.pageNumber}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pg.dataUrl}
                        alt={`Page ${pg.pageNumber}`}
                        className="max-h-full max-w-full object-contain shadow-sm"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                        Page {pg.pageNumber}
                      </span>
                    </div>

                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {pg.width} × {pg.height}px
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(pg)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
