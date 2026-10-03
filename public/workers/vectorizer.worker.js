// Raster to SVG Vectorizer Web Worker
// Converts bitmap pixels (JPG/PNG) into scalable vector SVG markup

// In Web Worker, import imagetracerjs if available, or use embedded vector path tracer
try {
  importScripts('https://cdn.jsdelivr.net/npm/imagetracerjs@1.2.6/imagetracer_v1.2.6.min.js');
} catch (e) {
  console.warn('Could not load remote imagetracerjs in worker, using built-in tracer:', e);
}

// Fallback high-speed pure JS vector tracing implementation
function traceRasterToSVG(imageData, options) {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const numColors = options.numberofcolors || 16;
  const blur = options.blurradius || 0;

  // Simple k-means/median cut palette approximation
  const palette = [];
  const step = Math.max(1, Math.floor(data.length / (numColors * 40)));
  for (let i = 0; i < data.length && palette.length < numColors; i += step * 4) {
    if (data[i + 3] > 64) {
      palette.push([data[i], data[i + 1], data[i + 2]]);
    }
  }
  if (palette.length === 0) palette.push([0, 0, 0]);

  // Quantize image
  const quantized = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] < 32) {
        quantized[y * width + x] = 255; // transparent
        continue;
      }
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      let bestDist = Infinity;
      let bestColor = 0;
      for (let c = 0; c < palette.length; c++) {
        const pr = palette[c][0];
        const pg = palette[c][1];
        const pb = palette[c][2];
        const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          bestColor = c;
        }
      }
      quantized[y * width + x] = bestColor;
    }
  }

  // Generate SVG polygon/path representation
  let svgPaths = '';
  // Group runs horizontally into vector rects/paths for crisp rendering
  for (let c = 0; c < palette.length; c++) {
    const colorHex = '#' + palette[c].map((v) => v.toString(16).padStart(2, '0')).join('');
    let pathD = '';

    for (let y = 0; y < height; y++) {
      let runStart = -1;
      for (let x = 0; x < width; x++) {
        const val = quantized[y * width + x];
        if (val === c) {
          if (runStart === -1) runStart = x;
        } else {
          if (runStart !== -1) {
            const runWidth = x - runStart;
            pathD += `M${runStart},${y}h${runWidth}v1h-${runWidth}Z `;
            runStart = -1;
          }
        }
      }
      if (runStart !== -1) {
        const runWidth = width - runStart;
        pathD += `M${runStart},${y}h${runWidth}v1h-${runWidth}Z `;
      }
    }

    if (pathD) {
      svgPaths += `<path fill="${colorHex}" d="${pathD}" shape-rendering="crispEdges"/>\n`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n${svgPaths}</svg>`;
}

self.onmessage = (e) => {
  const { imageData, options } = e.data;

  try {
    self.postMessage({ type: 'status', message: 'Tracing paths and smoothing curves...', progress: 30 });

    let svgStr = '';
    // If ImageTracer is globally defined from script
    // @ts-ignore
    if (typeof ImageTracer !== 'undefined' && ImageTracer.imagedataToSVG) {
      // @ts-ignore
      svgStr = ImageTracer.imagedataToSVG(imageData, {
        corsenabled: false,
        ltres: options.ltres || 1,
        qtres: options.qtres || 1,
        pathomit: options.pathomit || 8,
        colorsampling: 2,
        numberofcolors: options.numberofcolors || 16,
        mincolorratio: 0.02,
        colorquantcycles: 3,
        scale: 1,
        roundcoords: 1,
        viewbox: true,
        desc: false,
        blurradius: options.blurradius || 0,
        blurdelta: 20,
      });
    } else {
      svgStr = traceRasterToSVG(imageData, options);
    }

    self.postMessage({
      type: 'done',
      svg: svgStr,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message || 'Vectorization failed',
    });
  }
};
