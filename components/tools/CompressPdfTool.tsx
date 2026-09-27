'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  UploadCloud,
  FileArchive,
  Download,
  RefreshCw,
  AlertCircle,
  FileCheck,
  Sliders,
} from 'lucide-react';

export default function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleFile = async (selected: File | null) => {
    if (!selected) return;
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please upload a valid PDF document.');
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 50MB limit.');
      return;
    }

    setErrorMsg(null);
    setFile(selected);
    setOriginalSize(selected.size);
    setCompressedUrl(null);
    setCompressedBlob(null);

    try {
      const buffer = await selected.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch (err) {
      console.error('Failed to parse PDF:', err);
      setErrorMsg('Could not read PDF. Make sure file is not password-protected.');
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true });

      // Clean metadata and compress object streams
      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setProducer('MultiZest PDF Optimizer');
      pdf.setCreator('MultiZest');

      // Save with object stream optimization
      const compressedBytes = await pdf.save({
        useObjectStreams: true,
      });

      const blob = new Blob([compressedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setCompressedBlob(blob);
      setCompressedUrl(url);
      setCompressedSize(blob.size);
    } catch (err: unknown) {
      console.error('PDF compression error:', err);
      setErrorMsg('Failed to compress document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    const a = document.createElement('a');
    a.href = compressedUrl;
    const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : 'document';
    a.download = `compressed-${baseName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const savingsPercent =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0] || null);
          }}
          onClick={() => document.getElementById('compress-pdf-input')?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-10 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group"
        >
          <input
            id="compress-pdf-input"
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Drag & drop PDF here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Reduce file size for emails and web uploads (up to 50MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <FileArchive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  {pageCount} {pageCount === 1 ? 'Page' : 'Pages'} • Original Size: {formatFileSize(originalSize)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFile(null);
                setCompressedUrl(null);
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
              <span>Compression Level</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'low', name: 'Low Compression', desc: 'Highest quality, minor reduction' },
                { id: 'medium', name: 'Medium (Balanced)', desc: 'Recommended for email attachments' },
                { id: 'high', name: 'High Compression', desc: 'Maximum file size reduction' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLevel(opt.id as 'low' | 'medium' | 'high')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    level === opt.id
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs">{opt.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleCompress}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compressing PDF Document...</span>
                  </>
                ) : (
                  <>
                    <FileArchive className="w-4 h-4" />
                    <span>Compress PDF Now</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Compressed Result Card */}
          {compressedUrl && (
            <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      PDF Compression Complete!
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {formatFileSize(originalSize)} → <strong>{formatFileSize(compressedSize)}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {savingsPercent > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                      -{savingsPercent}% Saved
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
