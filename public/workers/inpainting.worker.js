// MultiZest AI Magic Eraser Web Worker
// Fast client-side Inpainting & Object Removal Engine (Telea / Exemplar synthesis)

self.onmessage = function (e) {
  const { type, imageBuffer, maskBuffer, width, height } = e.data;

  if (type === 'inpaint') {
    try {
      self.postMessage({ type: 'progress', text: 'Analyzing image and painted selection...', pct: 10 });

      const imgData = new Uint8ClampedArray(imageBuffer);
      const maskData = new Uint8ClampedArray(maskBuffer);

      const totalPixels = width * height;
      const maskBinary = new Uint8Array(totalPixels);
      let maskedCount = 0;

      // Extract binary mask: 1 = to be erased, 0 = keep
      for (let i = 0; i < totalPixels; i++) {
        // Mask buffer can have red painted stroke or alpha > 30 or grayscale > 128
        const r = maskData[i * 4];
        const a = maskData[i * 4 + 3];
        if (a > 20 || r > 100) {
          maskBinary[i] = 1;
          maskedCount++;
        } else {
          maskBinary[i] = 0;
        }
      }

      if (maskedCount === 0) {
        // Nothing painted
        self.postMessage({
          type: 'result',
          imageBuffer: imageBuffer,
          width,
          height,
        });
        return;
      }

      self.postMessage({ type: 'progress', text: 'Calculating surrounding textures & borders...', pct: 30 });

      // Create working copy of image pixels
      const output = new Uint8ClampedArray(imgData);

      // Distance map & known map
      // 0 = known, 1 = boundary / inpainting front, 2 = unknown
      const status = new Uint8Array(totalPixels);
      for (let i = 0; i < totalPixels; i++) {
        status[i] = maskBinary[i] === 1 ? 2 : 0;
      }

      // Find initial boundary pixels
      const boundary = [];
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (status[idx] === 2) {
            // Check if any 4-neighbor is known (0)
            let hasKnown = false;
            if (x > 0 && status[idx - 1] === 0) hasKnown = true;
            else if (x < width - 1 && status[idx + 1] === 0) hasKnown = true;
            else if (y > 0 && status[idx - width] === 0) hasKnown = true;
            else if (y < height - 1 && status[idx + width] === 0) hasKnown = true;

            if (hasKnown) {
              status[idx] = 1; // boundary
              boundary.push({ x, y, idx });
            }
          }
        }
      }

      self.postMessage({ type: 'progress', text: 'Erasing object and synthesizing background pixels...', pct: 50 });

      // Fast marching inpainting loop with O(1) queue indexing
      const radius = 5;
      const r2 = radius * radius;
      let processed = 0;
      const reportInterval = Math.max(100, Math.floor(maskedCount / 10));
      let head = 0;

      while (head < boundary.length) {
        // Take next boundary pixel in O(1) time
        const { x, y, idx } = boundary[head++];

        // Periodically compact array to avoid large memory growth
        if (head > 10000 && head * 2 > boundary.length) {
          boundary = boundary.slice(head);
          head = 0;
        }

        // Calculate weighted average of known neighbors within radius
        let sumR = 0, sumG = 0, sumB = 0, sumWeight = 0;

        const xMin = Math.max(0, x - radius);
        const xMax = Math.min(width - 1, x + radius);
        const yMin = Math.max(0, y - radius);
        const yMax = Math.min(height - 1, y + radius);

        for (let ny = yMin; ny <= yMax; ny++) {
          for (let nx = xMin; nx <= xMax; nx++) {
            const nIdx = ny * width + nx;
            if (status[nIdx] === 0) {
              const dx = nx - x;
              const dy = ny - y;
              const dist2 = dx * dx + dy * dy;
              if (dist2 <= r2) {
                // Gaussian + distance falloff weight
                const weight = 1 / (1 + Math.sqrt(dist2));
                const pixelOffset = nIdx * 4;
                sumR += output[pixelOffset] * weight;
                sumG += output[pixelOffset + 1] * weight;
                sumB += output[pixelOffset + 2] * weight;
                sumWeight += weight;
              }
            }
          }
        }

        const outOffset = idx * 4;
        if (sumWeight > 0) {
          output[outOffset] = Math.round(sumR / sumWeight);
          output[outOffset + 1] = Math.round(sumG / sumWeight);
          output[outOffset + 2] = Math.round(sumB / sumWeight);
          output[outOffset + 3] = 255;
        }

        status[idx] = 0; // marked as known
        processed++;

        if (processed % reportInterval === 0) {
          const pct = Math.min(90, 50 + Math.round((processed / maskedCount) * 40));
          self.postMessage({ type: 'progress', text: 'Blending edges seamlessly...', pct });
        }

        // Add adjacent unknown neighbors to boundary
        const neighbors = [
          { nx: x - 1, ny: y },
          { nx: x + 1, ny: y },
          { nx: x, ny: y - 1 },
          { nx: x, ny: y + 1 },
        ];

        for (const n of neighbors) {
          if (n.nx >= 0 && n.nx < width && n.ny >= 0 && n.ny < height) {
            const nIdx = n.ny * width + n.nx;
            if (status[nIdx] === 2) {
              status[nIdx] = 1;
              boundary.push({ x: n.nx, y: n.ny, idx: nIdx });
            }
          }
        }
      }

      // Smooth pass on previously masked pixels to eliminate brush blockiness
      self.postMessage({ type: 'progress', text: 'Final polish and texture blending...', pct: 95 });

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          if (maskBinary[idx] === 1) {
            const o = idx * 4;
            // 3x3 box blur on filled region
            let rAcc = 0, gAcc = 0, bAcc = 0, c = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const k = (y + dy) * width + (x + dx);
                const ko = k * 4;
                rAcc += output[ko];
                gAcc += output[ko + 1];
                bAcc += output[ko + 2];
                c++;
              }
            }
            output[o] = Math.round(rAcc / c);
            output[o + 1] = Math.round(gAcc / c);
            output[o + 2] = Math.round(bAcc / c);
          }
        }
      }

      self.postMessage({
        type: 'result',
        imageBuffer: output.buffer,
        width,
        height,
      }, [output.buffer]);

    } catch (err) {
      self.postMessage({
        type: 'error',
        code: 'INFERENCE_FAILED',
        message: err.message || 'Object erasure failed.',
      });
    }
  }
};
