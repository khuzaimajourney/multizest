'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  UploadCloud,
  Files,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface PdfFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export default function MergePdfTool() {
  const [pdfFiles, setPdfFiles] = useState<PdfFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedPageCount, setMergedPageCount] = useState<number>(0);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setErrorMsg(null);

    const newItems: PdfFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        continue;
      }

      try {
        const buffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          pageCount: doc.getPageCount(),
        });
      } catch (err) {
        console.error('Failed to read PDF:', err);
      }
    }

    if (newItems.length === 0) {
      setErrorMsg('Please select valid, non-password-protected PDF files.');
      return;
    }

    setPdfFiles((prev) => [...prev, ...newItems]);
    setMergedUrl(null);
    setMergedBlob(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setPdfFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const moveDown = (index: number) => {
    if (index === pdfFiles.length - 1) return;
    setPdfFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setErrorMsg('Please upload at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfFiles) {
        const buffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setMergedBlob(blob);
      setMergedUrl(url);
      setMergedPageCount(mergedPdf.getPageCount());
    } catch (err: unknown) {
      console.error('Merge PDF error:', err);
      setErrorMsg('Failed to merge documents. Make sure files are not password-protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedUrl) return;
    const a = document.createElement('a');
    a.href = mergedUrl;
    a.download = `multizest-merged-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => document.getElementById('merge-pdf-input')?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-8 sm:p-10 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 transition-colors group"
      >
        <input
          id="merge-pdf-input"
          type="file"
          multiple
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="mt-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Drag & drop PDF files here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select 2 or more PDF documents to merge into a single file
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* PDF List with Reordering */}
      {pdfFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Files to Merge ({pdfFiles.length})
            </span>
            <button
              type="button"
              onClick={() => setPdfFiles([])}
              className="text-xs text-red-500 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2.5">
            {pdfFiles.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'} • {formatFileSize(item.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    aria-label="Move file up"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === pdfFiles.length - 1}
                    onClick={() => moveDown(index)}
                    aria-label="Move file down"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    aria-label="Remove file"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleMerge}
              disabled={pdfFiles.length < 2 || isProcessing}
              className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Merging PDF Documents...</span>
                </>
              ) : (
                <>
                  <Files className="w-4 h-4" />
                  <span>Merge {pdfFiles.length} PDFs into One</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Merged Result Card */}
      {mergedUrl && (
        <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  PDFs Successfully Merged!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Total {mergedPageCount} pages • {mergedBlob ? formatFileSize(mergedBlob.size) : ''}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download Combined PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
