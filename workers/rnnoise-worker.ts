// TypeScript Web Worker wrapper for Audio Noise Remover
export type RNNoiseMessage =
  | {
      type: 'denoise';
      channelDataLeft: ArrayBuffer;
      channelDataRight?: ArrayBuffer;
      sampleRate: number;
      strength: 'light' | 'aggressive';
    }
  | { type: 'progress'; pct: number; text: string }
  | {
      type: 'result';
      wavBuffer: ArrayBuffer;
      cleanLeft: ArrayBuffer;
      sampleRate: number;
      isStereo: boolean;
    }
  | { type: 'error'; code: string; message: string };

export const RNNOISE_WORKER_PATH = '/workers/rnnoise.worker.js';
