'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  RotateCw,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { fireSuccessConfetti } from '@/lib/confetti';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

export default function RotatePdfTool() {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState('document');
  const [totalPages, setTotalPages] = useState(0);
  const [rotations, setRotations] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') return;
    setFileName(file.name.replace(/\.[^/.]+$/, ''));

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const count = pdfDoc.getPageCount();
      const initialRotations = pdfDoc.getPages().map((p) => p.getRotation().angle);

      setPdfBytes(buffer);
      setTotalPages(count);
      setRotations(initialRotations);
    } catch (err) {
      alert('Could not parse this PDF. Please check if it is password protected.');
    }
  };

  const rotateSinglePage = (pageIndex: number, delta: number) => {
    setRotations((prev) => {
      const updated = [...prev];
      updated[pageIndex] = (updated[pageIndex] + delta + 360) % 360;
      return updated;
    });
  };

  const rotateAllPages = (delta: number) => {
    setRotations((prev) => prev.map((angle) => (angle + delta + 360) % 360));
  };

  const handleSave = async () => {
    if (!pdfBytes) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      pages.forEach((page, index) => {
        page.setRotation(degrees(rotations[index] || 0));
      });

      const outputBytes = await pdfDoc.save();
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}-rotated.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setIsProcessing(false);
      fireSuccessConfetti();
    } catch (err) {
      setIsProcessing(false);
      alert('Failed to save rotated PDF.');
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
          className="border-3 border-dashed border-blue-400 dark:border-blue-600 rounded-3xl p-10 sm:p-16 text-center cursor-pointer bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all group duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="application/pdf"
            className="hidden"
          />
          <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
            <RotateCw className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Drop your PDF here to rotate
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Fix sideways or upside-down scanned PDFs. Rotate individual pages or all pages at once.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm group-hover:bg-blue-700 transition-colors">
            Select PDF Document
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {fileName}.pdf
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalPages} pages loaded • Ready to orient
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 hidden sm:inline flex items-center">
                <span>Batch Rotate:</span>
                <InteractiveTooltip content="Rotate all pages together clockwise by 90 degrees." />
              </span>
              <button
                type="button"
                onClick={() => rotateAllPages(-90)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>All 90° Left</span>
              </button>
              <button
                type="button"
                onClick={() => rotateAllPages(90)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>All 90° Right</span>
              </button>
            </div>
          </div>

          {/* Pages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[420px] overflow-y-auto p-2">
            {rotations.map((angle, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between w-full text-xs font-bold text-slate-500">
                  <span>Page {index + 1}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                    {angle}°
                  </span>
                </div>

                {/* Rotating preview icon box */}
                <div className="w-20 h-24 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center justify-center transition-transform duration-300">
                  <div
                    style={{ transform: `rotate(${angle}deg)` }}
                    className="transition-transform duration-300"
                  >
                    <FileText className="w-10 h-10 text-blue-500" />
                  </div>
                </div>

                {/* Single page rotation buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => rotateSinglePage(index, -90)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    title="Rotate 90° Counter-Clockwise"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => rotateSinglePage(index, 90)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setPdfBytes(null);
                setTotalPages(0);
                setRotations([]);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Choose Another PDF</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Save & Download Rotated PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
