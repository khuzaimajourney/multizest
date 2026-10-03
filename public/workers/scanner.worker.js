// Smart Document Scanner Web Worker
// Performs 4-point Perspective Warp & Document Filter Enhancements

// Solve 8 linear equations for 3x3 projective homography matrix
function getHomographyMatrix(srcPts, dstPts) {
  // srcPts: [{x, y}, {x, y}, {x, y}, {x, y}] (TL, TR, BR, BL)
  // dstPts: [{x, y}, {x, y}, {x, y}, {x, y}] (TL, TR, BR, BL)
  const A = [];
  const B = [];

  for (let i = 0; i < 4; i++) {
    const sx = srcPts[i].x;
    const sy = srcPts[i].y;
    const dx = dstPts[i].x;
    const dy = dstPts[i].y;

    A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
    B.push(dx);

    A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
    B.push(dy);
  }

  // Gaussian elimination with partial pivoting to solve A * h = B
  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
        maxRow = k;
      }
    }

    const tmpA = A[i];
    A[i] = A[maxRow];
    A[maxRow] = tmpA;

    const tmpB = B[i];
    B[i] = B[maxRow];
    B[maxRow] = tmpB;

    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        if (i === j) {
          A[k][j] = 0;
        } else {
          A[k][j] += c * A[i][j];
        }
      }
      B[k] += c * B[i];
    }
  }

  const h = new Array(8);
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += A[i][j] * h[j];
    }
    h[i] = (B[i] - sum) / A[i][i];
  }

  return [
    h[0], h[1], h[2],
    h[3], h[4], h[5],
    h[6], h[7], 1.0,
  ];
}

// Invert 3x3 matrix
function invert3x3(m) {
  const [a, b, c, d, e, f, g, h, i] = m;
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const D = -(b * i - c * h);
  const E = a * i - c * g;
  const F = -(a * h - b * g);
  const G = b * f - c * e;
  const H = -(a * f - c * d);
  const I = a * e - b * d;

  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-7) return null;

  const invDet = 1.0 / det;
  return [
    A * invDet, D * invDet, G * invDet,
    B * invDet, E * invDet, H * invDet,
    C * invDet, F * invDet, I * invDet,
  ];
}

self.onmessage = (e) => {
  const { srcData, srcWidth, srcHeight, corners, outWidth, outHeight, filterMode } = e.data;

  try {
    self.postMessage({ type: 'status', message: 'Calculating perspective projection matrix...', progress: 20 });

    // Target rectangle coordinates
    const dstCorners = [
      { x: 0, y: 0 },
      { x: outWidth, y: 0 },
      { x: outWidth, y: outHeight },
      { x: 0, y: outHeight },
    ];

    // Compute homography from original quadrilateral to target rectangle
    const H = getHomographyMatrix(corners, dstCorners);
    const invH = invert3x3(H);

    if (!invH) {
      throw new Error('Perspective points form a degenerate quadrilateral.');
    }

    self.postMessage({ type: 'status', message: 'Warping perspective & unskewing document...', progress: 40 });

    const dstData = new Uint8ClampedArray(outWidth * outHeight * 4);

    // Warp each destination pixel by sampling backward from source image (bilinear interpolation)
    for (let y = 0; y < outHeight; y++) {
      for (let x = 0; x < outWidth; x++) {
        // Map (x, y) back to source (sx, sy)
        const w = invH[6] * x + invH[7] * y + invH[8];
        const sx = (invH[0] * x + invH[1] * y + invH[2]) / w;
        const sy = (invH[3] * x + invH[4] * y + invH[5]) / w;

        const dstIdx = (y * outWidth + x) * 4;

        if (sx < 0 || sx >= srcWidth - 1 || sy < 0 || sy >= srcHeight - 1) {
          // Out of bounds -> white canvas
          dstData[dstIdx] = 255;
          dstData[dstIdx + 1] = 255;
          dstData[dstIdx + 2] = 255;
          dstData[dstIdx + 3] = 255;
          continue;
        }

        const x0 = Math.floor(sx);
        const y0 = Math.floor(sy);
        const tx = sx - x0;
        const ty = sy - y0;

        for (let c = 0; c < 3; c++) {
          const p00 = srcData[(y0 * srcWidth + x0) * 4 + c];
          const p10 = srcData[(y0 * srcWidth + (x0 + 1)) * 4 + c];
          const p01 = srcData[((y0 + 1) * srcWidth + x0) * 4 + c];
          const p11 = srcData[((y0 + 1) * srcWidth + (x0 + 1)) * 4 + c];

          const val =
            p00 * (1 - tx) * (1 - ty) +
            p10 * tx * (1 - ty) +
            p01 * (1 - tx) * ty +
            p11 * tx * ty;

          dstData[dstIdx + c] = Math.round(val);
        }
        dstData[dstIdx + 3] = 255;
      }
    }

    self.postMessage({ type: 'status', message: `Applying ${filterMode || 'enhanced'} filter...`, progress: 75 });

    // Apply document enhancements based on filterMode
    if (filterMode === 'bw') {
      // Document scan mode: high-contrast text enhancement
      for (let i = 0; i < dstData.length; i += 4) {
        const gray = 0.299 * dstData[i] + 0.587 * dstData[i + 1] + 0.114 * dstData[i + 2];
        const val = gray > 138 ? 255 : 0;
        dstData[i] = val;
        dstData[i + 1] = val;
        dstData[i + 2] = val;
      }
    } else if (filterMode === 'grayscale') {
      for (let i = 0; i < dstData.length; i += 4) {
        const gray = Math.round(0.299 * dstData[i] + 0.587 * dstData[i + 1] + 0.114 * dstData[i + 2]);
        dstData[i] = gray;
        dstData[i + 1] = gray;
        dstData[i + 2] = gray;
      }
    } else if (filterMode === 'magic_color') {
      // Magic Color: boost contrast and sharpen text
      for (let i = 0; i < dstData.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          let v = dstData[i + c];
          // S-curve contrast stretch
          v = ((v - 128) * 1.35) + 128;
          // slight gamma boost
          v = Math.pow(Math.max(0, Math.min(255, v)) / 255, 0.9) * 255;
          dstData[i + c] = Math.max(0, Math.min(255, Math.round(v)));
        }
      }
    }

    self.postMessage({
      type: 'done',
      dstData,
      outWidth,
      outHeight,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message || 'Scanning & flattening failed',
    });
  }
};
