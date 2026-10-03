// MultiZest Passport Photo Web Worker
// Biometric Face Detection, Clean White Background Replacement, Smart Cropping, and 4x6 Printable Sheet Tiling

self.onmessage = function (e) {
  const {
    type,
    imageBuffer,
    width,
    height,
    targetWidthPx = 600,
    targetHeightPx = 600,
    headRatio = [0.5, 0.69],
    countryName = 'US',
  } = e.data;

  if (type === 'process') {
    try {
      self.postMessage({ type: 'progress', step: 1, text: 'Finding your face and eyes...', pct: 20 });

      const data = new Uint8ClampedArray(imageBuffer);
      const totalPixels = width * height;

      // 1. Universal YCbCr Skin Locus Detection
      let minX = width, maxX = 0, minY = height, maxY = 0;
      let skinCount = 0;
      let sumX = 0, sumY = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Standard YCbCr skin chrominance
          const Y = 0.299 * r + 0.587 * g + 0.114 * b;
          const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
          const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

          const isSkin = Y > 35 && Cb >= 73 && Cb <= 133 && Cr >= 128 && Cr <= 182;

          if (isSkin) {
            skinCount++;
            sumX += x;
            sumY += y;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const skinRatio = skinCount / totalPixels;
      if (skinRatio < 0.015 || skinCount < 300) {
        self.postMessage({
          type: 'error',
          code: 'NO_FACE',
          message: "We couldn't find a face in this photo. Make sure your face is clearly visible, well-lit, and facing the camera.",
        });
        return;
      }

      const faceWidth = Math.max(20, maxX - minX);
      const faceHeight = Math.max(20, maxY - minY);
      const centerX = Math.round(sumX / skinCount);
      const centerY = Math.round(sumY / skinCount);

      if (faceHeight < height * 0.12) {
        self.postMessage({
          type: 'error',
          code: 'FACE_TOO_SMALL',
          message: 'Your face is too far from the camera. Try a closer selfie or portrait photo.',
        });
        return;
      }

      self.postMessage({ type: 'progress', step: 2, text: 'Making the background white...', pct: 50 });

      // 2. Background segmentation & whitening
      // Sample edge borders for initial background color
      let borderSamples = 0, sumR = 0, sumG = 0, sumB = 0;

      for (let x = 0; x < width; x += 4) {
        const top = x * 4;
        const bot = ((height - 1) * width + x) * 4;
        sumR += data[top] + data[bot];
        sumG += data[top + 1] + data[bot + 1];
        sumB += data[top + 2] + data[bot + 2];
        borderSamples += 2;
      }
      for (let y = 0; y < height; y += 4) {
        const left = (y * width) * 4;
        const right = (y * width + (width - 1)) * 4;
        sumR += data[left] + data[right];
        sumG += data[left + 1] + data[right + 1];
        sumB += data[left + 2] + data[right + 2];
        borderSamples += 2;
      }

      const bgR = borderSamples > 0 ? sumR / borderSamples : 240;
      const bgG = borderSamples > 0 ? sumG / borderSamples : 240;
      const bgB = borderSamples > 0 ? sumB / borderSamples : 240;

      // Clean image with bust/torso awareness
      const cleanImg = new Uint8ClampedArray(totalPixels * 4);

      for (let y = 0; y < height; y++) {
        // Dynamic allowed portrait radius at height y
        let allowedRadius = faceWidth * 0.8;
        if (y > centerY) {
          // Widen for chin, neck, and shoulders
          const downRatio = Math.min(2.5, (y - centerY) / (faceHeight * 0.5));
          allowedRadius = faceWidth * (0.8 + downRatio * 0.65);
        }

        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const dx = Math.abs(x - centerX);
          const colorDist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);

          // If above head, or outside shoulder corridor, or near background border color
          const isAboveHead = y < minY - faceHeight * 0.15;
          const isOutsideBody = dx > allowedRadius;
          const isBgColor = colorDist < 42;

          if (isAboveHead || isOutsideBody || (isBgColor && dx > faceWidth * 0.4)) {
            cleanImg[idx] = 255;
            cleanImg[idx + 1] = 255;
            cleanImg[idx + 2] = 255;
            cleanImg[idx + 3] = 255;
          } else {
            cleanImg[idx] = r;
            cleanImg[idx + 1] = g;
            cleanImg[idx + 2] = b;
            cleanImg[idx + 3] = 255;
          }
        }
      }

      self.postMessage({ type: 'progress', step: 3, text: `Cropping to ${countryName} passport size...`, pct: 75 });

      // 3. Smart Crop & Alignment
      // Desired head ratio (average of min and max)
      const targetHeadRatio = (headRatio[0] + headRatio[1]) / 2;
      // Desired head height in crop
      const desiredHeadPx = targetHeightPx * targetHeadRatio;
      const scale = desiredHeadPx / faceHeight;

      // Crop box in original image coords
      const cropW = targetWidthPx / scale;
      const cropH = targetHeightPx / scale;

      // Head should have about 10-15% top margin
      const topMargin = cropH * 0.12;
      const cropX = Math.round(centerX - cropW / 2);
      const cropY = Math.round(minY - topMargin);

      // Resample crop to targetWidthPx x targetHeightPx
      const singlePhoto = new Uint8ClampedArray(targetWidthPx * targetHeightPx * 4);

      for (let ty = 0; ty < targetHeightPx; ty++) {
        for (let tx = 0; tx < targetWidthPx; tx++) {
          const sx = Math.round(cropX + (tx / targetWidthPx) * cropW);
          const sy = Math.round(cropY + (ty / targetHeightPx) * cropH);

          const targetOffset = (ty * targetWidthPx + tx) * 4;

          if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
            const srcOffset = (sy * width + sx) * 4;
            singlePhoto[targetOffset] = cleanImg[srcOffset];
            singlePhoto[targetOffset + 1] = cleanImg[srcOffset + 1];
            singlePhoto[targetOffset + 2] = cleanImg[srcOffset + 2];
            singlePhoto[targetOffset + 3] = 255;
          } else {
            // Out of bounds is white background
            singlePhoto[targetOffset] = 255;
            singlePhoto[targetOffset + 1] = 255;
            singlePhoto[targetOffset + 2] = 255;
            singlePhoto[targetOffset + 3] = 255;
          }
        }
      }

      self.postMessage({ type: 'progress', step: 3, text: 'Generating printable 4×6 sheet...', pct: 90 });

      // 4. Generate 4×6 inch sheet @ 300 DPI (1800 x 1200 px landscape)
      const sheetW = 1800;
      const sheetH = 1200;
      const sheetData = new Uint8ClampedArray(sheetW * sheetH * 4);
      sheetData.fill(255); // pure white background

      // Determine grid layout
      const cols = Math.floor((sheetW - 80) / targetWidthPx);
      const rows = Math.floor((sheetH - 80) / targetHeightPx);
      const gridCols = Math.max(1, Math.min(3, cols));
      const gridRows = Math.max(1, Math.min(2, rows));

      const spacingX = Math.floor((sheetW - gridCols * targetWidthPx) / (gridCols + 1));
      const spacingY = Math.floor((sheetH - gridRows * targetHeightPx) / (gridRows + 1));

      // Draw photos onto sheet with fine cut border lines
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          const startX = spacingX + c * (targetWidthPx + spacingX);
          const startY = spacingY + r * (targetHeightPx + spacingY);

          // Copy photo
          for (let py = 0; py < targetHeightPx; py++) {
            for (let px = 0; px < targetWidthPx; px++) {
              const srcOff = (py * targetWidthPx + px) * 4;
              const dstOff = ((startY + py) * sheetW + (startX + px)) * 4;
              sheetData[dstOff] = singlePhoto[srcOff];
              sheetData[dstOff + 1] = singlePhoto[srcOff + 1];
              sheetData[dstOff + 2] = singlePhoto[srcOff + 2];
              sheetData[dstOff + 3] = 255;
            }
          }

          // Draw subtle cut guide border (light gray outline)
          const strokeColor = 210;
          for (let px = 0; px < targetWidthPx; px++) {
            const topOff = ((startY - 1) * sheetW + (startX + px)) * 4;
            const botOff = ((startY + targetHeightPx) * sheetW + (startX + px)) * 4;
            if (startY > 0) {
              sheetData[topOff] = strokeColor;
              sheetData[topOff + 1] = strokeColor;
              sheetData[topOff + 2] = strokeColor;
            }
            if (startY + targetHeightPx < sheetH) {
              sheetData[botOff] = strokeColor;
              sheetData[botOff + 1] = strokeColor;
              sheetData[botOff + 2] = strokeColor;
            }
          }
          for (let py = 0; py < targetHeightPx; py++) {
            const leftOff = ((startY + py) * sheetW + (startX - 1)) * 4;
            const rightOff = ((startY + py) * sheetW + (startX + targetWidthPx)) * 4;
            if (startX > 0) {
              sheetData[leftOff] = strokeColor;
              sheetData[leftOff + 1] = strokeColor;
              sheetData[leftOff + 2] = strokeColor;
            }
            if (startX + targetWidthPx < sheetW) {
              sheetData[rightOff] = strokeColor;
              sheetData[rightOff + 1] = strokeColor;
              sheetData[rightOff + 2] = strokeColor;
            }
          }
        }
      }

      self.postMessage({
        type: 'result',
        singleBuffer: singlePhoto.buffer,
        singleWidth: targetWidthPx,
        singleHeight: targetHeightPx,
        sheetBuffer: sheetData.buffer,
        sheetWidth: sheetW,
        sheetHeight: sheetH,
        totalCopies: gridCols * gridRows,
      }, [singlePhoto.buffer, sheetData.buffer]);

    } catch (err) {
      self.postMessage({
        type: 'error',
        code: 'PROCESSING_FAILED',
        message: err.message || 'Passport photo processing failed.',
      });
    }
  }
};
