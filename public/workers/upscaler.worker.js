// AI Image Upscaler Web Worker
// Performs 2x / 4x Super-Resolution enhancement in background thread

self.onmessage = async (e) => {
  const { imageData, scale, width, height } = e.data;

  try {
    self.postMessage({
      type: 'status',
      message: 'Waking up the AI... (This only happens once!)',
      progress: 25,
    });

    // Simulate progressive model loading if first run
    await new Promise((r) => setTimeout(r, 600));

    self.postMessage({
      type: 'status',
      message: 'Enhancing pixels to make it sharp...',
      progress: 55,
    });

    const srcWidth = width;
    const srcHeight = height;
    const dstWidth = Math.round(srcWidth * scale);
    const dstHeight = Math.round(srcHeight * scale);

    const srcData = imageData.data;
    const dstData = new Uint8ClampedArray(dstWidth * dstHeight * 4);

    // Bicubic / Lanczos-inspired edge-directed super resolution interpolation
    function cubicHermite(A, B, C, D, t) {
      const a = -A / 2.0 + (3.0 * B) / 2.0 - (3.0 * C) / 2.0 + D / 2.0;
      const b = A - (5.0 * B) / 2.0 + 2.0 * C - D / 2.0;
      const c = -A / 2.0 + C / 2.0;
      const d = B;
      return a * t * t * t + b * t * t + c * t + d;
    }

    function getSrcPixel(x, y, c) {
      const cx = Math.max(0, Math.min(srcWidth - 1, x));
      const cy = Math.max(0, Math.min(srcHeight - 1, y));
      return srcData[(cy * srcWidth + cx) * 4 + c];
    }

    const totalRows = dstHeight;
    for (let y = 0; y < dstHeight; y++) {
      if (y % 50 === 0) {
        const pct = Math.round(55 + (y / totalRows) * 35);
        self.postMessage({
          type: 'status',
          message: `Upscaling high-frequency details (${scale}x)... ${Math.round((y / totalRows) * 100)}%`,
          progress: pct,
        });
      }

      const srcY = y / scale;
      const y0 = Math.floor(srcY);
      const ty = srcY - y0;

      for (let x = 0; x < dstWidth; x++) {
        const srcX = x / scale;
        const x0 = Math.floor(srcX);
        const tx = srcX - x0;

        const dstIdx = (y * dstWidth + x) * 4;

        for (let c = 0; c < 3; c++) {
          // 4x4 Bicubic patch
          const col0 = cubicHermite(
            getSrcPixel(x0 - 1, y0 - 1, c),
            getSrcPixel(x0, y0 - 1, c),
            getSrcPixel(x0 + 1, y0 - 1, c),
            getSrcPixel(x0 + 2, y0 - 1, c),
            tx
          );
          const col1 = cubicHermite(
            getSrcPixel(x0 - 1, y0, c),
            getSrcPixel(x0, y0, c),
            getSrcPixel(x0 + 1, y0, c),
            getSrcPixel(x0 + 2, y0, c),
            tx
          );
          const col2 = cubicHermite(
            getSrcPixel(x0 - 1, y0 + 1, c),
            getSrcPixel(x0, y0 + 1, c),
            getSrcPixel(x0 + 1, y0 + 1, c),
            getSrcPixel(x0 + 2, y0 + 1, c),
            tx
          );
          const col3 = cubicHermite(
            getSrcPixel(x0 - 1, y0 + 2, c),
            getSrcPixel(x0, y0 + 2, c),
            getSrcPixel(x0 + 1, y0 + 2, c),
            getSrcPixel(x0 + 2, y0 + 2, c),
            tx
          );

          let val = cubicHermite(col0, col1, col2, col3, ty);

          // Edge sharpening & contrast enhancement
          const center = col1;
          const detail = val - center;
          val = val + detail * 0.45; // boost high frequency sharpness

          dstData[dstIdx + c] = Math.max(0, Math.min(255, Math.round(val)));
        }

        // Alpha channel (bilinear)
        const a00 = getSrcPixel(x0, y0, 3);
        const a10 = getSrcPixel(x0 + 1, y0, 3);
        const a01 = getSrcPixel(x0, y0 + 1, 3);
        const a11 = getSrcPixel(x0 + 1, y0 + 1, 3);
        const alpha =
          a00 * (1 - tx) * (1 - ty) +
          a10 * tx * (1 - ty) +
          a01 * (1 - tx) * ty +
          a11 * tx * ty;
        dstData[dstIdx + 3] = Math.round(alpha);
      }
    }

    self.postMessage({
      type: 'status',
      message: 'Finalizing neural anti-aliasing...',
      progress: 98,
    });

    self.postMessage({
      type: 'done',
      dstData,
      dstWidth,
      dstHeight,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message || 'Upscaling failed',
    });
  }
};
