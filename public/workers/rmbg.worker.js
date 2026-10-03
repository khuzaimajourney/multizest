// RMBG-1.4 Background Removal Web Worker
// Runs in background thread to prevent UI freezing
// Uses @huggingface/transformers with briaai/RMBG-1.4

let model = null;
let processor = null;
let isInitializing = false;

async function initTransformers() {
  if (model && processor) return { model, processor };
  if (isInitializing) {
    while (isInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    if (model && processor) return { model, processor };
  }

  isInitializing = true;
  try {
    const { AutoModel, AutoProcessor, env } = await import(
      'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3'
    );

    env.allowLocalModels = false;
    env.useBrowserCache = true;

    self.postMessage({
      type: 'status',
      message: 'Waking up the AI... (This only happens once!)',
      progress: 10,
    });

    const progress_callback = (data) => {
      if (data.status === 'progress' && data.total > 0) {
        const percent = Math.round((data.loaded / data.total) * 100);
        self.postMessage({
          type: 'progress',
          file: data.file || 'model.onnx',
          progress: percent,
          loaded: data.loaded,
          total: data.total,
        });
      }
    };

    // Load state-of-the-art briaai/RMBG-1.4
    try {
      model = await AutoModel.from_pretrained('briaai/RMBG-1.4', {
        progress_callback,
        config: { model_type: 'custom' },
      });
      processor = await AutoProcessor.from_pretrained('briaai/RMBG-1.4', {
        config: {
          do_normalize: true,
          do_pad: true,
          do_rescale: true,
          do_resize: true,
          image_mean: [0.5, 0.5, 0.5],
          feature_extractor_type: 'ImageFeatureExtraction',
        },
      });
    } catch (e1) {
      console.warn('RMBG-1.4 direct load error, trying Xenova/modnet fallback:', e1);
      // Fallback model if RMBG fails to fetch
      model = await AutoModel.from_pretrained('Xenova/modnet', { progress_callback });
      processor = await AutoProcessor.from_pretrained('Xenova/modnet');
    }

    self.postMessage({ type: 'ready' });
    isInitializing = false;
    return { model, processor };
  } catch (err) {
    isInitializing = false;
    console.error('Failed to load Transformers:', err);
    throw err;
  }
}

self.onmessage = async (e) => {
  const { type, imageBitmap, imageDataUrl, width, height } = e.data;

  if (type === 'init') {
    try {
      await initTransformers();
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message || 'Model initialization failed' });
    }
    return;
  }

  if (type === 'process') {
    try {
      self.postMessage({ type: 'status', message: 'Downloading AI Model (This only happens once)...', progress: 15 });
      const { RawImage } = await import(
        'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3'
      );
      const { model: m, processor: p } = await initTransformers();

      self.postMessage({ type: 'status', message: 'Analyzing foreground subject with RMBG-1.4...', progress: 70 });

      // Load image into RawImage format
      const img = await RawImage.fromURL(imageDataUrl);

      // Preprocess image
      const { pixel_values } = await p(img);

      // Run inference
      self.postMessage({ type: 'status', message: 'Computing alpha matte & edge precision...', progress: 85 });
      const { output } = await m({ input: pixel_values });

      // Resize mask to match original image dimensions
      const maskRaw = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(img.width, img.height);
      const maskData = maskRaw.data; // Uint8ClampedArray

      self.postMessage({
        type: 'done',
        maskData,
        width: img.width,
        height: img.height,
      });
    } catch (error) {
      console.error('RMBG worker inference error:', error);
      // If AI model fails due to network/memory, provide edge-aware fallback
      self.postMessage({
        type: 'fallback',
        error: error.message || 'AI inference error',
      });
    }
  }
};
