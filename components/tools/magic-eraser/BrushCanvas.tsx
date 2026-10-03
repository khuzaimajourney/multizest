'use client';

import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

export type SelectionMode = 'brush' | 'box';

export interface BrushCanvasRef {
  getImageAndMaskData: () => {
    imageData: ImageData;
    maskData: ImageData;
    width: number;
    height: number;
    hasMaskPixels: boolean;
  } | null;
  undo: () => void;
  clearMask: () => void;
  canUndo: boolean;
  hasMask: boolean;
}

interface BrushCanvasProps {
  imageSrc: string;
  brushSize: number;
  selectionMode?: SelectionMode;
  onMaskChange?: (hasMask: boolean, canUndo: boolean) => void;
  onSelectionComplete?: () => void;
}

interface BoxDragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const BrushCanvas = forwardRef<BrushCanvasRef, BrushCanvasProps>(
  ({ imageSrc, brushSize, selectionMode = 'brush', onMaskChange, onSelectionComplete }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const innerWrapperRef = useRef<HTMLDivElement>(null);
    const imageCanvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
    const [boxDrag, setBoxDrag] = useState<BoxDragState | null>(null);

    const undoStackRef = useRef<ImageData[]>([]);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const boxStartCanvasRef = useRef<{ x: number; y: number } | null>(null);
    const hasDrawnRef = useRef(false);

    // Keep callbacks in refs to avoid breaking re-renders
    const onMaskChangeRef = useRef(onMaskChange);
    useEffect(() => {
      onMaskChangeRef.current = onMaskChange;
    });

    const onSelectionCompleteRef = useRef(onSelectionComplete);
    useEffect(() => {
      onSelectionCompleteRef.current = onSelectionComplete;
    });

    // Check if mask currently contains any painted pixels
    const checkHasMaskPixels = useCallback(() => {
      const mCanvas = maskCanvasRef.current;
      if (!mCanvas) return false;
      const mCtx = mCanvas.getContext('2d', { willReadFrequently: true });
      if (!mCtx) return false;
      const data = mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height).data;
      const len = data.length;
      // sample or check
      for (let i = 0; i < len; i += 16) {
        if (data[i + 3] > 15 || data[i] > 50) {
          return true;
        }
      }
      return false;
    }, []);

    // Load original image onto base canvas
    useEffect(() => {
      if (!imageSrc) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        // Downscale proportionally if over 2000px for browser memory safety
        const MAX_DIM = 2000;
        if (w > MAX_DIM || h > MAX_DIM) {
          const scale = MAX_DIM / Math.max(w, h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }

        const imgCanvas = imageCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;

        if (imgCanvas && maskCanvas) {
          imgCanvas.width = w;
          imgCanvas.height = h;
          maskCanvas.width = w;
          maskCanvas.height = h;

          const iCtx = imgCanvas.getContext('2d');
          const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });

          if (iCtx) {
            iCtx.clearRect(0, 0, w, h);
            iCtx.drawImage(img, 0, 0, w, h);
          }

          if (mCtx) {
            mCtx.clearRect(0, 0, w, h);
            // Save initial empty state to undo stack
            undoStackRef.current = [mCtx.getImageData(0, 0, w, h)];
          }

          hasDrawnRef.current = false;
          setBoxDrag(null);
          onMaskChangeRef.current?.(false, false);
        }
      };
    }, [imageSrc]);

    const saveUndoState = useCallback(() => {
      const mCanvas = maskCanvasRef.current;
      if (!mCanvas) return;
      const mCtx = mCanvas.getContext('2d', { willReadFrequently: true });
      if (!mCtx) return;

      const state = mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height);
      undoStackRef.current.push(state);
      if (undoStackRef.current.length > 15) {
        undoStackRef.current.shift();
      }
      hasDrawnRef.current = true;
      onMaskChangeRef.current?.(true, undoStackRef.current.length > 1);
    }, []);

    const undo = useCallback(() => {
      if (undoStackRef.current.length <= 1) return;
      undoStackRef.current.pop(); // Remove current
      const prevState = undoStackRef.current[undoStackRef.current.length - 1];

      const mCanvas = maskCanvasRef.current;
      if (mCanvas && prevState) {
        const mCtx = mCanvas.getContext('2d', { willReadFrequently: true });
        if (mCtx) {
          mCtx.putImageData(prevState, 0, 0);
          const hasRemaining = checkHasMaskPixels();
          hasDrawnRef.current = hasRemaining;
          onMaskChangeRef.current?.(hasRemaining, undoStackRef.current.length > 1);
        }
      }
    }, [checkHasMaskPixels]);

    const clearMask = useCallback(() => {
      const mCanvas = maskCanvasRef.current;
      if (!mCanvas) return;
      const mCtx = mCanvas.getContext('2d', { willReadFrequently: true });
      if (mCtx) {
        mCtx.clearRect(0, 0, mCanvas.width, mCanvas.height);
        undoStackRef.current = [mCtx.getImageData(0, 0, mCanvas.width, mCanvas.height)];
        hasDrawnRef.current = false;
        setBoxDrag(null);
        onMaskChangeRef.current?.(false, false);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      getImageAndMaskData: () => {
        const imgCanvas = imageCanvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        if (!imgCanvas || !maskCanvas) return null;

        const iCtx = imgCanvas.getContext('2d', { willReadFrequently: true });
        const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
        if (!iCtx || !mCtx) return null;

        const hasPixels = checkHasMaskPixels();

        return {
          imageData: iCtx.getImageData(0, 0, imgCanvas.width, imgCanvas.height),
          maskData: mCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height),
          width: imgCanvas.width,
          height: imgCanvas.height,
          hasMaskPixels: hasPixels,
        };
      },
      undo,
      clearMask,
      canUndo: undoStackRef.current.length > 1,
      hasMask: hasDrawnRef.current,
    }));

    // Convert mouse/touch coords to internal canvas coordinates & inner-wrapper coords
    const getCanvasPoint = (clientX: number, clientY: number) => {
      const mCanvas = maskCanvasRef.current;
      if (!mCanvas) return null;
      const rect = mCanvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      const scaleX = mCanvas.width / rect.width;
      const scaleY = mCanvas.height / rect.height;

      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      return {
        x: Math.max(0, Math.min(mCanvas.width, localX * scaleX)),
        y: Math.max(0, Math.min(mCanvas.height, localY * scaleY)),
        clientX: localX,
        clientY: localY,
      };
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
      const mCanvas = maskCanvasRef.current;
      if (!mCanvas) return;
      const mCtx = mCanvas.getContext('2d', { willReadFrequently: true });
      if (!mCtx) return;

      mCtx.strokeStyle = 'rgba(239, 68, 68, 0.45)'; // Semi-transparent red highlight
      mCtx.fillStyle = 'rgba(239, 68, 68, 0.45)';
      mCtx.lineWidth = brushSize;
      mCtx.lineCap = 'round';
      mCtx.lineJoin = 'round';

      mCtx.beginPath();
      mCtx.moveTo(x1, y1);
      mCtx.lineTo(x2, y2);
      mCtx.stroke();
    };

    const commitBoxSelection = () => {
      if (!boxDrag || !boxStartCanvasRef.current) return;
      const mCanvas = maskCanvasRef.current;
      if (!mCanvas) return;
      const mCtx = mCanvas.getContext('2d', { willReadFrequently: true });
      if (!mCtx) return;

      const startX = boxStartCanvasRef.current.x;
      const startY = boxStartCanvasRef.current.y;

      const rect = mCanvas.getBoundingClientRect();
      const scaleX = mCanvas.width / rect.width;
      const scaleY = mCanvas.height / rect.height;

      const endX = Math.max(0, Math.min(mCanvas.width, boxDrag.currentX * scaleX));
      const endY = Math.max(0, Math.min(mCanvas.height, boxDrag.currentY * scaleY));

      const x = Math.min(startX, endX);
      const y = Math.min(startY, endY);
      const w = Math.abs(endX - startX);
      const h = Math.abs(endY - startY);

      // Only commit if selection is at least 3x3 pixels
      if (w > 2 && h > 2) {
        mCtx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        mCtx.fillRect(x, y, w, h);
        saveUndoState();
        onSelectionCompleteRef.current?.();
      }

      setBoxDrag(null);
      boxStartCanvasRef.current = null;
    };

    // Mouse Handlers
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pt = getCanvasPoint(e.clientX, e.clientY);
      if (!pt) return;

      setIsDrawing(true);
      hasDrawnRef.current = true;
      // Immediately notify parent that user has begun selecting an area!
      onMaskChangeRef.current?.(true, true);

      if (selectionMode === 'box') {
        boxStartCanvasRef.current = { x: pt.x, y: pt.y };
        setBoxDrag({
          startX: pt.clientX,
          startY: pt.clientY,
          currentX: pt.clientX,
          currentY: pt.clientY,
        });
      } else {
        lastPointRef.current = { x: pt.x, y: pt.y };
        drawLine(pt.x, pt.y, pt.x, pt.y);
      }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pt = getCanvasPoint(e.clientX, e.clientY);
      if (!pt) return;
      setCursorPos({ x: pt.clientX, y: pt.clientY });

      if (!isDrawing) return;

      if (selectionMode === 'box') {
        setBoxDrag((prev) => (prev ? { ...prev, currentX: pt.clientX, currentY: pt.clientY } : null));
      } else {
        if (!lastPointRef.current) return;
        drawLine(lastPointRef.current.x, lastPointRef.current.y, pt.x, pt.y);
        lastPointRef.current = { x: pt.x, y: pt.y };
      }
    };

    const handleMouseUp = () => {
      if (isDrawing) {
        setIsDrawing(false);
        if (selectionMode === 'box') {
          commitBoxSelection();
        } else {
          lastPointRef.current = null;
          saveUndoState();
          onSelectionCompleteRef.current?.();
        }
      }
    };

    const handleMouseLeave = () => {
      setCursorPos(null);
      if (isDrawing) {
        setIsDrawing(false);
        if (selectionMode === 'box') {
          commitBoxSelection();
        } else {
          lastPointRef.current = null;
          saveUndoState();
          onSelectionCompleteRef.current?.();
        }
      }
    };

    // Touch Handlers for Mobile Painting / Selecting
    const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const pt = getCanvasPoint(touch.clientX, touch.clientY);
      if (!pt) return;

      setIsDrawing(true);
      hasDrawnRef.current = true;
      onMaskChangeRef.current?.(true, true);

      if (selectionMode === 'box') {
        boxStartCanvasRef.current = { x: pt.x, y: pt.y };
        setBoxDrag({
          startX: pt.clientX,
          startY: pt.clientY,
          currentX: pt.clientX,
          currentY: pt.clientY,
        });
      } else {
        lastPointRef.current = { x: pt.x, y: pt.y };
        drawLine(pt.x, pt.y, pt.x, pt.y);
      }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawing || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const pt = getCanvasPoint(touch.clientX, touch.clientY);
      if (!pt) return;

      if (selectionMode === 'box') {
        setBoxDrag((prev) => (prev ? { ...prev, currentX: pt.clientX, currentY: pt.clientY } : null));
      } else {
        if (!lastPointRef.current) return;
        drawLine(lastPointRef.current.x, lastPointRef.current.y, pt.x, pt.y);
        lastPointRef.current = { x: pt.x, y: pt.y };
      }
    };

    const handleTouchEnd = () => {
      if (isDrawing) {
        setIsDrawing(false);
        if (selectionMode === 'box') {
          commitBoxSelection();
        } else {
          lastPointRef.current = null;
          saveUndoState();
          onSelectionCompleteRef.current?.();
        }
      }
    };

    // Calculate box overlay geometry
    const boxOverlayStyle = boxDrag
      ? {
          left: Math.min(boxDrag.startX, boxDrag.currentX),
          top: Math.min(boxDrag.startY, boxDrag.currentY),
          width: Math.abs(boxDrag.currentX - boxDrag.startX),
          height: Math.abs(boxDrag.currentY - boxDrag.startY),
        }
      : null;

    return (
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl bg-slate-950/5 flex items-center justify-center p-2 select-none"
        style={{ touchAction: 'none' }}
      >
        {/* Inner wrapper tightly fitting the base image canvas */}
        <div ref={innerWrapperRef} className="relative inline-flex items-center justify-center max-w-full max-h-[68vh]">
          {/* Layer 1: Base original image canvas */}
          <canvas
            ref={imageCanvasRef}
            className="max-h-[68vh] w-auto max-w-full block rounded-xl shadow-inner pointer-events-none"
          />

          {/* Layer 2: Mask painting canvas */}
          <canvas
            ref={maskCanvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`absolute inset-0 w-full h-full rounded-xl z-10 ${
              selectionMode === 'box' ? 'cursor-crosshair' : 'cursor-crosshair'
            }`}
          />

          {/* Custom round brush ring cursor overlay (only in brush mode) */}
          {selectionMode === 'brush' && cursorPos && (
            <div
              className="pointer-events-none absolute rounded-full border-2 border-red-500 bg-red-500/20 -translate-x-1/2 -translate-y-1/2 z-20 transition-transform duration-75"
              style={{
                left: cursorPos.x,
                top: cursorPos.y,
                width: brushSize,
                height: brushSize,
              }}
            />
          )}

          {/* Rectangle drag selection preview box (in box mode) */}
          {selectionMode === 'box' && boxOverlayStyle && (
            <div
              className="pointer-events-none absolute border-2 border-dashed border-red-500 bg-red-500/30 z-20 transition-none shadow-sm shadow-red-500/20 rounded-xs"
              style={boxOverlayStyle}
            >
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold font-mono">
                {Math.round(boxOverlayStyle.width)} × {Math.round(boxOverlayStyle.height)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

BrushCanvas.displayName = 'BrushCanvas';
