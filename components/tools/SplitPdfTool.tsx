'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Scissors,
  CheckSquare,
  Square,
  FileArchive,
  FileText,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { fireSuccessConfetti } from '@/lib/confetti';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

export default function SplitPdfTool() {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState('document');
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageRangeInput, setPageRangeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      setPdfBytes(buffer);
      setTotalPages(count);
      // Default to selecting all pages
      const all = Array.from({ length: count }, (_, i) => i + 1);
      setSelectedPages(all);
      setPageRangeInput(`1-${count}`);
    } catch (err) {
      alert('Could not parse this PDF. Please check if it is password-protected.');
    }
  };

  const togglePage = (pageNum: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNum) ? prev.filter((p) => p !== pageNum) : [...prev, pageNum].sort((a, b) => a - b)
    );
  };

  const handleSelectAll = () => {
    setSelectedPages(Array.from({ length: totalPages }, (_, i) => i + 1));
  };

  const handleDeselectAll = () => {
    setSelectedPages([]);
  };

  const parseRangeString = (str: string) => {
    const pages = new Set<number>();
    const parts = str.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const num = Number(trimmed);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          pages.add(num);
        }
      }
    }
    const result = Array.from(pages).sort((a, b) => a - b);
    setSelectedPages(result);
  };

  const handleExtractSelected = async () => {
    if (!pdfBytes || selectedPages.length === 0) return;
    setIsProcessing(true);
    setProgress(30);

    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();

      // Convert 1-indexed to 0-indexed
      const indices = selectedPages.map((p) => p - 1);
      const copiedPages = await newDoc.copyPages(srcDoc, indices);
      copiedPages.forEach((page) => newDoc.addPage(page));

      setProgress(80);
      const outputBytes = await newDoc.save();
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}-split-${selectedPages.length}-pages.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setIsProcessing(false);
      setProgress(100);
      fireSuccessConfetti();
    } catch (err) {
      setIsProcessing(false);
      alert('Error creating extracted PDF.');
    }
  };

  const handleBurstAllZip = async () => {
    if (!pdfBytes || totalPages === 0) return;
    setIsProcessing(true);
    setProgress(10);

    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      const zip = new JSZip();

      for (let i = 0; i < totalPages; i++) {
        const singleDoc = await PDFDocument.create();
        const [copied] = await singleDoc.copyPages(srcDoc, [i]);
        singleDoc.addPage(copied);
        const singleBytes = await singleDoc.save();
        zip.file(`${fileName}-page-${i + 1}.pdf`, singleBytes);
        setProgress(Math.round(((i + 1) / totalPages) * 80));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}-all-pages.zip`;
      link.click();
      URL.revokeObjectURL(url);

      setIsProcessing(false);
      setProgress(100);
      fireSuccessConfetti();
    } catch (err) {
      setIsProcessing(false);
      alert('Error bursting PDF into ZIP.');
    }
  };

  return (
    <div className="space-y-6">
      {!pdfBytes ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-3 border-dashed border-indigo-400 dark:border-indigo-600 rounded-3xl p-10 sm:p-16 text-center cursor-pointer bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all group duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="application/pdf"
            className="hidden"
          />
          <div className="w-20 h-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/25 group-hover:scale-110 transition-transform">
            <Scissors className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Drop your PDF here to split
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Isolate specific pages, extract page ranges, or burst every page into separate files.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm group-hover:bg-indigo-700 transition-colors">
            Select PDF Document
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Document: {fileName}.pdf
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total {totalPages} pages • {selectedPages.length} selected for extraction
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Custom page range text input */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0 flex items-center">
                <span>Custom Range:</span>
                <InteractiveTooltip content="Type comma-separated pages or ranges, e.g. '1-3, 5, 8'." />
              </label>
              <input
                type="text"
                value={pageRangeInput}
                onChange={(e) => {
                  setPageRangeInput(e.target.value);
                  parseRangeString(e.target.value);
                }}
                placeholder="e.g. 1-3, 5"
                className="w-full sm:w-64 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Page Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isSelected = selectedPages.includes(pageNum);
              return (
                <div
                  key={pageNum}
                  onClick={() => togglePage(pageNum)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center flex flex-col items-center justify-between h-32 select-none ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold">P. {pageNum}</span>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                  <FileText className={`w-8 h-8 ${isSelected ? 'text-indigo-600' : 'text-slate-300 dark:text-slate-700'}`} />
                  <span className="text-[11px] font-semibold">
                    {isSelected ? 'Selected' : 'Omitted'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          {isProcessing && (
            <div className="w-full h-2.5 rounded-full bg-indigo-100 dark:bg-indigo-950 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setPdfBytes(null);
                setTotalPages(0);
                setSelectedPages([]);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Choose Another PDF</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBurstAllZip}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-semibold text-sm transition-colors"
              >
                <FileArchive className="w-4 h-4" />
                <span>Burst All to ZIP</span>
              </button>

              <button
                type="button"
                onClick={handleExtractSelected}
                disabled={isProcessing || selectedPages.length === 0}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Extract {selectedPages.length} Pages</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
