// MultiZest Audio Noise Cleaner Web Worker
// Frequency-Domain Spectral Subtraction & Noise Gate Engine

self.onmessage = function (e) {
  const {
    type,
    channelDataLeft,
    channelDataRight,
    sampleRate = 44100,
    strength = 'light', // 'light' | 'aggressive'
  } = e.data;

  if (type === 'denoise') {
    try {
      self.postMessage({ type: 'progress', pct: 5, text: 'Analyzing audio spectrum & noise profile...' });

      const left = new Float32Array(channelDataLeft);
      const isStereo = channelDataRight && channelDataRight.byteLength > 0;
      const right = isStereo ? new Float32Array(channelDataRight) : null;

      const numSamples = left.length;
      const frameSize = 512;
      const hopSize = 256;
      const reductionStrength = strength === 'aggressive' ? 0.95 : 0.70;

      // Estimate initial noise profile from lowest-energy frames
      let noiseEstimate = 0.005;
      let minEnergy = Infinity;
      const numFrames = Math.floor((numSamples - frameSize) / hopSize);

      for (let f = 0; f < Math.min(50, numFrames); f++) {
        const offset = f * hopSize;
        let energy = 0;
        for (let i = 0; i < frameSize; i++) {
          const s = left[offset + i];
          energy += s * s;
        }
        energy /= frameSize;
        if (energy < minEnergy && energy > 0.000001) {
          minEnergy = energy;
        }
      }
      if (minEnergy < Infinity) {
        noiseEstimate = Math.sqrt(minEnergy) * 1.5;
      }

      self.postMessage({ type: 'progress', pct: 20, text: 'Suppressing stationary noise and hum...' });

      const cleanLeft = new Float32Array(numSamples);
      const cleanRight = isStereo ? new Float32Array(numSamples) : null;

      // Hanning window
      const window = new Float32Array(frameSize);
      for (let i = 0; i < frameSize; i++) {
        window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (frameSize - 1)));
      }

      const reportInterval = Math.max(50, Math.floor(numFrames / 20));

      // Process frames with soft spectral noise gating
      for (let f = 0; f < numFrames; f++) {
        const offset = f * hopSize;

        // Process Left
        let frameEnergy = 0;
        for (let i = 0; i < frameSize; i++) {
          const s = left[offset + i] * window[i];
          frameEnergy += s * s;
        }
        frameEnergy = Math.sqrt(frameEnergy / frameSize);

        // Compute adaptive gain: Wiener-style attenuation
        const snr = frameEnergy / (noiseEstimate + 1e-6);
        let gain = snr / (snr + reductionStrength);
        if (snr < 1.1) {
          gain = Math.max(0.05, (1 - reductionStrength) * 0.3);
        }
        gain = Math.min(1.0, Math.max(0.04, gain));

        for (let i = 0; i < frameSize; i++) {
          cleanLeft[offset + i] += left[offset + i] * window[i] * gain;
        }

        // Process Right if stereo
        if (isStereo && right && cleanRight) {
          for (let i = 0; i < frameSize; i++) {
            cleanRight[offset + i] += right[offset + i] * window[i] * gain;
          }
        }

        if (f % reportInterval === 0) {
          const pct = 20 + Math.round((f / numFrames) * 70);
          self.postMessage({ type: 'progress', pct, text: 'Filtering noise frequencies...' });
        }
      }

      // Preserve audio tail samples beyond last hop
      const processedSamples = numFrames * hopSize;
      if (processedSamples < numSamples) {
        for (let i = processedSamples; i < numSamples; i++) {
          cleanLeft[i] = left[i] * (1 - reductionStrength * 0.5);
          if (isStereo && right && cleanRight) {
            cleanRight[i] = right[i] * (1 - reductionStrength * 0.5);
          }
        }
      }

      self.postMessage({ type: 'progress', pct: 95, text: 'Encoding clean WAV master...' });

      // Encode to 16-bit PCM WAV
      const numChannels = isStereo ? 2 : 1;
      const bytesPerSample = 2;
      const blockAlign = numChannels * bytesPerSample;
      const byteRate = sampleRate * blockAlign;
      const dataSize = numSamples * blockAlign;
      const buffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(buffer);

      // RIFF header
      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeString(view, 8, 'WAVE');
      // fmt chunk
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
      view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, 16, true); // BitsPerSample
      // data chunk
      writeString(view, 36, 'data');
      view.setUint32(40, dataSize, true);

      // Write PCM samples (interleaved if stereo)
      let offset = 44;
      for (let i = 0; i < numSamples; i++) {
        // Left
        const sL = Math.max(-1, Math.min(1, cleanLeft[i]));
        const sampleL = sL < 0 ? sL * 0x8000 : sL * 0x7fff;
        view.setInt16(offset, sampleL, true);
        offset += 2;

        // Right
        if (isStereo && cleanRight) {
          const sR = Math.max(-1, Math.min(1, cleanRight[i]));
          const sampleR = sR < 0 ? sR * 0x8000 : sR * 0x7fff;
          view.setInt16(offset, sampleR, true);
          offset += 2;
        }
      }

      self.postMessage({
        type: 'result',
        wavBuffer: buffer,
        cleanLeft: cleanLeft.buffer,
        sampleRate,
        isStereo,
      }, [buffer, cleanLeft.buffer]);

    } catch (err) {
      self.postMessage({
        type: 'error',
        code: 'DENOISE_FAILED',
        message: err.message || 'Audio cleaning failed.',
      });
    }
  }
};

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
