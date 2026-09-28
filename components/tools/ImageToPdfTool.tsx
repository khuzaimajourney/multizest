/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Trash2,
  FileImage,
  Plus,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { fireSuccessConfetti } from '@/lib/confetti';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
}

export default function ImageToPdfTool() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margins, setMargins] = useState<'none' | 'small' | 'normal'>('small');
  const [isConverting, setIsConverting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | File[]) => {
    const newItems: ImageItem[] = [];
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newItems.push({
          id: Math.random().toString(36).substring(7),
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        });
      }
    });

    if (newItems.length > 0) {
      setImages((prev) => [...prev, ...newItems]);
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) return;
    setIsConverting(true);

    try {
      const pdfDoc = await PDFDocument.create();

      // Standard A4 dimensions in points (72 points per inch)
      const A4_WIDTH = 595.28;
      const A4_HEIGHT = 841.89;

      const marginPoints = margins === 'none' ? 0 : margins === 'small' ? 20 : 40;

      for (const item of images) {
        const imageBytes = await item.file.arrayBuffer();
        let pdfImage;

        if (item.file.type === 'image/jpeg' || item.file.type === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          // PNG or other formats: convert via canvas to png bytes
          pdfImage = await pdfDoc.embedPng(imageBytes).catch(async () => {
            // Fallback for WebP or other formats via canvas
            const canvas = document.createElement('canvas');
            const img = new Image();
            img.src = item.previewUrl;
            await new Promise((res) => {
              img.onload = res;
            });
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const pngDataUrl = canvas.toDataURL('image/png');
            const pngBuffer = await (await fetch(pngDataUrl)).arrayBuffer();
            return await pdfDoc.embedPng(pngBuffer);
          });
        }

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;

        let page;
        let drawWidth: number;
        let drawHeight: number;
        let posX: number;
        let posY: number;

        if (pageSize === 'fit') {
          // Page fits image dimensions exactly
          page = pdfDoc.addPage([imgWidth, imgHeight]);
          drawWidth = imgWidth;
          drawHeight = imgHeight;
          posX = 0;
          posY = 0;
        } else {
          // A4 layout
          const pageWidth = orientation === 'portrait' ? A4_WIDTH : A4_HEIGHT;
          const pageHeight = orientation === 'portrait' ? A4_HEIGHT : A4_WIDTH;
          page = pdfDoc.addPage([pageWidth, pageHeight]);

          const availWidth = pageWidth - marginPoints * 2;
          const availHeight = pageHeight - marginPoints * 2;

          const widthRatio = availWidth / imgWidth;
          const heightRatio = availHeight / imgHeight;
          const scale = Math.min(widthRatio, heightRatio);

          drawWidth = imgWidth * scale;
          drawHeight = imgHeight * scale;
          posX = (pageWidth - drawWidth) / 2;
          posY = (pageHeight - drawHeight) / 2;
        }

        page.drawImage(pdfImage, {
          x: posX,
          y: posY,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const outputBytes = await pdfDoc.save();
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `multizest-album-${images.length}-photos.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      setIsConverting(false);
      fireSuccessConfetti();
    } catch (err) {
      setIsConverting(false);
      alert('Error creating PDF album. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {images.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-3 border-dashed border-pink-400 dark:border-pink-600 rounded-3xl p-10 sm:p-16 text-center cursor-pointer bg-pink-50/40 dark:bg-pink-950/20 hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-all group duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            accept="image/*"
            multiple
            className="hidden"
          />
          <div className="w-20 h-20 rounded-3xl bg-pink-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-pink-500/25 group-hover:scale-110 transition-transform">
            <FileImage className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Drop multiple images to combine into PDF
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Upload JPG, PNG, or WebP photos. Reorder pages and customize margins effortlessly.
          </p>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 text-white text-xs font-semibold shadow-sm group-hover:bg-pink-700 transition-colors">
            Select Photos (Multiple)
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Options Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value as any)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="a4">Standard A4 Document</option>
                <option value="fit">Fit to Image Size</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Orientation
              </label>
              <select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as any)}
                disabled={pageSize === 'fit'}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
              >
                <option value="portrait">Portrait (Vertical)</option>
                <option value="landscape">Landscape (Horizontal)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Page Margins
              </label>
              <select
                value={margins}
                onChange={(e) => setMargins(e.target.value as any)}
                disabled={pageSize === 'fit'}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
              >
                <option value="none">None (Full Bleed)</option>
                <option value="small">Small Margin</option>
                <option value="normal">Normal Margin</option>
              </select>
            </div>
          </div>

          {/* Images Grid with Reordering */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto p-1">
            {images.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                  />
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {item.name}
                    </h5>
                    <p className="text-xs text-slate-500">
                      {(item.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition-colors ml-1"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add more button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Photos</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              accept="image/*"
              multiple
              className="hidden"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setImages([])}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear All Photos</span>
            </button>

            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isConverting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm transition-all shadow-lg shadow-pink-500/25 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Convert {images.length} Images to PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
