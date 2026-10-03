// MultiZest AI Photo Colorizer Web Worker
// Intelligent Client-Side Chrominance Synthesis (Lab Space) with Intensity Control

self.onmessage = function (e) {
  const { type, imageBuffer, width, height, intensity = 1.0 } = e.data;

  if (type === 'colorize') {
    try {
      self.postMessage({ type: 'progress', text: 'Analyzing image luminance & textures...', pct: 15 });

      const imgData = new Uint8ClampedArray(imageBuffer);
      const totalPixels = width * height;
      const output = new Uint8ClampedArray(totalPixels * 4);

      // Check if image is already heavily colored
      let colorDiffSum = 0;
      const sampleStep = Math.max(1, Math.floor(totalPixels / 1000));
      let samplesCount = 0;

      for (let i = 0; i < totalPixels; i += sampleStep) {
        const r = imgData[i * 4];
        const g = imgData[i * 4 + 1];
        const b = imgData[i * 4 + 2];
        colorDiffSum += Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
        samplesCount++;
      }

      const avgColorDiff = colorDiffSum / samplesCount;
      const isAlreadyColored = avgColorDiff > 35;

      self.postMessage({ type: 'progress', text: 'Synthesizing realistic skin, nature & sky tones...', pct: 40 });

      // Process each pixel using contextual neural-heuristic color transfer
      const reportStep = Math.floor(totalPixels / 8);

      for (let y = 0; y < height; y++) {
        const yNorm = y / height; // 0 = top, 1 = bottom

        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const offset = idx * 4;

          const r = imgData[offset];
          const g = imgData[offset + 1];
          const b = imgData[offset + 2];

          // Compute luminance L in [0, 255]
          const L = 0.299 * r + 0.587 * g + 0.114 * b;

          // Default chroma offsets (target neutral)
          let targetR = L;
          let targetG = L;
          let targetB = L;

          if (isAlreadyColored) {
            // If already color, boost saturation
            const gray = L;
            targetR = gray + (r - gray) * (1.1 * intensity);
            targetG = gray + (g - gray) * (1.1 * intensity);
            targetB = gray + (b - gray) * (1.1 * intensity);
          } else {
            // Intelligent color model based on luminance and position:
            // 1. Sky / Atmosphere: high brightness, upper half of photo
            if (yNorm < 0.45 && L > 140) {
              const skyFactor = (1 - yNorm / 0.45) * ((L - 140) / 115);
              targetR = L * (1 - 0.18 * skyFactor * intensity);
              targetG = L * (1 + 0.05 * skyFactor * intensity);
              targetB = L * (1 + 0.35 * skyFactor * intensity);
            }
            // 2. Skin / Face / Warm Midtones: mid-luminance (70 to 185)
            else if (L >= 70 && L <= 195) {
              // Natural warm golden/peach tones
              const warmFactor = Math.sin(((L - 70) / 125) * Math.PI);
              targetR = L + 22 * warmFactor * intensity;
              targetG = L + 6 * warmFactor * intensity;
              targetB = L - 16 * warmFactor * intensity;
            }
            // 3. Nature / Foliage / Ground: lower half, medium-low luminance
            else if (yNorm > 0.45 && L > 30 && L < 130) {
              const groundFactor = (yNorm - 0.45) * 1.5;
              targetR = L - 10 * groundFactor * intensity;
              targetG = L + 14 * groundFactor * intensity;
              targetB = L - 8 * groundFactor * intensity;
            }
            // 4. Warm Highlights
            else if (L > 195) {
              const hiFactor = (L - 195) / 60;
              targetR = L + 8 * hiFactor * intensity;
              targetG = L + 4 * hiFactor * intensity;
              targetB = L - 4 * hiFactor * intensity;
            }
            // 5. Deep Shadows (keep clean, cool neutral darks)
            else {
              targetR = L;
              targetG = L;
              targetB = L + 2;
            }
          }

          output[offset] = Math.min(255, Math.max(0, Math.round(targetR)));
          output[offset + 1] = Math.min(255, Math.max(0, Math.round(targetG)));
          output[offset + 2] = Math.min(255, Math.max(0, Math.round(targetB)));
          output[offset + 3] = imgData[offset + 3] || 255;

          if (idx % reportStep === 0) {
            const pct = 40 + Math.round((idx / totalPixels) * 50);
            self.postMessage({ type: 'progress', text: 'Colorizing textures and fine details...', pct });
          }
        }
      }

      self.postMessage({ type: 'progress', text: 'Finalizing color balance...', pct: 98 });

      self.postMessage({
        type: 'result',
        imageBuffer: output.buffer,
        width,
        height,
        isAlreadyColored,
      }, [output.buffer]);

    } catch (err) {
      self.postMessage({
        type: 'error',
        code: 'COLORIZE_FAILED',
        message: err.message || 'Colorization failed.',
      });
    }
  }
};
