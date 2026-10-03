/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sparkles,
  FileText,
  Copy,
  Check,
  Crop,
  FileCheck,
  FileDown,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { fireSuccessConfetti } from '@/lib/confetti';

interface Point {
  x: number;
  y: number;
}

export default function SmartScannerTool() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [flattenedImage, setFlattenedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'magic_color' | 'bw' | 'grayscale' | 'original'>('magic_color');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [friendlyAlert, setFriendlyAlert] = useState<string | null>(null);
  const [fileName, setFileName] = useState('document');
  const [copied, setCopied] = useState(false);

  // 4 corner handles
  const [corners, setCorners] = useState<Point[]>([
    { x: 50, y: 50 },
    { x: 350, y: 50 },
    { x: 350, y: 450 },
    { x: 50, y: 450 },
  ]);
  const [imgSize, setImgSize] = useState<{ w: number; h: number }>({ w: 400, h: 500 });
  const [draggedCorner, setDraggedCorner] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const tesseractWorkerRef = useRef<any>(null);

  const cancelOcr = () => {
    if (tesseractWorkerRef.current) {
      try {
        tesseractWorkerRef.current.terminate();
      } catch (e) {
        console.warn('Error terminating tesseract worker:', e);
      }
      tesseractWorkerRef.current = null;
    }
    setIsOcrProcessing(false);
    setOcrProgress(0);
    setStatusMessage('Canceled.');
  };

  useEffect(() => {
    try {
      workerRef.current = new Worker('/workers/scanner.worker.js');
      workerRef.current.onmessage = (e) => {
        const { type, message, dstData, outWidth, outHeight, error } = e.data;

        if (type === 'status') {
          if (message) setStatusMessage(message);
        } else if (type === 'done') {
          const canvas = document.createElement('canvas');
          canvas.width = outWidth;
          canvas.height = outHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imgData = new ImageData(dstData, outWidth, outHeight);
            ctx.putImageData(imgData, 0, 0);
            const url = canvas.toDataURL('image/png');
            setFlattenedImage(url);
            setIsProcessing(false);
            setStatusMessage('Straightened and ready!');
            fireSuccessConfetti();
          }
        } else if (type === 'error') {
          console.error('Scanner error:', error);
          setIsProcessing(false);
          setFriendlyAlert('Oops! Could not straighten document. Check if the corner pins form a valid shape.');
        }
      };
    } catch (err) {
      console.warn('Worker error:', err);
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Redraw Interactive 4-point polygon on canvas
  const drawCornerCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Tinted polygon area
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      ctx.lineTo(corners[1].x, corners[1].y);
      ctx.lineTo(corners[2].x, corners[2].y);
      ctx.lineTo(corners[3].x, corners[3].y);
      ctx.closePath();

      ctx.fillStyle = 'rgba(59, 130, 246, 0.22)';
      ctx.fill();
      ctx.lineWidth = Math.max(3, Math.round(canvas.width / 240));
      ctx.strokeStyle = '#2563eb';
      ctx.stroke();

      // Corner handles
      const labels = ['Top-L', 'Top-R', 'Bot-R', 'Bot-L'];
      const handleRadius = Math.max(14, Math.round(canvas.width / 40));

      corners.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, handleRadius, 0, Math.PI * 2);
        ctx.fillStyle = draggedCorner === idx ? '#f59e0b' : '#ffffff';
        ctx.fill();
        ctx.lineWidth = Math.max(3, Math.round(canvas.width / 240));
        ctx.strokeStyle = '#2563eb';
        ctx.stroke();

        ctx.font = `bold ${Math.round(handleRadius * 0.75)}px sans-serif`;
        ctx.fillStyle = '#1e3a8a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[idx], pt.x, pt.y);
      });
    };
  }, [corners, draggedCorner, originalImage]);

  useEffect(() => {
    drawCornerCanvas();
  }, [drawCornerCanvas]);

  const handleFileUpload = (file: File) => {
    setFriendlyAlert(null);
    if (!file.type.startsWith('image/')) {
      setFriendlyAlert('Please pick a regular image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setFriendlyAlert('Oops! That file is a bit too heavy for your browser to carry. Could you try a file under 50MB?');
      return;
    }

    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalImage(src);
      setFlattenedImage(null);
      setExtractedText('');

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImgSize({ w: img.width, h: img.height });
        // Initial friendly quad margin
        const insetX = img.width * 0.08;
        const insetY = img.height * 0.08;
        setCorners([
          { x: insetX, y: insetY },
          { x: img.width - insetX, y: insetY },
          { x: img.width - insetX, y: img.height - insetY },
          { x: insetX, y: img.height - insetY },
        ]);
      };
    };
    reader.readAsDataURL(file);
  };

  const getCanvasMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasMousePos(e);
    const canvas = canvasRef.current;
    const threshold = canvas ? Math.max(35, canvas.width / 18) : 40;

    let closest = -1;
    let minD = Infinity;
    corners.forEach((pt, i) => {
      const d = Math.hypot(pt.x - pos.x, pt.y - pos.y);
      if (d < threshold && d < minD) {
        minD = d;
        closest = i;
      }
    });

    if (closest !== -1) {
      setDraggedCorner(closest);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedCorner === null) return;
    const pos = getCanvasMousePos(e);
    const clampedX = Math.max(0, Math.min(imgSize.w, pos.x));
    const clampedY = Math.max(0, Math.min(imgSize.h, pos.y));

    setCorners((prev) => {
      const next = [...prev];
      next[draggedCorner] = { x: clampedX, y: clampedY };
      return next;
    });
  };

  const handleMouseUp = () => {
    setDraggedCorner(null);
  };

  const scanAndFlatten = () => {
    if (!originalImage || !workerRef.current) return;
    setIsProcessing(true);
    setStatusMessage('Straightening and enhancing document...');
    setFriendlyAlert(null);

    const img = new Image();
    img.src = originalImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);

      const widthTop = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
      const widthBottom = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
      const targetWidth = Math.round(Math.max(widthTop, widthBottom));

      const heightLeft = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
      const heightRight = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
      const targetHeight = Math.round(Math.max(heightLeft, heightRight));

      workerRef.current?.postMessage({
        srcData: imgData.data,
        srcWidth: img.width,
        srcHeight: img.height,
        corners,
        outWidth: targetWidth,
        outHeight: targetHeight,
        filterMode,
      });
    };
  };

  // Tesseract OCR with live friendly logger
  const extractTextOCR = async () => {
    if (!flattenedImage) return;
    setIsOcrProcessing(true);
    setOcrProgress(10);
    setStatusMessage('Waking up the OCR engine... (This only happens once!)');
    setFriendlyAlert(null);

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng', undefined, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const p = Math.round((m.progress || 0) * 100);
            setOcrProgress(p);
            setStatusMessage(`Recognizing words: ${p}%`);
          } else if (m.status === 'loading language traineddata') {
            setStatusMessage('Downloading language dictionary...');
          }
        },
      });
      tesseractWorkerRef.current = worker;

      const ret = await worker.recognize(flattenedImage);
      setExtractedText(ret.data.text.trim());
      await worker.terminate();
      tesseractWorkerRef.current = null;

      setIsOcrProcessing(false);
      setOcrProgress(100);
      setStatusMessage('Words extracted successfully!');
      fireSuccessConfetti();
    } catch (err) {
      console.error('OCR error:', err);
      setIsOcrProcessing(false);
      setFriendlyAlert('Could not read words from this image clearly. Try picking the "B&W Scan" filter for higher contrast.');
    }
  };

  const downloadAsPDF = async () => {
    if (!flattenedImage) return;

    try {
      const pdfDoc = await PDFDocument.create();
      const imageBytes = await fetch(flattenedImage).then((res) => res.arrayBuffer());
      const embeddedImg = await pdfDoc.embedPng(imageBytes);

      const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: embeddedImg.width,
        height: embeddedImg.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-scanned.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF error:', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setFlattenedImage(null);
    setExtractedText('');
    setIsProcessing(false);
    setIsOcrProcessing(false);
    setFriendlyAlert(null);
  };

  return (
    <div className="space-y-6">
      {friendlyAlert && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{friendlyAlert}</span>
        </div>
      )}

      {!originalImage ? (
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
            accept="image/*"
            className="hidden"
          />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
            <Crop className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Extract Text from Images & Receipts</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Upload document, receipt, or paper photo
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            Took a photo at an angle? We will unskew the paper, clean up the shadows, and copy out every single printed word for you.
          </p>
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>Pick a Document Picture</span>
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Enhancement:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                {[
                  { id: 'magic_color', label: 'Magic Color' },
                  { id: 'bw', label: 'B&W Scan' },
                  { id: 'grayscale', label: 'Grayscale' },
                  { id: 'original', label: 'Original' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFilterMode(item.id as typeof filterMode);
                      if (flattenedImage) scanAndFlatten();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filterMode === item.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload Another</span>
              </button>

              <button
                type="button"
                onClick={scanAndFlatten}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                <Crop className="w-4 h-4" />
                <span>Straighten Document</span>
              </button>
            </div>
          </div>

          {/* Interactive 4-Point Quadrilateral Corner Dragging */}
          {!flattenedImage && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 px-2">
                <span>📍 Drag the 4 corner pins to tightly frame the document paper:</span>
                <span className="text-blue-600 dark:text-blue-400">Click &apos;Straighten Document&apos; when ready</span>
              </div>
              <div className="relative w-full h-[480px] overflow-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center p-4">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="max-h-full max-w-full object-contain cursor-crosshair shadow-2xl rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Flattened Result Stage */}
          {flattenedImage && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Image & PDF Download */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    <span>Straightened Document</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = flattenedImage;
                        link.download = `${fileName}-scanned.png`;
                        link.click();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadAsPDF}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Save as PDF</span>
                    </button>
                  </div>
                </div>

                <div className="w-full h-[400px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 overflow-hidden shadow-inner">
                  <img
                    src={flattenedImage}
                    alt="Straightened scan"
                    className="max-h-full max-w-full object-contain rounded-xl shadow-lg"
                  />
                </div>
              </div>

              {/* OCR Text Extraction Column */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Extracted Text</span>
                  </h4>

                  {!extractedText ? (
                    <button
                      type="button"
                      onClick={extractTextOCR}
                      disabled={isOcrProcessing}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isOcrProcessing ? 'Reading words...' : 'Extract Text from Image'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={downloadTextFile}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>.TXT</span>
                      </button>
                    </div>
                  )}
                </div>

                {isOcrProcessing && (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold text-blue-900 dark:text-blue-200">
                      <span>{statusMessage}</span>
                      <div className="flex items-center gap-3">
                        <span>{ocrProgress}%</span>
                        <button
                          type="button"
                          onClick={cancelOcr}
                          className="px-2 py-0.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 text-[11px] font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-blue-200/60 dark:bg-blue-900 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    placeholder="Click 'Extract Text from Image' above to read all printed words into editable copy..."
                    rows={15}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none shadow-sm"
                  />
                  {extractedText && (
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{extractedText.split(/\s+/).filter(Boolean).length} words detected</span>
                      <span>Feel free to edit or copy text directly</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
