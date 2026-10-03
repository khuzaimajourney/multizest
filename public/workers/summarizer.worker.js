// On-Device AI Text Summarizer Web Worker
// Runs Xenova/distilbart-cnn-12-6 entirely in browser via Transformers.js

let pipeline = null;
let summarizerInstance = null;

async function getSummarizer() {
  if (summarizerInstance) return summarizerInstance;

  const { pipeline, env } = await import(
    'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.3.3'
  );

  env.allowLocalModels = false;
  env.useBrowserCache = true;

  const progress_callback = (data) => {
    if (data.status === 'progress' && data.total > 0) {
      const pct = Math.round((data.loaded / data.total) * 100);
      self.postMessage({
        type: 'progress',
        file: data.file || 'model.onnx',
        progress: pct,
        loaded: data.loaded,
        total: data.total,
      });
    }
  };

  self.postMessage({
    type: 'status',
    message: 'Waking up the AI... (This only happens once!)',
    progress: 20,
  });

  try {
    // Attempt WebGPU first for maximum speed, gracefully fallback to WASM
    try {
      summarizerInstance = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6', {
        device: 'webgpu',
        progress_callback,
      });
    } catch (webgpuErr) {
      console.info('WebGPU unavailable or failed, falling back to WebAssembly (WASM):', webgpuErr);
      summarizerInstance = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6', {
        device: 'wasm',
        progress_callback,
      });
    }
  } catch (err) {
    console.warn('distilbart-cnn-12-6 error, trying Xenova/t5-small fallback:', err);
    try {
      summarizerInstance = await pipeline('summarization', 'Xenova/t5-small', {
        device: 'webgpu',
        progress_callback,
      });
    } catch {
      summarizerInstance = await pipeline('summarization', 'Xenova/t5-small', {
        device: 'wasm',
        progress_callback,
      });
    }
  }

  return summarizerInstance;
}

// Client-side extractive fallback if WebAssembly memory limits or offline
function localExtractiveSummary(text, mode) {
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length <= 2) return text;

  // Word frequency scoring
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were', 'which',
    'their', 'about', 'there', 'would', 'could', 'these', 'other', 'after', 'been',
  ]);
  const freq = {};
  for (const w of words) {
    if (!stopWords.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }

  const scored = sentences.map((sentence, idx) => {
    const sWords = sentence.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    let score = 0;
    for (const w of sWords) {
      score += freq[w] || 0;
    }
    // Boost introduction and conclusion
    if (idx === 0) score *= 1.35;
    if (idx === sentences.length - 1) score *= 1.25;
    return { sentence, score: score / Math.max(1, sWords.length), idx };
  });

  scored.sort((a, b) => b.score - a.score);

  let targetCount = 3;
  if (mode === 'bullet') targetCount = Math.min(6, Math.max(3, Math.round(sentences.length * 0.25)));
  if (mode === 'detailed') targetCount = Math.min(8, Math.max(4, Math.round(sentences.length * 0.4)));
  if (mode === 'short') targetCount = Math.min(3, Math.max(2, Math.round(sentences.length * 0.15)));

  const selected = scored.slice(0, targetCount).sort((a, b) => a.idx - b.idx);

  if (mode === 'bullet') {
    return selected.map((s) => `• ${s.sentence}`).join('\n\n');
  }
  return selected.map((s) => s.sentence).join(' ');
}

self.onmessage = async (e) => {
  const { text, mode } = e.data;

  try {
    self.postMessage({
      type: 'status',
      message: 'Reading your document...',
      progress: 25,
    });

    // Determine generation parameters based on mode
    let max_new_tokens = 100;
    let min_length = 30;
    if (mode === 'short') {
      max_new_tokens = 70;
      min_length = 25;
    } else if (mode === 'detailed') {
      max_new_tokens = 180;
      min_length = 75;
    } else if (mode === 'bullet') {
      max_new_tokens = 130;
      min_length = 40;
    }

    let summaryText = '';

    try {
      const summarizer = await getSummarizer();

      self.postMessage({
        type: 'status',
        message: 'Synthesizing on-device neural summary...',
        progress: 75,
      });

      // Split into chunks if text is long (distilbart limit is ~1024 tokens)
      const maxChars = 2400;
      const chunks = [];
      for (let i = 0; i < text.length; i += maxChars) {
        chunks.push(text.slice(i, i + maxChars));
      }

      const results = [];
      for (let i = 0; i < Math.min(chunks.length, 3); i++) {
        const out = await summarizer(chunks[i], {
          max_new_tokens,
          min_length,
        });
        if (out && out[0] && out[0].summary_text) {
          results.push(out[0].summary_text.trim());
        }
      }

      summaryText = results.join('\n\n');

      if (mode === 'bullet') {
        const lines = summaryText.split(/(?<=[.?!])\s+/);
        summaryText = lines
          .filter((l) => l.trim().length > 10)
          .map((l) => `• ${l.trim()}`)
          .join('\n\n');
      }
    } catch (aiErr) {
      console.warn('AI pipeline fallback to local extractive algorithm:', aiErr);
      self.postMessage({
        type: 'status',
        message: 'Applying local natural language processing...',
        progress: 85,
      });
      summaryText = localExtractiveSummary(text, mode);
    }

    self.postMessage({
      type: 'done',
      summary: summaryText,
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message || 'Summarization failed',
    });
  }
};
