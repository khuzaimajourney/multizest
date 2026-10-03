// TypeScript Web Worker wrapper for Photo Colorizer
export type ColorizeMessage =
  | { type: 'colorize'; imageBuffer: ArrayBuffer; width: number; height: number; intensity: number }
  | { type: 'progress'; text: string; pct: number }
  | { type: 'result'; imageBuffer: ArrayBuffer; width: number; height: number; isAlreadyColored: boolean }
  | { type: 'error'; code: string; message: string };

export const COLORIZE_WORKER_PATH = '/workers/colorize.worker.js';
